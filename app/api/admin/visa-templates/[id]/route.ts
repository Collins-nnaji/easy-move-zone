import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"
import { TEMPLATE_SELECT, mapTemplateRow, type TemplateRow } from "@/lib/visa/map-template"
import type { ChecklistTemplateItem, RequiredDocumentSpec } from "@/lib/visa/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const { id } = await context.params

    const rowsRaw = await sql.query(`select ${TEMPLATE_SELECT} from visa_requirement_templates where id = $1 limit 1`, [id])
    const row = (rowsRaw as TemplateRow[])[0]
    if (!row) return Response.json({ error: "Template not found." }, { status: 404 })
    return Response.json({ template: mapTemplateRow(row) }, { status: 200 })
  } catch (err) {
    if (err instanceof AdminForbiddenError) return Response.json({ error: "Forbidden" }, { status: 403 })
    return Response.json({ error: "Unable to load template." }, { status: 500 })
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const { id } = await context.params

    const body = (await request.json()) as {
      visaTypeLabel?: string
      summary?: string
      requiredDocuments?: RequiredDocumentSpec[]
      checklistTemplate?: ChecklistTemplateItem[]
      processingTimeEstimate?: string
      feeEstimate?: string
      validityNotes?: string
      verify?: boolean
    }

    const existingRaw = await sql.query(`select ${TEMPLATE_SELECT} from visa_requirement_templates where id = $1 limit 1`, [id])
    const current = (existingRaw as TemplateRow[])[0]
    if (!current) return Response.json({ error: "Template not found." }, { status: 404 })

    // Any admin edit — or an explicit verify — promotes an AI-generated template
    // out of the "needs review" state.
    const nextSource = current.source === "ai_generated" ? "admin_edited" : current.source

    const rowsRaw = await sql.query(
      `update visa_requirement_templates set
        visa_type_label = $1, summary = $2, required_documents = $3, checklist_template = $4,
        processing_time_estimate = $5, fee_estimate = $6, validity_notes = $7,
        source = $8, last_verified_at = now(), updated_at = now()
       where id = $9
       returning ${TEMPLATE_SELECT}`,
      [
        body.visaTypeLabel === undefined ? current.visa_type_label : String(body.visaTypeLabel).trim() || current.visa_type_label,
        body.summary === undefined ? current.summary : String(body.summary).trim() || current.summary,
        JSON.stringify(body.requiredDocuments ?? current.required_documents ?? []),
        JSON.stringify(body.checklistTemplate ?? current.checklist_template ?? []),
        body.processingTimeEstimate === undefined ? current.processing_time_estimate : String(body.processingTimeEstimate).trim() || null,
        body.feeEstimate === undefined ? current.fee_estimate : String(body.feeEstimate).trim() || null,
        body.validityNotes === undefined ? current.validity_notes : String(body.validityNotes).trim() || null,
        nextSource,
        id,
      ],
    )
    const row = (rowsRaw as TemplateRow[])[0]
    if (!row) return Response.json({ error: "Unable to update template." }, { status: 500 })
    return Response.json({ template: mapTemplateRow(row) }, { status: 200 })
  } catch (err) {
    if (err instanceof AdminForbiddenError) return Response.json({ error: "Forbidden" }, { status: 403 })
    return Response.json({ error: "Unable to update template." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const { id } = await context.params

    const result = await sql.query(`delete from visa_requirement_templates where id = $1 returning id`, [id])
    const rows = result as Array<{ id: string }>
    if (!rows[0]) return Response.json({ error: "Template not found." }, { status: 404 })
    return Response.json({ ok: true }, { status: 200 })
  } catch (err) {
    if (err instanceof AdminForbiddenError) return Response.json({ error: "Forbidden" }, { status: 403 })
    return Response.json({ error: "Unable to delete template." }, { status: 500 })
  }
}
