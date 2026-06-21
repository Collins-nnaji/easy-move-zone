import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { BookingStatus, MoveBooking } from "@/lib/bookings/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const ALLOWED_STATUSES = new Set<BookingStatus>(["reserved", "confirmed", "cancelled"])

interface BookingRow {
  id: string
  auth_user_id: string
  booking_type: MoveBooking["bookingType"]
  destination_city: string
  destination_country: string | null
  item_title: string
  provider: string | null
  price_label: string | null
  start_date: string | null
  end_date: string | null
  guests: number | null
  status: BookingStatus
  notes: string | null
  created_at: string
  updated_at: string
}

function mapRow(row: BookingRow): MoveBooking {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    bookingType: row.booking_type,
    destinationCity: row.destination_city,
    destinationCountry: row.destination_country ?? "",
    itemTitle: row.item_title,
    provider: row.provider ?? "",
    priceLabel: row.price_label ?? "",
    startDate: row.start_date,
    endDate: row.end_date,
    guests: row.guests ?? 1,
    status: row.status,
    notes: row.notes ?? "",
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

const SELECT_COLUMNS = `id, auth_user_id, booking_type, destination_city, destination_country,
  item_title, provider, price_label, start_date, end_date, guests, status, notes,
  created_at, updated_at`

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const authUserId = String(user.id)
    const { id } = await context.params
    if (!id) return Response.json({ error: "Booking id is required." }, { status: 400 })

    const body = (await request.json()) as { status?: BookingStatus; notes?: string }
    const status = ALLOWED_STATUSES.has(body.status as BookingStatus) ? (body.status as BookingStatus) : null
    if (!status) return Response.json({ error: "Valid status is required." }, { status: 400 })

    const notes = body.notes === undefined ? undefined : String(body.notes ?? "").trim()

    const existingRaw = await sql.query(
      `select status, notes from move_bookings where id = $1 and auth_user_id = $2 limit 1`,
      [id, authUserId],
    )
    const existing = (existingRaw as Array<{ status: BookingStatus; notes: string | null }>)[0]
    if (!existing) return Response.json({ error: "Booking not found." }, { status: 404 })

    if (existing.status === "cancelled" && status !== "cancelled") {
      return Response.json({ error: "Cancelled bookings cannot be changed." }, { status: 400 })
    }

    const rowsRaw = await sql.query(
      `update move_bookings
       set status = $1,
           notes = $2,
           updated_at = now()
       where id = $3 and auth_user_id = $4
       returning ${SELECT_COLUMNS}`,
      [
        status,
        notes === undefined ? existing.notes : notes || null,
        id,
        authUserId,
      ],
    )
    const row = (rowsRaw as BookingRow[])[0]
    if (!row) return Response.json({ error: "Unable to update booking." }, { status: 500 })

    return Response.json({ booking: mapRow(row) }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to update booking." }, { status: 500 })
  }
}
