import { neon } from "@neondatabase/serverless"
import { EMBASSY_SELECT, mapEmbassyRow, type EmbassyRow } from "@/lib/visa/map-embassy"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function GET(request: Request) {
  try {
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const { searchParams } = new URL(request.url)
    const country = String(searchParams.get("country") ?? "").trim()
    const locatedIn = String(searchParams.get("locatedIn") ?? "").trim()
    const city = String(searchParams.get("city") ?? "").trim()

    const conditions: string[] = ["is_active = true"]
    const values: string[] = []
    if (country) {
      values.push(country)
      conditions.push(`lower(country) = lower($${values.length})`)
    }
    if (locatedIn) {
      values.push(locatedIn)
      conditions.push(`lower(located_in_country) = lower($${values.length})`)
    }
    if (city) {
      values.push(`%${city}%`)
      conditions.push(`city ilike $${values.length}`)
    }

    const rowsRaw = await sql.query(
      `select ${EMBASSY_SELECT} from embassies
       where ${conditions.join(" and ")}
       order by country asc, city asc`,
      values,
    )
    const embassies = (rowsRaw as EmbassyRow[]).map(mapEmbassyRow)
    return Response.json({ embassies }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load embassy directory." }, { status: 500 })
  }
}
