import { NextRequest, NextResponse } from "next/server"
import { compareMarkets } from "@/lib/ai/platform"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { marketA?: string; marketB?: string }
    if (!body.marketA || !body.marketB) {
      return NextResponse.json({ error: "Two markets are required." }, { status: 400 })
    }
    const result = await compareMarkets(body.marketA, body.marketB)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Unable to compare markets." }, { status: 500 })
  }
}
