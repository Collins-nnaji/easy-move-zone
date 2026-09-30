import { careerSql } from "./db"
import type { JobRow } from "./map-job"

export type JobFilters = {
  q?: string
  country?: string
  countries?: string[]
  visaType?: string
  category?: string
  categories?: string[]
  experienceLevels?: string[]
  jobTypes?: string[]
  limit?: number
  offset?: number
  ids?: number[]
  /** Only roles tagged with a named visa route (not blank or "Other"). */
  visaSponsoredOnly?: boolean
}

export type JobFacetCounts = {
  countries: Record<string, number>
  experienceLevels: Record<string, number>
  jobTypes: Record<string, number>
  categories: Record<string, number>
  /** Visa-sponsored roles matching every other active filter. */
  visaSponsored: number
}

function cleanList(values?: string[] | null): string[] | null {
  if (!values?.length) return null
  const next = values.map((value) => value.trim()).filter(Boolean)
  return next.length ? next : null
}

type LogoRow = { company_name: string; logo_url: string; aliases: string[] | null }

let logoCache: { at: number; byName: Map<string, string> } | null = null

async function loadCompanyLogoIndex(): Promise<Map<string, string>> {
  if (!careerSql) return new Map()
  const now = Date.now()
  if (logoCache && now - logoCache.at < 5 * 60_000) return logoCache.byName
  try {
    const rows = (await careerSql`
      SELECT company_name, logo_url, aliases
      FROM skilledjobs.company_logos
      WHERE logo_url IS NOT NULL AND logo_url <> ''
    `) as LogoRow[]
    const byName = new Map<string, string>()
    for (const row of rows) {
      const url = row.logo_url.trim()
      if (!url) continue
      byName.set(row.company_name.trim().toLowerCase(), url)
      for (const alias of row.aliases ?? []) {
        const key = String(alias).trim().toLowerCase()
        if (key && !byName.has(key)) byName.set(key, url)
      }
    }
    logoCache = { at: now, byName }
    return byName
  } catch {
    return logoCache?.byName ?? new Map()
  }
}

function resolveLogo(company: string | null | undefined, current: string | null | undefined, index: Map<string, string>) {
  if (current?.trim()) return current.trim()
  if (!company?.trim()) return null
  const key = company.trim().toLowerCase()
  if (index.has(key)) return index.get(key)!
  // Soft contains match against curated names (same idea as Rekruuter fuzzy lookup)
  for (const [name, url] of index) {
    if (name.length < 4) continue
    if (key.includes(name) || (key.length >= 4 && name.includes(key))) return url
  }
  return null
}

async function withCompanyLogos(rows: JobRow[]): Promise<JobRow[]> {
  if (!rows.length) return rows
  const index = await loadCompanyLogoIndex()
  if (!index.size) return rows
  return rows.map((row) => ({
    ...row,
    logo_url: resolveLogo(row.company, row.logo_url, index),
  }))
}

export async function searchLocalJobs(filters: JobFilters = {}): Promise<{ rows: JobRow[]; total: number } | null> {
  if (!careerSql) return null
  try {
    const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100)
    const offset = Math.max(filters.offset ?? 0, 0)
    const q = filters.q?.trim() || null
    const country = filters.country?.trim() || null
    const countries = cleanList(filters.countries)
    const visaType = filters.visaType?.trim() || null
    const category = filters.category?.trim() || null
    const categories = cleanList(filters.categories)
    const experienceLevels = cleanList(filters.experienceLevels)
    const jobTypes = cleanList(filters.jobTypes)
    const ids = filters.ids?.filter((id) => Number.isFinite(id)) ?? null
    const visaOnly = Boolean(filters.visaSponsoredOnly)

    if (ids && ids.length > 0) {
      const rows = (await careerSql`
        SELECT id, title, company, location, country, category, experience_level, job_type,
               visa_type, skills, url, logo_url, posted_at, description
        FROM skilledjobs.jobs
        WHERE id = ANY(${ids})
        ORDER BY posted_at DESC NULLS LAST
      `) as JobRow[]
      return { rows: await withCompanyLogos(rows), total: rows.length }
    }

    const rows = (await careerSql`
      SELECT id, title, company, location, country, category, experience_level, job_type,
             visa_type, skills, url, logo_url, posted_at, description
      FROM skilledjobs.jobs
      WHERE (${q}::text IS NULL OR title ILIKE '%' || ${q} || '%' OR company ILIKE '%' || ${q} || '%' OR coalesce(location, '') ILIKE '%' || ${q} || '%')
        AND (${country}::text IS NULL OR country = ${country})
        AND (${countries}::text[] IS NULL OR country = ANY(${countries}))
        AND (${visaType}::text IS NULL OR visa_type = ${visaType})
        AND (${category}::text IS NULL OR category = ${category})
        AND (${categories}::text[] IS NULL OR category = ANY(${categories}))
        AND (${experienceLevels}::text[] IS NULL OR experience_level = ANY(${experienceLevels}))
        AND (${jobTypes}::text[] IS NULL OR job_type = ANY(${jobTypes}))
        AND (NOT ${visaOnly}::boolean OR (visa_type IS NOT NULL AND trim(visa_type) NOT IN ('', 'Other')))
      ORDER BY posted_at DESC NULLS LAST
      LIMIT ${limit}
      OFFSET ${offset}
    `) as JobRow[]

    const totalRows = await careerSql`
      SELECT count(*)::int AS n
      FROM skilledjobs.jobs
      WHERE (${q}::text IS NULL OR title ILIKE '%' || ${q} || '%' OR company ILIKE '%' || ${q} || '%' OR coalesce(location, '') ILIKE '%' || ${q} || '%')
        AND (${country}::text IS NULL OR country = ${country})
        AND (${countries}::text[] IS NULL OR country = ANY(${countries}))
        AND (${visaType}::text IS NULL OR visa_type = ${visaType})
        AND (${category}::text IS NULL OR category = ${category})
        AND (${categories}::text[] IS NULL OR category = ANY(${categories}))
        AND (${experienceLevels}::text[] IS NULL OR experience_level = ANY(${experienceLevels}))
        AND (${jobTypes}::text[] IS NULL OR job_type = ANY(${jobTypes}))
        AND (NOT ${visaOnly}::boolean OR (visa_type IS NOT NULL AND trim(visa_type) NOT IN ('', 'Other')))
    `
    return { rows: await withCompanyLogos(rows), total: Number(totalRows[0]?.n ?? 0) }
  } catch {
    return null
  }
}

