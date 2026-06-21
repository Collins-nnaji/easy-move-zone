import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

export async function GET() {
  try {
    await assertAdminApi()
    if (!DATABASE_URL) return NextResponse.json({ error: "Database not configured." }, { status: 500 })

    const sql = neon(DATABASE_URL)
    const rows = await sql`
      select id, auth_user_id, booking_type, destination_city, destination_country,
             item_title, provider, price_label, start_date, end_date, guests, status, created_at, updated_at
      from move_bookings
      order by created_at desc
      limit 200
    `
    return NextResponse.json({ bookings: rows })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
