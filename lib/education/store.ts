import { neon } from "@neondatabase/serverless"
import { EDUCATION_SEED } from "./seed"
import {
  APPLICATION_STATUSES,
  STUDY_LEVELS,
  type ApplicationStatus,
  type Course,
  type CourseFit,
  type CourseWithUniversity,
  type EducationApplication,
  type StudyLevel,
  type University,
} from "./types"

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
  await seedIfEmpty()
  ensured = true
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
           fee_note, entry_requirements, english_requirement, course_url)
        values
          (${universityId}, ${course.title}, ${course.level}, ${course.subject}, ${course.duration}, ${course.intake},
           ${course.tuition[0]}, ${course.tuition[1]}, ${uni.currency}, ${course.feeNote ?? null},
           ${course.entry}, ${course.english}, ${uni.website})
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
  }
}

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
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

function toCourseWithUniversity(row: Row): CourseWithUniversity {
  return { ...toCourse(row), university: toUniversity(row, "u_") }
}

export type CourseFilters = {
  country?: string | null
  level?: string | null
  subject?: string | null
  q?: string | null
}

export async function listCourses(filters: CourseFilters = {}): Promise<CourseWithUniversity[]> {
  if (!sql) return []
  await ensureEducationTables()
  const country = filters.country?.trim() || null
  const level = filters.level?.trim() || null
  const subject = filters.subject?.trim() || null
  const q = filters.q?.trim() || null
  const rows = await sql`
    select c.*, u.id as u_id, u.slug as u_slug, u.name as u_name, u.country as u_country, u.city as u_city,
           u.website as u_website, u.summary as u_summary
    from education_courses c
    join education_universities u on u.id = c.university_id
    where (${country}::text is null or u.country = ${country})
      and (${level}::text is null or c.level = ${level})
      and (${subject}::text is null or c.subject = ${subject})
      and (${q}::text is null or c.title ilike '%' || ${q} || '%' or u.name ilike '%' || ${q} || '%'
           or u.city ilike '%' || ${q} || '%' or c.subject ilike '%' || ${q} || '%')
    order by u.country asc, u.name asc, c.title asc
    limit 300
  `
  return rows.map(toCourseWithUniversity)
}

export async function getCourse(id: string): Promise<CourseWithUniversity | null> {
  if (!sql) return null
  await ensureEducationTables()
  const rows = await sql`
    select c.*, u.id as u_id, u.slug as u_slug, u.name as u_name, u.country as u_country, u.city as u_city,
           u.website as u_website, u.summary as u_summary
    from education_courses c
    join education_universities u on u.id = c.university_id
    where c.id::text = ${id}
    limit 1
  `
  return rows[0] ? toCourseWithUniversity(rows[0]) : null
}

export async function listUniversities(): Promise<Array<University & { courseCount: number }>> {
  if (!sql) return []
  await ensureEducationTables()
  const rows = await sql`
    select u.*, count(c.id)::int as course_count
    from education_universities u
    left join education_courses c on c.university_id = u.id
    group by u.id
    order by u.country asc, u.name asc
  `
  return rows.map((row) => ({ ...toUniversity(row), courseCount: Number(row.course_count ?? 0) }))
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
  const rows = await sql`
    select a.id as a_id, a.status as a_status, a.personal_statement as a_statement, a.notes as a_notes,
           a.fit as a_fit, a.updated_at as a_updated_at,
           c.*, u.id as u_id, u.slug as u_slug, u.name as u_name, u.country as u_country, u.city as u_city,
           u.website as u_website, u.summary as u_summary
    from education_applications a
    join education_courses c on c.id = a.course_id
    join education_universities u on u.id = c.university_id
    where a.auth_user_id = ${authUserId}
    order by a.updated_at desc
  `
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export async function createUniversity(input: {
  name: string
  country: string
  city?: string
  website?: string
  summary?: string
}): Promise<string | null> {
  if (!sql) return null
  await ensureEducationTables()
  const slug = `${slugify(input.name)}-${slugify(input.country)}`
  const rows = await sql`
    insert into education_universities (slug, name, country, city, website, summary)
    values (${slug}, ${input.name.trim()}, ${input.country.trim()}, ${input.city?.trim() ?? ""},
            ${input.website?.trim() || null}, ${input.summary?.trim() || null})
    on conflict (slug) do update set name = excluded.name, city = excluded.city,
      website = excluded.website, summary = excluded.summary
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
  if (input.id) {
    await sql`
      update education_courses set
        title = ${values.title}, level = ${values.level}, subject = ${values.subject}, duration = ${values.duration},
        intake = ${values.intake}, tuition_min = ${values.tuitionMin}, tuition_max = ${values.tuitionMax},
        currency = ${values.currency}, fee_note = ${values.feeNote}, entry_requirements = ${values.entry},
        english_requirement = ${values.english}, course_url = ${values.url}, updated_at = now()
      where id::text = ${input.id}
    `
    return
  }
  await sql`
    insert into education_courses
      (university_id, title, level, subject, duration, intake, tuition_min, tuition_max, currency,
       fee_note, entry_requirements, english_requirement, course_url)
    values
      (${input.universityId}::uuid, ${values.title}, ${values.level}, ${values.subject}, ${values.duration},
       ${values.intake}, ${values.tuitionMin}, ${values.tuitionMax}, ${values.currency}, ${values.feeNote},
       ${values.entry}, ${values.english}, ${values.url})
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
