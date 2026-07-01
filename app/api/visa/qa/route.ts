import { neon } from "@neondatabase/serverless"
import { chatJson, getAiProvider } from "@/lib/ai/openai"
import { TEMPLATE_SELECT, type TemplateRow } from "@/lib/visa/map-template"
import { EMBASSY_SELECT, type EmbassyRow } from "@/lib/visa/map-embassy"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

interface QaResult {
  answer: string
}

const NO_AI_ANSWER: QaResult = {
  answer: "AI guidance isn't configured for this deployment yet. Check the visa requirements page or the embassy directory for details, or contact the destination country's embassy directly.",
}

async function loadTemplate(nationality: string, destinationCountry: string, visaType: string): Promise<TemplateRow | null> {
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

async function loadEmbassies(destinationCountry: string): Promise<EmbassyRow[]> {
  if (!sql) return []
  const rowsRaw = await sql.query(
    `select ${EMBASSY_SELECT} from embassies where lower(country) = lower($1) and is_active = true limit 3`,
    [destinationCountry],
  )
  return rowsRaw as EmbassyRow[]
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      question?: string
      nationality?: string
      destinationCountry?: string
      visaType?: string
    }

    const question = String(body.question ?? "").trim().slice(0, 300)
    const nationality = String(body.nationality ?? "").trim()
    const destinationCountry = String(body.destinationCountry ?? "").trim()
    const visaType = String(body.visaType ?? "").trim()

    if (!question || !nationality || !destinationCountry || !visaType) {
      return Response.json({ error: "question, nationality, destinationCountry, and visaType are required." }, { status: 400 })
    }

    if (!getAiProvider()) {
      return Response.json(NO_AI_ANSWER, { status: 200 })
    }

    const [template, embassies] = await Promise.all([
      loadTemplate(nationality, destinationCountry, visaType),
      loadEmbassies(destinationCountry),
    ])

    const contextLines: string[] = []
    if (template) {
      contextLines.push(`Summary: ${template.summary}`)
      if (template.processing_time_estimate) contextLines.push(`Processing time: ${template.processing_time_estimate}`)
      if (template.fee_estimate) contextLines.push(`Fee: ${template.fee_estimate}`)
      if (template.validity_notes) contextLines.push(`Validity notes: ${template.validity_notes}`)
      for (const doc of template.required_documents ?? []) {
        contextLines.push(`Required document — ${doc.label}: ${doc.description}`)
      }
    }
    for (const embassy of embassies) {
      contextLines.push(
        `Embassy: ${embassy.country} embassy in ${embassy.city}, ${embassy.located_in_country} — ${embassy.address ?? "address not on file"}, ${embassy.phone ?? "phone not on file"}, ${embassy.website ?? "no website on file"}`,
      )
    }

    const fallback: QaResult = {
      answer: contextLines.length
        ? "Check the visa requirements and embassy directory pages for the specific facts we have on file."
        : NO_AI_ANSWER.answer,
    }

    if (contextLines.length === 0) {
      return Response.json(fallback, { status: 200 })
    }

    const systemPrompt =
      `You are a visa assistant inside a visa-preparation app, answering a question about a ${visaType} ` +
      `visa for a ${nationality} citizen applying to ${destinationCountry}. Answer ONLY using the facts ` +
      `provided below — never invent visa rules, fees, embassy addresses, or processing times that ` +
      `aren't given. If the facts don't cover the question, say so honestly and direct the user to the ` +
      `relevant embassy's official website. Keep it to 2-4 direct, plain-language sentences. Respond ` +
      `with raw JSON: {"answer": "..."}.`
    const userPrompt = `Question: "${question}"\n\nFacts:\n${contextLines.join("\n")}`

    const result = await chatJson<QaResult>(systemPrompt, userPrompt, fallback)
    const answer = typeof result.answer === "string" && result.answer.trim() ? result.answer.trim() : fallback.answer
    return Response.json({ answer }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to answer right now." }, { status: 500 })
  }
}
