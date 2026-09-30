import { NextResponse } from "next/server"
import { isEducationDbConfigured, searchUniversities } from "@/lib/education/store"
import { INSTITUTION_KINDS, type InstitutionKind, type UniversitySort } from "@/lib/education/types"

export const runtime = "nodejs"

const SORTS: UniversitySort[] = ["recommended", "courses", "name"]

export async function GET(request: Request) {
  if (!isEducationDbConfigured()) {
    return NextResponse.json({ universities: [], total: 0, error: "Education catalogue is not configured." }, { status: 503 })
  }
  const params = new URL(request.url).searchParams
  const list = (key: string) => params.getAll(key).flatMap((value) => value.split("|")).filter(Boolean).slice(0, 20)
  const sort = params.get("sort") as UniversitySort | null
  try {
    const result = await searchUniversities({
      q: params.get("q")?.slice(0, 120),
      country: list("country"),
      kind: list("kind").filter((value): value is InstitutionKind => (INSTITUTION_KINDS as readonly string[]).includes(value)),
      sponsorOnly: params.get("sponsor") === "1",
      hasCourses: params.get("courses") === "1",
      sort: sort && SORTS.includes(sort) ? sort : "recommended",
      page: Number(params.get("page")) || 1,
      pageSize: 24,
      facets: true,
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ universities: [], total: 0, error: error instanceof Error ? error.message : "Could not load institutions" }, { status: 500 })
  }
}
