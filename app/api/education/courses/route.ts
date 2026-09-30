import { NextResponse } from "next/server"
import { isEducationDbConfigured, searchCourses } from "@/lib/education/store"
import { COURSE_FACETS, type CourseSort } from "@/lib/education/types"

export const runtime = "nodejs"

const SORTS: CourseSort[] = ["recommended", "fees", "duration"]

const list = (params: URLSearchParams, key: string) =>
  params
    .getAll(key)
    .flatMap((value) => value.split("|"))
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 30)

export async function GET(request: Request) {
  if (!isEducationDbConfigured()) {
    return NextResponse.json({ courses: [], total: 0, error: "Education catalogue is not configured." }, { status: 503 })
  }
  const params = new URL(request.url).searchParams
  const sort = params.get("sort") as CourseSort | null
  try {
    const result = await searchCourses({
      q: params.get("q")?.slice(0, 120),
      ...Object.fromEntries(COURSE_FACETS.map((key) => [key, list(params, key)])),
      sponsorOnly: params.get("sponsor") === "1",
      universityId: params.get("university"),
      sort: sort && SORTS.includes(sort) ? sort : "recommended",
      page: Number(params.get("page")) || 1,
      pageSize: 20,
      facets: params.get("facets") !== "0",
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ courses: [], total: 0, error: error instanceof Error ? error.message : "Could not load courses" }, { status: 500 })
  }
}
