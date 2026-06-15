import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/auth/admin"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

// GET /api/admin/vendors -> all vendors with enquiry counts (admin only).
export async function GET(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const params: unknown[] = []
  let where = ""
  if (status && ["live", "pending", "rejected"].includes(status)) {
    params.push(status)
    where = `WHERE v.status = $1`
  }

  const rows = await sql.query(
    `SELECT
       v.id, v.business_name, v.service_type, v.city, v.status, v.rating,
       v.contact_email, v.contact_phone, v.created_at AS submitted_at, v.reviewer_notes,
       (SELECT count(*) FROM vendor_enquiries e WHERE e.vendor_id = v.id) AS enquiries
     FROM vendors v ${where}
     ORDER BY
       CASE v.status WHEN 'pending' THEN 1 WHEN 'live' THEN 2 ELSE 3 END,
       v.created_at DESC
     LIMIT 200`,
    params,
  )
  return NextResponse.json({ vendors: rows })
}

// PATCH /api/admin/vendors -> approve/reject a vendor (admin only).
export async function PATCH(req: NextRequest) {
  if (!sql) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id, action, reviewer_notes } = await req.json()
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const newStatus = action === "approve" ? "live" : "rejected"
  await sql.query(
    `UPDATE vendors SET status = $1, reviewer_notes = $2, updated_at = now() WHERE id = $3`,
    [newStatus, reviewer_notes ?? null, id],
  )
  return NextResponse.json({ ok: true, status: newStatus })
}
