// Dynamic, AI-generated destinations — lets users move anywhere in the
// world instead of being limited to the seeded catalog. The AI produces a
// full Destination profile for any city; these helpers keep whatever comes
// back (or whatever a client sends us) shaped exactly like catalog entries.

import type { Destination, Mode, VisaInfo } from "@/app/move/data"

export const MODES: Mode[] = ["trip", "nomad", "move"]

// Regions the UI can theme (see ImageSlot's REGION_GRADIENT).
export const REGIONS = [
  "Europe",
  "Latin America",
  "Asia-Pacific",
  "Africa",
  "Middle East",
  "North America",
  "Oceania",
] as const

export function slugifyPlace(city: string, country: string): string {
  return `${city} ${country}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

function clampScore(n: unknown, dflt: number): number {
  const v = typeof n === "number" ? n : Number(n)
  if (!Number.isFinite(v)) return dflt
  return Math.max(20, Math.min(99, Math.round(v)))
}

function cleanText(v: unknown, dflt: string, max = 400): string {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : dflt
}

function cleanStats(v: unknown, dflt: [string, string][]): [string, string][] {
  if (!Array.isArray(v)) return dflt
  const rows = v
    .filter((row): row is [unknown, unknown] => Array.isArray(row) && row.length >= 2)
    .map((row): [string, string] => [cleanText(row[0], "", 40), cleanText(row[1], "", 60)])
    .filter(([k, val]) => k && val)
    .slice(0, 3)
  return rows.length ? rows : dflt
}

function cleanVisa(v: unknown, dflt: VisaInfo): VisaInfo {
  const raw = (v && typeof v === "object" ? v : {}) as Partial<VisaInfo>
  return {
    headline: cleanText(raw.headline, dflt.headline, 90),
    body: cleanText(raw.body, dflt.body, 300),
    tag: cleanText(raw.tag, dflt.tag, 40),
  }
}

/** A safe, honest-about-uncertainty profile for any typed place. Used when
 * no AI provider is configured, or as the chatJson fallback. Never invents
 * specific figures — everything is framed as "check before you go". */
export function fallbackCustomDestination(cityRaw: string, countryRaw?: string): Destination {
  const city = cityRaw.trim().replace(/\s+/g, " ")
  const country = (countryRaw ?? "").trim() || "—"
  const label = country !== "—" ? `${city}, ${country}` : city
  const stats: [string, string][] = [
    ["Cost of living", "Varies — check locally"],
    ["Internet", "Check coverage maps"],
    ["Community", "Growing — ask in Community"],
  ]
  const visaBody = `Entry rules into ${country !== "—" ? country : "this country"} depend on your passport. Check the official immigration site, or run the eligibility check in this app for routes matched to your profile.`
  const visa: VisaInfo = { headline: "Check entry requirements", body: visaBody, tag: "Verify officially" }
  return {
    id: slugifyPlace(city, country),
    city,
    country,
    // Neutral label shown on cards when the AI couldn't classify the region;
    // ImageSlot themes unknown regions with its default gradient.
    region: "Worldwide",
    photo: label,
    match: { trip: 70, nomad: 70, move: 70 },
    honest: {
      trip: `${label} isn't in our researched set yet, so treat this as a starting brief — we'll still build your trip checklist and you can ask the assistant anything.`,
      nomad: `We don't have deep nomad data on ${label} yet. Use the eligibility check and the assistant to pressure-test wifi, cost and visa fit before committing.`,
      move: `A move to ${label} is absolutely plannable here — your plan, documents and visa routes all still work — but double-check local specifics against official sources.`,
    },
    stats: { trip: stats, nomad: stats, move: stats },
    visa: { trip: visa, nomad: visa, move: visa },
  }
}

/** Coerces an untrusted destination-shaped object (AI output or a client
 * payload) into a valid Destination, falling back field-by-field. */
export function sanitizeDestination(raw: unknown, fallback: Destination): Destination {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const city = cleanText(r.city, fallback.city, 60)
  const country = cleanText(r.country, fallback.country, 60)
  const regionRaw = cleanText(r.region, fallback.region, 30)
  const region = (REGIONS as readonly string[]).includes(regionRaw) ? regionRaw : fallback.region
  const match = (r.match && typeof r.match === "object" ? r.match : {}) as Record<string, unknown>
  const honest = (r.honest && typeof r.honest === "object" ? r.honest : {}) as Record<string, unknown>
  const stats = (r.stats && typeof r.stats === "object" ? r.stats : {}) as Record<string, unknown>
  const visa = (r.visa && typeof r.visa === "object" ? r.visa : {}) as Record<string, unknown>

  const out: Destination = {
    id: slugifyPlace(city, country),
    city,
    country,
    region,
    photo: `${city}, ${country}`,
    match: { trip: 70, nomad: 70, move: 70 },
    honest: { trip: "", nomad: "", move: "" },
    stats: { trip: [], nomad: [], move: [] },
    visa: {
      trip: { headline: "", body: "", tag: "" },
      nomad: { headline: "", body: "", tag: "" },
      move: { headline: "", body: "", tag: "" },
    },
  }
  for (const m of MODES) {
    out.match[m] = clampScore(match[m], fallback.match[m])
    out.honest[m] = cleanText(honest[m], fallback.honest[m])
    out.stats[m] = cleanStats(stats[m], fallback.stats[m])
    out.visa[m] = cleanVisa(visa[m], fallback.visa[m])
  }
  const imageUrl = typeof r.imageUrl === "string" && /^https:\/\//.test(r.imageUrl) ? r.imageUrl : undefined
  if (imageUrl) out.imageUrl = imageUrl
  return out
}

/** Resolves a request's destination. A client-supplied profile (the
 * AI-generated content the user is actually looking at) wins, sanitized
 * against the catalog copy when the id is known; a bare known id falls back
 * to the catalog entry; anything else is rejected. This keeps AI features
 * grounded in the same profile the user sees, for any city in the world. */
export function resolveRequestDestination(
  destinationId: string,
  catalog: Destination[],
  customPayload: unknown,
): Destination | null {
  const known = catalog.find((d) => d.id === destinationId)
  const p = (customPayload && typeof customPayload === "object" ? customPayload : null) as
    | { city?: unknown; country?: unknown }
    | null
  if (p && typeof p.city === "string" && p.city.trim()) {
    const fallback =
      known ?? fallbackCustomDestination(p.city, typeof p.country === "string" ? p.country : undefined)
    return sanitizeDestination(customPayload, fallback)
  }
  return known ?? null
}
