// ─── Verified move-services marketplace ───────────────────────────────────────
// Vendors that help with moving: logistics, packing, storage, removals, etc.

export type VendorCategory =
  | "logistics"      // Freight, shipping, port-to-door
  | "packing"        // Packing materials, packing services
  | "storage"        // Short/long-term storage
  | "removals"       // Moving companies, furniture moving
  | "document_visa"  // Document support, visa assistance
  | "settling"       // Local setup, SIM, utilities, etc.

export interface MoveVendor {
  id: string
  name: string
  tagline: string
  category: VendorCategory
  countries: string[]
  cities?: string[]        // Optional city-level coverage
  email?: string
  phone?: string
  website?: string
  verified: boolean
  highlights: string[]     // e.g. ["Door-to-door", "Insurance included"]
}

export const VENDOR_CATEGORIES: { id: VendorCategory; label: string; description: string }[] = [
  { id: "logistics", label: "Logistics & shipping", description: "Freight, port-to-door, international shipping" },
  { id: "packing", label: "Packing services", description: "Materials, packing, crating" },
  { id: "storage", label: "Storage", description: "Short or long-term storage" },
  { id: "removals", label: "Removals", description: "Moving companies, furniture & goods" },
  { id: "document_visa", label: "Documents & visa", description: "Visa support, document clearance" },
  { id: "settling", label: "Settling-in", description: "Local SIM, utilities, setup" },
]

export const MOVE_VENDORS: MoveVendor[] = [
  {
    id: "v-log-1",
    name: "AfriMove Logistics",
    tagline: "Door-to-door cross-border moves",
    category: "logistics",
    countries: ["Nigeria", "Kenya", "Ghana", "South Africa"],
    email: "bookings@afrimovelogistics.com",
    phone: "+234 700 000 0000",
    website: "https://example.com",
    verified: true,
    highlights: ["Door-to-door", "Insurance included", "Tracking"],
  },
  {
    id: "v-log-2",
    name: "Port2Home Cargo",
    tagline: "Sea & air freight for household moves",
    category: "logistics",
    countries: ["Nigeria", "Ghana"],
    cities: ["Lagos", "Abuja", "Accra"],
    verified: true,
    highlights: ["Sea freight", "Customs clearance", "Warehouse"],
  },
  {
    id: "v-pack-1",
    name: "PackSmart Relocations",
    tagline: "Professional packing and crating",
    category: "packing",
    countries: ["Nigeria", "Kenya"],
    email: "hello@packsmart.co",
    phone: "+254 700 000 000",
    verified: true,
    highlights: ["Fragile handling", "Materials supplied", "Same-day quote"],
  },
  {
    id: "v-stor-1",
    name: "StoreEazy",
    tagline: "Secure storage by the month",
    category: "storage",
    countries: ["Nigeria", "South Africa"],
    cities: ["Lagos", "Johannesburg", "Cape Town"],
    website: "https://example.com",
    verified: true,
    highlights: ["Climate-controlled", "24/7 access", "Flexible terms"],
  },
  {
    id: "v-rem-1",
    name: "QuickMove Removals",
    tagline: "Local and interstate moving",
    category: "removals",
    countries: ["Nigeria", "Kenya"],
    email: "move@quickmove.co",
    phone: "+234 800 000 0000",
    verified: true,
    highlights: ["Same-day available", "Furniture disassembly", "Packing add-on"],
  },
  {
    id: "v-rem-2",
    name: "Lagos Van & Man",
    tagline: "Affordable moves within Lagos",
    category: "removals",
    countries: ["Nigeria"],
    cities: ["Lagos"],
    phone: "+234 801 234 5678",
    verified: true,
    highlights: ["Same-day", "Transparent pricing", "No hidden fees"],
  },
  {
    id: "v-doc-1",
    name: "VisaPath Advisory",
    tagline: "Visa and document support",
    category: "document_visa",
    countries: ["Nigeria", "Kenya", "Ghana"],
    email: "support@visapath.com",
    verified: true,
    highlights: ["UK/Nigerian routes", "Document certification", "Application review"],
  },
  {
    id: "v-set-1",
    name: "SettleIn Services",
    tagline: "SIM, utilities, local setup",
    category: "settling",
    countries: ["Nigeria", "Kenya", "South Africa"],
    email: "hello@settleinservices.com",
    verified: true,
    highlights: ["SIM on arrival", "Utility sign-up", "Bank account intro"],
  },
]

export function getVendorsByCategory(category: VendorCategory): MoveVendor[] {
  return MOVE_VENDORS.filter((v) => v.category === category)
}

export function getVendorsByCountry(country: string): MoveVendor[] {
  const c = country?.trim().toLowerCase()
  if (!c) return []
  return MOVE_VENDORS.filter((v) =>
    v.countries.some((co) => co.toLowerCase() === c)
  )
}

export function getAllVendors(): MoveVendor[] {
  return MOVE_VENDORS
}

export function getCategoryInfo(id: VendorCategory) {
  return VENDOR_CATEGORIES.find((cat) => cat.id === id)
}
