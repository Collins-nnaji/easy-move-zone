import { NextResponse } from "next/server"
import { AdminForbiddenError, assertAdminApi } from "@/lib/auth/assert-admin-api"
import {
  createUniversity,
  deleteCourse,
  deleteUniversity,
  listCourses,
  listUniversities,
  saveCourse,
} from "@/lib/education/store"
import { STUDY_LEVELS, type StudyLevel } from "@/lib/education/types"

export const runtime = "nodejs"

async function guard() {
  try {
    await assertAdminApi()
    return null
  } catch (error) {
    if (error instanceof AdminForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    throw error
  }
}

async function snapshot() {
  const [universities, courses] = await Promise.all([listUniversities(), listCourses()])
  return NextResponse.json({ universities, courses })
}

const text = (value: unknown) => (typeof value === "string" ? value : "")
const money = (value: unknown) => {
  if (value === "" || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null
}

export async function GET() {
  return (await guard()) ?? snapshot()
}

export async function POST(request: Request) {
  const denied = await guard()
  if (denied) return denied
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

  if (body.type === "university") {
    if (!text(body.name).trim() || !text(body.country).trim()) {
      return NextResponse.json({ error: "Name and country are required" }, { status: 400 })
    }
    await createUniversity({
      name: text(body.name),
      country: text(body.country),
      city: text(body.city),
      website: text(body.website),
      summary: text(body.summary),
    })
    return snapshot()
  }

  if (body.type === "course") {
    const level = (STUDY_LEVELS as readonly string[]).includes(text(body.level)) ? (text(body.level) as StudyLevel) : null
    if (!text(body.universityId) || !text(body.title).trim() || !level) {
      return NextResponse.json({ error: "University, title and level are required" }, { status: 400 })
    }
    await saveCourse({
      id: text(body.id) || undefined,
      universityId: text(body.universityId),
      title: text(body.title),
      level,
      subject: text(body.subject),
      duration: text(body.duration),
      intake: text(body.intake),
      tuitionMin: money(body.tuitionMin),
      tuitionMax: money(body.tuitionMax),
      currency: text(body.currency) || "GBP",
      feeNote: text(body.feeNote),
      entryRequirements: text(body.entryRequirements),
      englishRequirement: text(body.englishRequirement),
      courseUrl: text(body.courseUrl),
    })
    return snapshot()
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 })
}

export async function DELETE(request: Request) {
  const denied = await guard()
  if (denied) return denied
  const params = new URL(request.url).searchParams
  const id = params.get("id")
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
  if (params.get("type") === "university") await deleteUniversity(id)
  else await deleteCourse(id)
  return snapshot()
}
