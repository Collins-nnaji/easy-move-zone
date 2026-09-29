import { NextResponse } from "next/server"
import { listSponsorsWithCareerPages } from "@/lib/career/sponsors"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const result = await listSponsorsWithCareerPages(100)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load sponsors"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
