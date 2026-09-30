import { neon } from "@neondatabase/serverless"
// Explicit .ts extensions let scripts/import-education.ts load this module under plain Node.
import { budgetBandSql, durationBandSql, durationMonthsFromText, feeToGbp, MONTHS, slugify } from "./catalog.ts"
import { EDUCATION_SEED } from "./seed.ts"
import {
  APPLICATION_STATUSES,
  COURSE_FACETS,
  STUDY_LEVELS,
  type ApplicationStatus,
  type Course,
  type CourseFacet,
  type CourseFit,
  type CourseSearchResult,
  type CourseSort,
  type CourseWithUniversity,
  type EducationApplication,
  type StudyLevel,
  type InstitutionKind,
  type University,
  type UniversitySearchResult,
  type UniversitySort,
} from "./types.ts"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

let ensured = false

export function isEducationDbConfigured() {
  return Boolean(sql)
}

export async function ensureEducationTables() {
  if (!sql || ensured) return
  await sql`
    create table if not exists education_universities (
      id uuid primary key default gen_random_uuid(),
      slug text not null unique,
      name text not null,
      country text not null,
      city text not null default '',
      website text,
      summary text,
      created_at timestamptz not null default now()
    )
  `
  await sql`
    create table if not exists education_courses (
      id uuid primary key default gen_random_uuid(),
      university_id uuid not null references education_universities(id) on delete cascade,
      title text not null,
      level text not null,
      subject text not null default '',
      duration text,
      intake text,
      tuition_min integer,
      tuition_max integer,
      currency text not null default 'GBP',
      fee_note text,
      entry_requirements text,
      english_requirement text,
      course_url text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `
  await sql`create index if not exists education_courses_university_idx on education_courses (university_id)`
  await sql`
    create table if not exists education_applications (
      id uuid primary key default gen_random_uuid(),
      auth_user_id text not null,
      course_id uuid not null references education_courses(id) on delete cascade,
      status text not null default 'shortlisted',
      personal_statement text not null default '',
      notes text not null default '',
      fit jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (auth_user_id, course_id)
    )
  `
  await sql`
    alter table education_universities
      add column if not exists source text not null default 'manual',
      add column if not exists external_id text,
      add column if not exists student_sponsor boolean not null default false,
      add column if not exists sponsor_note text,
      add column if not exists institution_type text,
      add column if not exists updated_at timestamptz not null default now()
  `
  await sql`
    alter table education_courses
      add column if not exists source text not null default 'manual',
      add column if not exists external_id text,
      add column if not exists duration_months integer,
      add column if not exists fee_gbp integer,
      add column if not exists admin_edited_at timestamptz
  `
  await sql`create unique index if not exists education_universities_source_key on education_universities (source, external_id)`
  await sql`create unique index if not exists education_courses_source_key on education_courses (source, external_id)`
  await sql`create index if not exists education_universities_country_idx on education_universities (country)`
  await sql`create index if not exists education_courses_level_subject_idx on education_courses (level, subject)`
  await seedIfEmpty()
  await backfillDerived()
  ensured = true
}

async function backfillDerived() {
  if (!sql) return
  const rows = await sql`
    select id, duration, tuition_min, tuition_max, currency from education_courses
    where source = 'manual' and duration_months is null and fee_gbp is null
      and (duration is not null or tuition_min is not null or tuition_max is not null)
  `
  for (const row of rows) {
    await sql`
      update education_courses set
        duration_months = ${durationMonthsFromText(str(row.duration))},
        fee_gbp = ${feeToGbp(num(row.tuition_min), num(row.tuition_max), String(row.currency ?? "GBP"))}
      where id = ${row.id}
    `
  }
}

