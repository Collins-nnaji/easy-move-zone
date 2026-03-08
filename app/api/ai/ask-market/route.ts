import { NextRequest, NextResponse } from "next/server"
import { askMarket } from "@/lib/ai/platform"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { corridorId?: string; question?: string }
    if (!body.corridorId || !body.question) {
      return NextResponse.json({ error: "corridorId and question are required." }, { status: 400 })
    }
    const result = await askMarket(body.corridorId, body.question)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Unable to answer market question." }, { status: 500 })
  }
}
