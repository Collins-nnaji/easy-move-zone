import { NextResponse } from "next/server"
import { searchOccupationCodes } from "@/lib/career/sponsors"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? ""
  try {
    const codes = await searchOccupationCodes(query)
    return NextResponse.json(codes)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
