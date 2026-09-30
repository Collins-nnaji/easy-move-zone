import { NextResponse } from "next/server"
import { AdminForbiddenError, assertAdminApi } from "@/lib/auth/assert-admin-api"
import {
  createUniversity,
  deleteCourse,
  deleteUniversity,
  educationStats,
  saveCourse,
  searchCourses,
  searchUniversities,
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

const text = (value: unknown) => (typeof value === "string" ? value : "")
const money = (value: unknown) => {
  if (value === "" || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null
}

export async function GET(request: Request) {
  const denied = await guard()
  if (denied) return denied
  const params = new URL(request.url).searchParams
  const [stats, universities, courses] = await Promise.all([
    educationStats(),
    searchUniversities({ q: params.get("uq"), page: Number(params.get("upage")) || 1, pageSize: 25 }),
    searchCourses({
      q: params.get("cq"),
      universityId: params.get("university"),
      page: Number(params.get("cpage")) || 1,
      pageSize: 50,
      sort: "recommended",
    }),
  ])
  return NextResponse.json({ stats, universities, courses })
}

export async function POST(request: Request) {
  const denied = await guard()
  if (denied) return denied
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

  if (body.type === "university") {
    if (!text(body.name).trim() || !text(body.country).trim()) {
      return NextResponse.json({ error: "Name and country are required" }, { status: 400 })
    }
    const id = await createUniversity({
      name: text(body.name),
      country: text(body.country),
      city: text(body.city),
      website: text(body.website),
      summary: text(body.summary),
      studentSponsor: typeof body.studentSponsor === "boolean" ? body.studentSponsor : undefined,
    })
    return NextResponse.json({ ok: true, id })
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
    return NextResponse.json({ ok: true })
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
  return NextResponse.json({ ok: true })
}
