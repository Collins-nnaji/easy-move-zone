import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { BookingStatus, BookingType, MoveBooking } from "@/lib/bookings/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const ALLOWED_TYPES = new Set<BookingType>(["trip", "stay", "visa", "school", "job"])

function safeDate(value: unknown): string | null {
  if (!value) return null
  const cast = String(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cast)) return null
  return cast
}

function safeGuests(value: unknown): number {
  const cast = Number(value)
  if (!Number.isFinite(cast) || cast < 1) return 1
  return Math.min(20, Math.round(cast))
}

interface BookingRow {
  id: string
  auth_user_id: string
  booking_type: BookingType
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

export async function GET() {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const rowsRaw = await sql.query(
      `select ${SELECT_COLUMNS} from move_bookings
       where auth_user_id = $1
       order by created_at desc`,
      [authUserId],
    )
    const bookings = (rowsRaw as BookingRow[]).map(mapRow)
    return Response.json({ bookings }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load bookings." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const body = (await request.json()) as Record<string, unknown>

    const bookingType = ALLOWED_TYPES.has(body.bookingType as BookingType)
      ? (body.bookingType as BookingType)
      : null
    const destinationCity = String(body.destinationCity ?? "").trim()
    const itemTitle = String(body.itemTitle ?? "").trim()
    if (!bookingType || !destinationCity || !itemTitle) {
      return Response.json({ error: "Missing required booking fields." }, { status: 400 })
    }

    const destinationCountry = String(body.destinationCountry ?? "").trim()
    const provider = String(body.provider ?? "").trim()
    const priceLabel = String(body.priceLabel ?? "").trim()
    const notes = String(body.notes ?? "").trim()
    const startDate = safeDate(body.startDate)
    const endDate = safeDate(body.endDate)
    const guests = safeGuests(body.guests)

    const rowsRaw = await sql.query(
      `insert into move_bookings (
        auth_user_id, booking_type, destination_city, destination_country,
        item_title, provider, price_label, start_date, end_date, guests, notes
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      returning ${SELECT_COLUMNS}`,
      [
        authUserId,
        bookingType,
        destinationCity,
        destinationCountry || null,
        itemTitle,
        provider || null,
        priceLabel || null,
        startDate,
        endDate,
        guests,
        notes || null,
      ],
    )
    const row = (rowsRaw as BookingRow[])[0]
    if (!row) return Response.json({ error: "Unable to save booking." }, { status: 500 })
    return Response.json({ booking: mapRow(row) }, { status: 201 })
  } catch {
    return Response.json({ error: "Unable to save booking." }, { status: 500 })
  }
}
