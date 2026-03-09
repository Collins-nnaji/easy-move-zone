export type CityStatus = "active" | "coming_soon" | "expanding"
export type ListingType = "rent" | "buy" | "commercial"

export interface CityMarket {
  id: string
  slug: string
  name: string
  country: string
  flagEmoji: string
  status: CityStatus
  avgRentUsd: number
  avgBuyUsd: number
  securityScore: number
  commuteScore: number
  lifestyleScore: number
  topSectors: string[]
  latitude: number
  longitude: number
}

export interface PropertyListing {
  id: string
  title: string
  citySlug: string
  country: string
  neighborhood: string
  type: ListingType
  priceUsd: number
  bedrooms: number
  bathrooms: number
  areaSqm: number
  verified: boolean
  moveInReady: boolean
  schoolsNearby: number
  commuteMinutes: number
  description: string
  images: string[]
  agentId: string
}

export interface AgentProfile {
  id: string
  name: string
  company: string
  cityCoverage: string[]
  rating: number
  verified: boolean
  transactions: number
  languages: string[]
}

export interface Testimonial {
  id: string
  moverType: "Domestic Mover" | "Diaspora Returnee" | "Pan-African Professional"
  route: string
  outcome: string
  quote: string
}

export interface OpportunityRow {
  segment: string
  sizeVolume: string
  whyNow: string
}

export interface RevenueStream {
  name: string
  description: string
}

export interface ListingFilters {
  citySlug?: string
  type?: ListingType | "all"
  maxBudgetUsd?: number
  moveInReady?: boolean
}

