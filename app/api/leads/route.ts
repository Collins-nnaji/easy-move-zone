import { NextRequest, NextResponse } from "next/server"
import { leadPrequalification } from "@/lib/ai/platform"
import { createLead } from "@/lib/platform"
import type { LeadInput } from "@/lib/platform/types"

function validateLead(lead: LeadInput): string | null {
  if (!lead.firstName || !lead.lastName) return "Name is required."
  if (!lead.company) return "Company is required."
  if (!lead.email) return "Email is required."
  if (!lead.direction) return "Direction is required."
  if (!lead.targetMarket) return "Target market is required."
  if (!lead.businessSector) return "Business sector is required."
  if (!lead.timeline) return "Timeline is required."
  if (!lead.budgetRange) return "Budget range is required."
  if (!lead.message || lead.message.length < 40) return "Message must be at least 40 characters."
  if (!lead.source) return "Source is required."
  return null
}

export async function POST(req: NextRequest) {
  try {
    const lead = (await req.json()) as LeadInput
    const validationError = validateLead(lead)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const ai = await leadPrequalification(lead)
    const aiSummary = [
      ai.summary,
      `Likely match: ${ai.likelyServiceMatch}`,
      `Priority: ${ai.priorityLevel}`,
      ai.talkingPoints?.length ? `Talking points: ${ai.talkingPoints.join(" | ")}` : "",
      ai.redFlags?.length ? `Red flags: ${ai.redFlags.join(" | ")}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    const createdLead = await createLead(lead, aiSummary)

    // Hook for your automation layer:
    // - send client confirmation email
    // - notify internal team
    return NextResponse.json({ ok: true, lead: createdLead })
  } catch {
    return NextResponse.json({ error: "Unable to submit lead." }, { status: 500 })
  }
}
