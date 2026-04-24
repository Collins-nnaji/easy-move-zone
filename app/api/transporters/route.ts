import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const state = searchParams.get("state")
  const verified = searchParams.get("verified")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 100)
  const offset = parseInt(searchParams.get("offset") ?? "0")

  try {
    const rows = await sql.query(
      `SELECT * FROM transporter_profiles
       WHERE status = 'active'
         AND ($1::text IS NULL OR base_state ILIKE '%' || $1 || '%')
         AND ($2::text IS NULL OR verified = ($2 = 'true'))
       ORDER BY rating DESC NULLS LAST, total_trips DESC
       LIMIT $3 OFFSET $4`,
      [state, verified, limit, offset],
    )
    return NextResponse.json({ transporters: rows, count: rows.length })
  } catch (err) {
    console.error("[api/transporters GET]", err)
    return NextResponse.json({ error: "Failed to fetch transporters" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const body = await req.json()
    const {
      company_name, owner_name, phone, whatsapp,
      base_state, base_lga, fleet_size,
      truck_types, specialties, routes, years_experience,
      has_insurance, has_gps, has_cold_chain, notes,
    } = body

    if (!company_name || !owner_name || !phone || !base_state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const rows = await sql.query(
      `INSERT INTO transporter_profiles (
        company_name, owner_name, phone, whatsapp,
        base_state, base_lga, fleet_size,
        truck_types, specialties, routes, years_experience,
        has_insurance, has_gps, has_cold_chain, notes,
        status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending')
      RETURNING id, created_at`,
      [
        company_name, owner_name, phone, whatsapp ?? true,
        base_state, base_lga ?? null, fleet_size ?? 1,
        truck_types ?? [], specialties ?? [], routes ?? null, years_experience ?? null,
        has_insurance ?? false, has_gps ?? false, has_cold_chain ?? false, notes ?? null,
      ],
    )
    const row = (rows as Array<{ id: string; created_at: string }>)[0]
    return NextResponse.json({ success: true, id: row.id }, { status: 201 })
  } catch (err) {
    console.error("[api/transporters POST]", err)
    return NextResponse.json({ error: "Failed to register transporter" }, { status: 500 })
  }
}
