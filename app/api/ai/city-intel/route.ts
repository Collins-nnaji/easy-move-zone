import { NextRequest, NextResponse } from "next/server"
import { cityIntelWithWeb } from "@/lib/ai/platform"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { cityId?: string; question?: string }
    if (!body.cityId || !body.question?.trim()) {
      return NextResponse.json({ error: "cityId and question are required." }, { status: 400 })
    }
    const result = await cityIntelWithWeb(body.cityId, body.question.trim())
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Unable to fetch city intelligence." }, { status: 500 })
  }
}
