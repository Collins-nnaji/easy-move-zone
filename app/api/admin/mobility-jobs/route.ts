import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { listLocalFacets, searchLocalJobs } from "@/lib/career/jobs-store"
import { mapJob } from "@/lib/career/map-job"
import { listFeaturedJobMap, setJobFeatured } from "@/lib/mobility/featured-jobs"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const q = url.searchParams.get("q") ?? undefined
  const country = url.searchParams.get("country") ?? undefined
  const visaType = url.searchParams.get("visaType") ?? undefined
  const category = url.searchParams.get("category") ?? undefined
  const featuredOnly = url.searchParams.get("featured") === "1"
  const page = Math.max(Number(url.searchParams.get("page") ?? 1) || 1, 1)
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 40) || 40, 1), 100)
  const offset = (page - 1) * limit

  const featuredMap = await listFeaturedJobMap()
  const featuredIds = Object.entries(featuredMap)
    .filter(([, featured]) => featured)
    .map(([id]) => Number(id))
    .filter((id) => Number.isFinite(id))

  const [found, facets] = await Promise.all([
    featuredOnly
      ? featuredIds.length
        ? searchLocalJobs({ ids: featuredIds })
        : Promise.resolve({ rows: [], total: 0 })
      : searchLocalJobs({ q, country, visaType, category, limit, offset, featuredIds }),
    listLocalFacets(),
  ])
  if (!found || !facets) {
    return NextResponse.json({ error: "EasyMoveZone job database is not ready." }, { status: 500 })
  }
  let { rows, total } = found

  if (featuredOnly && (q || country || visaType || category)) {
    const needle = (q ?? "").toLowerCase()
    rows = rows.filter((row) => {
      if (needle) {
        const hay = `${row.title} ${row.company ?? ""} ${row.location ?? ""}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      if (country && row.country !== country) return false
      if (visaType && row.visa_type !== visaType) return false
      if (category && row.category !== category) return false
      return true
    })
    total = rows.length
    rows = rows.slice(offset, offset + limit)
  } else if (featuredOnly) {
    total = rows.length
    rows = rows.slice(offset, offset + limit)
  }

  const jobs = rows.map((row) => {
    const mapped = mapJob(row)
    return {
      ...mapped,
      featured: Boolean(featuredMap[String(row.id)]),
      description: row.description?.slice(0, 280) ?? null,
      experienceLevel: row.experience_level,
      jobType: row.job_type,
    }
  })

  return NextResponse.json({
    jobs,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    featuredCount: featuredIds.length,
    facets,
    admin: admin.email,
    source: "easymovezone",
  })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json().catch(() => null)) as {
    externalJobId?: string | number
    externalJobIds?: Array<string | number>
    featured?: boolean
    note?: string
  } | null

  if (Array.isArray(body?.externalJobIds) && typeof body.featured === "boolean") {
    const ids = body.externalJobIds.map(String).filter(Boolean)
    for (const externalJobId of ids) {
      await setJobFeatured({
        externalJobId,
        featured: body.featured,
        note: body.note ?? null,
        updatedBy: admin.email,
      })
    }
    return NextResponse.json({ ok: true, updated: ids.length })
  }

  if (!body?.externalJobId || typeof body.featured !== "boolean") {
    return NextResponse.json({ error: "externalJobId and featured are required." }, { status: 400 })
  }

  await setJobFeatured({
    externalJobId: String(body.externalJobId),
    featured: body.featured,
    note: body.note ?? null,
    updatedBy: admin.email,
  })

  return NextResponse.json({ ok: true })
}
