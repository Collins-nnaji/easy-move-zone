import { neon } from "@neondatabase/serverless"
import { EMBASSY_SELECT, mapEmbassyRow, type EmbassyRow } from "@/lib/visa/map-embassy"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const { id } = await context.params

    const rowsRaw = await sql.query(
      `select ${EMBASSY_SELECT} from embassies where id = $1 and is_active = true limit 1`,
      [id],
    )
    const row = (rowsRaw as EmbassyRow[])[0]
    if (!row) return Response.json({ error: "Embassy not found." }, { status: 404 })
    return Response.json({ embassy: mapEmbassyRow(row) }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load embassy." }, { status: 500 })
  }
}
