import { NextRequest, NextResponse } from "next/server"
import { type Mode } from "@/app/move/data"
import { getMoveDestinations } from "@/lib/move/get-catalog"
import { chatJson, getAiProvider } from "@/lib/ai/openai"

const VALID_MODES: Mode[] = ["trip", "nomad", "move"]
const MODE_NAME: Record<Mode, string> = { trip: "short trip", nomad: "nomad stint", move: "long-term move" }

interface ChecklistItem {
  label: string
  why: string
  urgent: boolean
}

interface ChecklistResult {
  items: ChecklistItem[]
}

interface ProfileInput {
  goals?: string[]
  education?: string
  english?: string
  nationality?: string
  family?: string
}

// A generic, safe starting checklist assembled from the profile — used when no
// AI provider is configured, or as the JSON fallback for chatJson. Never claims
// destination-specific rules it can't back up.
function heuristicChecklist(profile: ProfileInput, modeName: string): ChecklistResult {
  const goals = profile.goals ?? []
  const items: ChecklistItem[] = [
    { label: "Valid international passport", why: "Most visas require at least 6 months of validity beyond your intended stay.", urgent: true },
    { label: "Proof of funds / bank statements", why: `Almost every ${modeName} route asks you to show you can support yourself.`, urgent: true },
    { label: "Passport-style photographs", why: "Standard requirement for the visa application form.", urgent: false },
  ]
  if (goals.includes("study")) {
    items.push({ label: "Letter of admission / acceptance", why: "Study routes require an offer from a recognised institution.", urgent: true })
    items.push({ label: "Tuition payment or scholarship proof", why: "Shows you can cover course fees.", urgent: false })
  }
  if (goals.includes("work") || goals.includes("business")) {
    items.push({ label: "Job offer or sponsorship letter", why: "Skilled-work routes typically need a sponsoring employer.", urgent: true })
    items.push({ label: "Employment references & CV", why: "Used to verify your experience for eligibility.", urgent: false })
  }
  if (goals.includes("family")) {
    items.push({ label: "Relationship / family evidence", why: "Family routes require proof of the qualifying relationship.", urgent: true })
  }
  items.push({ label: "Education certificates (attested)", why: "Degrees and diplomas often need official verification.", urgent: false })
  if (profile.english && !["fluent", "ielts-7.0", "ielts-7.5", "ielts-8.0"].includes(profile.english)) {
    items.push({ label: "English test booking (IELTS/PTE)", why: "Many routes require a minimum English score — book early, slots fill up.", urgent: true })
  }
  return { items }
}

export async function POST(req: NextRequest) {
  let body: { destinationId?: unknown; mode?: unknown; profile?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const destinationId = typeof body.destinationId === "string" ? body.destinationId : ""
  const mode: Mode = VALID_MODES.includes(body.mode as Mode) ? (body.mode as Mode) : "move"
  const profile: ProfileInput = (body.profile && typeof body.profile === "object") ? (body.profile as ProfileInput) : {}

  const { destinations } = await getMoveDestinations()
  const dest = destinations.find((d) => d.id === destinationId)

  const fallback = heuristicChecklist(profile, MODE_NAME[mode])

  // No destination context or no AI → return the safe heuristic list.
  if (!dest || !getAiProvider()) {
    return NextResponse.json(fallback)
  }

  const contextLines = [
    `Destination: ${dest.city}, ${dest.country}`,
    `Visa (${MODE_NAME[mode]}): ${dest.visa[mode].headline}. ${dest.visa[mode].body}`,
    `Honest take: ${dest.honest[mode]}`,
    `Stats: ${dest.stats[mode].map(([k, v]) => `${k} ${v}`).join("; ")}`,
  ]

  const system = `You are a relocation document advisor. Produce a tailored document checklist for someone planning a ${MODE_NAME[mode]} to ${dest.city}, ${dest.country}, grounded ONLY in the facts provided and the applicant's profile. Never invent specific visa rules, fees or thresholds that aren't given — keep items to well-known document categories (passport, funds, admission/job offer, certificates, language tests, etc.) framed for this destination. Mark an item urgent only if it typically gates the whole application or takes a long time to obtain. Respond with raw JSON only: {"items": [{"label": "...", "why": "one short sentence", "urgent": true|false}]} with 5-8 items.`

  const user = `Applicant profile:
- Nationality: ${profile.nationality ?? "unspecified"}
- Goals: ${(profile.goals ?? []).join(", ") || "unspecified"}
- Education: ${profile.education ?? "unspecified"}
- English: ${profile.english ?? "unspecified"}
- Family: ${profile.family ?? "unspecified"}

Facts about ${dest.city}:
${contextLines.join("\n")}`

  const result = await chatJson<ChecklistResult>(system, user, fallback)
  const items = Array.isArray(result.items) && result.items.length ? result.items : fallback.items
  return NextResponse.json({ items })
}
