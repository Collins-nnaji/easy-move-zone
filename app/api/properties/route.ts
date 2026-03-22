import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { authServer } from "@/lib/auth/server"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const PROPERTY_TYPES = new Set(["land", "house", "apartment", "commercial", "mixed-use"])

export async function GET(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const city = searchParams.get("city")
  const type = searchParams.get("type")
  const status = searchParams.get("status")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100)
  const offset = parseInt(searchParams.get("offset") ?? "0")

  try {
    if (city && type && type !== "all" && status && status !== "any") {
      const rows = await sql`
        SELECT * FROM properties
        WHERE is_published = true AND LOWER(city) = LOWER(${city}) AND property_type = ${type} AND verification_status = ${status}
        ORDER BY is_featured DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
      return NextResponse.json({ properties: rows, count: rows.length })
    }

    if (city && type && type !== "all") {
      const rows = await sql`
        SELECT * FROM properties
        WHERE is_published = true AND LOWER(city) = LOWER(${city}) AND property_type = ${type}
        ORDER BY is_featured DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
      return NextResponse.json({ properties: rows, count: rows.length })
    }

    if (city && status && status !== "any") {
      const rows = await sql`
        SELECT * FROM properties
        WHERE is_published = true AND LOWER(city) = LOWER(${city}) AND verification_status = ${status}
        ORDER BY is_featured DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
      return NextResponse.json({ properties: rows, count: rows.length })
    }

    if (city) {
      const rows = await sql`
        SELECT * FROM properties
        WHERE is_published = true AND LOWER(city) = LOWER(${city})
        ORDER BY is_featured DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
      return NextResponse.json({ properties: rows, count: rows.length })
    }

    if (status && status !== "any") {
      const rows = await sql`
        SELECT * FROM properties
        WHERE is_published = true AND verification_status = ${status}
        ORDER BY is_featured DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}
      `
      return NextResponse.json({ properties: rows, count: rows.length })
    }

    const rows = await sql`
      SELECT * FROM properties
      WHERE is_published = true
      ORDER BY is_featured DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}
    `
    return NextResponse.json({ properties: rows, count: rows.length })
  } catch {
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}

type CreatePropertyBody = {
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
}

export async function POST(req: NextRequest) {
  const session = await authServer.getSession()
  if (!session?.data?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  let body: CreatePropertyBody
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

  const agentId = session.data.user.id
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
        verification_status,
        is_published
      )
      VALUES (
        ${agentId},
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
        'pending',
        true
      )
      RETURNING id
    `
    const row = rows[0] as { id: string } | undefined
    if (!row?.id) {
      return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
    }
    return NextResponse.json({ id: row.id, message: "Listing created" })
  } catch (e) {
    console.error("POST /api/properties:", e)
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
