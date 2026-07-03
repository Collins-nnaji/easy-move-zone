import { NextRequest, NextResponse } from "next/server"
import { type Mode } from "@/app/move/data"
import { getMoveDestinations } from "@/lib/move/get-catalog"
import { chatJson, getAiProvider } from "@/lib/ai/openai"

const VALID_MODES: Mode[] = ["trip", "nomad", "move"]
const MODE_NAME: Record<Mode, string> = { trip: "short trip", nomad: "nomad stint", move: "long-term move" }

// waitLevel: 1 (slots usually open) … 5 (long backlog). Drives the code-drawn meter.
interface AppointmentsGuide {
  portalName: string
  portalUrl: string
  typicalWait: string
  waitLevel: number
  bookAhead: string
  bestTimes: string
  prep: string[]
  notes: string
}

interface ProfileInput {
  goals?: string[]
  nationality?: string
}

function clampLevel(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n)
  if (!Number.isFinite(v)) return 3
  return Math.max(1, Math.min(5, Math.round(v)))
}

// Deterministic fallback so the page is always useful, even with no AI key. We
// deliberately do NOT invent a specific portal URL here — we point at an
// official search so the user still lands on a legitimate site.
function fallbackGuide(country: string, modeName: string): AppointmentsGuide {
  return {
    portalName: `Official ${country} visa booking portal`,
    portalUrl: `https://www.google.com/search?q=${encodeURIComponent(`official ${country} visa appointment booking VFS TLScontact embassy`)}`,
    typicalWait: "Varies by consulate and season",
    waitLevel: 3,
    bookAhead: "Book as early as your documents allow — slots for a " + modeName + " can go weeks out.",
    bestTimes: "Slots often refresh early morning on weekdays; check frequently.",
    prep: [
      "Complete your online application form first — you usually can't book without it",
      "Have your passport and payment ready before you start",
      "Note your reference number so you can return to your booking",
    ],
    notes: "Appointment availability is live on the official portal only — always confirm there. This is general guidance, not a live slot feed.",
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

  const fallback = fallbackGuide(dest.country, MODE_NAME[mode])

  if (!getAiProvider()) {
    return NextResponse.json({ ...fallback, source: "static", disclaimer: fallback.notes })
  }

  const system = `You are a visa-appointment advisor inside a relocation app. For the given destination + trip type, tell the user how to get a consular appointment. Give: the NAME of the official booking system typically used for ${dest.country} (e.g. VFS Global, TLScontact, BLS, or the embassy's own portal) and its official URL if you are confident it is correct — otherwise give the embassy's official website. NEVER claim to know live/real-time available dates (you do not); describe TYPICAL waits and seasonality only. Be honest and practical. Respond with raw JSON only: {"portalName":"...","portalUrl":"https://...","typicalWait":"e.g. 2-6 weeks or varies","waitLevel":1-5,"bookAhead":"one line of advice","bestTimes":"when slots tend to appear","prep":["step","step","step"],"notes":"one honest sentence that availability is only live on the official portal"}. waitLevel: 1 slots usually open … 5 long backlog. Only use official government/VFS/TLScontact/BLS URLs — if unsure, use the country's official embassy/immigration site, never a third-party blog.`

  const user = `Destination: ${dest.city}, ${dest.country}
Trip type: ${MODE_NAME[mode]}
Applicant nationality: ${profile.nationality ?? "unspecified"}
Goals: ${(profile.goals ?? []).join(", ") || "unspecified"}`

  const result = await chatJson<AppointmentsGuide>(system, user, fallback)

  const guide: AppointmentsGuide = {
    portalName: String(result.portalName ?? "").trim() || fallback.portalName,
    portalUrl: /^https?:\/\//i.test(String(result.portalUrl ?? "")) ? String(result.portalUrl).trim() : fallback.portalUrl,
    typicalWait: String(result.typicalWait ?? "").trim() || fallback.typicalWait,
    waitLevel: clampLevel(result.waitLevel),
    bookAhead: String(result.bookAhead ?? "").trim() || fallback.bookAhead,
    bestTimes: String(result.bestTimes ?? "").trim() || fallback.bestTimes,
    prep: Array.isArray(result.prep) && result.prep.length ? result.prep.map((p) => String(p).trim()).filter(Boolean).slice(0, 6) : fallback.prep,
    notes: String(result.notes ?? "").trim() || fallback.notes,
  }

  return NextResponse.json({ ...guide, source: "ai", disclaimer: guide.notes })
}
