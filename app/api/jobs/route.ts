import { NextResponse } from "next/server"
import { listJobFacetCounts, searchLocalJobs } from "@/lib/career/jobs-store"
import { mapJob } from "@/lib/career/map-job"
import { listFeaturedJobIds } from "@/lib/mobility/featured-jobs"

export const runtime = "nodejs"

function multi(params: URLSearchParams, key: string): string[] {
  return params.getAll(key).map((value) => value.trim()).filter(Boolean)
}

/**
 * Public job board — EasyMoveZone `skilledjobs` only.
 * Supports search, left-rail filters, and pagination.
 * Featured (admin-pushed) roles sort to the top.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")?.trim() || undefined
  const page = Math.max(Number(url.searchParams.get("page") ?? 1) || 1, 1)
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20) || 20, 1), 50)
  const offset = (page - 1) * limit
  const countries = multi(url.searchParams, "country")
  const experienceLevels = multi(url.searchParams, "experienceLevel")
  const jobTypes = multi(url.searchParams, "jobType")
  const categories = multi(url.searchParams, "category")
  const featuredOnly = url.searchParams.get("featured") === "1"

  const featuredIds = (await listFeaturedJobIds())
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id))

  const filters = {
    q,
    countries,
    experienceLevels,
    jobTypes,
    categories,
    limit,
    offset,
    featuredIds,
    featuredOnly,
  }

  const [found, facets] = await Promise.all([
    searchLocalJobs(filters),
    listJobFacetCounts(filters),
  ])

  if (!found) {
    return NextResponse.json({
      jobs: [],
      source: "unconfigured",
      error: "EasyMoveZone job database is not ready.",
      page,
      total: 0,
      totalPages: 0,
      facets: { countries: {}, experienceLevels: {}, jobTypes: {}, categories: {} },
    })
  }

  const featuredSet = new Set(featuredIds.map(String))
  const jobs = found.rows.map((row) => {
    const mapped = mapJob(row)
    return {
      ...mapped,
      experienceLevel: row.experience_level,
      jobType: row.job_type,
      logoUrl: row.logo_url,
      skills: row.skills ?? [],
      featured: featuredSet.has(String(row.id)),
    }
  })

  const totalPages = Math.max(1, Math.ceil(found.total / limit))

  return NextResponse.json({
    jobs,
    source: "easymovezone",
    count: jobs.length,
    total: found.total,
    page,
    limit,
    totalPages,
    featuredCount: featuredIds.length,
    facets: facets ?? { countries: {}, experienceLevels: {}, jobTypes: {}, categories: {} },
  })
}
