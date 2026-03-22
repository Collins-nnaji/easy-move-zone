/** Shape returned from Neon for `properties` rows (subset used in UI). */
export type PropertyRow = {
  id: string
  agent_id: string
  title: string
  description: string | null
  property_type: string
  city: string
  state: string
  country: string
  neighborhood: string | null
  address: string | null
  price_ngn: number | null
  land_size_sqm: number | null
  building_size_sqm: number | null
  bedrooms: number | null
  bathrooms: number | null
  images: unknown
  features: unknown
  verification_status: string
  ai_valuation_ngn: number | null
  ai_valuation_confidence: number | null
  is_featured: boolean
  is_published: boolean
  view_count: number | null
  enquiry_count: number | null
  created_at: string
  updated_at: string
}

export function parseImages(images: unknown): string[] {
  if (Array.isArray(images)) {
    return images.filter((u): u is string => typeof u === "string" && u.length > 0)
  }
  return []
}

export function formatNgnPrice(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return "Price on request"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(n))
}

export function formatAiRange(mid: number | null, confidence: number | null): string | null {
  if (mid == null || !Number.isFinite(Number(mid))) return null
  const m = Number(mid)
  const band = confidence != null && confidence > 0 ? 0.08 : 0.1
  const low = Math.round(m * (1 - band))
  const high = Math.round(m * (1 + band))
  const fmt = (x: number) =>
    x >= 1_000_000_000
      ? `₦${(x / 1_000_000_000).toFixed(2)}B`
      : x >= 1_000_000
        ? `₦${(x / 1_000_000).toFixed(1)}M`
        : `₦${Math.round(x / 1_000)}k`
  return `${fmt(low)} – ${fmt(high)}`
}
