import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import {
  approveStaged,
  bulkStagedByFilter,
  deleteStaged,
  listStagedPage,
  rejectStaged,
  updateStaged,
  type StagedStatus,
} from "@/lib/career/admin-jobs"

export const runtime = "nodejs"

const STATUSES = ["pending", "approved", "rejected"]
const toIds = (value: unknown) =>
  Array.isArray(value) ? value.map(Number).filter((id) => Number.isInteger(id) && id > 0) : []
const toStatus = (value: unknown) => (STATUSES.includes(String(value)) ? (String(value) as StagedStatus) : null)

export async function GET(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const params = new URL(request.url).searchParams
  const page = Math.max(Number(params.get("page") ?? 1) || 1, 1)
  const limit = Math.min(Math.max(Number(params.get("limit") ?? 50) || 50, 1), 200)
  const result = await listStagedPage({
    status: toStatus(params.get("status")),
    country: params.get("country"),
    q: params.get("q"),
    page,
    limit,
  })
  return NextResponse.json({ ...result, page, limit, totalPages: Math.max(1, Math.ceil(result.total / limit)) })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

  try {
    switch (body.action) {
      case "approve":
        return NextResponse.json({ affected: await approveStaged(toIds(body.ids)) })
      case "reject":
        return NextResponse.json({ affected: await rejectStaged(toIds(body.ids)) })
      case "delete":
        return NextResponse.json({ affected: await deleteStaged(toIds(body.ids)) })
      case "update": {
        const job = (body.job ?? {}) as Record<string, unknown>
        const str = (key: string) => (typeof job[key] === "string" ? (job[key] as string) : undefined)
        await updateStaged(Number(body.id), {
          title: str("title"),
          company: str("company"),
          location: str("location"),
          country: str("country"),
          category: str("category"),
          experienceLevel: str("experienceLevel"),
          jobType: str("jobType"),
          visaType: str("visaType"),
          url: str("url"),
          description: str("description"),
          skills: typeof job.skills === "string" ? job.skills.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        })
        return NextResponse.json({ ok: true })
      }
      case "bulk-by-filter": {
        const action = String(body.bulk)
        if (!["approve", "reject", "delete"].includes(action)) {
          return NextResponse.json({ error: "Unknown bulk action" }, { status: 400 })
        }
        const result = await bulkStagedByFilter({
          action: action as "approve" | "reject" | "delete",
          status: toStatus(body.status),
          country: typeof body.country === "string" ? body.country : null,
          batch: 500,
        })
        return NextResponse.json(result)
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 })
  }
}
