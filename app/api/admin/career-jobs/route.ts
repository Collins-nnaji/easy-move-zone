import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import {
  clearFetchHistory,
  deleteSavedUrls,
  listFetchHistory,
  listSavedUrls,
  listSponsorCompanies,
  saveJobUrl,
  updateSavedUrl,
  upsertSponsorCareerUrl,
  urlCheckQueue,
} from "@/lib/career/admin-jobs"
import { fetchJobsFromUrl } from "@/lib/career/fetch-jobs"
import { checkJobUrls } from "@/lib/career/url-check"

export const runtime = "nodejs"
export const maxDuration = 60

const toIds = (value: unknown) =>
  Array.isArray(value) ? value.map(Number).filter((id) => Number.isInteger(id) && id > 0) : []

export async function GET(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const params = new URL(request.url).searchParams
  const view = params.get("view") ?? "urls"
  const page = Math.max(Number(params.get("page") ?? 1) || 1, 1)
  const limit = Math.min(Math.max(Number(params.get("limit") ?? 50) || 50, 1), 200)

  if (view === "sponsors") {
    const hasUrl = (params.get("hasUrl") as "any" | "yes" | "no" | null) ?? "any"
    const result = await listSponsorCompanies({ q: params.get("q") ?? undefined, hasUrl, page, limit })
    return NextResponse.json({
      sponsors: result.rows,
      total: result.total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(result.total / limit)),
    })
  }

  if (view === "history") {
    const result = await listFetchHistory({ status: params.get("status"), q: params.get("q"), page, limit })
    return NextResponse.json({ ...result, page, limit, totalPages: Math.max(1, Math.ceil(result.total / limit)) })
  }

  return NextResponse.json({ urls: await listSavedUrls() })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const str = (key: string) => (typeof body[key] === "string" ? (body[key] as string) : undefined)

  try {
    switch (body.action) {
      case "save-url": {
        const url = str("url")?.trim()
        if (!url) return NextResponse.json({ error: "A careers URL is required." }, { status: 400 })
        const saved = await saveJobUrl({
          label: (str("label") || str("company") || url).trim(),
          url,
          company: str("company")?.trim() || null,
          category: str("category")?.trim() || null,
        })
        return NextResponse.json({ saved })
      }
      case "update-url": {
        await updateSavedUrl(Number(body.id), {
          label: str("label"),
          url: str("url"),
          company: str("company"),
          category: str("category"),
        })
        return NextResponse.json({ ok: true })
      }
      case "delete-urls":
        return NextResponse.json({ deleted: await deleteSavedUrls(toIds(body.ids)) })
      case "upsert-sponsor-url": {
        const company = str("company")?.trim()
        const url = str("url")?.trim()
        if (!company || !url) return NextResponse.json({ error: "Company and careers URL are required." }, { status: 400 })
        const saved = await upsertSponsorCareerUrl({ company, url, label: str("label") ?? company })
        return NextResponse.json({ saved })
      }
      case "fetch-url": {
        const url = str("url")?.trim()
        if (!url) return NextResponse.json({ error: "A careers URL is required." }, { status: 400 })
        const result = await fetchJobsFromUrl({
          url,
          company: str("company") || null,
          savedUrlId: body.id ? Number(body.id) : null,
          source: str("source") ?? "single",
          createdBy: admin.email,
        })
        return NextResponse.json(result)
      }
      case "url-check-queue": {
        const result = await urlCheckQueue({
          limit: Math.min(Math.max(Number(body.limit) || 50, 1), 100),
          force: Boolean(body.force),
          page: Math.max(Number(body.page) || 1, 1),
        })
        return NextResponse.json(result)
      }
      case "check-urls":
        return NextResponse.json({ results: await checkJobUrls(toIds(body.ids)) })
      case "clear-history":
        await clearFetchHistory()
        return NextResponse.json({ ok: true })
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 })
  }
}
