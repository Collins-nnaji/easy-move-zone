import { neonAuth } from "@neondatabase/auth/next/server"
import { NextResponse } from "next/server"
import { loadCareerProfile } from "@/lib/career/profile-store"
import { loadLatestProfileCvText } from "@/lib/check/documents-store"
import { draftPersonalStatement } from "@/lib/education/ai"
import { getCourse, upsertApplication } from "@/lib/education/store"
import type { StatementFormat } from "@/lib/education/types"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { session, user } = await neonAuth()
  if (!session || !user) return NextResponse.json({ error: "Sign in to draft a personal statement." }, { status: 401 })
  const body = (await request.json().catch(() => ({}))) as {
    courseId?: string
    format?: StatementFormat
    motivation?: string
    wordLimit?: number
  }
  const course = body.courseId ? await getCourse(body.courseId) : null
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

  const userId = String(user.id)
  const [cvText, profile] = await Promise.all([
    loadLatestProfileCvText(userId).catch(() => ""),
    loadCareerProfile(userId, user.email ?? "").catch(() => null),
  ])
  const format: StatementFormat = body.format === "ucas" ? "ucas" : "postgraduate"
  const wordLimit = Math.min(Math.max(Number(body.wordLimit) || 700, 250), 1500)
  const statement = await draftPersonalStatement(
    course,
    { cvText, profile, fullName: user.name ?? "" },
    { format, motivation: String(body.motivation ?? "").slice(0, 3000), wordLimit },
  )
  await upsertApplication(userId, course.id, { personalStatement: statement, status: "preparing" })
  return NextResponse.json({ statement, hasCv: cvText.trim().length > 0 })
}
