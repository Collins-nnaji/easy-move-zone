import { neonAuth } from "@neondatabase/auth/next/server"
import { NextResponse } from "next/server"
import { deleteApplication, getCourse, listApplications, upsertApplication } from "@/lib/education/store"
import type { ApplicationStatus } from "@/lib/education/types"

export const runtime = "nodejs"

async function userId() {
  const { session, user } = await neonAuth()
  return session && user ? String(user.id) : null
}

const unauthorized = () => NextResponse.json({ error: "Sign in to use the application hub." }, { status: 401 })

export async function GET() {
  const id = await userId()
  if (!id) return unauthorized()
  return NextResponse.json({ applications: await listApplications(id) })
}

export async function POST(request: Request) {
  const id = await userId()
  if (!id) return unauthorized()
  const body = (await request.json().catch(() => ({}))) as { courseId?: string }
  if (!body.courseId || !(await getCourse(body.courseId))) return NextResponse.json({ error: "Course not found" }, { status: 404 })
  await upsertApplication(id, body.courseId)
  return NextResponse.json({ applications: await listApplications(id) })
}

export async function PATCH(request: Request) {
  const id = await userId()
  if (!id) return unauthorized()
  const body = (await request.json().catch(() => ({}))) as {
    courseId?: string
    status?: ApplicationStatus
    personalStatement?: string
    notes?: string
  }
  if (!body.courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 })
  await upsertApplication(id, body.courseId, {
    status: body.status,
    personalStatement: typeof body.personalStatement === "string" ? body.personalStatement.slice(0, 20000) : undefined,
    notes: typeof body.notes === "string" ? body.notes.slice(0, 5000) : undefined,
  })
  return NextResponse.json({ applications: await listApplications(id) })
}

export async function DELETE(request: Request) {
  const id = await userId()
  if (!id) return unauthorized()
  const courseId = new URL(request.url).searchParams.get("courseId")
  if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 })
  await deleteApplication(id, courseId)
  return NextResponse.json({ applications: await listApplications(id) })
}
