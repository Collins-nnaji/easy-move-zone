import { neon } from "@neondatabase/serverless"
import { estimateMonthly, type BodyType, type Car, type CurrencyCode, type FuelType, type Market, type StockType, type Transmission } from "./catalog"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

export type ListingStatus = "pending" | "approved" | "rejected"

export type CarListingRow = {
  id: string
  seller_user_id: string
  seller_email: string | null
  seller_name: string | null
  status: ListingStatus
  year: number
  make: string
  model: string
  trim: string
  mileage: number
  fuel: string
  transmission: string
  engine: string
  body: string
  colour: string
  doors: number
  seats: number
  price: number
  location: string
  description: string
  photos: string[] | null
  stock_type: string
  origin_country: string
  market: Market | null
  currency: CurrencyCode | null
  admin_notes: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
}

export type ListingInput = {
  year: number
  make: string
  model: string
  trim?: string
  mileage: number
  fuel: FuelType
  transmission: Transmission
  engine?: string
  body: BodyType
  colour?: string
  doors?: number
  seats?: number
  price: number
  location?: string
  description?: string
  photos: string[]
  stockType?: StockType
  originCountry?: string
  market?: Market
  currency?: CurrencyCode
}

function sql() {
  if (!DATABASE_URL) return null
  return neon(DATABASE_URL)
}

function asPhotos(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string")
  return []
}

export function listingToCar(row: CarListingRow): Car {
  const price = Number(row.price) || 0
  return {
    id: row.id,
    year: Number(row.year),
    make: row.make,
    model: row.model,
    trim: row.trim || "",
    mileage: Number(row.mileage) || 0,
    fuel: (row.fuel as FuelType) || "Petrol",
    transmission: (row.transmission as Transmission) || "Automatic",
    engine: row.engine || "",
    body: (row.body as BodyType) || "Saloon",
    colour: row.colour || "",
    doors: Number(row.doors) || 4,
    seats: Number(row.seats) || 5,
    price,
    monthlyFrom: Math.round(estimateMonthly(price)),
    photos: asPhotos(row.photos),
    features: [],
    description: row.description || "",
    history: { hpi: "Pending review", mot: "Seller declared", service: "Ask seller", owners: 1 },
    stockType: (row.stock_type as StockType) || "uk_stock",
    market: "uk",
    currency: "GBP",
    originCountry: row.origin_country || "United Kingdom",
    shippingStatus: "ready",
    location: row.location || "Nationwide",
    seller: row.seller_name || "Private seller",
    sellerType: "Private",
    rating: 0,
    reviewCount: 0,
  }
}

export async function createCarListing(
  seller: { id: string; email?: string | null; name?: string | null },
  input: ListingInput,
) {
  const db = sql()
  if (!db) throw new Error("Database is not configured")
  const rows = (await db`
    INSERT INTO car_listings (
      seller_user_id, seller_email, seller_name, status,
      year, make, model, trim, mileage, fuel, transmission, engine, body, colour,
      doors, seats, price, location, description, photos, stock_type, origin_country
    ) VALUES (
      ${seller.id}, ${seller.email ?? null}, ${seller.name ?? null}, 'pending',
      ${input.year}, ${input.make}, ${input.model}, ${input.trim ?? ""}, ${input.mileage},
      ${input.fuel}, ${input.transmission}, ${input.engine ?? ""}, ${input.body}, ${input.colour ?? ""},
      ${input.doors ?? 4}, ${input.seats ?? 5}, ${input.price}, ${input.location ?? ""},
      ${input.description ?? ""}, ${input.photos}, ${input.stockType ?? "uk_stock"},
      ${input.originCountry ?? "United Kingdom"}
    )
    RETURNING *
  `) as CarListingRow[]
  return rows[0]
}

export async function listMine(userId: string) {
  const db = sql()
  if (!db) return []
  return (await db`
    SELECT * FROM car_listings WHERE seller_user_id = ${userId} ORDER BY created_at DESC
  `) as CarListingRow[]
}

export async function listApprovedListingCars(): Promise<Car[]> {
  const db = sql()
  if (!db) return []
  const rows = (await db`
    SELECT * FROM car_listings WHERE status = 'approved' ORDER BY created_at DESC
  `) as CarListingRow[]
  return rows.map(listingToCar)
}

export async function getApprovedListingCar(id: string): Promise<Car | null> {
  const db = sql()
  if (!db) return null
  const rows = (await db`
    SELECT * FROM car_listings WHERE id = ${id} AND status = 'approved' LIMIT 1
  `) as CarListingRow[]
  return rows[0] ? listingToCar(rows[0]) : null
}

export async function listAdminListings(status: ListingStatus | "all") {
  const db = sql()
  if (!db) return []
  if (status === "all") {
    return (await db`SELECT * FROM car_listings ORDER BY created_at DESC LIMIT 200`) as CarListingRow[]
  }
  return (await db`
    SELECT * FROM car_listings WHERE status = ${status} ORDER BY created_at DESC LIMIT 200
  `) as CarListingRow[]
}

export async function reviewListing(
  id: string,
  action: "approve" | "reject",
  reviewer: string,
  notes?: string,
) {
  const db = sql()
  if (!db) throw new Error("Database is not configured")
  const next = action === "approve" ? "approved" : "rejected"
  const rows = (await db`
    UPDATE car_listings
    SET status = ${next},
        admin_notes = ${notes ?? null},
        reviewed_at = now(),
        reviewed_by = ${reviewer},
        updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as CarListingRow[]
  return rows[0] ?? null
}
