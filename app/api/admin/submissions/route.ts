import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/auth/admin"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") ?? "pending"

  const rows = await sql`
    SELECT
      id, title, listing_type, property_type,
      city, state, price_ngn,
      bedrooms, bathrooms, land_size_sqm, building_size_sqm,
      images, description,
      submission_status, submitted_by, submitted_at,
      reviewer_notes,
      seller_name, seller_phone, seller_email
    FROM property_listings
    WHERE submission_status = ${status}
    ORDER BY submitted_at DESC
    LIMIT 100
  `
  return NextResponse.json({ submissions: rows })
}

export async function PATCH(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id, action, reviewer_notes } = await req.json()
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const newStatus = action === "approve" ? "approved" : "rejected"
  const isPublished = action === "approve"

  await sql`
    UPDATE property_listings SET
      submission_status = ${newStatus},
      is_published      = ${isPublished},
      verification_status = ${action === "approve" ? "verified" : "unverified"},
      reviewed_at       = NOW(),
      reviewer_notes    = ${reviewer_notes ?? null}
    WHERE id = ${id}
  `
  return NextResponse.json({ ok: true })
}
