import { NextRequest, NextResponse } from "next/server"
import { recommendService } from "@/lib/ai/platform"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      businessType?: string
      targetMarket?: string
      timelineBudget?: string
    }

    if (!body.businessType || !body.targetMarket || !body.timelineBudget) {
      return NextResponse.json({ error: "All quiz inputs are required." }, { status: 400 })
    }

    const result = await recommendService({
      businessType: body.businessType,
      targetMarket: body.targetMarket,
      timelineBudget: body.timelineBudget,
    })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Unable to generate service recommendation." }, { status: 500 })
  }
}
