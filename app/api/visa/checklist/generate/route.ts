import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import { chatJson, getAiProvider } from "@/lib/ai/openai"
import { ALLOWED_CHECKLIST_CATEGORIES, CHECKLIST_SELECT, mapChecklistRow, type ChecklistRow } from "@/lib/visa/map-checklist"
import { APPLICATION_SELECT, type ApplicationRow } from "@/lib/visa/map-application"
import { TEMPLATE_SELECT, type TemplateRow } from "@/lib/visa/map-template"
import type { ChecklistCategory, ChecklistTemplateItem } from "@/lib/visa/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

async function findTemplate(nationality: string, destinationCountry: string, visaType: string): Promise<TemplateRow | null> {
  const exactRaw = await sql!.query(
    `select ${TEMPLATE_SELECT} from visa_requirement_templates
     where lower(nationality) = lower($1) and lower(destination_country) = lower($2) and lower(visa_type) = lower($3)
     limit 1`,
    [nationality, destinationCountry, visaType],
  )
  const exact = (exactRaw as TemplateRow[])[0]
  if (exact) return exact

  const wildcardRaw = await sql!.query(
    `select ${TEMPLATE_SELECT} from visa_requirement_templates
     where nationality = 'ANY' and lower(destination_country) = lower($1) and lower(visa_type) = lower($2)
     limit 1`,
    [destinationCountry, visaType],
  )
  return (wildcardRaw as TemplateRow[])[0] ?? null
}

async function generateChecklistWithAi(nationality: string, destinationCountry: string, visaType: string): Promise<ChecklistTemplateItem[]> {
  if (!getAiProvider()) return []

  const systemPrompt =
    `You are a visa preparation assistant. Given a nationality, destination country, and visa type, ` +
    `produce a practical step-by-step checklist for that application. Use qualifying language rather ` +
    `than false precision, and never invent specific fees or office names. Respond with raw JSON: ` +
    `{"checklistTemplate": [{"title": "...", "category": "documentation|application_form|appointment|` +
    `fee_payment|biometrics|interview|follow_up", "description": "...", "sortOrder": 0}]}`
  const userPrompt = `Nationality: ${nationality}\nDestination country: ${destinationCountry}\nVisa type: ${visaType}`

  const result = await chatJson<{ checklistTemplate: ChecklistTemplateItem[] }>(systemPrompt, userPrompt, { checklistTemplate: [] })
  return Array.isArray(result.checklistTemplate) ? result.checklistTemplate : []
}

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const body = (await request.json()) as { applicationId?: string }
    const applicationId = String(body.applicationId ?? "").trim()
    if (!applicationId) return Response.json({ error: "applicationId is required." }, { status: 400 })

    const appRaw = await sql.query(
      `select ${APPLICATION_SELECT} from visa_applications where id = $1 and auth_user_id = $2 limit 1`,
      [applicationId, authUserId],
    )
    const application = (appRaw as ApplicationRow[])[0]
    if (!application) return Response.json({ error: "Application not found." }, { status: 404 })

    const template = await findTemplate(application.applicant_nationality, application.destination_country, application.visa_type)
    let templateItems: ChecklistTemplateItem[] = []
    let sourceTemplateId: string | null = null

    if (template && Array.isArray(template.checklist_template) && template.checklist_template.length > 0) {
      templateItems = template.checklist_template
      sourceTemplateId = template.id
    } else {
      templateItems = await generateChecklistWithAi(
        application.applicant_nationality,
        application.destination_country,
        application.visa_type,
      )
    }

    if (templateItems.length === 0) {
      return Response.json({ items: [], generated: 0 }, { status: 200 })
    }

    const insertedRows: ChecklistRow[] = []
    for (const [index, item] of templateItems.entries()) {
      const rowsRaw = await sql.query(
        `insert into visa_checklist_items (
          application_id, auth_user_id, title, description, category, status, priority,
          is_ai_generated, source_template_id, sort_order
        ) values ($1,$2,$3,$4,$5,'todo','medium',true,$6,$7)
        returning ${CHECKLIST_SELECT}`,
        [
          applicationId,
          authUserId,
          String(item.title ?? "").slice(0, 200) || "Checklist item",
          String(item.description ?? "").slice(0, 1000) || null,
          ALLOWED_CHECKLIST_CATEGORIES.has(item.category as ChecklistCategory) ? item.category : "documentation",
          sourceTemplateId,
          Number.isFinite(item.sortOrder) ? item.sortOrder : index,
        ],
      )
      const row = (rowsRaw as ChecklistRow[])[0]
      if (row) insertedRows.push(row)
    }

    return Response.json({ items: insertedRows.map(mapChecklistRow), generated: insertedRows.length }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to generate checklist." }, { status: 500 })
  }
}