/** Random roles for previews, at most one per company so the list stays varied. */
export async function sampleLocalJobs(limit = 10): Promise<JobRow[] | null> {
  if (!careerSql) return null
  try {
    const size = Math.min(Math.max(limit, 1), 50)
    const rows = (await careerSql`
      SELECT * FROM (
        SELECT DISTINCT ON (lower(coalesce(nullif(trim(company), ''), title)))
               id, title, company, location, country, category, experience_level, job_type,
               visa_type, skills, url, logo_url, posted_at, description
        FROM skilledjobs.jobs
        ORDER BY lower(coalesce(nullif(trim(company), ''), title)), random()
      ) per_company
      ORDER BY random()
      LIMIT ${size}
    `) as JobRow[]
    return await withCompanyLogos(rows)
  } catch {
    return null
  }
}

export async function listLocalFacets(): Promise<{ countries: string[]; visaTypes: string[]; categories: string[] } | null> {
  if (!careerSql) return null
  try {
    const [countries, visaTypes, categories] = await Promise.all([
      careerSql`SELECT DISTINCT country FROM skilledjobs.jobs WHERE country IS NOT NULL AND country <> '' ORDER BY country ASC LIMIT 80`,
      careerSql`SELECT DISTINCT visa_type FROM skilledjobs.jobs WHERE visa_type IS NOT NULL AND visa_type <> '' ORDER BY visa_type ASC LIMIT 40`,
      careerSql`SELECT DISTINCT category FROM skilledjobs.jobs WHERE category IS NOT NULL AND category <> '' ORDER BY category ASC LIMIT 40`,
    ])
    return {
      countries: countries.map((row) => String(row.country)),
      visaTypes: visaTypes.map((row) => String(row.visa_type)),
      categories: categories.map((row) => String(row.category)),
    }
  } catch {
    return null
  }
}

function toCountMap(rows: Array<Record<string, unknown>>, key: string): Record<string, number> {
  const map: Record<string, number> = {}
  for (const row of rows) {
    const label = String(row[key] ?? "").trim()
    if (!label) continue
    map[label] = Number(row.n ?? 0)
  }
  return map
}

