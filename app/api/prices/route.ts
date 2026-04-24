import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const crop = searchParams.get("crop")
  const market = searchParams.get("market")
  const state = searchParams.get("state")
  const category = searchParams.get("category")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200)

  try {
    const rows = await sql.query(
      `SELECT DISTINCT ON (crop, market_name)
         id, crop, category, variety, unit,
         price, currency, market_name, state, city,
         quality_grade, created_at
       FROM commodity_prices
       WHERE verified = true
         AND ($1::text IS NULL OR crop ILIKE '%' || $1 || '%')
         AND ($2::text IS NULL OR market_name ILIKE '%' || $2 || '%')
         AND ($3::text IS NULL OR state ILIKE '%' || $3 || '%')
         AND ($4::text IS NULL OR category = $4)
       ORDER BY crop, market_name, created_at DESC
       LIMIT $5`,
      [crop, market, state, category, limit],
    )
    return NextResponse.json({ prices: rows, count: rows.length })
  } catch (err) {
    console.error("[api/prices GET]", err)
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })

  try {
    const body = await req.json()
    const { crop, unit, price, market_name, state, submitted_by, phone } = body

    if (!crop || !unit || !price || !market_name || !state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const rows = await sql.query(
      `INSERT INTO price_submissions (crop, unit, price, market_name, state, submitted_by, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id`,
      [crop, unit, price, market_name, state, submitted_by ?? null, phone ?? null],
    )
    const row = (rows as Array<{ id: string }>)[0]
    return NextResponse.json({ success: true, id: row.id, message: "Price submitted for review. Thank you!" }, { status: 201 })
  } catch (err) {
    console.error("[api/prices POST]", err)
    return NextResponse.json({ error: "Failed to submit price" }, { status: 500 })
  }
}
