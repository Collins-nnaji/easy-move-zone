import { neonAuth } from "@neondatabase/auth/next/server"
import { neon } from "@neondatabase/serverless"

export const runtime = "nodejs"

const databaseUrl = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = databaseUrl ? neon(databaseUrl) : null

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {}
}

function sourceFrom(settings: Record<string, unknown>) {
  return {
    sourceDocumentId: settings.sourceDocumentId ? String(settings.sourceDocumentId) : null,
    sourceFileName: settings.sourceFileName ? String(settings.sourceFileName) : null,
  }
}

function cvFromRow(row: Record<string, unknown>) {
  const settings = object(row.settings)
  const categories = Array.isArray(row.skill_categories) ? row.skill_categories.map(object) : []
  return {
    id: Number(row.id), name: String(row.name || "Untitled CV"),
    personalInfo: object(row.personal_info),
    experience: Array.isArray(row.experiences) ? row.experiences : [],
    education: Array.isArray(row.education) ? row.education : [],
    skillCategories: categories.length
      ? categories
      : [{ id: "skills", name: "Skills", skills: Array.isArray(row.skills) ? row.skills : [] }],
    parsed: settings.parsed ?? {}, templateId: "minimal",
    ...sourceFrom(settings),
    createdAt: String(row.created_at ?? ""), updatedAt: String(row.updated_at ?? ""),
  }
}

function cvColumns(data: Record<string, unknown>) {
  const personal = object(data.personalInfo)
  const experience = Array.isArray(data.experience) ? data.experience : []
  const education = Array.isArray(data.education) ? data.education : []
  const categories = Array.isArray(data.skillCategories) ? data.skillCategories.map(object) : []
  const skills = categories.flatMap((item) => Array.isArray(item.skills) ? item.skills.map(String) : []).slice(0, 60)
  return { personal, experience, education, categories, skills }
}

async function userId() {
  const { session, user } = await neonAuth()
  return session && user ? String(user.id) : null
}

export async function GET(request: Request) {
  const uid = await userId()
  if (!uid) return Response.json({ error: "Unauthorized" }, { status: 401 })
  if (!sql) return Response.json({ cvs: [] })
  const id = Number(new URL(request.url).searchParams.get("id"))
  if (Number.isFinite(id) && id > 0) {
    const rows = await sql`select * from skilledjobs.cvs where id = ${id} and user_id = ${uid} limit 1`
    return rows[0] ? Response.json({ cv: cvFromRow(rows[0]) }) : Response.json({ error: "CV not found" }, { status: 404 })
  }
  const rows = await sql`
    select id, name, settings, created_at, updated_at from skilledjobs.cvs
    where user_id = ${uid} order by updated_at desc limit 30
  `
  return Response.json({ cvs: rows.map((row) => ({
    id: Number(row.id), name: String(row.name || "Untitled CV"),
    ...sourceFrom(object(row.settings)),
    createdAt: String(row.created_at ?? ""), updatedAt: String(row.updated_at ?? ""),
  })) })
}

export async function POST(request: Request) {
  const uid = await userId()
  if (!uid) return Response.json({ error: "Unauthorized" }, { status: 401 })
  if (!sql) return Response.json({ error: "Database is not configured" }, { status: 503 })
  const body = object(await request.json().catch(() => null))
  const data = object(body.data)
  const source = object(body.source)
  const { personal, experience, education, categories, skills } = cvColumns(data)
  const name = String(body.name || personal.fullName || "My CV").trim().slice(0, 180)
  const settings = {
    source: "easymove-score", parsed: data.parsed ?? {},
    sourceDocumentId: source.documentId ? String(source.documentId) : null,
    sourceFileName: source.fileName ? String(source.fileName).slice(0, 240) : null,
  }
  const rows = await sql`
    insert into skilledjobs.cvs (
      user_id, name, personal_info, summary, experiences, education, skills, skill_categories,
      template_id, settings, is_optimized, created_at, updated_at
    ) values (
      ${uid}, ${name}, ${JSON.stringify(personal)}::jsonb, ${String(personal.summary ?? "")},
      ${JSON.stringify(experience)}::jsonb, ${JSON.stringify(education)}::jsonb, ${skills},
      ${JSON.stringify(categories)}::jsonb,
      'minimal', ${JSON.stringify(settings)}::jsonb, false, now(), now()
    ) returning *
  `
  return Response.json({ cv: cvFromRow(rows[0]) })
}

export async function PUT(request: Request) {
  const uid = await userId()
  if (!uid) return Response.json({ error: "Unauthorized" }, { status: 401 })
  if (!sql) return Response.json({ error: "Database is not configured" }, { status: 503 })
  const body = object(await request.json().catch(() => null))
  const id = Number(body.id)
  const data = object(body.data)
  if (!Number.isFinite(id)) return Response.json({ error: "CV id is required" }, { status: 400 })
  const { personal, experience, education, categories, skills } = cvColumns(data)
  const patch = { source: "easymove-score", parsed: data.parsed ?? {} }
  const rows = await sql`
    update skilledjobs.cvs set name = ${String(body.name || "My CV").slice(0, 180)},
      personal_info = ${JSON.stringify(personal)}::jsonb, summary = ${String(personal.summary ?? "")},
      experiences = ${JSON.stringify(experience)}::jsonb, education = ${JSON.stringify(education)}::jsonb,
      skills = ${skills}, skill_categories = ${JSON.stringify(categories)}::jsonb, template_id = 'minimal',
      settings = coalesce(settings, '{}'::jsonb) || ${JSON.stringify(patch)}::jsonb,
      updated_at = now() where id = ${id} and user_id = ${uid} returning *
  `
  return rows[0] ? Response.json({ cv: cvFromRow(rows[0]) }) : Response.json({ error: "CV not found" }, { status: 404 })
}

export async function DELETE(request: Request) {
  const uid = await userId()
  if (!uid) return Response.json({ error: "Unauthorized" }, { status: 401 })
  if (!sql) return Response.json({ error: "Database is not configured" }, { status: 503 })
  const id = Number(new URL(request.url).searchParams.get("id"))
  if (!Number.isFinite(id)) return Response.json({ error: "CV id is required" }, { status: 400 })
  await sql`delete from skilledjobs.cvs where id = ${id} and user_id = ${uid}`
  return Response.json({ deleted: true })
}