async function seedIfEmpty() {
  if (!sql) return
  const existing = await sql`select count(*)::int as n from education_universities`
  if (Number(existing[0]?.n ?? 0) > 0) return
  for (const uni of EDUCATION_SEED) {
    const rows = await sql`
      insert into education_universities (slug, name, country, city, website, summary)
      values (${uni.slug}, ${uni.name}, ${uni.country}, ${uni.city}, ${uni.website}, ${uni.summary})
      on conflict (slug) do nothing
      returning id
    `
    const universityId = rows[0]?.id
    if (!universityId) continue
    for (const course of uni.courses) {
      await sql`
        insert into education_courses
          (university_id, title, level, subject, duration, intake, tuition_min, tuition_max, currency,
           fee_note, entry_requirements, english_requirement, course_url, duration_months, fee_gbp)
        values
          (${universityId}, ${course.title}, ${course.level}, ${course.subject}, ${course.duration}, ${course.intake},
           ${course.tuition[0]}, ${course.tuition[1]}, ${uni.currency}, ${course.feeNote ?? null},
           ${course.entry}, ${course.english}, ${uni.website}, ${durationMonthsFromText(course.duration)},
           ${feeToGbp(course.tuition[0], course.tuition[1], uni.currency)})
      `
    }
  }
}

type Row = Record<string, unknown>

const str = (value: unknown) => (value == null ? null : String(value))
const num = (value: unknown) => (value == null || value === "" ? null : Number(value))

function toUniversity(row: Row, prefix = ""): University {
  return {
    id: String(row[`${prefix}id`]),
    slug: String(row[`${prefix}slug`]),
    name: String(row[`${prefix}name`]),
    country: String(row[`${prefix}country`]),
    city: String(row[`${prefix}city`] ?? ""),
    website: str(row[`${prefix}website`]),
    summary: str(row[`${prefix}summary`]),
    source: String(row[`${prefix}source`] ?? "manual"),
    studentSponsor: Boolean(row[`${prefix}student_sponsor`]),
    sponsorNote: str(row[`${prefix}sponsor_note`]),
    institutionType: str(row[`${prefix}institution_type`]),
  }
}

const UNIVERSITY_COLUMNS = `u.id as u_id, u.slug as u_slug, u.name as u_name, u.country as u_country, u.city as u_city,
  u.website as u_website, u.summary as u_summary, u.source as u_source, u.student_sponsor as u_student_sponsor,
  u.sponsor_note as u_sponsor_note, u.institution_type as u_institution_type`

