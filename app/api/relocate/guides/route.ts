import { neon } from "@neondatabase/serverless"
import type { RelocationCountryGuide } from "@/lib/relocate/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(request: Request) {
  try {
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const { searchParams } = new URL(request.url)
    const country = String(searchParams.get("country") ?? "").trim()

    const rowsRaw = country
      ? await sql.query(
          `select
            id,
            country,
            visa_summary,
            required_documents,
            pre_move_steps,
            first_week_steps,
            healthcare_tip,
            banking_tip,
            schooling_tip,
            estimated_setup_days,
            created_at,
            updated_at
          from relocation_country_guides
          where lower(country) = lower($1)
          order by country asc`,
          [country],
        )
      : await sql.query(
          `select
            id,
            country,
            visa_summary,
            required_documents,
            pre_move_steps,
            first_week_steps,
            healthcare_tip,
            banking_tip,
            schooling_tip,
            estimated_setup_days,
            created_at,
            updated_at
          from relocation_country_guides
          order by country asc`,
        )

    const rows = rowsRaw as Array<{
      id: string
      country: string
      visa_summary: string
      required_documents: string[] | null
      pre_move_steps: string[] | null
      first_week_steps: string[] | null
      healthcare_tip: string | null
      banking_tip: string | null
      schooling_tip: string | null
      estimated_setup_days: number | null
      created_at: string
      updated_at: string
    }>

    const guides: RelocationCountryGuide[] = rows.map((row) => ({
      id: row.id,
      country: row.country,
      visaSummary: row.visa_summary,
      requiredDocuments: row.required_documents ?? [],
      preMoveSteps: row.pre_move_steps ?? [],
      firstWeekSteps: row.first_week_steps ?? [],
      healthcareTip: row.healthcare_tip ?? "",
      bankingTip: row.banking_tip ?? "",
      schoolingTip: row.schooling_tip ?? "",
      estimatedSetupDays: row.estimated_setup_days ?? 14,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }))

    return Response.json({ guides }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load relocation country guides." }, { status: 500 })
  }
}
