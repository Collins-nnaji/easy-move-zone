import { NextRequest, NextResponse } from "next/server"
import { getMoveDestinations } from "@/lib/move/get-catalog"
import { chatJson, getAiProvider } from "@/lib/ai/openai"
import {
  fallbackCustomDestination,
  REGIONS,
  sanitizeDestination,
  slugifyPlace,
} from "@/lib/move/custom-destination"

export const runtime = "nodejs"

// AI builds a full destination profile for ANY city — a freeform typed query
// OR an existing catalog city (destinationId), whose seeded copy is used only
// as context and replaced by fresh AI-generated content. The response has
// exactly the same shape as a catalog destination, so the whole app (matches,
// detail, visa, plan, settle) works on it unchanged.

interface GeneratedPayload {
  unknown?: boolean
  city?: string
  country?: string
  region?: string
  match?: Record<string, number>
  honest?: Record<string, string>
  stats?: Record<string, [string, string][]>
  visa?: Record<string, { headline: string; body: string; tag: string }>
}

const PROFILE_RULES = `Rules:
- "region" must be exactly one of: ${REGIONS.join(", ")}.
- "match" scores (0-100) rate how well the city suits each stay type: trip (short visit), nomad (1-3 month remote stint), move (long-term relocation). Be honest — not everywhere is a 90.
- "honest" takes are 1-2 sentences each: the genuine upside AND the catch, like a well-travelled friend would say.
- "stats" are 3 [label, value] pairs per stay type (cost of living, wifi/internet, visa-friendliness, safety, schools, etc.). Use realistic ranges; write "varies" when unsure. Never invent precise figures you're not confident in.
- "visa" per stay type: a headline naming the real, commonly-used entry/visa route into that country, a 1-2 sentence body, and a short tag. Do NOT invent visa names, fees, or durations you're unsure of — say "check official sources" instead.
Respond with raw JSON only:
{"city":"...","country":"...","region":"...","match":{"trip":0,"nomad":0,"move":0},"honest":{"trip":"...","nomad":"...","move":"..."},"stats":{"trip":[["label","value"],["label","value"],["label","value"]],"nomad":[...],"move":[...]},"visa":{"trip":{"headline":"...","body":"...","tag":"..."},"nomad":{...},"move":{...}}}`

export async function POST(req: NextRequest) {
  let body: { query?: unknown; destinationId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const query = typeof body.query === "string" ? body.query.trim().replace(/\s+/g, " ").slice(0, 80) : ""
  const destinationId = typeof body.destinationId === "string" ? body.destinationId.trim().slice(0, 80) : ""
  if (!destinationId && query.length < 2) {
    return NextResponse.json({ error: "Type a city to search for." }, { status: 400 })
  }

  const { destinations } = await getMoveDestinations()

  // ── Regenerate a catalog city's profile with AI ─────────────────────────
  // The seeded copy is only a fallback + context; the served profile is AI.
  if (destinationId) {
    const seed = destinations.find((d) => d.id === destinationId)
    if (!seed) {
      return NextResponse.json({ error: "Unknown destination." }, { status: 404 })
    }
    if (!getAiProvider()) {
      return NextResponse.json({ destination: seed, source: "static" })
    }
    const system = `You are the destination-profile generator inside a global relocation app. Produce a fresh, current relocation profile for the given city with the EXACT JSON shape below. Write everything yourself — do not copy the reference notes, they are only context and may be outdated. ${PROFILE_RULES}`
    const result = await chatJson<GeneratedPayload>(
      system,
      `City: ${seed.city}, ${seed.country} (region: ${seed.region})`,
      {},
    )
    const hasContent = typeof result.city === "string" && result.city.trim()
    if (!hasContent) {
      return NextResponse.json({ destination: seed, source: "static" })
    }
    const generated = sanitizeDestination({ ...result, city: seed.city, country: seed.country }, seed)
    // Keep the catalog identity (id, image) — only the content is regenerated.
    const destination = { ...generated, id: seed.id, imageUrl: seed.imageUrl }
    return NextResponse.json({ destination, source: "ai" })
  }

  // ── Freeform query → brand-new destination ──────────────────────────────
  // If the query names a catalog city, serve that id (the client will then
  // AI-refresh its profile through the destinationId path above).
  const q = query.toLowerCase()
  const existing = destinations.find(
    (d) => d.city.toLowerCase() === q || `${d.city}, ${d.country}`.toLowerCase() === q || d.id === slugifyPlace(q, ""),
  )
  if (existing) {
    return NextResponse.json({ destination: existing, source: "catalog" })
  }

  // Parse an optional "City, Country" form for a better no-AI fallback.
  const [cityPart, ...rest] = query.split(",")
  const fallback = fallbackCustomDestination(cityPart, rest.join(",").trim() || undefined)

  if (!getAiProvider()) {
    return NextResponse.json({ destination: fallback, source: "fallback" })
  }

  const system = `You are the destination-profile generator inside a global relocation app. Given a user's typed place, identify the real city and country it refers to and produce a relocation profile with the EXACT JSON shape below. If the input is not a recognizable real city/town anywhere in the world, respond {"unknown": true} and nothing else. ${PROFILE_RULES}`

  const result = await chatJson<GeneratedPayload>(system, `Place: "${query}"`, {})

  if (result.unknown) {
    return NextResponse.json(
      { error: `We couldn't place "${query}" — try "City, Country" (e.g. "Accra, Ghana").` },
      { status: 404 },
    )
  }

  const hasContent = typeof result.city === "string" && result.city.trim()
  const destination = hasContent ? sanitizeDestination(result, fallback) : fallback

  // Never let a generated city shadow a catalog entry's id.
  if (destinations.some((d) => d.id === destination.id)) {
    const clash = destinations.find((d) => d.id === destination.id)!
    return NextResponse.json({ destination: clash, source: "catalog" })
  }

  return NextResponse.json({ destination, source: hasContent ? "ai" : "fallback" })
}