function toCourse(row: Row): Course {
  return {
    id: String(row.id),
    universityId: String(row.university_id),
    title: String(row.title),
    level: (STUDY_LEVELS as readonly string[]).includes(String(row.level)) ? (row.level as StudyLevel) : "postgraduate",
    subject: String(row.subject ?? ""),
    duration: str(row.duration),
    intake: str(row.intake),
    tuitionMin: num(row.tuition_min),
    tuitionMax: num(row.tuition_max),
    currency: String(row.currency ?? "GBP"),
    feeNote: str(row.fee_note),
    entryRequirements: str(row.entry_requirements),
    englishRequirement: str(row.english_requirement),
    courseUrl: str(row.course_url),
    source: String(row.source ?? "manual"),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

function toCourseWithUniversity(row: Row): CourseWithUniversity {
  return { ...toCourse(row), university: toUniversity(row, "u_") }
}

export type CourseSearch = {
  q?: string | null
  country?: string[]
  level?: string[]
  subject?: string[]
  intake?: string[]
  duration?: string[]
  budget?: string[]
  sponsorOnly?: boolean
  universityId?: string | null
  sort?: CourseSort
  page?: number
  pageSize?: number
  facets?: boolean
}

const DURATION_BAND = durationBandSql("c.duration_months")
const BUDGET_BAND = budgetBandSql("c.fee_gbp")
const FACET_EXPR: Record<Exclude<CourseFacet, "intake">, string> = {
  country: "u.country",
  level: "c.level",
  subject: "c.subject",
  duration: DURATION_BAND,
  budget: BUDGET_BAND,
}

function searchTerms(q: string | null | undefined) {
  return (q ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .map((term) => `%${term.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`)
}

/** Builds a where clause; `skip` leaves one facet out so its own option counts stay stable. */
function courseWhere(search: CourseSearch, skip?: CourseFacet | "sponsor") {
  const params: unknown[] = []
  const parts: string[] = []
  const bind = (value: unknown) => {
    params.push(value)
    return `$${params.length}`
  }
  for (const term of searchTerms(search.q)) {
    const p = bind(term)
    parts.push(`(c.title ilike ${p} or u.name ilike ${p} or u.city ilike ${p} or c.subject ilike ${p})`)
  }
  for (const key of COURSE_FACETS) {
    const values = search[key]
    if (key === skip || !values?.length) continue
    if (key === "intake") parts.push(`c.intake ilike any(${bind(values.map((month) => `%${month}%`))}::text[])`)
    else parts.push(`(${FACET_EXPR[key]}) = any(${bind(values)}::text[])`)
  }
  if (search.sponsorOnly && skip !== "sponsor") parts.push("u.student_sponsor")
  if (search.universityId) parts.push(`c.university_id::text = ${bind(search.universityId)}`)
  return { where: parts.length ? `where ${parts.join(" and ")}` : "", params }
}

const COURSE_FROM = "from education_courses c join education_universities u on u.id = c.university_id"

const ORDER_BY: Record<CourseSort, string> = {
  recommended: "(c.source = 'manual') desc, (c.fee_gbp is not null) desc, u.student_sponsor desc, u.name asc, c.title asc",
  fees: "c.fee_gbp asc nulls last, u.name asc, c.title asc",
  duration: "c.duration_months asc nulls last, u.name asc, c.title asc",
}

export async function searchCourses(search: CourseSearch = {}): Promise<CourseSearchResult> {
  const pageSize = Math.min(Math.max(search.pageSize ?? 20, 1), 100)
  const page = Math.max(search.page ?? 1, 1)
  if (!sql) return { courses: [], total: 0, universityCount: 0, page, pageSize }
  await ensureEducationTables()
  const db = sql
  const base = courseWhere(search)
  const order = ORDER_BY[search.sort ?? "recommended"] ?? ORDER_BY.recommended
  const listQuery = db.query(
    `select c.*, ${UNIVERSITY_COLUMNS} ${COURSE_FROM} ${base.where}
     order by ${order} limit ${pageSize} offset ${(page - 1) * pageSize}`,
    base.params,
  )
  const totalQuery = db.query(
    `select count(*)::int as total, count(distinct c.university_id)::int as universities ${COURSE_FROM} ${base.where}`,
    base.params,
  )
  if (!search.facets) {
    const [rows, totals] = await Promise.all([listQuery, totalQuery])
    return { courses: rows.map(toCourseWithUniversity), total: Number(totals[0]?.total ?? 0), universityCount: Number(totals[0]?.universities ?? 0), page, pageSize }
  }

  const facetQuery = (key: Exclude<CourseFacet, "intake">) => {
    const { where, params } = courseWhere(search, key)
    return db.query(`select ${FACET_EXPR[key]} as value, count(*)::int as n ${COURSE_FROM} ${where} group by 1`, params)
  }
  const intakeWhere = courseWhere(search, "intake")
  const intakeQuery = db.query(
    `select ${MONTHS.map((month, i) => `count(*) filter (where c.intake ilike '%${month}%')::int as m${i}`).join(", ")}
     ${COURSE_FROM} ${intakeWhere.where}`,
    intakeWhere.params,
  )
  const sponsorWhere = courseWhere(search, "sponsor")
  const sponsorQuery = db.query(
    `select count(*) filter (where u.student_sponsor)::int as n ${COURSE_FROM} ${sponsorWhere.where}`,
    sponsorWhere.params,
  )
  const [rows, totals, country, level, subject, duration, budget, intake, sponsor] = await Promise.all([
    listQuery,
    totalQuery,
    facetQuery("country"),
    facetQuery("level"),
    facetQuery("subject"),
    facetQuery("duration"),
    facetQuery("budget"),
    intakeQuery,
    sponsorQuery,
  ])
  const toCounts = (list: Row[]) =>
    Object.fromEntries(list.filter((row) => row.value != null && row.value !== "").map((row) => [String(row.value), Number(row.n)]))
  const intakeRow = intake[0] ?? {}
  return {
    courses: rows.map(toCourseWithUniversity),
    total: Number(totals[0]?.total ?? 0),
    universityCount: Number(totals[0]?.universities ?? 0),
    page,
    pageSize,
    facets: {
      country: toCounts(country),
      level: toCounts(level),
      subject: toCounts(subject),
      duration: toCounts(duration),
      budget: toCounts(budget),
      intake: Object.fromEntries(MONTHS.map((month, i) => [month, Number(intakeRow[`m${i}`] ?? 0)]).filter(([, n]) => Number(n) > 0)),
      sponsor: Number(sponsor[0]?.n ?? 0),
    },
  }
}

export async function getCourse(id: string): Promise<CourseWithUniversity | null> {
  if (!sql) return null
  await ensureEducationTables()
  const rows = await sql.query(`select c.*, ${UNIVERSITY_COLUMNS} ${COURSE_FROM} where c.id::text = $1 limit 1`, [id])
  return rows[0] ? toCourseWithUniversity(rows[0]) : null
}

export type UniversitySearch = {
  q?: string | null
  country?: string[]
  sponsorOnly?: boolean
  kind?: InstitutionKind[]
  hasCourses?: boolean
  sort?: UniversitySort
  page?: number
  pageSize?: number
  facets?: boolean
}

const INSTITUTION_KIND_SQL = `(case
  when u.institution_type in ('Research university', 'University of applied sciences', 'Higher Education Institution (HEI)')
    or u.name ~* '(universit|polytechnic|institute of technology)' then 'university'
  else 'college' end)`
const PUBLIC_SQL = `(u.institution_type in ('Public', 'Research university', 'University of applied sciences', 'Higher Education Institution (HEI)', 'Publicly funded college'))`

export async function searchUniversities(search: UniversitySearch = {}): Promise<UniversitySearchResult> {
  const pageSize = Math.min(Math.max(search.pageSize ?? 24, 1), 100)
  const page = Math.max(search.page ?? 1, 1)
  if (!sql) return { universities: [], total: 0, page, pageSize }
  await ensureEducationTables()
  const build = (skip?: "country" | "kind") => {
    const params: unknown[] = []
    const parts: string[] = []
    for (const term of searchTerms(search.q)) {
      params.push(term)
      parts.push(`(u.name ilike $${params.length} or u.city ilike $${params.length})`)
    }
    if (skip !== "country" && search.country?.length) {
      params.push(search.country)
      parts.push(`u.country = any($${params.length}::text[])`)
    }
    if (skip !== "kind" && search.kind?.length) {
      params.push(search.kind)
      parts.push(`${INSTITUTION_KIND_SQL} = any($${params.length}::text[])`)
    }
    if (search.sponsorOnly) parts.push("u.student_sponsor")
    if (search.hasCourses) parts.push(`exists (select 1 from education_courses c where c.university_id = u.id)`)
    return { where: parts.length ? `where ${parts.join(" and ")}` : "", params }
  }
  const base = build()
  const phrase = search.q?.trim().replace(/[\\%_]/g, (ch) => `\\${ch}`)
  const rowParams = phrase ? [...base.params, phrase] : base.params
  const p = `$${rowParams.length}`
  const name = `regexp_replace(u.name, '^the\\s+', '', 'i')`
  const relevance = phrase
    ? `case
         when ${name} ilike ${p} or ${name} ilike 'university of ' || ${p} or ${name} ilike 'university of ' || ${p} || ' (%' or ${name} ilike ${p} || ' university' then 0
         when ${name} ilike ${p} || '%' then 1
         when u.name ilike '%' || ${p} || '%' then 2
         else 3
       end,`
    : ""
  const order = {
    recommended: `${relevance} (${INSTITUTION_KIND_SQL} = 'university') desc, (coalesce(cc.n, 0) > 0) desc, ${PUBLIC_SQL} desc nulls last, coalesce(cc.n, 0) desc, u.student_sponsor desc, u.name asc`,
    courses: `${relevance} coalesce(cc.n, 0) desc, u.name asc`,
    name: `${relevance} regexp_replace(lower(u.name), '^the\\s+', '') asc`,
  }[search.sort ?? "recommended"]
  const facetQuery = (skip: "country" | "kind", column: string) => {
    if (!search.facets) return Promise.resolve([] as Row[])
    const facet = build(skip)
    return sql!.query(`select ${column} as value, count(*)::int as n from education_universities u ${facet.where} group by 1`, facet.params)
  }
  const [rows, totals, countries, kinds] = await Promise.all([
    sql.query(
      `select u.*, coalesce(cc.n, 0)::int as course_count
       from education_universities u
       left join (select university_id, count(*) as n from education_courses group by university_id) cc on cc.university_id = u.id
       ${base.where}
       order by ${order}
       limit ${pageSize} offset ${(page - 1) * pageSize}`,
      rowParams,
    ),
    sql.query(`select count(*)::int as total from education_universities u ${base.where}`, base.params),
    facetQuery("country", "u.country"),
    facetQuery("kind", INSTITUTION_KIND_SQL),
  ])
  const toCounts = (list: Row[]) => Object.fromEntries(list.map((row) => [String(row.value), Number(row.n)]))
  return {
    universities: rows.map((row) => ({ ...toUniversity(row), courseCount: Number(row.course_count ?? 0) })),
    total: Number(totals[0]?.total ?? 0),
    page,
    pageSize,
    countries: search.facets ? toCounts(countries) : undefined,
    kinds: search.facets ? toCounts(kinds) : undefined,
  }
}

export async function educationStats() {
  if (!sql) return { universities: 0, courses: 0, bySource: [] as Array<{ source: string; universities: number; courses: number }> }
  await ensureEducationTables()
  const rows = await sql`
    select s.source,
      (select count(*)::int from education_universities u where u.source = s.source) as universities,
      (select count(*)::int from education_courses c where c.source = s.source) as courses
    from (select source from education_universities union select source from education_courses) s
    order by 1
  `
  const bySource = rows.map((row) => ({ source: String(row.source), universities: Number(row.universities), courses: Number(row.courses) }))
  return {
    universities: bySource.reduce((sum, row) => sum + row.universities, 0),
    courses: bySource.reduce((sum, row) => sum + row.courses, 0),
    bySource,
  }
}

// ── Applications ──────────────────────────────────────────────

function toApplication(row: Row): EducationApplication {
  const status = String(row.a_status)
  return {
    id: String(row.a_id),
    courseId: String(row.id),
    status: (APPLICATION_STATUSES as readonly string[]).includes(status) ? (status as ApplicationStatus) : "shortlisted",
    personalStatement: String(row.a_statement ?? ""),
    notes: String(row.a_notes ?? ""),
    fit: (row.a_fit as CourseFit | null) ?? null,
    updatedAt: new Date(String(row.a_updated_at)).toISOString(),
    course: toCourseWithUniversity(row),
  }
}

export async function listApplications(authUserId: string): Promise<EducationApplication[]> {
  if (!sql) return []
  await ensureEducationTables()
  const rows = await sql.query(
    `select a.id as a_id, a.status as a_status, a.personal_statement as a_statement, a.notes as a_notes,
            a.fit as a_fit, a.updated_at as a_updated_at, c.*, ${UNIVERSITY_COLUMNS}
     from education_applications a
     join education_courses c on c.id = a.course_id
     join education_universities u on u.id = c.university_id
     where a.auth_user_id = $1
     order by a.updated_at desc`,
    [authUserId],
  )
  return rows.map(toApplication)
}

export async function upsertApplication(
  authUserId: string,
  courseId: string,
  patch: { status?: ApplicationStatus; personalStatement?: string; notes?: string; fit?: CourseFit | null } = {},
): Promise<void> {
  if (!sql) return
  await ensureEducationTables()
  const status = patch.status && (APPLICATION_STATUSES as readonly string[]).includes(patch.status) ? patch.status : null
  const statement = patch.personalStatement ?? null
  const notes = patch.notes ?? null
  const fit = patch.fit === undefined ? null : JSON.stringify(patch.fit)
  await sql`
    insert into education_applications (auth_user_id, course_id, status, personal_statement, notes, fit)
    values (${authUserId}, ${courseId}::uuid, coalesce(${status}, 'shortlisted'), coalesce(${statement}, ''),
            coalesce(${notes}, ''), ${fit}::jsonb)
    on conflict (auth_user_id, course_id) do update set
      status = coalesce(${status}, education_applications.status),
      personal_statement = coalesce(${statement}, education_applications.personal_statement),
      notes = coalesce(${notes}, education_applications.notes),
      fit = coalesce(${fit}::jsonb, education_applications.fit),
      updated_at = now()
  `
}

export async function deleteApplication(authUserId: string, courseId: string): Promise<void> {
  if (!sql) return
  await ensureEducationTables()
  await sql`delete from education_applications where auth_user_id = ${authUserId} and course_id::text = ${courseId}`
}

// ── Admin ─────────────────────────────────────────────────────

export async function createUniversity(input: {
  name: string
  country: string
  city?: string
  website?: string
  summary?: string
  studentSponsor?: boolean
}): Promise<string | null> {
  if (!sql) return null
  await ensureEducationTables()
  const slug = `${slugify(input.name)}-${slugify(input.country)}`
  const sponsor = input.studentSponsor ?? null
  const rows = await sql`
    insert into education_universities (slug, name, country, city, website, summary, student_sponsor, sponsor_note)
    values (${slug}, ${input.name.trim()}, ${input.country.trim()}, ${input.city?.trim() ?? ""},
            ${input.website?.trim() || null}, ${input.summary?.trim() || null}, coalesce(${sponsor}::boolean, false),
            case when ${sponsor}::boolean then 'Marked as a licensed student sponsor by an admin' end)
    on conflict (slug) do update set name = excluded.name,
      city = coalesce(nullif(excluded.city, ''), education_universities.city),
      website = coalesce(excluded.website, education_universities.website),
      summary = coalesce(excluded.summary, education_universities.summary),
      student_sponsor = coalesce(${sponsor}::boolean, education_universities.student_sponsor),
      sponsor_note = case when ${sponsor}::boolean is null or ${sponsor}::boolean = education_universities.student_sponsor
        then education_universities.sponsor_note else excluded.sponsor_note end,
      updated_at = now()
    returning id
  `
  return rows[0]?.id ? String(rows[0].id) : null
}

export type CourseInput = {
  universityId: string
  title: string
  level: StudyLevel
  subject: string
  duration?: string
  intake?: string
  tuitionMin?: number | null
  tuitionMax?: number | null
  currency: string
  feeNote?: string
  entryRequirements?: string
  englishRequirement?: string
  courseUrl?: string
}

export async function saveCourse(input: CourseInput & { id?: string }): Promise<void> {
  if (!sql) return
  await ensureEducationTables()
  const values = {
    title: input.title.trim(),
    level: input.level,
    subject: input.subject.trim(),
    duration: input.duration?.trim() || null,
    intake: input.intake?.trim() || null,
    tuitionMin: input.tuitionMin ?? null,
    tuitionMax: input.tuitionMax ?? null,
    currency: input.currency.trim().toUpperCase() || "GBP",
    feeNote: input.feeNote?.trim() || null,
    entry: input.entryRequirements?.trim() || null,
    english: input.englishRequirement?.trim() || null,
    url: input.courseUrl?.trim() || null,
  }
  const durationMonths = durationMonthsFromText(values.duration)
  const feeGbp = feeToGbp(values.tuitionMin, values.tuitionMax, values.currency)
  if (input.id) {
    await sql`
      update education_courses set
        title = ${values.title}, level = ${values.level}, subject = ${values.subject}, duration = ${values.duration},
        intake = ${values.intake}, tuition_min = ${values.tuitionMin}, tuition_max = ${values.tuitionMax},
        currency = ${values.currency}, fee_note = ${values.feeNote}, entry_requirements = ${values.entry},
        english_requirement = ${values.english}, course_url = ${values.url}, duration_months = ${durationMonths},
        fee_gbp = ${feeGbp}, admin_edited_at = now(), updated_at = now()
      where id::text = ${input.id}
    `
    return
  }
  await sql`
    insert into education_courses
      (university_id, title, level, subject, duration, intake, tuition_min, tuition_max, currency,
       fee_note, entry_requirements, english_requirement, course_url, duration_months, fee_gbp)
    values
      (${input.universityId}::uuid, ${values.title}, ${values.level}, ${values.subject}, ${values.duration},
       ${values.intake}, ${values.tuitionMin}, ${values.tuitionMax}, ${values.currency}, ${values.feeNote},
       ${values.entry}, ${values.english}, ${values.url}, ${durationMonths}, ${feeGbp})
  `
}

export async function deleteCourse(id: string) {
  if (!sql) return
  await ensureEducationTables()
  await sql`delete from education_courses where id::text = ${id}`
}

export async function deleteUniversity(id: string) {
  if (!sql) return
  await ensureEducationTables()
  await sql`delete from education_universities where id::text = ${id}`
}
