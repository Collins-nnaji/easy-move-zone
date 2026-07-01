import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"
import { TEMPLATE_SELECT, mapTemplateRow, type TemplateRow } from "@/lib/visa/map-template"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET() {
  try {
    await assertAdminApi()
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const rowsRaw = await sql.query(
      `select ${TEMPLATE_SELECT} from visa_requirement_templates
       order by source = 'ai_generated' desc, destination_country asc, nationality asc, visa_type asc`,
    )
    const templates = (rowsRaw as TemplateRow[]).map(mapTemplateRow)
    return Response.json({ templates }, { status: 200 })
  } catch (err) {
    if (err instanceof AdminForbiddenError) return Response.json({ error: "Forbidden" }, { status: 403 })
    return Response.json({ error: "Unable to load templates." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await assertAdminApi()
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const body = (await request.json()) as {
      nationality?: string
      destinationCountry?: string
      visaType?: string
      visaTypeLabel?: string
      summary?: string
    }

    const nationality = String(body.nationality ?? "").trim()
    const destinationCountry = String(body.destinationCountry ?? "").trim()
    const visaType = String(body.visaType ?? "").trim()
    const visaTypeLabel = String(body.visaTypeLabel ?? "").trim() || visaType
    const summary = String(body.summary ?? "").trim()

    if (!nationality || !destinationCountry || !visaType || !summary) {
      return Response.json({ error: "nationality, destinationCountry, visaType, and summary are required." }, { status: 400 })
    }

    const rowsRaw = await sql.query(
      `insert into visa_requirement_templates (
        nationality, destination_country, visa_type, visa_type_label, summary, source
      ) values ($1,$2,$3,$4,$5,'curated')
      on conflict (nationality, destination_country, visa_type) do update set
        visa_type_label = excluded.visa_type_label, summary = excluded.summary, updated_at = now()
      returning ${TEMPLATE_SELECT}`,
      [nationality, destinationCountry, visaType, visaTypeLabel, summary],
    )
    const row = (rowsRaw as TemplateRow[])[0]
    if (!row) return Response.json({ error: "Unable to create template." }, { status: 500 })
    return Response.json({ template: mapTemplateRow(row) }, { status: 200 })
  } catch (err) {
    if (err instanceof AdminForbiddenError) return Response.json({ error: "Forbidden" }, { status: 403 })
    return Response.json({ error: "Unable to create template." }, { status: 500 })
  }
}
