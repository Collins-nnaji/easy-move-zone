import { neon } from "@neondatabase/serverless"
import { chatJson, getAiProvider } from "@/lib/ai/openai"
import { TEMPLATE_SELECT, mapTemplateRow, type TemplateRow } from "@/lib/visa/map-template"
import type { ChecklistTemplateItem, RequiredDocumentSpec, VisaRequirementTemplate } from "@/lib/visa/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

interface AiTemplateResult {
  summary: string
  requiredDocuments: RequiredDocumentSpec[]
  checklistTemplate: ChecklistTemplateItem[]
  processingTimeEstimate: string
  feeEstimate: string
  validityNotes: string
}

const UNAVAILABLE_TEMPLATE_FALLBACK: AiTemplateResult = {
  summary:
    "We don't have verified guidance for this nationality, destination, and visa type combination yet. Check the destination country's official embassy or immigration website for authoritative requirements.",
  requiredDocuments: [],
  checklistTemplate: [],
  processingTimeEstimate: "",
  feeEstimate: "",
  validityNotes: "",
}

async function findTemplate(nationality: string, destinationCountry: string, visaType: string): Promise<TemplateRow | null> {
  if (!sql) return null

  const exactRaw = await sql.query(
    `select ${TEMPLATE_SELECT} from visa_requirement_templates
     where lower(nationality) = lower($1) and lower(destination_country) = lower($2) and lower(visa_type) = lower($3)
     limit 1`,
    [nationality, destinationCountry, visaType],
  )
  const exact = (exactRaw as TemplateRow[])[0]
  if (exact) return exact

  const wildcardRaw = await sql.query(
    `select ${TEMPLATE_SELECT} from visa_requirement_templates
     where nationality = 'ANY' and lower(destination_country) = lower($1) and lower(visa_type) = lower($2)
     limit 1`,
    [destinationCountry, visaType],
  )
  return (wildcardRaw as TemplateRow[])[0] ?? null
}

async function generateAndCache(nationality: string, destinationCountry: string, visaType: string): Promise<TemplateRow | null> {
  if (!sql || !getAiProvider()) return null

  const systemPrompt =
    `You are a visa requirements research assistant. Given a nationality (passport-holder's ` +
    `citizenship) and a destination country and visa type, provide accurate, general guidance on ` +
    `typical requirements. You do not have live access to government sources, so clearly signal this ` +
    `is general guidance requiring official verification. Never invent specific fees, processing ` +
    `times, or document names you're not confident about — use qualifying language ("typically", ` +
    `"often") rather than false precision. Respond with raw JSON matching this shape: ` +
    `{"summary": "2-3 sentence overview", "requiredDocuments": [{"documentType": "passport", ` +
    `"label": "...", "description": "...", "mandatory": true}], "checklistTemplate": [{"title": ` +
    `"...", "category": "documentation|application_form|appointment|fee_payment|biometrics|` +
    `interview|follow_up", "description": "...", "sortOrder": 0}], "processingTimeEstimate": "...", ` +
    `"feeEstimate": "...", "validityNotes": "..."}`

  const userPrompt = `Nationality: ${nationality}\nDestination country: ${destinationCountry}\nVisa type: ${visaType}`

  const result = await chatJson<AiTemplateResult>(systemPrompt, userPrompt, UNAVAILABLE_TEMPLATE_FALLBACK)
  if (result === UNAVAILABLE_TEMPLATE_FALLBACK) return null

  const visaTypeLabel = visaType.charAt(0).toUpperCase() + visaType.slice(1)
  const rowsRaw = await sql.query(
    `insert into visa_requirement_templates (
      nationality, destination_country, visa_type, visa_type_label, summary,
      required_documents, checklist_template, processing_time_estimate, fee_estimate,
      validity_notes, source
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'ai_generated')
    on conflict (nationality, destination_country, visa_type) do update set
      summary = excluded.summary,
      required_documents = excluded.required_documents,
      checklist_template = excluded.checklist_template,
      processing_time_estimate = excluded.processing_time_estimate,
      fee_estimate = excluded.fee_estimate,
      validity_notes = excluded.validity_notes,
      updated_at = now()
    returning ${TEMPLATE_SELECT}`,
    [
      nationality,
      destinationCountry,
      visaType,
      visaTypeLabel,
      result.summary,
      JSON.stringify(result.requiredDocuments ?? []),
      JSON.stringify(result.checklistTemplate ?? []),
      result.processingTimeEstimate || null,
      result.feeEstimate || null,
      result.validityNotes || null,
    ],
  )
  return (rowsRaw as TemplateRow[])[0] ?? null
}

export async function GET(request: Request) {
  try {
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const { searchParams } = new URL(request.url)
    const nationality = String(searchParams.get("nationality") ?? "").trim()
    const destinationCountry = String(searchParams.get("destination") ?? "").trim()
    const visaType = String(searchParams.get("visaType") ?? "").trim()

    if (!nationality || !destinationCountry || !visaType) {
      return Response.json({ error: "nationality, destination, and visaType are required." }, { status: 400 })
    }

    const existing = await findTemplate(nationality, destinationCountry, visaType)
    if (existing) {
      return Response.json({ template: mapTemplateRow(existing), verified: existing.source !== "ai_generated" }, { status: 200 })
    }

    const generated = await generateAndCache(nationality, destinationCountry, visaType)
    if (generated) {
      return Response.json({ template: mapTemplateRow(generated), verified: false }, { status: 200 })
    }

    const placeholder: VisaRequirementTemplate = {
      id: "",
      nationality,
      destinationCountry,
      visaType,
      visaTypeLabel: visaType,
      summary: UNAVAILABLE_TEMPLATE_FALLBACK.summary,
      requiredDocuments: [],
      checklistTemplate: [],
      processingTimeEstimate: "",
      feeEstimate: "",
      validityNotes: "",
      source: "curated",
      lastVerifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return Response.json({ template: placeholder, verified: false, unavailable: true }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load visa requirements." }, { status: 500 })
  }
}
