export type PartCategory = "Tyres" | "Brakes" | "Batteries" | "Filters" | "Oils" | "Lighting" | "Body"

export type Part = {
  id: string
  name: string
  category: PartCategory
  brand: string
  price: number
  fitment: string
  inStock: number
  rating: number
  reviewCount: number
  photo: string
  description: string
  specs: string[]
}

const img = (id: string, q: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80&${q}`

export const PARTS: Part[] = [
  {
    id: "michelin-pilot-sport-4-225",
    name: "Michelin Pilot Sport 4 225/45 R18",
    category: "Tyres",
    brand: "Michelin",
    price: 129,
    fitment: "BMW 3 Series, Audi A4, Mercedes C-Class",
    inStock: 24,
    rating: 4.8,
    reviewCount: 312,
    photo: img("photo-1486262715619-67b85e0b08d3", "tyre"),
    description: "High-performance summer tyre with strong wet grip. Sold as a single tyre — buy a set of 4 for matching wear.",
    specs: ["225/45 R18", "91Y", "XL", "EU wet grip A"],
  },
  {
    id: "continental-premium-205",
    name: "Continental PremiumContact 205/55 R16",
    category: "Tyres",
    brand: "Continental",
    price: 89,
    fitment: "Golf, Civic, Focus, Fiesta",
    inStock: 40,
    rating: 4.7,
    reviewCount: 198,
    photo: img("photo-1619642751034-765dfdf7c58e", "tyre2"),
    description: "Everyday tyre with a quiet ride. Popular on hatchbacks and family cars.",
    specs: ["205/55 R16", "91V", "EU rolling resistance B"],
  },
  {
    id: "goodyear-allseason-255",
    name: "Goodyear Vector 4Seasons 255/55 R19",
    category: "Tyres",
    brand: "Goodyear",
    price: 164,
    fitment: "RAV4, Sportage, GLE, Range Rover Sport",
    inStock: 12,
    rating: 4.6,
    reviewCount: 87,
    photo: img("photo-1486262715619-67b85e0b08d3", "suvtyre"),
    description: "All-season SUV tyre so you are not swapping twice a year. Suits UK winters without a dedicated winter set.",
    specs: ["255/55 R19", "111V", "M+S / 3PMSF"],
  },
  {
    id: "brembo-pads-front",
    name: "Brembo front brake pads",
    category: "Brakes",
    brand: "Brembo",
    price: 74,
    fitment: "BMW 3 Series 320i (G20)",
    inStock: 18,
    rating: 4.9,
    reviewCount: 64,
    photo: img("photo-1487754180451-c456f719a1fc", "brakes"),
    description: "OEM-quality pads. Book fitting with a garage below if you do not want to fit them yourself.",
    specs: ["Front axle set", "Includes wear sensors", "Low dust compound"],
  },
  {
    id: "bosch-s4-battery",
    name: "Bosch S4 12V car battery 70Ah",
    category: "Batteries",
    brand: "Bosch",
    price: 98,
    fitment: "Most petrol saloons and hatchbacks",
    inStock: 9,
    rating: 4.5,
    reviewCount: 141,
    photo: img("photo-1558618666-fcd25c85cd64", "battery"),
    description: "Replacement battery with a 3-year warranty. Garages on EasyMoveZone can supply and fit the same day.",
    specs: ["70Ah", "640A CCA", "3-year warranty"],
  },
  {
    id: "mann-oil-filter",
    name: "MANN oil filter + 5W-30 5L",
    category: "Filters",
    brand: "MANN",
    price: 42,
    fitment: "VW / Audi 2.0 TDI and many BMW diesels",
    inStock: 33,
    rating: 4.7,
    reviewCount: 55,
    photo: img("photo-1487754180451-c456f719a1fc", "filter"),
    description: "Service kit for a DIY oil change, or send it with the car to a partner garage.",
    specs: ["5W-30 C3", "5 litres", "MANN HU 719/7 x"],
  },
  {
    id: "castrol-edge-5w30",
    name: "Castrol EDGE 5W-30 5L",
    category: "Oils",
    brand: "Castrol",
    price: 38,
    fitment: "Petrol and diesel engines specifying 5W-30",
    inStock: 50,
    rating: 4.8,
    reviewCount: 220,
    photo: img("photo-1487754180451-c456f719a1fc", "oil"),
    description: "Fully synthetic oil used by a lot of independent garages on EasyMoveZone.",
    specs: ["5W-30", "5L", "ACEA C3"],
  },
  {
    id: "osram-night-breaker",
    name: "Osram Night Breaker H7 pair",
    category: "Lighting",
    brand: "Osram",
    price: 28,
    fitment: "H7 headlamp housings",
    inStock: 61,
    rating: 4.4,
    reviewCount: 90,
    photo: img("photo-1486262715619-67b85e0b08d3", "light"),
    description: "Brighter road lighting than a standard halogen. Check your handbook before buying HID or LED conversions.",
    specs: ["H7", "12V 55W", "Pair"],
  },
  {
    id: "wing-mirror-golf",
    name: "Passenger wing mirror glass — Golf Mk7",
    category: "Body",
    brand: "Febi",
    price: 22,
    fitment: "Volkswagen Golf Mk7 2013–2020",
    inStock: 7,
    rating: 4.3,
    reviewCount: 19,
    photo: img("photo-1486262715619-67b85e0b08d3", "mirror"),
    description: "Heated glass with the wide-angle spot. A garage can bond it in while you wait.",
    specs: ["Right-hand drive", "Heated", "Convex"],
  },
]

export const PART_CATEGORIES: PartCategory[] = [
  "Tyres",
  "Brakes",
  "Batteries",
  "Filters",
  "Oils",
  "Lighting",
  "Body",
]

export function getPart(id: string) {
  return PARTS.find((p) => p.id === id) ?? null
}

export function filterParts(opts: { q?: string; category?: string }) {
  const q = opts.q?.trim().toLowerCase() ?? ""
  return PARTS.filter((p) => {
    if (opts.category && p.category !== opts.category) return false
    if (!q) return true
    return `${p.name} ${p.brand} ${p.fitment} ${p.category}`.toLowerCase().includes(q)
  })
}
