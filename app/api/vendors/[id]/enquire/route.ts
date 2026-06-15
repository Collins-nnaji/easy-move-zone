import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

function safeDate(value: unknown): string | null {
  if (!value) return null
  const cast = String(value)
  return /^\d{4}-\d{2}-\d{2}$/.test(cast) ? cast : null
}

// POST /api/vendors/[id]/enquire -> record a move enquiry for a vendor.
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  try {
    const { id } = await context.params
    if (!id) return NextResponse.json({ error: "Vendor id is required" }, { status: 400 })

    const b = await req.json()
    const name = String(b.name ?? "").trim()
    const message = String(b.message ?? "").trim()
    if (!name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 })
    }

    const exists = await sql.query(`SELECT 1 FROM vendors WHERE id = $1 AND status = 'live' LIMIT 1`, [id])
    if ((exists as unknown[]).length === 0) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    await sql.query(
      `INSERT INTO vendor_enquiries (vendor_id, name, email, phone, message, move_from, move_to, move_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        id, name, b.email ?? null, b.phone ?? null, message,
        b.move_from ?? null, b.move_to ?? null, safeDate(b.move_date),
      ],
    )
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to send enquiry" }, { status: 500 })
  }
}
