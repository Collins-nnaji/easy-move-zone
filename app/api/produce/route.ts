import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const crop = searchParams.get("crop")
  const state = searchParams.get("state")
  const hub = searchParams.get("hub")
  const needs_transport = searchParams.get("needs_transport")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 100)
  const offset = parseInt(searchParams.get("offset") ?? "0")

  try {
    const rows = await sql.query(
      `SELECT * FROM produce_listings
       WHERE status = 'active'
         AND ($1::text IS NULL OR crop_type ILIKE '%' || $1 || '%')
         AND ($2::text IS NULL OR state ILIKE '%' || $2 || '%')
         AND ($3::text IS NULL OR state ILIKE '%' || $3 || '%' OR lga ILIKE '%' || $3 || '%')
         AND ($4::text IS NULL OR needs_transport = ($4 = 'true'))
       ORDER BY created_at DESC
       LIMIT $5 OFFSET $6`,
      [crop, state, hub, needs_transport, limit, offset],
    )
    return NextResponse.json({ listings: rows, count: rows.length })
  } catch (err) {
    console.error("[api/produce GET]", err)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const body = await req.json()
    const {
      crop_type, variety, quantity, unit, price_per_unit, notes,
      state, lga, harvest_date, pickup_from, pickup_to,
      needs_transport, cold_storage_required,
      contact_name, contact_phone, contact_whatsapp,
    } = body

    if (!crop_type || !quantity || !unit || !price_per_unit || !state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const rows = await sql.query(
      `INSERT INTO produce_listings (
        crop_type, variety, quantity, unit, price_per_unit, notes,
        state, lga, harvest_date, pickup_from, pickup_to,
        needs_transport, cold_storage_required,
        contact_name, contact_phone, contact_whatsapp,
        status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending')
      RETURNING id, created_at`,
      [
        crop_type, variety ?? null, quantity, unit, price_per_unit, notes ?? null,
        state, lga ?? null, harvest_date ?? null, pickup_from ?? null, pickup_to ?? null,
        needs_transport ?? false, cold_storage_required ?? false,
        contact_name ?? null, contact_phone ?? null, contact_whatsapp ?? true,
      ],
    )
    const row = (rows as Array<{ id: string; created_at: string }>)[0]
    return NextResponse.json({ success: true, id: row.id }, { status: 201 })
  } catch (err) {
    console.error("[api/produce POST]", err)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
