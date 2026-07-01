import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import {
  APPLICATION_SELECT,
  mapApplicationRow,
  safeDate,
  safePassportLast4,
  type ApplicationRow,
} from "@/lib/visa/map-application"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET() {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const rowsRaw = await sql.query(
      `select ${APPLICATION_SELECT} from visa_applications
       where auth_user_id = $1
       order by created_at desc`,
      [authUserId],
    )
    const applications = (rowsRaw as ApplicationRow[]).map(mapApplicationRow)
    return Response.json({ applications }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load visa applications." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

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
    }

    const applicantNationality = String(body.applicantNationality ?? "").trim()
    const destinationCountry = String(body.destinationCountry ?? "").trim()
    const visaType = String(body.visaType ?? "").trim()
    if (!applicantNationality || !destinationCountry || !visaType) {
      return Response.json(
        { error: "Nationality, destination country, and visa type are required." },
        { status: 400 },
      )
    }

    const label = String(body.label ?? "").trim() || `${visaType} visa — ${destinationCountry}`
    const visaTypeLabel = String(body.visaTypeLabel ?? "").trim()
    const purposeNotes = String(body.purposeNotes ?? "").trim()
    const targetTravelDate = safeDate(body.targetTravelDate)
    const passportExpiryDate = safeDate(body.passportExpiryDate)
    const passportNumberLast4 = safePassportLast4(body.passportNumberLast4)

    const rowsRaw = await sql.query(
      `insert into visa_applications (
        auth_user_id, label, applicant_nationality, destination_country, visa_type,
        visa_type_label, purpose_notes, target_travel_date, passport_expiry_date, passport_number_last4
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      returning ${APPLICATION_SELECT}`,
      [
        authUserId,
        label,
        applicantNationality,
        destinationCountry,
        visaType,
        visaTypeLabel || null,
        purposeNotes || null,
        targetTravelDate,
        passportExpiryDate,
        passportNumberLast4 || null,
      ],
    )

    const row = (rowsRaw as ApplicationRow[])[0]
    if (!row) return Response.json({ error: "Unable to create visa application." }, { status: 500 })
    return Response.json({ application: mapApplicationRow(row) }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to create visa application." }, { status: 500 })
  }
}
