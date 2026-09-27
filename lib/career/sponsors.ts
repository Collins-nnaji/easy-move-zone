import { careerSql } from "./db"
import { careerSiteFromJobUrl, companyKey, matchSponsorCompany, type CompanyIndexEntry } from "./company-match"

export type SponsorHit = {
  id: number
  name: string
  city: string | null
  county: string | null
  typeAndRating: string | null
  route: string | null
  /** Careers page from the fetcher, or the site the company's job links live on. */
  careerUrl: string | null
  careerUrlSource: "saved" | "jobs" | null
  jobCount: number
  matchedCompany: string | null
  openings: Array<{ title: string; url: string }>
}

export type OccupationCodeHit = {
  code: string
  jobType: string
  relatedJobTitles: string | null
  standardGoingRate: string | null
  lowerGoingRate: string | null
}

type IndexCache = { at: number; entries: CompanyIndexEntry[]; byKey: Map<string, string> }
let indexCache: IndexCache | null = null

async function companyIndex(): Promise<IndexCache> {
  if (!careerSql) return { at: 0, entries: [], byKey: new Map() }
  if (indexCache && Date.now() - indexCache.at < 10 * 60 * 1000) return indexCache

  const [jobs, saved] = await Promise.all([
    careerSql`
      SELECT lower(trim(company)) AS company_key,
             max(company) AS company,
             count(*)::int AS job_count,
             (array_agg(url ORDER BY posted_at DESC NULLS LAST))[1] AS latest_url
      FROM skilledjobs.jobs
      WHERE company IS NOT NULL AND trim(company) <> ''
      GROUP BY 1
    `,
    careerSql`
      SELECT company, url
      FROM skilledjobs.saved_job_urls
      WHERE company IS NOT NULL AND trim(company) <> ''
        AND url IS NOT NULL AND trim(url) <> ''
    `,
  ])

  const savedByKey = new Map<string, string>()
  for (const row of saved) {
    const key = companyKey(String(row.company))
    if (key && !savedByKey.has(key)) savedByKey.set(key, String(row.url))
  }

  const byKey = new Map<string, string>()
  const entries: CompanyIndexEntry[] = []
  for (const row of jobs) {
    const name = String(row.company)
    const key = companyKey(name)
    if (!key) continue
    byKey.set(key, String(row.company_key))
    entries.push({
      key,
      name,
      jobCount: Number(row.job_count ?? 0),
      latestUrl: row.latest_url ? String(row.latest_url) : null,
      savedCareerUrl: savedByKey.get(key) ?? null,
    })
  }

  for (const [key, url] of savedByKey) {
    if (entries.some((entry) => entry.key === key)) continue
    entries.push({ key, name: key, jobCount: 0, latestUrl: null, savedCareerUrl: url })
  }

  indexCache = { at: Date.now(), entries, byKey }
  return indexCache
}

export function clearCompanyIndexCache() {
  indexCache = null
}

export async function searchSponsors(query: string): Promise<SponsorHit[]> {
  if (!careerSql) return []
  const q = query.trim()
  if (q.length < 2) return []
  const like = `%${q}%`

  const rows = await careerSql`
    SELECT id, name, city, county, type_and_rating, route
    FROM (
      SELECT DISTINCT ON (lower(name), coalesce(route, ''), coalesce(city, ''))
        id, name, city, county, type_and_rating, route
      FROM skilledjobs.sponsored_companies
      WHERE name ILIKE ${like} OR coalesce(city, '') ILIKE ${like}
      ORDER BY lower(name), coalesce(route, ''), coalesce(city, ''), id
    ) sponsors
    ORDER BY
      CASE WHEN name ILIKE ${q + "%"} THEN 0 ELSE 1 END,
      name ASC
    LIMIT 20
  `

  const index = await companyIndex()
  const matched = rows.map((row) => {
    const hit = matchSponsorCompany(String(row.name), index.entries)
    const careerUrl = hit?.savedCareerUrl ?? careerSiteFromJobUrl(hit?.latestUrl)
    const careerUrlSource = hit?.savedCareerUrl ? "saved" : hit?.latestUrl ? "jobs" : null
    return {
      row,
      hit,
      careerUrl,
      careerUrlSource: careerUrlSource as SponsorHit["careerUrlSource"],
      rawKey: hit ? index.byKey.get(hit.key) ?? null : null,
    }
  })

  const rawKeys = matched.map((item) => item.rawKey).filter((key): key is string => Boolean(key))
  const openings = new Map<string, Array<{ title: string; url: string }>>()
  if (rawKeys.length > 0) {
    const jobRows = await careerSql`
      SELECT lower(trim(company)) AS company_key, title, url
      FROM skilledjobs.jobs
      WHERE lower(trim(company)) = ANY(${rawKeys})
      ORDER BY posted_at DESC NULLS LAST
    `
    for (const job of jobRows) {
      const key = String(job.company_key)
      const list = openings.get(key) ?? []
      if (list.length < 4) list.push({ title: String(job.title), url: String(job.url) })
      openings.set(key, list)
    }
  }

  return matched.map((item) => ({
    id: Number(item.row.id),
    name: String(item.row.name),
    city: item.row.city ? String(item.row.city) : null,
    county: item.row.county ? String(item.row.county) : null,
    typeAndRating: item.row.type_and_rating ? String(item.row.type_and_rating) : null,
    route: item.row.route ? String(item.row.route) : null,
    careerUrl: item.careerUrl,
    careerUrlSource: item.careerUrlSource,
    jobCount: item.hit?.jobCount ?? 0,
    matchedCompany: item.hit?.name ?? null,
    openings: item.rawKey ? openings.get(item.rawKey) ?? [] : [],
  }))
}

