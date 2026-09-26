import { careerSql } from "./db"
import { clearCompanyIndexCache } from "./sponsors"

export async function listSavedUrls() {
  if (!careerSql) return []
  const rows = await careerSql`
    SELECT id, label, url, company, category, last_fetched_at, last_fetch_status, last_fetch_error, show_on_dashboard
    FROM skilledjobs.saved_job_urls
    ORDER BY created_at DESC NULLS LAST
    LIMIT 300
  `
  return rows
}

export async function saveJobUrl(input: { label: string; url: string; company?: string | null; category?: string | null }) {
  if (!careerSql) throw new Error("Database is not configured")
  const rows = await careerSql`
    INSERT INTO skilledjobs.saved_job_urls (label, url, company, category)
    VALUES (${input.label}, ${input.url}, ${input.company ?? null}, ${input.category ?? null})
    RETURNING id, label, url, company
  `
  clearCompanyIndexCache()
  return rows[0]
}

export async function deleteSavedUrl(id: number) {
  if (!careerSql) return
  await careerSql`DELETE FROM skilledjobs.saved_job_urls WHERE id = ${id}`
  clearCompanyIndexCache()
}

export async function listStaged(status = "pending") {
  if (!careerSql) return []
  return careerSql`
    SELECT id, title, company, location, country, category, visa_type, url, status, created_at
    FROM skilledjobs.staged_jobs
    WHERE status = ${status}
    ORDER BY created_at DESC NULLS LAST
    LIMIT 80
  `
}

export async function approveStaged(ids: number[]) {
  if (!careerSql || ids.length === 0) return 0
  const rows = await careerSql`
    INSERT INTO skilledjobs.jobs (
      title, company, location, description, category, experience_level, job_type, visa_type,
      skills, url, logo_url, posted_at, expires_at, country, external_id, is_partner_job
    )
    SELECT title, company, location, description, category, experience_level, job_type, visa_type,
           skills, url, NULL, posted_at, expires_at, country, external_id, is_partner_job
    FROM skilledjobs.staged_jobs s
    WHERE s.id = ANY(${ids})
      AND s.status = 'pending'
      AND NOT EXISTS (SELECT 1 FROM skilledjobs.jobs j WHERE j.url = s.url)
    RETURNING id
  `
  await careerSql`
    UPDATE skilledjobs.staged_jobs
    SET status = 'approved'
    WHERE id = ANY(${ids}) AND status = 'pending'
  `
  clearCompanyIndexCache()
  return rows.length
}

export async function rejectStaged(ids: number[]) {
  if (!careerSql || ids.length === 0) return
  await careerSql`
    UPDATE skilledjobs.staged_jobs
    SET status = 'rejected'
    WHERE id = ANY(${ids}) AND status = 'pending'
  `
}

export async function updateLocalJob(id: number, patch: { title?: string; company?: string; url?: string; visaType?: string; country?: string }) {
  if (!careerSql) throw new Error("Database is not configured")
  await careerSql`
    UPDATE skilledjobs.jobs
    SET title = coalesce(${patch.title ?? null}, title),
        company = coalesce(${patch.company ?? null}, company),
        url = coalesce(${patch.url ?? null}, url),
        visa_type = coalesce(${patch.visaType ?? null}, visa_type),
        country = coalesce(${patch.country ?? null}, country)
    WHERE id = ${id}
  `
  clearCompanyIndexCache()
}

export async function jobsForUrlCheck(page: number, limit: number) {
  if (!careerSql) return []
  const offset = Math.max(page - 1, 0) * limit
  return careerSql`
    SELECT j.id, j.title, j.company, j.url
    FROM skilledjobs.jobs j
    ORDER BY j.id ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `
}

export async function recordUrlCheck(jobId: number, url: string, status: string, isValid: boolean, errorMessage: string | null) {
  if (!careerSql) return
  await careerSql`
    INSERT INTO skilledjobs.url_validation_history (job_id, url, status, is_valid, content_available, error_message)
    VALUES (${jobId}, ${url}, ${status}, ${isValid}, ${isValid}, ${errorMessage})
  `
}

export type SponsorCompanyRow = {
  id: number
  name: string
  city: string | null
  county: string | null
  type_and_rating: string | null
  route: string | null
  career_url: string | null
  saved_url_id: number | null
  last_fetch_status: string | null
  last_fetched_at: string | null
}

