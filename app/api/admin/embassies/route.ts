import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"
import { ALLOWED_MISSION_TYPES, EMBASSY_SELECT, mapEmbassyRow, type EmbassyRow } from "@/lib/visa/map-embassy"
import type { MissionType } from "@/lib/visa/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET() {
  try {
    await assertAdminApi()
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const rowsRaw = await sql.query(`select ${EMBASSY_SELECT} from embassies order by country asc, city asc`)
    const embassies = (rowsRaw as EmbassyRow[]).map(mapEmbassyRow)
    return Response.json({ embassies }, { status: 200 })
  } catch (err) {
    if (err instanceof AdminForbiddenError) return Response.json({ error: "Forbidden" }, { status: 403 })
    return Response.json({ error: "Unable to load embassies." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await assertAdminApi()
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const body = (await request.json()) as {
      country?: string
      locatedInCountry?: string
      missionType?: MissionType
      city?: string
      address?: string
      phone?: string
      email?: string
      website?: string
      appointmentBookingUrl?: string
      jurisdictionNotes?: string
      operatingHours?: string
    }

    const country = String(body.country ?? "").trim()
    const locatedInCountry = String(body.locatedInCountry ?? "").trim()
    const city = String(body.city ?? "").trim()
    if (!country || !locatedInCountry || !city) {
      return Response.json({ error: "country, locatedInCountry, and city are required." }, { status: 400 })
    }
    const missionType = ALLOWED_MISSION_TYPES.has(body.missionType as MissionType) ? (body.missionType as MissionType) : "embassy"

    const rowsRaw = await sql.query(
      `insert into embassies (
        country, located_in_country, mission_type, city, address, phone, email,
        website, appointment_booking_url, jurisdiction_notes, operating_hours
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      returning ${EMBASSY_SELECT}`,
      [
        country,
        locatedInCountry,
        missionType,
        city,
        String(body.address ?? "").trim() || null,
        String(body.phone ?? "").trim() || null,
        String(body.email ?? "").trim() || null,
        String(body.website ?? "").trim() || null,
        String(body.appointmentBookingUrl ?? "").trim() || null,
        String(body.jurisdictionNotes ?? "").trim() || null,
        String(body.operatingHours ?? "").trim() || null,
      ],
    )
    const row = (rowsRaw as EmbassyRow[])[0]
    if (!row) return Response.json({ error: "Unable to create embassy." }, { status: 500 })
    return Response.json({ embassy: mapEmbassyRow(row) }, { status: 200 })
  } catch (err) {
    if (err instanceof AdminForbiddenError) return Response.json({ error: "Forbidden" }, { status: 403 })
    return Response.json({ error: "Unable to create embassy." }, { status: 500 })
  }
}
