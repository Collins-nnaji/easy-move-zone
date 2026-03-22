/** Demo catalogue for /search — includes numeric basis for buy-vs-build estimates */

export type ListingCategory = "home" | "land"

export type DemoListing = {
  id: string
  title: string
  city: string
  neighborhood: string
  price: string
  /** Basis for calculations & sorting (NGN). For non-NG displays, still a rough NGN-equivalent for demo. */
  priceNgn: number
  size: string
  sizeSqm: number
  type: string
  category: ListingCategory
  bedrooms?: number
  status: "verified" | "pending" | "unverified"
  aiValue: string
  gradient: string
}

export const demoListings: DemoListing[] = [
  {
    id: "1",
    title: "Verified 800sqm Plot — Lekki Phase 2",
    city: "Lagos",
    neighborhood: "Lekki Phase 2",
    price: "₦85,000,000",
    priceNgn: 85_000_000,
    size: "800 sqm",
    sizeSqm: 800,
    type: "Land",
    category: "land",
    status: "verified",
    aiValue: "₦82M – ₦90M",
    gradient: "linear-gradient(135deg, #0a1628, #1a4a7a)",
  },
  {
    id: "2",
    title: "Title-Clear 3BR Detached — Maitama",
    city: "Abuja",
    neighborhood: "Maitama",
    price: "₦120,000,000",
    priceNgn: 120_000_000,
    size: "450 sqm",
    sizeSqm: 450,
    type: "House",
    category: "home",
    bedrooms: 3,
    status: "verified",
    aiValue: "₦115M – ₦128M",
    gradient: "linear-gradient(135deg, #0a2818, #1a6a4a)",
  },
  {
    id: "3",
    title: "600sqm C of O Land — GRA, Enugu",
    city: "Enugu",
    neighborhood: "GRA",
    price: "₦45,000,000",
    priceNgn: 45_000_000,
    size: "600 sqm",
    sizeSqm: 600,
    type: "Land",
    category: "land",
    status: "verified",
    aiValue: "₦42M – ₦48M",
    gradient: "linear-gradient(135deg, #281a08, #6a4a2a)",
  },
  {
    id: "4",
    title: "1200sqm Industrial Plot — Apapa",
    city: "Lagos",
    neighborhood: "Apapa",
    price: "₦250,000,000",
    priceNgn: 250_000_000,
    size: "1,200 sqm",
    sizeSqm: 1200,
    type: "Commercial",
    category: "land",
    status: "pending",
    aiValue: "₦240M – ₦265M",
    gradient: "linear-gradient(135deg, #1a0a28, #4a1a6a)",
  },
  {
    id: "5",
    title: "4BR Semi-Detached — Gwarinpa",
    city: "Abuja",
    neighborhood: "Gwarinpa",
    price: "₦75,000,000",
    priceNgn: 75_000_000,
    size: "380 sqm",
    sizeSqm: 380,
    type: "House",
    category: "home",
    bedrooms: 4,
    status: "verified",
    aiValue: "₦70M – ₦80M",
    gradient: "linear-gradient(135deg, #0a2828, #1a6a6a)",
  },
  {
    id: "6",
    title: "500sqm Residential — Ikoyi",
    city: "Lagos",
    neighborhood: "Ikoyi",
    price: "₦350,000,000",
    priceNgn: 350_000_000,
    size: "500 sqm",
    sizeSqm: 500,
    type: "Land",
    category: "land",
    status: "verified",
    aiValue: "₦330M – ₦370M",
    gradient: "linear-gradient(135deg, #280a0a, #6a1a1a)",
  },
  {
    id: "7",
    title: "2BR Luxury Apartment — Victoria Island",
    city: "Lagos",
    neighborhood: "Victoria Island",
    price: "₦95,000,000",
    priceNgn: 95_000_000,
    size: "140 sqm",
    sizeSqm: 140,
    type: "Apartment",
    category: "home",
    bedrooms: 2,
    status: "verified",
    aiValue: "₦90M – ₦102M",
    gradient: "linear-gradient(135deg, #0a1a28, #1a3a5a)",
  },
  {
    id: "8",
    title: "1,000sqm Fenced Plot — Trans Amadi",
    city: "Port Harcourt",
    neighborhood: "Trans Amadi",
    price: "₦180,000,000",
    priceNgn: 180_000_000,
    size: "1,000 sqm",
    sizeSqm: 1000,
    type: "Land",
    category: "land",
    status: "pending",
    aiValue: "₦175M – ₦190M",
    gradient: "linear-gradient(135deg, #180a28, #3a1a5a)",
  },
  {
    id: "9",
    title: "3BR Bungalow — Asokoro",
    city: "Abuja",
    neighborhood: "Asokoro",
    price: "₦200,000,000",
    priceNgn: 200_000_000,
    size: "550 sqm",
    sizeSqm: 550,
    type: "House",
    category: "home",
    bedrooms: 3,
    status: "verified",
    aiValue: "₦185M – ₦215M",
    gradient: "linear-gradient(135deg, #281808, #5a3a1a)",
  },
]

export type BrowseMode = "all" | "homes" | "land"

export function filterListings(listings: DemoListing[], mode: BrowseMode): DemoListing[] {
  if (mode === "all") return listings
  if (mode === "homes") return listings.filter((l) => l.category === "home")
  return listings.filter((l) => l.category === "land")
}

export function cheapestComparableHome(listings: DemoListing[], city: string): DemoListing | undefined {
  const homes = listings.filter((l) => l.category === "home" && l.city === city)
  if (!homes.length) return undefined
  return homes.reduce((a, b) => (a.priceNgn <= b.priceNgn ? a : b))
}
