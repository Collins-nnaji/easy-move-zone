import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"
import { ALLOWED_MISSION_TYPES, EMBASSY_SELECT, mapEmbassyRow, type EmbassyRow } from "@/lib/visa/map-embassy"
import type { MissionType } from "@/lib/visa/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const { id } = await context.params

    const rowsRaw = await sql.query(`select ${EMBASSY_SELECT} from embassies where id = $1 limit 1`, [id])
    const row = (rowsRaw as EmbassyRow[])[0]
    if (!row) return Response.json({ error: "Embassy not found." }, { status: 404 })
    return Response.json({ embassy: mapEmbassyRow(row) }, { status: 200 })
  } catch (err) {
    if (err instanceof AdminForbiddenError) return Response.json({ error: "Forbidden" }, { status: 403 })
    return Response.json({ error: "Unable to load embassy." }, { status: 500 })
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const { id } = await context.params

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
      isActive?: boolean
    }

    const existingRaw = await sql.query(`select ${EMBASSY_SELECT} from embassies where id = $1 limit 1`, [id])
    const current = (existingRaw as EmbassyRow[])[0]
    if (!current) return Response.json({ error: "Embassy not found." }, { status: 404 })

    const missionType = ALLOWED_MISSION_TYPES.has(body.missionType as MissionType)
      ? (body.missionType as MissionType)
      : current.mission_type

    const rowsRaw = await sql.query(
      `update embassies set
        country = $1, located_in_country = $2, mission_type = $3, city = $4, address = $5,
        phone = $6, email = $7, website = $8, appointment_booking_url = $9,
        jurisdiction_notes = $10, operating_hours = $11, is_active = $12, updated_at = now()
       where id = $13
       returning ${EMBASSY_SELECT}`,
      [
        body.country === undefined ? current.country : String(body.country).trim() || current.country,
        body.locatedInCountry === undefined ? current.located_in_country : String(body.locatedInCountry).trim() || current.located_in_country,
        missionType,
        body.city === undefined ? current.city : String(body.city).trim() || current.city,
        body.address === undefined ? current.address : String(body.address).trim() || null,
        body.phone === undefined ? current.phone : String(body.phone).trim() || null,
        body.email === undefined ? current.email : String(body.email).trim() || null,
        body.website === undefined ? current.website : String(body.website).trim() || null,
        body.appointmentBookingUrl === undefined ? current.appointment_booking_url : String(body.appointmentBookingUrl).trim() || null,
        body.jurisdictionNotes === undefined ? current.jurisdiction_notes : String(body.jurisdictionNotes).trim() || null,
        body.operatingHours === undefined ? current.operating_hours : String(body.operatingHours).trim() || null,
        body.isActive === undefined ? current.is_active : Boolean(body.isActive),
        id,
      ],
    )
    const row = (rowsRaw as EmbassyRow[])[0]
    if (!row) return Response.json({ error: "Unable to update embassy." }, { status: 500 })
    return Response.json({ embassy: mapEmbassyRow(row) }, { status: 200 })
  } catch (err) {
    if (err instanceof AdminForbiddenError) return Response.json({ error: "Forbidden" }, { status: 403 })
    return Response.json({ error: "Unable to update embassy." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const { id } = await context.params

    const result = await sql.query(`delete from embassies where id = $1 returning id`, [id])
    const rows = result as Array<{ id: string }>
    if (!rows[0]) return Response.json({ error: "Embassy not found." }, { status: 404 })
    return Response.json({ ok: true }, { status: 200 })
  } catch (err) {
    if (err instanceof AdminForbiddenError) return Response.json({ error: "Forbidden" }, { status: 403 })
    return Response.json({ error: "Unable to delete embassy." }, { status: 500 })
  }
}
