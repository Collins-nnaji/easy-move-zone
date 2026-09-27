import { neonAuth } from "@neondatabase/auth/next/server"
import { NextResponse } from "next/server"
import { loadCareerProfile } from "@/lib/career/profile-store"
import { loadLatestProfileCvText } from "@/lib/check/documents-store"
import { checkCourseFit } from "@/lib/education/ai"
import { getCourse, upsertApplication } from "@/lib/education/store"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { session, user } = await neonAuth()
  if (!session || !user) return NextResponse.json({ error: "Sign in to check your fit." }, { status: 401 })
  const body = (await request.json().catch(() => ({}))) as { courseId?: string }
  const course = body.courseId ? await getCourse(body.courseId) : null
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

  const userId = String(user.id)
  const [cvText, profile] = await Promise.all([
    loadLatestProfileCvText(userId).catch(() => ""),
    loadCareerProfile(userId, user.email ?? "").catch(() => null),
  ])
  const fit = await checkCourseFit(course, { cvText, profile })
  await upsertApplication(userId, course.id, { fit })
  return NextResponse.json({ fit, hasCv: cvText.trim().length > 0 })
}
