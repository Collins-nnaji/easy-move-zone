import { NextResponse } from "next/server"
import { listCountryEmployers } from "@/lib/career/sponsors"
import { getCountryGuide } from "@/lib/sponsors/country-guides"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const guide = getCountryGuide(params.get("country") ?? "")
  if (!guide) return NextResponse.json({ error: "Unknown country" }, { status: 400 })
  try {
    const result = await listCountryEmployers(guide.jobCountries, params.get("q") ?? "")
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
