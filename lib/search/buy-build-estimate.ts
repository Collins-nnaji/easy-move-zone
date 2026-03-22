/**
 * Indicative construction cost ranges (NGN / sqm built area) for residential builds.
 * Figures are ballpark guides for decision support — not quotes. Vary by site, design, and inflation.
 */
export const FINISH_TIERS = {
  economy: {
    id: "economy" as const,
    label: "Economy",
    description: "Basic finishes, standard materials",
    ngnPerSqmLow: 95_000,
    ngnPerSqmHigh: 150_000,
  },
  standard: {
    id: "standard" as const,
    label: "Standard",
    description: "Good-quality fittings, typical 3–4 bed spec",
    ngnPerSqmLow: 160_000,
    ngnPerSqmHigh: 260_000,
  },
  premium: {
    id: "premium" as const,
    label: "Premium",
    description: "High-end finishes, bespoke details",
    ngnPerSqmLow: 280_000,
    ngnPerSqmHigh: 480_000,
  },
}

export type FinishTierId = keyof typeof FINISH_TIERS

export function estimateBuildCost(groundFloorSqm: number, tier: FinishTierId) {
  const t = FINISH_TIERS[tier]
  const low = Math.round(groundFloorSqm * t.ngnPerSqmLow)
  const high = Math.round(groundFloorSqm * t.ngnPerSqmHigh)
  return { low, high, tier: t }
}

export function formatNgn(n: number) {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${Math.round(n / 1_000)}k`
  return `₦${n.toLocaleString("en-NG")}`
}
