import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/auth/admin"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

const PROPERTY_TYPES = new Set(["land", "house", "apartment", "commercial", "mixed-use"])
const VERIFICATION = new Set(["unverified", "pending", "verified", "flagged", "rejected"])

type CreateBody = {
  title?: string
  description?: string | null
  property_type?: string
  city?: string
  state?: string
  country?: string
  neighborhood?: string | null
  address?: string | null
  price_ngn?: number | null
  land_size_sqm?: number | null
  building_size_sqm?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  images?: string[]
  verification_status?: string
  is_published?: boolean
  is_featured?: boolean
  ai_valuation_ngn?: number | null
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!DATABASE_URL) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500)

  const sql = neon(DATABASE_URL)
  try {
    const rows = await sql`
      SELECT * FROM properties
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return NextResponse.json({ properties: rows, count: rows.length })
  } catch (e) {
    console.error("[admin/properties GET]", e)
    return NextResponse.json({ error: "Failed to list properties" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!DATABASE_URL) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  let body: CreateBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const title = typeof body.title === "string" ? body.title.trim() : ""
  const propertyType = typeof body.property_type === "string" ? body.property_type.trim() : ""
  const city = typeof body.city === "string" ? body.city.trim() : ""
  const state = typeof body.state === "string" ? body.state.trim() : ""

  if (!title || !city || !state) {
    return NextResponse.json({ error: "title, city, and state are required" }, { status: 400 })
  }
  if (!PROPERTY_TYPES.has(propertyType)) {
    return NextResponse.json(
      { error: "property_type must be land, house, apartment, commercial, or mixed-use" },
      { status: 400 }
    )
  }

  const verification =
    body.verification_status && VERIFICATION.has(body.verification_status)
      ? body.verification_status
      : "verified"
  const isPublished = body.is_published !== false
  const isFeatured = body.is_featured === true

  const description = typeof body.description === "string" ? body.description : null
  const country = typeof body.country === "string" && body.country.trim() ? body.country.trim() : "Nigeria"
  const neighborhood =
    typeof body.neighborhood === "string" && body.neighborhood.trim() ? body.neighborhood.trim() : null
  const address = typeof body.address === "string" && body.address.trim() ? body.address.trim() : null
  const priceNgn =
    body.price_ngn != null && Number.isFinite(Number(body.price_ngn)) ? Math.round(Number(body.price_ngn)) : null
  const landSize =
    body.land_size_sqm != null && Number.isFinite(Number(body.land_size_sqm))
      ? Number(body.land_size_sqm)
      : null
  const buildingSize =
    body.building_size_sqm != null && Number.isFinite(Number(body.building_size_sqm))
      ? Number(body.building_size_sqm)
      : null
  const bedrooms =
    body.bedrooms != null && Number.isFinite(Number(body.bedrooms)) ? Math.round(Number(body.bedrooms)) : null
  const bathrooms =
    body.bathrooms != null && Number.isFinite(Number(body.bathrooms)) ? Math.round(Number(body.bathrooms)) : null
  const images = Array.isArray(body.images) ? body.images.filter((u) => typeof u === "string" && u.length > 0) : []
  const imagesJson = JSON.stringify(images)
  const aiVal =
    body.ai_valuation_ngn != null && Number.isFinite(Number(body.ai_valuation_ngn))
      ? Math.round(Number(body.ai_valuation_ngn))
      : null

  const sql = neon(DATABASE_URL)
  try {
    const rows = await sql`
      INSERT INTO properties (
        agent_id,
        title,
        description,
        property_type,
        city,
        state,
        country,
        neighborhood,
        address,
        price_ngn,
        land_size_sqm,
        building_size_sqm,
        bedrooms,
        bathrooms,
        images,
        verification_status,
        is_published,
        is_featured,
        ai_valuation_ngn
      )
      VALUES (
        ${admin.userId},
        ${title},
        ${description},
        ${propertyType},
        ${city},
        ${state},
        ${country},
        ${neighborhood},
        ${address},
        ${priceNgn},
        ${landSize},
        ${buildingSize},
        ${bedrooms},
        ${bathrooms},
        ${imagesJson}::jsonb,
        ${verification},
        ${isPublished},
        ${isFeatured},
        ${aiVal}
      )
      RETURNING id
    `
    const row = rows[0] as { id: string } | undefined
    if (!row?.id) return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
    return NextResponse.json({ id: row.id, message: "Listing created" })
  } catch (e) {
    console.error("[admin/properties POST]", e)
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
