import { NextResponse } from "next/server"
import { searchSponsors } from "@/lib/career/sponsors"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? ""
  if (query.trim().length < 2) return NextResponse.json([])
  try {
    const sponsors = await searchSponsors(query)
    return NextResponse.json(sponsors)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
