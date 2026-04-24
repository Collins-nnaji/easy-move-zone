import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  const { session, user } = await neonAuth()
  if (!session || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100)
  const offset = parseInt(searchParams.get("offset") ?? "0")

  try {
    const rows = await sql`
      SELECT s.*, tp.company_name AS transporter_name, tp.phone AS transporter_phone
      FROM shipments s
      LEFT JOIN transporter_profiles tp ON s.transporter_id = tp.id
      WHERE (s.farmer_id = ${user.id} OR s.buyer_id = ${user.id})
        AND (${status ?? null} IS NULL OR s.status = ${status})
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return NextResponse.json({ shipments: rows, count: rows.length })
  } catch (err) {
    console.error("[api/shipments GET]", err)
    return NextResponse.json({ error: "Failed to fetch shipments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  const { session, user } = await neonAuth()
  if (!session || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const {
      produce_listing_id, transporter_id,
      crop_description, quantity, unit, cargo_value,
      origin_state, origin_lga, destination,
      pickup_date, eta,
    } = body

    if (!crop_description || !quantity || !unit || !origin_state || !destination) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [row] = await sql`
      INSERT INTO shipments (
        farmer_id, transporter_id, produce_listing_id,
        crop_description, quantity, unit, cargo_value,
        origin_state, origin_lga, destination,
        pickup_date, eta,
        status
      ) VALUES (
        ${user.id}, ${transporter_id ?? null}, ${produce_listing_id ?? null},
        ${crop_description}, ${quantity}, ${unit}, ${cargo_value ?? null},
        ${origin_state}, ${origin_lga ?? null}, ${destination},
        ${pickup_date ?? null}, ${eta ?? null},
        'pending'
      )
      RETURNING id, created_at
    `
    return NextResponse.json({ success: true, id: row.id }, { status: 201 })
  } catch (err) {
    console.error("[api/shipments POST]", err)
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 })
  }
}
