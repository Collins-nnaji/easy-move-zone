import { neon } from "@neondatabase/serverless"
import { chatJson } from "@/lib/ai/openai"
import { searchLocalJobs } from "@/lib/career/jobs-store"

const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = databaseUrl ? neon(databaseUrl) : null

export type PackExperience = {
  id: string
  role: string
  company: string
  location: string
  startDate: string
  endDate: string
  bullets: string[]
}

export type PackEducation = {
  id: string
  qualification: string
  institution: string
  date: string
}

export type ApplicationPackData = {
  personal: {
    fullName: string
    title: string
    email: string
    phone: string
    location: string
    linkedin: string
    summary: string
  }
  experience: PackExperience[]
  education: PackEducation[]
  skills: string[]
  coverLetter: string
  applicationChecklist: string[]
}

function text(value: unknown, max = 4000) {
  return String(value ?? "").trim().slice(0, max)
}

function list(value: unknown, max = 20) {
  return Array.isArray(value) ? value.map((item) => text(item, 300)).filter(Boolean).slice(0, max) : []
}

export function normalizeApplicationPack(value: Partial<ApplicationPackData>, fallback: ApplicationPackData): ApplicationPackData {
  const personal = value.personal ?? fallback.personal
  return {
    personal: {
      fullName: text(personal.fullName || fallback.personal.fullName, 150),
      title: text(personal.title || fallback.personal.title, 150),
      email: text(personal.email || fallback.personal.email, 200),
      phone: text(personal.phone || fallback.personal.phone, 60),
      location: text(personal.location || fallback.personal.location, 150),
      linkedin: text(personal.linkedin || fallback.personal.linkedin, 300),
      summary: text(personal.summary || fallback.personal.summary, 1800),
    },
    experience: Array.isArray(value.experience) ? value.experience.slice(0, 12).map((item, index) => ({
      id: text(item.id, 80) || `exp-${index}`,
      role: text(item.role, 150), company: text(item.company, 150), location: text(item.location, 150),
      startDate: text(item.startDate, 50), endDate: text(item.endDate, 50), bullets: list(item.bullets, 8),
    })) : fallback.experience,
    education: Array.isArray(value.education) ? value.education.slice(0, 10).map((item, index) => ({
      id: text(item.id, 80) || `edu-${index}`,
      qualification: text(item.qualification, 180), institution: text(item.institution, 180), date: text(item.date, 60),
    })) : fallback.education,
    skills: list(value.skills, 30).length ? list(value.skills, 30) : fallback.skills,
    coverLetter: text(value.coverLetter || fallback.coverLetter, 6000),
    applicationChecklist: list(value.applicationChecklist, 12).length ? list(value.applicationChecklist, 12) : fallback.applicationChecklist,
  }
}

export async function generateApplicationPack(input: {
  jobId: number
  cvText: string
  cvData?: unknown
  user: { name?: string | null; email?: string | null }
}) {
  const found = await searchLocalJobs({ ids: [input.jobId], limit: 1 })
  const job = found?.rows[0]
  if (!job) throw new Error("Job not found")

  const fallback: ApplicationPackData = {
    personal: {
      fullName: input.user.name || "Your name", title: job.title, email: input.user.email || "",
      phone: "", location: "", linkedin: "",
      summary: input.cvText.slice(0, 500).replace(/\s+/g, " "),
    },
    experience: [], education: [], skills: (job.skills ?? []).slice(0, 12),
    coverLetter: `Dear Hiring Team,\n\nI am applying for the ${job.title} role${job.company ? ` at ${job.company}` : ""}. My experience and skills align with the requirements described in the vacancy.\n\nI would welcome the opportunity to discuss my application.\n\nKind regards,\n${input.user.name || "Candidate"}`,
    applicationChecklist: ["Tailored CV", "Review the vacancy requirements", "Confirm visa sponsorship wording", "Proofread before applying"],
  }

  const result = await chatJson<Partial<ApplicationPackData>>(
    "You are an expert UK CV writer. Tailor truthfully using only facts from the candidate CV. Never invent employers, dates, qualifications, metrics, tools or achievements. Return valid JSON only. Use concise achievement-led bullets and UK English.",
    `Create one ATS-friendly, single-column application pack for this vacancy.\n\nJOB\nTitle: ${job.title}\nCompany: ${job.company || ""}\nLocation: ${job.location || job.country || ""}\nDescription: ${text(job.description, 9000)}\nRequired skills: ${(job.skills ?? []).join(", ")}\n\nCANDIDATE CV (structured extraction)\n${input.cvData ? text(JSON.stringify(input.cvData), 16000) : "Not available"}\n\nCANDIDATE CV (original extracted text)\n${text(input.cvText, 16000)}\n\nReturn: {"personal":{"fullName":"","title":"","email":"","phone":"","location":"","linkedin":"","summary":""},"experience":[{"id":"exp-1","role":"","company":"","location":"","startDate":"","endDate":"","bullets":[""]}],"education":[{"id":"edu-1","qualification":"","institution":"","date":""}],"skills":[""],"coverLetter":"","applicationChecklist":[""]}. Preserve the candidate's real chronology. Tailor wording and ordering, not facts.`,
    fallback,
    { maxTokens: 4500, temperature: 0.2 },
  )

  return { data: normalizeApplicationPack(result, fallback), job }
}

export async function saveApplicationPack(input: {
  userId: string
  jobId: number
  jobTitle: string
  data: ApplicationPackData
  id?: number | null
}) {
  if (!sql) return null
  if (input.id) {
    const rows = await sql`
      update skilledjobs.cvs set
        name = ${`${input.jobTitle} application CV`}, personal_info = ${JSON.stringify(input.data.personal)}::jsonb,
        summary = ${input.data.personal.summary}, experiences = ${JSON.stringify(input.data.experience)}::jsonb,
        education = ${JSON.stringify(input.data.education)}::jsonb, skills = ${input.data.skills},
        settings = ${JSON.stringify({ applicationPack: true, jobId: input.jobId, coverLetter: input.data.coverLetter, applicationChecklist: input.data.applicationChecklist, primaryColor: "#1b231e" })}::jsonb,
        template_id = 'minimal', job_description = ${String(input.jobId)}, updated_at = now()
      where id = ${input.id} and user_id = ${input.userId}
      returning id
    `
    return rows[0]?.id ? Number(rows[0].id) : null
  }
  const rows = await sql`
    insert into skilledjobs.cvs (
      user_id, name, personal_info, summary, experiences, education, skills, template_id, settings,
      job_description, is_optimized, last_optimized, created_at, updated_at
    ) values (
      ${input.userId}, ${`${input.jobTitle} application CV`}, ${JSON.stringify(input.data.personal)}::jsonb,
      ${input.data.personal.summary}, ${JSON.stringify(input.data.experience)}::jsonb,
      ${JSON.stringify(input.data.education)}::jsonb, ${input.data.skills}, 'minimal',
      ${JSON.stringify({ applicationPack: true, jobId: input.jobId, coverLetter: input.data.coverLetter, applicationChecklist: input.data.applicationChecklist, primaryColor: "#1b231e" })}::jsonb,
      ${String(input.jobId)}, true, now(), now(), now()
    ) returning id
  `
  return rows[0]?.id ? Number(rows[0].id) : null
}
