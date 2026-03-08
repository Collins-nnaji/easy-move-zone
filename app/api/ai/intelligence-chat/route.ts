import { NextRequest, NextResponse } from "next/server"
import { intelligenceChat } from "@/lib/ai/platform"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { question?: string }
    if (!body.question?.trim()) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 })
    }
    const result = await intelligenceChat(body.question)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Unable to answer question." }, { status: 500 })
  }
}
