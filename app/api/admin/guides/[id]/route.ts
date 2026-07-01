import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"
import { GUIDE_SELECT, GUIDE_SELECT_LEGACY, mapGuideRow, mapGuideRowLegacy } from "@/lib/settle/map-guide"
import type { RelocationCountryGuide } from "@/lib/relocate/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

type GuidePatch = Partial<Pick<RelocationCountryGuide,
  "visaSummary" | "healthcareTip" | "bankingTip" | "schoolingTip" | "simTip" |
  "neighborhoodsTip" | "communityTip" | "transportTip" | "estimatedSetupDays"
>> & {
  requiredDocuments?: string[]
  preMoveSteps?: string[]
  firstWeekSteps?: string[]
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!DATABASE_URL) return NextResponse.json({ error: "Database not configured." }, { status: 500 })
    const { id } = await context.params
    const sql = neon(DATABASE_URL)

    try {
      const rows = await sql.query(`select ${GUIDE_SELECT} from relocation_country_guides where id = $1 limit 1`, [id])
      const guide = (rows as Parameters<typeof mapGuideRow>[0][])[0]
      if (!guide) return NextResponse.json({ error: "Not found" }, { status: 404 })
      return NextResponse.json({ guide: mapGuideRow(guide) })
    } catch {
      const rows = await sql.query(`select ${GUIDE_SELECT_LEGACY} from relocation_country_guides where id = $1 limit 1`, [id])
      const guide = (rows as Parameters<typeof mapGuideRowLegacy>[0][])[0]
      if (!guide) return NextResponse.json({ error: "Not found" }, { status: 404 })
      return NextResponse.json({ guide: mapGuideRowLegacy(guide) })
    }
  } catch (err) {
    if (err instanceof AdminForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!DATABASE_URL) return NextResponse.json({ error: "Database not configured." }, { status: 500 })
    const { id } = await context.params
    const body = (await request.json()) as { guide?: GuidePatch }
    const input = body.guide ?? {}
    const sql = neon(DATABASE_URL)

    let current: Record<string, unknown>
    try {
      const existingRaw = await sql.query(
        `select visa_summary, required_documents, pre_move_steps, first_week_steps,
                healthcare_tip, banking_tip, schooling_tip, estimated_setup_days,
                sim_tip, neighborhoods_tip, community_tip, transport_tip
         from relocation_country_guides where id = $1 limit 1`,
        [id],
      )
      current = (existingRaw as Record<string, unknown>[])[0]
    } catch {
      const existingRaw = await sql.query(
        `select visa_summary, required_documents, pre_move_steps, first_week_steps,
                healthcare_tip, banking_tip, schooling_tip, estimated_setup_days
         from relocation_country_guides where id = $1 limit 1`,
        [id],
      )
      current = (existingRaw as Record<string, unknown>[])[0]
    }
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const params = [
      String(input.visaSummary ?? current.visa_summary ?? ""),
      input.requiredDocuments ?? (current.required_documents as string[]) ?? [],
      input.preMoveSteps ?? (current.pre_move_steps as string[]) ?? [],
      input.firstWeekSteps ?? (current.first_week_steps as string[]) ?? [],
      String(input.healthcareTip ?? current.healthcare_tip ?? ""),
      String(input.bankingTip ?? current.banking_tip ?? ""),
      String(input.schoolingTip ?? current.schooling_tip ?? ""),
      Math.max(1, Number(input.estimatedSetupDays ?? current.estimated_setup_days ?? 14)),
      String(input.simTip ?? current.sim_tip ?? ""),
      String(input.neighborhoodsTip ?? current.neighborhoods_tip ?? ""),
      String(input.communityTip ?? current.community_tip ?? ""),
      String(input.transportTip ?? current.transport_tip ?? ""),
      id,
    ]

    try {
      const rowsRaw = await sql.query(
        `update relocation_country_guides set
           visa_summary = $1, required_documents = $2, pre_move_steps = $3, first_week_steps = $4,
           healthcare_tip = $5, banking_tip = $6, schooling_tip = $7, estimated_setup_days = $8,
           sim_tip = $9, neighborhoods_tip = $10, community_tip = $11, transport_tip = $12,
           updated_at = now()
         where id = $13
         returning ${GUIDE_SELECT}`,
        params,
      )
      const row = (rowsRaw as Parameters<typeof mapGuideRow>[0][])[0]
      return NextResponse.json({ guide: mapGuideRow(row) })
    } catch {
      const rowsRaw = await sql.query(
        `update relocation_country_guides set
           visa_summary = $1, required_documents = $2, pre_move_steps = $3, first_week_steps = $4,
           healthcare_tip = $5, banking_tip = $6, schooling_tip = $7, estimated_setup_days = $8,
           updated_at = now()
         where id = $9
         returning ${GUIDE_SELECT_LEGACY}`,
        params.slice(0, 8).concat(params[12]),
      )
      const row = (rowsRaw as Parameters<typeof mapGuideRowLegacy>[0][])[0]
      return NextResponse.json({ guide: mapGuideRowLegacy(row) })
    }
  } catch (err) {
    if (err instanceof AdminForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
