import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import {
  approveStaged,
  deleteSavedUrl,
  jobsForUrlCheck,
  listSavedUrls,
  listSponsorCompanies,
  listStaged,
  recordUrlCheck,
  rejectStaged,
  saveJobUrl,
  updateLocalJob,
  upsertSponsorCareerUrl,
} from "@/lib/career/admin-jobs"
import { fetchJobsFromUrl } from "@/lib/career/fetch-jobs"

export const runtime = "nodejs"

async function guard() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return null
}

export async function GET(request: Request) {
  const denied = await guard()
  if (denied) return denied
  const url = new URL(request.url)
  const view = url.searchParams.get("view") ?? "urls"
  if (view === "staged") {
    const jobs = await listStaged("pending")
    return NextResponse.json({ jobs })
  }
  if (view === "sponsors") {
    const q = url.searchParams.get("q") ?? undefined
    const hasUrl = (url.searchParams.get("hasUrl") as "any" | "yes" | "no" | null) ?? "any"
    const page = Number(url.searchParams.get("page") ?? 1)
    const limit = Number(url.searchParams.get("limit") ?? 40)
    const result = await listSponsorCompanies({ q, hasUrl, page, limit })
    return NextResponse.json({
      sponsors: result.rows,
      total: result.total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(result.total / Math.max(limit, 1))),
    })
  }
  const urls = await listSavedUrls()
  return NextResponse.json({ urls })
}

export async function POST(request: Request) {
  const denied = await guard()
  if (denied) return denied
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const action = String(body?.action ?? "")

  try {
    if (action === "save-url") {
      const url = String(body?.url ?? "").trim()
      const label = String(body?.label ?? body?.company ?? "Careers page").trim()
      if (!url) return NextResponse.json({ error: "A careers URL is required." }, { status: 400 })
      const saved = await saveJobUrl({
        label,
        url,
        company: body?.company ? String(body.company) : null,
        category: body?.category ? String(body.category) : null,
      })
      return NextResponse.json({ saved })
    }

    if (action === "upsert-sponsor-url") {
      const company = String(body?.company ?? "").trim()
      const url = String(body?.url ?? "").trim()
      if (!company || !url) {
        return NextResponse.json({ error: "Company and careers URL are required." }, { status: 400 })
      }
      const saved = await upsertSponsorCareerUrl({
        company,
        url,
        label: body?.label ? String(body.label) : company,
      })
      return NextResponse.json({ saved })
    }

    if (action === "delete-url") {
      await deleteSavedUrl(Number(body?.id))
      return NextResponse.json({ ok: true })
    }

    if (action === "fetch-url") {
      const result = await fetchJobsFromUrl({
        url: String(body?.url ?? ""),
        company: body?.company ? String(body.company) : null,
        savedUrlId: body?.id ? Number(body.id) : null,
      })
      return NextResponse.json(result)
    }

    if (action === "approve") {
      const ids = Array.isArray(body?.ids) ? body.ids.map(Number).filter(Number.isFinite) : []
      const published = await approveStaged(ids)
      return NextResponse.json({ published })
    }

    if (action === "reject") {
      const ids = Array.isArray(body?.ids) ? body.ids.map(Number).filter(Number.isFinite) : []
      await rejectStaged(ids)
      return NextResponse.json({ ok: true })
    }

    if (action === "update-job") {
      await updateLocalJob(Number(body?.id), {
        title: body?.title ? String(body.title) : undefined,
        company: body?.company ? String(body.company) : undefined,
        url: body?.url ? String(body.url) : undefined,
        visaType: body?.visaType ? String(body.visaType) : undefined,
        country: body?.country ? String(body.country) : undefined,
      })
      return NextResponse.json({ ok: true })
    }

    if (action === "validate-urls") {
      const page = Math.max(Number(body?.page ?? 1), 1)
      const limit = Math.min(Math.max(Number(body?.limit ?? 15), 1), 30)
      const jobs = await jobsForUrlCheck(page, limit)
      const results = []
      for (const job of jobs) {
        const url = String(job.url ?? "")
        let status = "no-url"
        let isValid = false
        let errorMessage: string | null = url ? null : "No URL"
        if (url) {
          try {
            const response = await fetch(url, {
              method: "GET",
              redirect: "follow",
              signal: AbortSignal.timeout(8000),
              headers: { "User-Agent": "EasyMoveZoneUrlCheck/1.0" },
            })
            status = String(response.status)
            isValid = response.status >= 200 && response.status < 400
            if (!isValid) errorMessage = `HTTP ${response.status}`
          } catch (error) {
            status = "error"
            errorMessage = error instanceof Error ? error.message : "Request failed"
          }
        }
        await recordUrlCheck(Number(job.id), url, status, isValid, errorMessage)
        results.push({
          id: job.id,
          title: job.title,
          company: job.company,
          url,
          status,
          isValid,
          errorMessage,
        })
      }
      return NextResponse.json({
        page,
        checked: results.length,
        valid: results.filter((item) => item.isValid).length,
        invalid: results.filter((item) => !item.isValid),
        results,
      })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
