import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export type CareerProfile = {
  currentRole: string
  currentCompany: string
  currentLocation: string
  yearsExperience: number | null
  seniority: string
  industry: string
  skills: string[]
  bio: string
  linkedinUrl: string
  phone: string
  visaRequired: boolean
  jobSearchStatus: string
  isOpenToWork: boolean
  firstName: string
  lastName: string
  email: string
}

export const EMPTY_CAREER_PROFILE: CareerProfile = {
  currentRole: "",
  currentCompany: "",
  currentLocation: "",
  yearsExperience: null,
  seniority: "",
  industry: "",
  skills: [],
  bio: "",
  linkedinUrl: "",
  phone: "",
  visaRequired: false,
  jobSearchStatus: "Open",
  isOpenToWork: true,
  firstName: "",
  lastName: "",
  email: "",
}

function toSkills(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(String).map((s) => s.trim()).filter(Boolean))].slice(0, 40)
}

function mapRow(row: Record<string, unknown> | undefined, fallbackEmail = ""): CareerProfile {
  if (!row) return { ...EMPTY_CAREER_PROFILE, email: fallbackEmail }
  return {
    currentRole: String(row.current_role ?? ""),
    currentCompany: String(row.current_company ?? ""),
    currentLocation: String(row.current_location ?? ""),
    yearsExperience: row.years_experience == null ? null : Number(row.years_experience),
    seniority: String(row.seniority ?? ""),
    industry: String(row.industry ?? ""),
    skills: toSkills(row.skills),
    bio: String(row.bio ?? ""),
    linkedinUrl: String(row.linkedin_url ?? ""),
    phone: String(row.phone ?? ""),
    visaRequired: Boolean(row.visa_required),
    jobSearchStatus: String(row.job_search_status ?? "Open"),
    isOpenToWork: row.is_open_to_work == null ? true : Boolean(row.is_open_to_work),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    email: String(row.email ?? fallbackEmail),
  }
}

export function normalizeCareerInput(input: Partial<CareerProfile>, fallbackEmail = ""): CareerProfile {
  const years =
    input.yearsExperience == null || Number.isNaN(Number(input.yearsExperience))
      ? null
      : Math.max(0, Math.min(50, Math.round(Number(input.yearsExperience))))

  return {
    ...EMPTY_CAREER_PROFILE,
    currentRole: String(input.currentRole ?? "").trim().slice(0, 120),
    currentCompany: String(input.currentCompany ?? "").trim().slice(0, 120),
    currentLocation: String(input.currentLocation ?? "").trim().slice(0, 120),
    yearsExperience: years,
    seniority: String(input.seniority ?? "").trim().slice(0, 60),
    industry: String(input.industry ?? "").trim().slice(0, 80),
    skills: toSkills(input.skills),
    bio: String(input.bio ?? "").trim().slice(0, 2000),
    linkedinUrl: String(input.linkedinUrl ?? "").trim().slice(0, 240),
    phone: String(input.phone ?? "").trim().slice(0, 40),
    visaRequired: Boolean(input.visaRequired),
    jobSearchStatus: String(input.jobSearchStatus ?? "Open").trim().slice(0, 40) || "Open",
    isOpenToWork: input.isOpenToWork !== false,
    firstName: String(input.firstName ?? "").trim().slice(0, 80),
    lastName: String(input.lastName ?? "").trim().slice(0, 80),
    email: String(input.email ?? fallbackEmail).trim().slice(0, 200) || fallbackEmail,
  }
}

export async function loadCareerProfile(userId: string, email = ""): Promise<CareerProfile> {
  if (!sql) return { ...EMPTY_CAREER_PROFILE, email }
  try {
    const rows = await sql`
      SELECT first_name, last_name, email, bio, phone, linkedin_url,
             current_role, current_company, current_location, years_experience,
             seniority, industry, skills, visa_required, job_search_status, is_open_to_work
      FROM skilledjobs.users
      WHERE id = ${userId}
      LIMIT 1
    `
    return mapRow(rows[0] as Record<string, unknown> | undefined, email)
  } catch {
    return { ...EMPTY_CAREER_PROFILE, email }
  }
}

export async function saveCareerProfile(
  userId: string,
  input: Partial<CareerProfile>,
  email = "",
): Promise<CareerProfile> {
  if (!sql) throw new Error("Database is not configured")
  const profile = normalizeCareerInput(input, email)

  await sql`
    INSERT INTO skilledjobs.users (
      id, email, first_name, last_name, bio, phone, linkedin_url,
      current_role, current_company, current_location, years_experience,
      seniority, industry, skills, visa_required, job_search_status, is_open_to_work,
      updated_at, created_at
    ) VALUES (
      ${userId},
      ${profile.email || null},
      ${profile.firstName || null},
      ${profile.lastName || null},
      ${profile.bio || null},
      ${profile.phone || null},
      ${profile.linkedinUrl || null},
      ${profile.currentRole || null},
      ${profile.currentCompany || null},
      ${profile.currentLocation || null},
      ${profile.yearsExperience},
      ${profile.seniority || null},
      ${profile.industry || null},
      ${profile.skills},
      ${profile.visaRequired},
      ${profile.jobSearchStatus},
      ${profile.isOpenToWork},
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, skilledjobs.users.email),
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      bio = EXCLUDED.bio,
      phone = EXCLUDED.phone,
      linkedin_url = EXCLUDED.linkedin_url,
      current_role = EXCLUDED.current_role,
      current_company = EXCLUDED.current_company,
      current_location = EXCLUDED.current_location,
      years_experience = EXCLUDED.years_experience,
      seniority = EXCLUDED.seniority,
      industry = EXCLUDED.industry,
      skills = EXCLUDED.skills,
      visa_required = EXCLUDED.visa_required,
      job_search_status = EXCLUDED.job_search_status,
      is_open_to_work = EXCLUDED.is_open_to_work,
      updated_at = now()
  `

  return loadCareerProfile(userId, profile.email)
}

export async function mergeCareerSkills(userId: string, skills: string[], email = "") {
  const existing = await loadCareerProfile(userId, email)
  const merged = toSkills([...existing.skills, ...skills])
  return saveCareerProfile(userId, { ...existing, skills: merged }, email)
}
