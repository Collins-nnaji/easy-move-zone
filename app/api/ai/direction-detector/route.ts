import { NextRequest, NextResponse } from "next/server"
import { detectDirection } from "@/lib/ai/platform"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { description?: string }
    if (!body.description?.trim()) {
      return NextResponse.json({ error: "Description is required." }, { status: 400 })
    }

    const result = await detectDirection(body.description)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Unable to detect direction." }, { status: 500 })
  }
}
