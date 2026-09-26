import { NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import { listAssessmentCatalog, listAttempts, listBadges, startAssessment, submitAssessment } from "@/lib/career/assessments"

export const runtime = "nodejs"

async function userId() {
  const { user } = await neonAuth()
  return user?.id ?? null
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = await userId()
  if (url.searchParams.get("badges") === "1") {
    if (!id) return NextResponse.json({ badges: [] })
    const badges = await listBadges(id)
    return NextResponse.json({ badges })
  }
  if (url.searchParams.get("progress") === "1") {
    if (!id) return NextResponse.json({ attempts: [], badges: [] })
    const [attempts, badges] = await Promise.all([listAttempts(id), listBadges(id)])
    return NextResponse.json({ attempts, badges })
  }
  const category = url.searchParams.get("category") ?? undefined
  return NextResponse.json(listAssessmentCatalog(category))
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: string
    roleId?: string
    attemptId?: string
    answers?: Record<string, string>
  } | null

  const id = await userId()

  if (body?.action === "start" && body.roleId) {
    const started = await startAssessment(body.roleId, id)
    if (!started) return NextResponse.json({ error: "Unknown role" }, { status: 404 })
    return NextResponse.json(started)
  }

  if (body?.action === "submit" && body.attemptId && body.answers) {
    const result = await submitAssessment(body.attemptId, id, body.answers)
    if (!result) return NextResponse.json({ error: "That assessment is no longer open." }, { status: 400 })
    return NextResponse.json({ ...result, saved: Boolean(id) })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
