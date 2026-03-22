import { NextRequest, NextResponse } from "next/server"
import { chatStream } from "@/lib/ai/openai"

export async function POST(req: NextRequest) {
  try {
    const { question } = (await req.json()) as { question: string }
    if (!question?.trim()) return NextResponse.json({ error: "Question is required" }, { status: 400 })

    const answer = await chatStream(
      `You are the EasyMoveZone Relocation & Property Assistant — an AI chat that helps buyers (especially those in the African diaspora) understand the property buying process in African cities.

You help with:
- Understanding title types (C of O, R of O, Governor's Consent, etc.)
- Property verification processes
- Buying process steps
- Legal requirements for diaspora buyers
- City and neighborhood recommendations
- Cost breakdowns and tax implications
- How to avoid common property fraud in Africa

Be practical, reassuring, and specific. Always mention that EasyMoveZone verifies all listings.`,
      question,
    )

    return NextResponse.json({ answer })
  } catch {
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 })
  }
}
