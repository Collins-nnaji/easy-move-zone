import type { NeonQueryFunction } from "@neondatabase/serverless"
import { slugify } from "../../lib/education/catalog.ts"
import type { StudyLevel } from "../../lib/education/types.ts"
import { normaliseName } from "./io.ts"

export type ImportUniversity = {
  externalId: string
  name: string
  country: string
  city: string
  website: string | null
  summary: string | null
  studentSponsor: boolean
  sponsorNote: string | null
  institutionType: string | null
}

export type ImportCourse = {
  externalId: string
  universityExternalId: string
  title: string
  level: StudyLevel
  subject: string
  duration: string | null
  durationMonths: number | null
  intake: string | null
  tuitionMin: number | null
  tuitionMax: number | null
  currency: string
  feeGbp: number | null
  feeNote: string | null
  entryRequirements: string | null
  englishRequirement: string | null
  courseUrl: string | null
}

export type ImportBatch = { source: string; universities: ImportUniversity[]; courses: ImportCourse[] }

type Sql = NeonQueryFunction<false, false>

const CHUNK = 1000

function chunks<T>(items: T[], size = CHUNK): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export async function writeBatch(sql: Sql, batch: ImportBatch, log: (message: string) => void) {
  const { source } = batch
  const universities = [...new Map(batch.universities.map((u) => [u.externalId, u])).values()]
  const courses = [...new Map(batch.courses.map((c) => [c.externalId, c])).values()]

  const existing = (await sql.query(
    "select id, slug, source, external_id, name, country from education_universities",
  )) as Array<{ id: string; slug: string; source: string; external_id: string | null; name: string; country: string }>
  const slugs = new Set(existing.map((row) => row.slug))
  const bySourceKey = new Map(existing.filter((row) => row.source === source).map((row) => [row.external_id, row]))
  const unclaimed = new Map(
    existing
      .filter((row) => row.source === "manual" && !row.external_id)
      .map((row) => [`${normaliseName(row.name)}|${row.country}`, row]),
  )

  const claims: Array<{ id: string; externalId: string }> = []
  const merges: Array<{ fromId: string; externalId: string }> = []
  const slugFor = new Map<string, string>()
  for (const uni of universities) {
    const bare = uni.name.replace(/\([^)]*\)/g, " ")
    const claimKey = [uni.name, bare, bare.split(",")[0]]
      .map((name) => `${normaliseName(name)}|${uni.country}`)
      .find((key) => unclaimed.has(key))
    const manual = claimKey ? unclaimed.get(claimKey) : undefined
    const current = bySourceKey.get(uni.externalId)
    if (current) {
      slugFor.set(uni.externalId, current.slug)
      if (claimKey && manual) {
        unclaimed.delete(claimKey)
        merges.push({ fromId: manual.id, externalId: uni.externalId })
      }
      continue
    }
    if (claimKey && manual) {
      unclaimed.delete(claimKey)
      claims.push({ id: manual.id, externalId: uni.externalId })
      slugFor.set(uni.externalId, manual.slug)
      continue
    }
    const base = `${slugify(uni.name)}-${slugify(uni.country)}`
    let slug = base
    for (let n = 2; slugs.has(slug); n++) slug = `${base}-${n}`
    slugs.add(slug)
    slugFor.set(uni.externalId, slug)
  }

  for (const part of chunks(claims)) {
    await sql.query(
      `update education_universities u set source = $1, external_id = v.external_id
       from unnest($2::uuid[], $3::text[]) as v(id, external_id) where u.id = v.id`,
      [source, part.map((c) => c.id), part.map((c) => c.externalId)],
    )
  }
  if (claims.length) log(`  linked ${claims.length} existing universities`)

  for (const part of chunks(universities)) {
    await sql.query(
      `insert into education_universities
         (slug, name, country, city, website, summary, source, external_id, student_sponsor, sponsor_note, institution_type)
       select v.slug, v.name, v.country, v.city, v.website, v.summary, $1, v.external_id, v.student_sponsor, v.sponsor_note, v.institution_type
       from unnest($2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[], $8::text[], $9::boolean[], $10::text[], $11::text[])
         as v(slug, name, country, city, website, summary, external_id, student_sponsor, sponsor_note, institution_type)
       on conflict (source, external_id) do update set
         name = excluded.name,
         country = excluded.country,
         city = coalesce(nullif(excluded.city, ''), education_universities.city),
         website = coalesce(excluded.website, education_universities.website),
         summary = coalesce(excluded.summary, education_universities.summary),
         student_sponsor = excluded.student_sponsor,
         sponsor_note = excluded.sponsor_note,
         institution_type = coalesce(excluded.institution_type, education_universities.institution_type),
         updated_at = now()`,
      [
        source,
        part.map((u) => slugFor.get(u.externalId)),
        part.map((u) => u.name),
        part.map((u) => u.country),
        part.map((u) => u.city),
        part.map((u) => u.website),
        part.map((u) => u.summary),
        part.map((u) => u.externalId),
        part.map((u) => u.studentSponsor),
        part.map((u) => u.sponsorNote),
        part.map((u) => u.institutionType),
      ],
    )
  }
  log(`  upserted ${universities.length} universities`)

  const idRows = (await sql.query("select id, external_id from education_universities where source = $1", [source])) as Array<{ id: string; external_id: string }>
  const universityId = new Map(idRows.map((row) => [row.external_id, row.id]))
  for (const merge of merges) {
    const target = universityId.get(merge.externalId)
    if (!target) continue
    await sql.query("update education_courses set university_id = $1 where university_id = $2", [target, merge.fromId])
    await sql.query("delete from education_universities where id = $1", [merge.fromId])
  }
  if (merges.length) log(`  merged ${merges.length} admin-added universities into their official entries`)
  const linked = courses.filter((c) => universityId.has(c.universityExternalId))
  if (linked.length < courses.length) log(`  skipped ${courses.length - linked.length} courses with no matching university`)

  let done = 0
  for (const part of chunks(linked)) {
    await sql.query(
      `insert into education_courses
         (university_id, title, level, subject, duration, duration_months, intake, tuition_min, tuition_max, currency, fee_gbp,
          fee_note, entry_requirements, english_requirement, course_url, source, external_id)
       select v.university_id, v.title, v.level, v.subject, v.duration, v.duration_months, v.intake, v.tuition_min, v.tuition_max,
              v.currency, v.fee_gbp, v.fee_note, v.entry_requirements, v.english_requirement, v.course_url, $1, v.external_id
       from unnest($2::uuid[], $3::text[], $4::text[], $5::text[], $6::text[], $7::int[], $8::text[], $9::int[], $10::int[],
                   $11::text[], $12::int[], $13::text[], $14::text[], $15::text[], $16::text[], $17::text[])
         as v(university_id, title, level, subject, duration, duration_months, intake, tuition_min, tuition_max, currency, fee_gbp,
              fee_note, entry_requirements, english_requirement, course_url, external_id)
       on conflict (source, external_id) do update set
         university_id = excluded.university_id, title = excluded.title, level = excluded.level, subject = excluded.subject,
         duration = excluded.duration, duration_months = excluded.duration_months, intake = excluded.intake,
         tuition_min = excluded.tuition_min, tuition_max = excluded.tuition_max, currency = excluded.currency,
         fee_gbp = excluded.fee_gbp, fee_note = excluded.fee_note, entry_requirements = excluded.entry_requirements,
         english_requirement = excluded.english_requirement, course_url = excluded.course_url, updated_at = now()
       where education_courses.admin_edited_at is null`,
      [
        source,
        part.map((c) => universityId.get(c.universityExternalId)),
        part.map((c) => c.title),
        part.map((c) => c.level),
        part.map((c) => c.subject),
        part.map((c) => c.duration),
        part.map((c) => c.durationMonths),
        part.map((c) => c.intake),
        part.map((c) => c.tuitionMin),
        part.map((c) => c.tuitionMax),
        part.map((c) => c.currency),
        part.map((c) => c.feeGbp),
        part.map((c) => c.feeNote),
        part.map((c) => c.entryRequirements),
        part.map((c) => c.englishRequirement),
        part.map((c) => c.courseUrl),
        part.map((c) => c.externalId),
      ],
    )
    done += part.length
    log(`  courses ${done}/${linked.length}`)
  }

  const removedCourses = (await sql.query(
    `delete from education_courses c
     where c.source = $1 and c.admin_edited_at is null and not (c.external_id = any($2::text[]))
       and not exists (select 1 from education_applications a where a.course_id = c.id)
     returning c.id`,
    [source, linked.map((c) => c.externalId)],
  )) as unknown[]
  const removedUniversities = (await sql.query(
    `delete from education_universities u
     where u.source = $1 and not (u.external_id = any($2::text[]))
       and not exists (select 1 from education_courses c where c.university_id = u.id)
     returning u.id`,
    [source, universities.map((u) => u.externalId)],
  )) as unknown[]
  if (removedCourses.length || removedUniversities.length) {
    log(`  removed ${removedCourses.length} withdrawn courses and ${removedUniversities.length} universities`)
  }
}