/** Facet counts for the left filter bar (linked to current search + other filters). */
export async function listJobFacetCounts(filters: JobFilters = {}): Promise<JobFacetCounts | null> {
  if (!careerSql) return null
  try {
    const q = filters.q?.trim() || null
    const countries = cleanList(filters.countries)
    const categories = cleanList(filters.categories)
    const experienceLevels = cleanList(filters.experienceLevels)
    const jobTypes = cleanList(filters.jobTypes)
    const visaOnly = Boolean(filters.visaSponsoredOnly)

    const [countryRows, experienceRows, jobTypeRows, categoryRows, visaRows] = await Promise.all([
      careerSql`
        SELECT country AS key, count(*)::int AS n
        FROM skilledjobs.jobs
        WHERE (${q}::text IS NULL OR title ILIKE '%' || ${q} || '%' OR company ILIKE '%' || ${q} || '%' OR coalesce(location, '') ILIKE '%' || ${q} || '%')
          AND (NOT ${visaOnly}::boolean OR (visa_type IS NOT NULL AND trim(visa_type) NOT IN ('', 'Other')))
          AND country IS NOT NULL AND country <> ''
          AND (${categories}::text[] IS NULL OR category = ANY(${categories}))
          AND (${experienceLevels}::text[] IS NULL OR experience_level = ANY(${experienceLevels}))
          AND (${jobTypes}::text[] IS NULL OR job_type = ANY(${jobTypes}))
        GROUP BY country
        ORDER BY n DESC
        LIMIT 80
      `,
      careerSql`
        SELECT experience_level AS key, count(*)::int AS n
        FROM skilledjobs.jobs
        WHERE (${q}::text IS NULL OR title ILIKE '%' || ${q} || '%' OR company ILIKE '%' || ${q} || '%' OR coalesce(location, '') ILIKE '%' || ${q} || '%')
          AND (NOT ${visaOnly}::boolean OR (visa_type IS NOT NULL AND trim(visa_type) NOT IN ('', 'Other')))
          AND experience_level IS NOT NULL AND experience_level <> ''
          AND (${countries}::text[] IS NULL OR country = ANY(${countries}))
          AND (${categories}::text[] IS NULL OR category = ANY(${categories}))
          AND (${jobTypes}::text[] IS NULL OR job_type = ANY(${jobTypes}))
        GROUP BY experience_level
        ORDER BY n DESC
        LIMIT 40
      `,
      careerSql`
        SELECT job_type AS key, count(*)::int AS n
        FROM skilledjobs.jobs
        WHERE (${q}::text IS NULL OR title ILIKE '%' || ${q} || '%' OR company ILIKE '%' || ${q} || '%' OR coalesce(location, '') ILIKE '%' || ${q} || '%')
          AND (NOT ${visaOnly}::boolean OR (visa_type IS NOT NULL AND trim(visa_type) NOT IN ('', 'Other')))
          AND job_type IS NOT NULL AND job_type <> ''
          AND (${countries}::text[] IS NULL OR country = ANY(${countries}))
          AND (${categories}::text[] IS NULL OR category = ANY(${categories}))
          AND (${experienceLevels}::text[] IS NULL OR experience_level = ANY(${experienceLevels}))
        GROUP BY job_type
        ORDER BY n DESC
        LIMIT 40
      `,
      careerSql`
        SELECT category AS key, count(*)::int AS n
        FROM skilledjobs.jobs
        WHERE (${q}::text IS NULL OR title ILIKE '%' || ${q} || '%' OR company ILIKE '%' || ${q} || '%' OR coalesce(location, '') ILIKE '%' || ${q} || '%')
          AND (NOT ${visaOnly}::boolean OR (visa_type IS NOT NULL AND trim(visa_type) NOT IN ('', 'Other')))
          AND category IS NOT NULL AND category <> ''
          AND (${countries}::text[] IS NULL OR country = ANY(${countries}))
          AND (${experienceLevels}::text[] IS NULL OR experience_level = ANY(${experienceLevels}))
          AND (${jobTypes}::text[] IS NULL OR job_type = ANY(${jobTypes}))
        GROUP BY category
        ORDER BY n DESC
        LIMIT 60
      `,
      careerSql`
        SELECT count(*)::int AS n
        FROM skilledjobs.jobs
        WHERE (${q}::text IS NULL OR title ILIKE '%' || ${q} || '%' OR company ILIKE '%' || ${q} || '%' OR coalesce(location, '') ILIKE '%' || ${q} || '%')
          AND visa_type IS NOT NULL AND trim(visa_type) NOT IN ('', 'Other')
          AND (${countries}::text[] IS NULL OR country = ANY(${countries}))
          AND (${categories}::text[] IS NULL OR category = ANY(${categories}))
          AND (${experienceLevels}::text[] IS NULL OR experience_level = ANY(${experienceLevels}))
          AND (${jobTypes}::text[] IS NULL OR job_type = ANY(${jobTypes}))
      `,
    ])

    return {
      countries: toCountMap(countryRows as Array<Record<string, unknown>>, "key"),
      experienceLevels: toCountMap(experienceRows as Array<Record<string, unknown>>, "key"),
      jobTypes: toCountMap(jobTypeRows as Array<Record<string, unknown>>, "key"),
      categories: toCountMap(categoryRows as Array<Record<string, unknown>>, "key"),
      visaSponsored: Number(visaRows[0]?.n ?? 0),
    }
  } catch {
    return null
  }
}

export async function localJobCount(): Promise<number> {
  if (!careerSql) return 0
  try {
    const rows = await careerSql`SELECT count(*)::int AS n FROM skilledjobs.jobs`
    return Number(rows[0]?.n ?? 0)
  } catch {
    return 0
  }
}
