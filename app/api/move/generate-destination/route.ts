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

// AI builds a full destination profile for ANY city a user types, so location
// selection isn't limited to the seeded catalog. The response has exactly the
// same shape as a catalog destination, so the whole app (matches, detail,
// visa, plan, settle) works on it unchanged.

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

export async function POST(req: NextRequest) {
  let body: { query?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const query = typeof body.query === "string" ? body.query.trim().replace(/\s+/g, " ").slice(0, 80) : ""
  if (query.length < 2) {
    return NextResponse.json({ error: "Type a city to search for." }, { status: 400 })
  }

  // If the query is already a catalog city, return that instead of generating.
  const { destinations } = await getMoveDestinations()
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

  const system = `You are the destination-profile generator inside a global relocation app. Given a user's typed place, identify the real city and country it refers to and produce a relocation profile with the EXACT JSON shape below. Rules:
- If the input is not a recognizable real city/town anywhere in the world, respond {"unknown": true} and nothing else.
- "region" must be exactly one of: ${REGIONS.join(", ")}.
- "match" scores (0-100) rate how well the city suits each stay type: trip (short visit), nomad (1-3 month remote stint), move (long-term relocation). Be honest — not everywhere is a 90.
- "honest" takes are 1-2 sentences each: the genuine upside AND the catch, like a well-travelled friend would say.
- "stats" are 3 [label, value] pairs per stay type (cost of living, wifi/internet, visa-friendliness, safety, schools, etc.). Use realistic ranges; write "varies" when unsure. Never invent precise figures you're not confident in.
- "visa" per stay type: a headline naming the real, commonly-used entry/visa route into that country, a 1-2 sentence body, and a short tag. Do NOT invent visa names, fees, or durations you're unsure of — say "check official sources" instead.
Respond with raw JSON only:
{"city":"...","country":"...","region":"...","match":{"trip":0,"nomad":0,"move":0},"honest":{"trip":"...","nomad":"...","move":"..."},"stats":{"trip":[["label","value"],["label","value"],["label","value"]],"nomad":[...],"move":[...]},"visa":{"trip":{"headline":"...","body":"...","tag":"..."},"nomad":{...},"move":{...}}}`

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