export async function listSponsorCompanies(opts: {
  q?: string
  hasUrl?: "any" | "yes" | "no"
  page?: number
  limit?: number
}): Promise<{ rows: SponsorCompanyRow[]; total: number }> {
  if (!careerSql) return { rows: [], total: 0 }
  const q = opts.q?.trim() || null
  const page = Math.max(opts.page ?? 1, 1)
  const limit = Math.min(Math.max(opts.limit ?? 40, 1), 100)
  const offset = (page - 1) * limit
  const hasUrl = opts.hasUrl ?? "any"

  const rows = (await careerSql`
    WITH distinct_sponsors AS (
      SELECT DISTINCT ON (lower(trim(name)))
        id, name, city, county, type_and_rating, route
      FROM skilledjobs.sponsored_companies
      WHERE (${q}::text IS NULL OR name ILIKE '%' || ${q} || '%' OR coalesce(city, '') ILIKE '%' || ${q} || '%')
      ORDER BY lower(trim(name)), id
    )
    SELECT
      s.id,
      s.name,
      s.city,
      s.county,
      s.type_and_rating,
      s.route,
      u.url AS career_url,
      u.id AS saved_url_id,
      u.last_fetch_status,
      u.last_fetched_at
    FROM distinct_sponsors s
    LEFT JOIN LATERAL (
      SELECT id, url, last_fetch_status, last_fetched_at
      FROM skilledjobs.saved_job_urls
      WHERE company IS NOT NULL
        AND lower(trim(company)) = lower(trim(s.name))
      ORDER BY last_fetched_at DESC NULLS LAST, id DESC
      LIMIT 1
    ) u ON true
    WHERE (
      ${hasUrl}::text = 'any'
      OR (${hasUrl}::text = 'yes' AND u.url IS NOT NULL)
      OR (${hasUrl}::text = 'no' AND u.url IS NULL)
    )
    ORDER BY
      CASE WHEN u.url IS NULL THEN 1 ELSE 0 END,
      s.name ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `) as SponsorCompanyRow[]

  const totalRows = await careerSql`
    WITH distinct_sponsors AS (
      SELECT DISTINCT ON (lower(trim(name)))
        id, name
      FROM skilledjobs.sponsored_companies
      WHERE (${q}::text IS NULL OR name ILIKE '%' || ${q} || '%' OR coalesce(city, '') ILIKE '%' || ${q} || '%')
      ORDER BY lower(trim(name)), id
    )
    SELECT count(*)::int AS n
    FROM distinct_sponsors s
    LEFT JOIN LATERAL (
      SELECT url
      FROM skilledjobs.saved_job_urls
      WHERE company IS NOT NULL
        AND lower(trim(company)) = lower(trim(s.name))
      ORDER BY id DESC
      LIMIT 1
    ) u ON true
    WHERE (
      ${hasUrl}::text = 'any'
      OR (${hasUrl}::text = 'yes' AND u.url IS NOT NULL)
      OR (${hasUrl}::text = 'no' AND u.url IS NULL)
    )
  `

  return { rows, total: Number(totalRows[0]?.n ?? 0) }
}

export async function upsertSponsorCareerUrl(input: {
  company: string
  url: string
  label?: string | null
}): Promise<{ id: number; url: string; company: string }> {
  if (!careerSql) throw new Error("Database is not configured")
  const company = input.company.trim()
  const url = input.url.trim()
  if (!company || !url) throw new Error("Company and careers URL are required")

  const existing = await careerSql`
    SELECT id
    FROM skilledjobs.saved_job_urls
    WHERE company IS NOT NULL AND lower(trim(company)) = lower(trim(${company}))
    ORDER BY id DESC
    LIMIT 1
  `

  if (existing[0]?.id) {
    const rows = await careerSql`
      UPDATE skilledjobs.saved_job_urls
      SET url = ${url},
          label = coalesce(${input.label?.trim() || null}, label),
          company = ${company}
      WHERE id = ${Number(existing[0].id)}
      RETURNING id, url, company
    `
    clearCompanyIndexCache()
    return {
      id: Number(rows[0].id),
      url: String(rows[0].url),
      company: String(rows[0].company),
    }
  }

  const rows = await careerSql`
    INSERT INTO skilledjobs.saved_job_urls (label, url, company)
    VALUES (${input.label?.trim() || company}, ${url}, ${company})
    RETURNING id, url, company
  `
  clearCompanyIndexCache()
  return {
    id: Number(rows[0].id),
    url: String(rows[0].url),
    company: String(rows[0].company),
  }
}
