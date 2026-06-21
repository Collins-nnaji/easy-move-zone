import { neon } from "@neondatabase/serverless"
import type { RelocationCountryGuide } from "@/lib/relocate/types"
import { GUIDE_SELECT, GUIDE_SELECT_LEGACY, mapGuideRow, mapGuideRowLegacy } from "@/lib/settle/map-guide"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

async function loadGuides(country: string, citySlug: string): Promise<RelocationCountryGuide[]> {
  if (!sql) return []

  try {
    if (citySlug) {
      const rowsRaw = await sql.query(
        `select ${GUIDE_SELECT} from relocation_country_guides where city_slug = $1 limit 1`,
        [citySlug],
      )
      return (rowsRaw as Parameters<typeof mapGuideRow>[0][]).map(mapGuideRow)
    }
    if (country) {
      const rowsRaw = await sql.query(
        `select ${GUIDE_SELECT} from relocation_country_guides where lower(country) = lower($1) order by country asc`,
        [country],
      )
      return (rowsRaw as Parameters<typeof mapGuideRow>[0][]).map(mapGuideRow)
    }
    const rowsRaw = await sql.query(
      `select ${GUIDE_SELECT} from relocation_country_guides
       order by case when city_slug is not null then 0 else 1 end, country asc`,
    )
    return (rowsRaw as Parameters<typeof mapGuideRow>[0][]).map(mapGuideRow)
  } catch {
    if (citySlug) return []
    if (country) {
      const rowsRaw = await sql.query(
        `select ${GUIDE_SELECT_LEGACY} from relocation_country_guides where lower(country) = lower($1) order by country asc`,
        [country],
      )
      return (rowsRaw as Parameters<typeof mapGuideRowLegacy>[0][]).map(mapGuideRowLegacy)
    }
    const rowsRaw = await sql.query(
      `select ${GUIDE_SELECT_LEGACY} from relocation_country_guides order by country asc`,
    )
    return (rowsRaw as Parameters<typeof mapGuideRowLegacy>[0][]).map(mapGuideRowLegacy)
  }
}

export async function GET(request: Request) {
  try {
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const { searchParams } = new URL(request.url)
    const country = String(searchParams.get("country") ?? "").trim()
    const citySlug = String(searchParams.get("citySlug") ?? "").trim()

    const guides = await loadGuides(country, citySlug)
    return Response.json({ guides }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load relocation country guides." }, { status: 500 })
  }
}
