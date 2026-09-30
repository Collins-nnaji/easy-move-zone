import { unstable_cache } from "next/cache"
import { careerSql } from "@/lib/career/db"

export type SponsorRegisterStats = {
  organisations: number
  skilledWorkerOrganisations: number
  towns: number
  topRoutes: Array<{ route: string; organisations: number }>
  topTowns: Array<{ town: string; organisations: number }>
  /** When our copy of the Home Office register was loaded. */
  loadedAt: string | null
}

async function loadStats(): Promise<SponsorRegisterStats | null> {
  if (!careerSql) return null
  try {
    const [totals, routes, towns] = await Promise.all([
      careerSql`
        SELECT count(DISTINCT lower(trim(name)))::int AS organisations,
               count(DISTINCT lower(trim(name))) FILTER (WHERE route = 'Skilled Worker')::int AS skilled,
               count(DISTINCT lower(trim(city))) FILTER (WHERE trim(coalesce(city, '')) <> '')::int AS towns,
               max(created_at) AS loaded_at
        FROM skilledjobs.sponsored_companies
      `,
      careerSql`
        SELECT route, count(DISTINCT lower(trim(name)))::int AS organisations
        FROM skilledjobs.sponsored_companies
        WHERE route IS NOT NULL AND trim(route) <> ''
        GROUP BY route
        ORDER BY 2 DESC
        LIMIT 6
      `,
      careerSql`
        SELECT initcap(lower(trim(city))) AS town, count(DISTINCT lower(trim(name)))::int AS organisations
        FROM skilledjobs.sponsored_companies
        WHERE trim(coalesce(city, '')) <> ''
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 8
      `,
    ])
    const row = totals[0]
    if (!row || !Number(row.organisations)) return null
    return {
      organisations: Number(row.organisations),
      skilledWorkerOrganisations: Number(row.skilled ?? 0),
      towns: Number(row.towns ?? 0),
      topRoutes: routes.map((r) => ({ route: String(r.route), organisations: Number(r.organisations) })),
      topTowns: towns.map((r) => ({ town: String(r.town), organisations: Number(r.organisations) })),
      loadedAt: row.loaded_at ? new Date(String(row.loaded_at)).toISOString() : null,
    }
  } catch {
    return null
  }
}

export const getSponsorRegisterStats = unstable_cache(loadStats, ["sponsor-register-stats"], { revalidate: 60 * 60 * 24 })

/** 124,946 → "124,000+" — never overstates the live count. */
export function roundedDown(value: number, step = 1000) {
  return `${(Math.floor(value / step) * step).toLocaleString("en-GB")}+`
}

export function formatRegisterDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }) : null
}
