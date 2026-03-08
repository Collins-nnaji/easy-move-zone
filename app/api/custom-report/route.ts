import { NextRequest, NextResponse } from "next/server"
import { leadPrequalification } from "@/lib/ai/platform"
import { createCustomReportRequest } from "@/lib/platform"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string
      company?: string
      email?: string
      targetMarket?: string
      sector?: string
      questions?: string
      timeline?: string
      budgetRange?: string
    }
    if (!body.name || !body.company || !body.email || !body.targetMarket || !body.questions) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 })
    }

    const [firstName, ...rest] = body.name.trim().split(" ")
    const lastName = rest.join(" ") || "N/A"

    const leadInput = {
      firstName,
      lastName,
      company: body.company,
      email: body.email,
      direction: "Commissioning a report",
      targetMarket: body.targetMarket,
      businessSector: body.sector ?? "General",
      timeline: body.timeline ?? "Within 3 months",
      budgetRange: body.budgetRange ?? "Let's discuss",
      message: body.questions,
      source: "Custom report form",
    }

    const ai = await leadPrequalification(leadInput)
    const created = await createCustomReportRequest(leadInput, ai.summary)

    return NextResponse.json({ ok: true, lead: created })
  } catch {
    return NextResponse.json({ error: "Unable to submit custom report request." }, { status: 500 })
  }
}
