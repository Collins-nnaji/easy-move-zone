import { NextResponse } from "next/server"
import { neonAuth } from "@neondatabase/auth/next/server"
import { createCarListing, listMine } from "@/lib/cars/marketplace"
import { isListingPhotoUrl } from "@/lib/storage/s3"
import type { BodyType, FuelType, StockType, Transmission } from "@/lib/cars/catalog"

export const runtime = "nodejs"

const FUELS: FuelType[] = ["Petrol", "Diesel", "Hybrid", "Electric"]
const GEARS: Transmission[] = ["Automatic", "Manual"]
const BODIES: BodyType[] = ["Saloon", "Hatchback", "Estate", "SUV", "Coupe", "MPV"]
const STOCK: StockType[] = ["uk_stock", "import", "cfr"]

export async function GET() {
  const { session, user } = await neonAuth()
  if (!session || !user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 })
  }
  const items = await listMine(user.id)
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const { session, user } = await neonAuth()
  if (!session || !user?.id) {
    return NextResponse.json({ error: "Sign in to list a car" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

  const make = String(body.make ?? "").trim()
  const model = String(body.model ?? "").trim()
  const year = Number(body.year)
  const mileage = Number(body.mileage)
  const price = Number(body.price)
  const photos = Array.isArray(body.photos) ? body.photos.filter((p): p is string => typeof p === "string") : []

  if (!make || !model) return NextResponse.json({ error: "Make and model are required" }, { status: 400 })
  if (!Number.isFinite(year) || year < 1980 || year > new Date().getFullYear() + 1) {
    return NextResponse.json({ error: "Enter a valid year" }, { status: 400 })
  }
  if (!Number.isFinite(mileage) || mileage < 0) {
    return NextResponse.json({ error: "Enter mileage" }, { status: 400 })
  }
  if (!Number.isFinite(price) || price < 500) {
    return NextResponse.json({ error: "Enter an asking price" }, { status: 400 })
  }
  if (photos.length < 1) return NextResponse.json({ error: "Add at least one photo" }, { status: 400 })
  if (photos.length > 8) return NextResponse.json({ error: "Maximum 8 photos" }, { status: 400 })
  if (!photos.every(isListingPhotoUrl)) {
    return NextResponse.json({ error: "Photos must be uploaded through EasyMoveZone" }, { status: 400 })
  }

  const fuel = FUELS.includes(body.fuel as FuelType) ? (body.fuel as FuelType) : "Petrol"
  const transmission = GEARS.includes(body.transmission as Transmission)
    ? (body.transmission as Transmission)
    : "Automatic"
  const carBody = BODIES.includes(body.body as BodyType) ? (body.body as BodyType) : "Saloon"
  const stockType = STOCK.includes(body.stockType as StockType) ? (body.stockType as StockType) : "uk_stock"

  try {
    const listing = await createCarListing(
      { id: user.id, email: user.email, name: user.name },
      {
        year,
        make,
        model,
        trim: String(body.trim ?? "").trim(),
        mileage,
        fuel,
        transmission,
        engine: String(body.engine ?? "").trim(),
        body: carBody,
        colour: String(body.colour ?? "").trim(),
        doors: Number(body.doors) || 4,
        seats: Number(body.seats) || 5,
        price: Math.round(price),
        location: String(body.location ?? "").trim(),
        description: String(body.description ?? "").trim(),
        photos,
        stockType,
        originCountry: String(body.originCountry ?? "United Kingdom").trim() || "United Kingdom",
      },
    )
    return NextResponse.json({ listing }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save listing"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
