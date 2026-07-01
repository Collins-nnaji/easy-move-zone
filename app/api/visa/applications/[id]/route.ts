import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import {
  ALLOWED_APPLICATION_STATUSES,
  APPLICATION_SELECT,
  mapApplicationRow,
  safeDate,
  safePassportLast4,
  type ApplicationRow,
} from "@/lib/visa/map-application"
import type { ApplicationStatus } from "@/lib/visa/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const { id } = await context.params

    const rowsRaw = await sql.query(
      `select ${APPLICATION_SELECT} from visa_applications where id = $1 and auth_user_id = $2 limit 1`,
      [id, authUserId],
    )
    const row = (rowsRaw as ApplicationRow[])[0]
    if (!row) return Response.json({ error: "Application not found." }, { status: 404 })
    return Response.json({ application: mapApplicationRow(row) }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load visa application." }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const { id } = await context.params

    const body = (await request.json()) as {
      label?: string
      applicantNationality?: string
      destinationCountry?: string
      visaType?: string
      visaTypeLabel?: string
      purposeNotes?: string
      targetTravelDate?: string | null
      passportExpiryDate?: string | null
      passportNumberLast4?: string
      status?: ApplicationStatus
    }

    const existingRaw = await sql.query(
      `select ${APPLICATION_SELECT} from visa_applications where id = $1 and auth_user_id = $2 limit 1`,
      [id, authUserId],
    )
    const current = (existingRaw as ApplicationRow[])[0]
    if (!current) return Response.json({ error: "Application not found." }, { status: 404 })

    const label = body.label === undefined ? current.label : String(body.label).trim() || current.label
    const applicantNationality =
      body.applicantNationality === undefined ? current.applicant_nationality : String(body.applicantNationality).trim()
    const destinationCountry =
      body.destinationCountry === undefined ? current.destination_country : String(body.destinationCountry).trim()
    const visaType = body.visaType === undefined ? current.visa_type : String(body.visaType).trim()
    const visaTypeLabel =
      body.visaTypeLabel === undefined ? current.visa_type_label : String(body.visaTypeLabel).trim() || null
    const purposeNotes = body.purposeNotes === undefined ? current.purpose_notes : String(body.purposeNotes).trim() || null
    const targetTravelDate = body.targetTravelDate === undefined ? current.target_travel_date : safeDate(body.targetTravelDate)
    const passportExpiryDate =
      body.passportExpiryDate === undefined ? current.passport_expiry_date : safeDate(body.passportExpiryDate)
    const passportNumberLast4 =
      body.passportNumberLast4 === undefined ? current.passport_number_last4 : safePassportLast4(body.passportNumberLast4) || null
    const status = ALLOWED_APPLICATION_STATUSES.has(body.status as ApplicationStatus)
      ? (body.status as ApplicationStatus)
      : current.status

    const rowsRaw = await sql.query(
      `update visa_applications set
        label = $1, applicant_nationality = $2, destination_country = $3, visa_type = $4,
        visa_type_label = $5, purpose_notes = $6, target_travel_date = $7,
        passport_expiry_date = $8, passport_number_last4 = $9, status = $10, updated_at = now()
       where id = $11 and auth_user_id = $12
       returning ${APPLICATION_SELECT}`,
      [
        label,
        applicantNationality,
        destinationCountry,
        visaType,
        visaTypeLabel,
        purposeNotes,
        targetTravelDate,
        passportExpiryDate,
        passportNumberLast4,
        status,
        id,
        authUserId,
      ],
    )

    const row = (rowsRaw as ApplicationRow[])[0]
    if (!row) return Response.json({ error: "Unable to update visa application." }, { status: 500 })
    return Response.json({ application: mapApplicationRow(row) }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to update visa application." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const { id } = await context.params

    const result = await sql.query(
      `delete from visa_applications where id = $1 and auth_user_id = $2 returning id`,
      [id, authUserId],
    )
    const rows = result as Array<{ id: string }>
    if (!rows[0]) return Response.json({ error: "Application not found." }, { status: 404 })
    return Response.json({ ok: true }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to delete visa application." }, { status: 500 })
  }
}
