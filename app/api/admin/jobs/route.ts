import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import {
  createLocalJob,
  deleteDuplicateJobs,
  deleteLocalJobs,
  deleteOldJobs,
  findDuplicateJobs,
  listAdminJobs,
  updateLocalJob,
  type DuplicateKeep,
  type DuplicateMatch,
  type JobInput,
} from "@/lib/career/admin-jobs"
import { listLocalFacets } from "@/lib/career/jobs-store"
import { setManualSkilledWorker } from "@/lib/career/sponsor-check"

export const runtime = "nodejs"

const toIds = (value: unknown) =>
  Array.isArray(value) ? value.map(Number).filter((id) => Number.isInteger(id) && id > 0) : []

function toJobInput(raw: unknown): JobInput {
  const body = (raw ?? {}) as Record<string, unknown>
  const str = (key: string) => (typeof body[key] === "string" ? (body[key] as string) : undefined)
  const skills = Array.isArray(body.skills)
    ? body.skills.map(String)
    : typeof body.skills === "string"
      ? body.skills.split(",")
      : undefined
  return {
    title: str("title"),
    company: str("company"),
    location: str("location"),
    country: str("country"),
    category: str("category"),
    experienceLevel: str("experienceLevel"),
    jobType: str("jobType"),
    visaType: str("visaType"),
    url: str("url"),
    logoUrl: str("logoUrl"),
    expiresAt: str("expiresAt"),
    description: str("description"),
    skills: skills?.map((s) => s.trim()).filter(Boolean).slice(0, 30),
  }
}

export async function GET(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const params = new URL(request.url).searchParams

  if (params.get("view") === "duplicates") {
    const match = (params.get("match") ?? "title-company-location") as DuplicateMatch
    const keep = (params.get("keep") ?? "newest") as DuplicateKeep
    return NextResponse.json(await findDuplicateJobs(match, keep))
  }

  const page = Math.max(Number(params.get("page") ?? 1) || 1, 1)
  const limit = Math.min(Math.max(Number(params.get("limit") ?? 50) || 50, 1), 200)

  const [result, facets] = await Promise.all([
    listAdminJobs({
      q: params.get("q"),
      country: params.get("country"),
      visaType: params.get("visaType"),
      category: params.get("category"),
      sponsor: params.get("sponsor"),
      page,
      limit,
    }),
    listLocalFacets(),
  ])

  return NextResponse.json({
    jobs: result.rows,
    total: result.total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(result.total / limit)),
    facets: facets ?? { countries: [], visaTypes: [], categories: [] },
  })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

  try {
    switch (body.action) {
      case "create": {
        const id = await createLocalJob(toJobInput(body.job))
        return NextResponse.json({ id })
      }
      case "update": {
        const id = Number(body.id)
        if (!Number.isInteger(id)) return NextResponse.json({ error: "id is required" }, { status: 400 })
        await updateLocalJob(id, toJobInput(body.job))
        return NextResponse.json({ ok: true })
      }
      case "delete": {
        const deleted = await deleteLocalJobs(toIds(body.ids))
        return NextResponse.json({ deleted })
      }
      case "skilled-worker": {
        const updated = await setManualSkilledWorker(toIds(body.ids), Boolean(body.flagged), admin.email)
        return NextResponse.json({ updated })
      }
      case "delete-old": {
        const months = Number(body.months)
        if (!Number.isFinite(months) || months < 1) return NextResponse.json({ error: "months is required" }, { status: 400 })
        const deleted = await deleteOldJobs(months)
        return NextResponse.json({ deleted, months })
      }
      case "delete-duplicates": {
        const deleted = await deleteDuplicateJobs(
          (body.match as DuplicateMatch) ?? "title-company-location",
          (body.keep as DuplicateKeep) ?? "newest",
        )
        return NextResponse.json({ deleted })
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 })
  }
}
