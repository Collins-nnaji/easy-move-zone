import { NextRequest, NextResponse } from "next/server"
import { type Mode } from "@/app/move/data"
import { getMoveDestinations } from "@/lib/move/get-catalog"
import { chatJson, getAiProvider } from "@/lib/ai/openai"

const VALID_MODES: Mode[] = ["trip", "nomad", "move"]
const MODE_NAME: Record<Mode, string> = { trip: "short trip", nomad: "nomad stint", move: "long-term move" }

// difficulty: 1 (easiest) … 5 (hardest) — drives the code-drawn meter in the UI.
interface VisaOption {
  name: string
  who: string
  timeline: string
  cost: string
  difficulty: number
  notes: string
}

interface OptionsResult {
  options: VisaOption[]
}

interface ProfileInput {
  goals?: string[]
  education?: string
  english?: string
  nationality?: string
  experience?: number
}

function clampDifficulty(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n)
  if (!Number.isFinite(v)) return 3
  return Math.max(1, Math.min(5, Math.round(v)))
}

// Static fallback: derive a couple of options from the destination's own visa
// headline so the section is never empty, even with no AI key or no DB.
function fallbackOptions(headline: string, tag: string, modeName: string): OptionsResult {
  return {
    options: [
      {
        name: headline || "Primary entry route",
        who: `Travellers planning a ${modeName}.`,
        timeline: "Varies by consulate",
        cost: "See official source",
        difficulty: 3,
        notes: tag || "Confirm current requirements before applying.",
      },
      {
        name: "Alternative / long-stay route",
        who: "Those who don't fit the primary route.",
        timeline: "Varies",
        cost: "Varies",
        difficulty: 4,
        notes: "Ask our assistant or check the official immigration site for other pathways.",
      },
    ],
  }
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

  if (!dest) {
    return NextResponse.json({ error: "Unknown destination." }, { status: 400 })
  }

  const visa = dest.visa[mode]
  const fallback = fallbackOptions(visa.headline, visa.tag, MODE_NAME[mode])

  if (!getAiProvider()) {
    return NextResponse.json({ ...fallback, source: "static" })
  }

  const system = `You are a visa-routes advisor inside a global relocation app. List the REAL, commonly-used visa/entry routes into ${dest.country} for someone planning a ${MODE_NAME[mode]}. Give 3-5 distinct routes. Ground them in real, well-known immigration pathways for ${dest.country} — do NOT invent route names, and do NOT state precise fees or processing times you're unsure of (use ranges or "varies"). Tailor ordering/notes to the applicant profile when relevant. Respond with raw JSON only: {"options":[{"name":"route name","who":"who it suits, one line","timeline":"e.g. 2-4 months or varies","cost":"e.g. $2,000-$8,000 or varies","difficulty":1-5,"notes":"one short sentence"}]}. difficulty: 1 easiest … 5 hardest.`

  const user = `Destination: ${dest.city}, ${dest.country}
Planning: ${MODE_NAME[mode]}
Current headline route (seed context): ${visa.headline} — ${visa.body}

Applicant profile:
- Nationality: ${profile.nationality ?? "unspecified"}
- Goals: ${(profile.goals ?? []).join(", ") || "unspecified"}
- Education: ${profile.education ?? "unspecified"}
- English: ${profile.english ?? "unspecified"}
- Experience: ${profile.experience ?? "unspecified"} years`

  const result = await chatJson<OptionsResult>(system, user, fallback)
  const options = (Array.isArray(result.options) && result.options.length ? result.options : fallback.options)
    .slice(0, 5)
    .map((o) => ({
      name: String(o.name ?? "").trim() || "Visa route",
      who: String(o.who ?? "").trim(),
      timeline: String(o.timeline ?? "Varies").trim(),
      cost: String(o.cost ?? "Varies").trim(),
      difficulty: clampDifficulty(o.difficulty),
      notes: String(o.notes ?? "").trim(),
    }))

  return NextResponse.json({ options, source: getAiProvider() ? "ai" : "static" })
}
