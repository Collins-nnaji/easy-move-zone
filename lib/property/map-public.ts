import type { CSSProperties } from "react"
import type { BrowseMode } from "@/lib/search/demo-listings"
import type { PropertyRow } from "@/lib/property/db-row"
import { formatAiRange, formatNgnPrice, parseImages } from "@/lib/property/db-row"

/** Browse / search card model */
export type PublicListingCard = {
  id: string
  title: string
  city: string
  neighborhood: string | null
  price: string
  priceNgn: number
  size: string
  sizeSqm: number
  type: string
  category: "home" | "land"
  bedrooms?: number
  status: "verified" | "pending" | "unverified"
  aiValue: string | null
  imageUrl: string | null
}

const GRADIENTS = [
  "linear-gradient(135deg, #0a1628, #1a4a7a)",
  "linear-gradient(135deg, #0a2818, #1a6a4a)",
  "linear-gradient(135deg, #281a08, #6a4a2a)",
  "linear-gradient(135deg, #1a0a28, #4a1a6a)",
  "linear-gradient(135deg, #0a2828, #1a6a6a)",
]

export function listingHeroStyle(card: PublicListingCard): CSSProperties {
  if (card.imageUrl) {
    return {
      backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.9), rgba(15,23,42,0.25), transparent), url(${card.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
  }
  return { background: gradientForId(card.id) }
}

function gradientForId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % GRADIENTS.length
  return GRADIENTS[h]!
}

export function rowToPublicCard(row: PropertyRow): PublicListingCard {
  const imgs = parseImages(row.images)
  const imageUrl = imgs[0] && imgs[0].startsWith("http") ? imgs[0] : null
  const land = row.land_size_sqm != null ? Number(row.land_size_sqm) : 0
  const built = row.building_size_sqm != null ? Number(row.building_size_sqm) : 0
  const sizeSqm = Math.max(land, built, 1)
  const size =
    land > 0 && built > 0
      ? `${Math.round(land)} sqm land · ${Math.round(built)} sqm built`
      : land > 0
        ? `${Math.round(land)} sqm`
        : built > 0
          ? `${Math.round(built)} sqm`
          : "—"

  const pt = (row.property_type || "").toLowerCase()
  const category: "home" | "land" =
    pt === "land" || pt === "commercial" ? "land" : "home"

  const vs = (row.verification_status || "unverified").toLowerCase()
  const status: PublicListingCard["status"] =
    vs === "verified" ? "verified" : vs === "pending" ? "pending" : "unverified"

  const priceNgn = row.price_ngn != null ? Number(row.price_ngn) : 0

  return {
    id: row.id,
    title: row.title,
    city: row.city,
    neighborhood: row.neighborhood,
    price: formatNgnPrice(row.price_ngn),
    priceNgn,
    size,
    sizeSqm,
    type: row.property_type.charAt(0).toUpperCase() + row.property_type.slice(1),
    category,
    bedrooms: row.bedrooms ?? undefined,
    status,
    aiValue: formatAiRange(row.ai_valuation_ngn, row.ai_valuation_confidence),
    imageUrl,
  }
}

export function filterPublicByMode(list: PublicListingCard[], mode: BrowseMode): PublicListingCard[] {
  if (mode === "all") return list
  if (mode === "homes") return list.filter((l) => l.category === "home")
  return list.filter((l) => l.category === "land")
}

export function cheapestHomeInCity(list: PublicListingCard[], city: string): PublicListingCard | undefined {
  const homes = list.filter((l) => l.category === "home" && l.city === city)
  if (!homes.length) return undefined
  return homes.reduce((a, b) => (a.priceNgn <= b.priceNgn ? a : b))
}