export type CountryEmployer = {
  name: string
  jobCount: number
  careerUrl: string | null
  openings: Array<{ title: string; url: string }>
}

/** Employers with live roles in a destination, from the jobs board (not an official sponsor register). */
export async function listCountryEmployers(
  countries: string[],
  query = "",
): Promise<{ employers: CountryEmployer[]; totalJobs: number }> {
  if (!careerSql || countries.length === 0) return { employers: [], totalJobs: 0 }
  const q = query.trim() || null
  const [rows, totals] = await Promise.all([
    careerSql`
      SELECT max(company) AS company,
             count(*)::int AS job_count,
             (array_agg(url ORDER BY posted_at DESC NULLS LAST))[1] AS latest_url,
             (array_agg(json_build_object('title', title, 'url', url) ORDER BY posted_at DESC NULLS LAST))[1:3] AS openings
      FROM skilledjobs.jobs
      WHERE country = ANY(${countries})
        AND company IS NOT NULL AND trim(company) <> ''
        AND (${q}::text IS NULL OR company ILIKE '%' || ${q} || '%' OR title ILIKE '%' || ${q} || '%')
      GROUP BY lower(trim(company))
      ORDER BY count(*) DESC, max(company) ASC
      LIMIT 30
    `,
    careerSql`SELECT count(*)::int AS n FROM skilledjobs.jobs WHERE country = ANY(${countries})`,
  ])
  return {
    totalJobs: Number(totals[0]?.n ?? 0),
    employers: rows.map((row) => ({
      name: String(row.company),
      jobCount: Number(row.job_count ?? 0),
      careerUrl: careerSiteFromJobUrl(row.latest_url ? String(row.latest_url) : null),
      openings: Array.isArray(row.openings)
        ? (row.openings as Array<{ title: unknown; url: unknown }>)
            .filter((job) => job?.url)
            .map((job) => ({ title: String(job.title), url: String(job.url) }))
        : [],
    })),
  }
}

export async function searchOccupationCodes(query: string): Promise<OccupationCodeHit[]> {
  if (!careerSql) return []
  const q = query.trim()
  const like = `%${q}%`
  const rows = q
    ? await careerSql`
        SELECT code, job_type, related_job_titles, standard_going_rate, lower_going_rate
        FROM skilledjobs.occupation_codes
        WHERE code ILIKE ${like}
           OR job_type ILIKE ${like}
           OR coalesce(related_job_titles, '') ILIKE ${like}
        ORDER BY code ASC
        LIMIT 40
      `
    : await careerSql`
        SELECT code, job_type, related_job_titles, standard_going_rate, lower_going_rate
        FROM skilledjobs.occupation_codes
        ORDER BY code ASC
        LIMIT 20
      `

  return rows.map((row) => ({
    code: String(row.code),
    jobType: String(row.job_type),
    relatedJobTitles: row.related_job_titles ? String(row.related_job_titles) : null,
    standardGoingRate: row.standard_going_rate ? String(row.standard_going_rate) : null,
    lowerGoingRate: row.lower_going_rate ? String(row.lower_going_rate) : null,
  }))
}
