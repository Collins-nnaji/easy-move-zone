import { NextRequest, NextResponse } from "next/server"
import { leadPrequalification } from "@/lib/ai/platform"
import type { LeadInput } from "@/lib/platform/types"

export async function POST(req: NextRequest) {
  try {
    const lead = (await req.json()) as LeadInput
    const result = await leadPrequalification(lead)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Unable to pre-qualify lead." }, { status: 500 })
  }
}
