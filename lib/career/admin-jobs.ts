import { careerSql } from "./db"
import { clearCompanyIndexCache, ensureSponsorShowcaseColumn } from "./sponsors"
import { ensureSponsorCheckTables } from "./sponsor-check"

/* ------------------------------------------------------------------ */
/* Live jobs                                                           */
/* ------------------------------------------------------------------ */

export type AdminJobRow = {
  id: number
  title: string
  company: string | null
  location: string | null
  country: string | null
  category: string | null
  experience_level: string | null
  job_type: string | null
  visa_type: string | null
  skills: string[] | null
  url: string | null
  logo_url: string | null
  posted_at: string | null
  expires_at: string | null
  description: string | null
  sponsor_status?: string | null
  sponsor_register?: string | null
  sponsor_match?: string | null
  sponsor_checked_at?: string | null
  sponsor_flagged_by?: string | null
}

export type JobInput = {
  title?: string
  company?: string
  location?: string
  country?: string
  category?: string
  experienceLevel?: string
  jobType?: string
  visaType?: string
  skills?: string[]
  url?: string
  logoUrl?: string
  expiresAt?: string
  description?: string
}

export async function listAdminJobs(opts: {
  q?: string | null
  country?: string | null
  visaType?: string | null
  category?: string | null
  ids?: number[] | null
  /** Sponsor check status, or "unchecked" / "tag_unverified". */
  sponsor?: string | null
  page?: number
  limit?: number
}): Promise<{ rows: AdminJobRow[]; total: number }> {
  if (!careerSql) return { rows: [], total: 0 }
  const q = opts.q?.trim() || null
  const country = opts.country?.trim() || null
  const visaType = opts.visaType?.trim() || null
  const category = opts.category?.trim() || null
  const ids = opts.ids ?? null
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200)
  const offset = (Math.max(opts.page ?? 1, 1) - 1) * limit

  const sponsor = opts.sponsor?.trim() || null
  await ensureSponsorCheckTables()

  const [rawRows, totals] = await Promise.all([
    careerSql`
      SELECT j.id, j.title, j.company, j.location, j.country, j.category, j.experience_level, j.job_type, j.visa_type,
             j.skills, j.url, j.logo_url, j.posted_at, j.expires_at, j.description,
             c.status AS sponsor_status, c.register_id AS sponsor_register, c.matched_name AS sponsor_match,
             c.checked_at AS sponsor_checked_at, c.flagged_by AS sponsor_flagged_by
      FROM skilledjobs.jobs j
      LEFT JOIN skilledjobs.job_sponsor_checks c ON c.job_id = j.id
      WHERE (${q}::text IS NULL OR j.title ILIKE '%' || ${q} || '%' OR j.company ILIKE '%' || ${q} || '%'
             OR coalesce(j.location, '') ILIKE '%' || ${q} || '%' OR j.id::text = ${q})
        AND (${country}::text IS NULL OR j.country = ${country})
        AND (${visaType}::text IS NULL OR j.visa_type = ${visaType})
        AND (${category}::text IS NULL OR j.category = ${category})
        AND (${ids}::int[] IS NULL OR j.id = ANY(${ids}))
        AND (${sponsor}::text IS NULL
             OR (${sponsor} = 'unchecked' AND c.job_id IS NULL)
             OR (${sponsor} = 'tag_unverified' AND c.status IN ('not_listed', 'no_company')
                 AND j.visa_type IS NOT NULL AND trim(j.visa_type) NOT IN ('', 'Other'))
             OR c.status = ${sponsor})
      ORDER BY j.posted_at DESC NULLS LAST, j.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    careerSql`
      SELECT count(*)::int AS all_n
      FROM skilledjobs.jobs j
      LEFT JOIN skilledjobs.job_sponsor_checks c ON c.job_id = j.id
      WHERE (${q}::text IS NULL OR j.title ILIKE '%' || ${q} || '%' OR j.company ILIKE '%' || ${q} || '%'
             OR coalesce(j.location, '') ILIKE '%' || ${q} || '%' OR j.id::text = ${q})
        AND (${country}::text IS NULL OR j.country = ${country})
        AND (${visaType}::text IS NULL OR j.visa_type = ${visaType})
        AND (${category}::text IS NULL OR j.category = ${category})
        AND (${ids}::int[] IS NULL OR j.id = ANY(${ids}))
        AND (${sponsor}::text IS NULL
             OR (${sponsor} = 'unchecked' AND c.job_id IS NULL)
             OR (${sponsor} = 'tag_unverified' AND c.status IN ('not_listed', 'no_company')
                 AND j.visa_type IS NOT NULL AND trim(j.visa_type) NOT IN ('', 'Other'))
             OR c.status = ${sponsor})
    `,
  ])
  return { rows: rawRows as AdminJobRow[], total: Number(totals[0]?.all_n ?? 0) }
}

const blankToNull = (value: string | undefined) => (value === undefined ? undefined : value.trim() || null)

export async function createLocalJob(input: JobInput): Promise<number> {
  if (!careerSql) throw new Error("Database is not configured")
  if (!input.title?.trim() || !input.company?.trim()) throw new Error("Title and company are required")
  const rows = await careerSql`
    INSERT INTO skilledjobs.jobs (
      title, company, location, country, category, experience_level, job_type, visa_type,
      skills, url, logo_url, expires_at, description, posted_at
    ) VALUES (
      ${input.title.trim()}, ${input.company.trim()}, ${input.location?.trim() || "Remote"},
      ${input.country?.trim() || "Other"}, ${input.category?.trim() || "Other"},
      ${input.experienceLevel?.trim() || "Mid Level"}, ${input.jobType?.trim() || "Full-time"},
      ${input.visaType?.trim() || "Other"}, ${input.skills ?? []}, ${input.url?.trim() || null},
      ${input.logoUrl?.trim() || null}, ${input.expiresAt?.trim() || null}, ${input.description?.trim() || ""}, now()
    )
    RETURNING id
  `
  clearCompanyIndexCache()
  return Number(rows[0].id)
}

export async function updateLocalJob(id: number, patch: JobInput) {
  if (!careerSql) throw new Error("Database is not configured")
  const logo = blankToNull(patch.logoUrl)
  const expires = blankToNull(patch.expiresAt)
  await careerSql`
    UPDATE skilledjobs.jobs
    SET title = coalesce(${patch.title?.trim() || null}, title),
        company = coalesce(${patch.company?.trim() || null}, company),
        location = coalesce(${patch.location?.trim() || null}, location),
        country = coalesce(${patch.country?.trim() || null}, country),
        category = coalesce(${patch.category?.trim() || null}, category),
        experience_level = coalesce(${patch.experienceLevel?.trim() || null}, experience_level),
        job_type = coalesce(${patch.jobType?.trim() || null}, job_type),
        visa_type = coalesce(${patch.visaType?.trim() || null}, visa_type),
        skills = coalesce(${patch.skills ?? null}::text[], skills),
        url = coalesce(${patch.url?.trim() || null}, url),
        logo_url = CASE WHEN ${logo === undefined} THEN logo_url ELSE ${logo ?? null} END,
        expires_at = CASE WHEN ${expires === undefined} THEN expires_at ELSE ${expires ?? null} END,
        description = coalesce(${patch.description ?? null}, description)
    WHERE id = ${id}
  `
  clearCompanyIndexCache()
}

export async function deleteLocalJobs(ids: number[]): Promise<number> {
  if (!careerSql || ids.length === 0) return 0
  const rows = await careerSql`DELETE FROM skilledjobs.jobs WHERE id = ANY(${ids}) RETURNING id`
  clearCompanyIndexCache()
  return rows.length
}

export async function deleteOldJobs(months: number): Promise<number> {
  if (!careerSql) return 0
  const safeMonths = Math.min(Math.max(Math.round(months), 1), 24)
  const rows = await careerSql`
    DELETE FROM skilledjobs.jobs
    WHERE posted_at < now() - make_interval(months => ${safeMonths})
    RETURNING id
  `
  clearCompanyIndexCache()
  return rows.length
}

export type DuplicateMatch = "title-company-location" | "title-company" | "url"
export type DuplicateKeep = "newest" | "oldest"

export async function findDuplicateJobs(match: DuplicateMatch, keep: DuplicateKeep) {
  if (!careerSql) return { groups: 0, removable: 0, sample: [] as Array<{ key: string; count: number; ids: number[]; title: string; company: string | null }> }
  const rows = await careerSql`
    WITH keyed AS (
      SELECT id, title, company, posted_at,
        CASE ${match}
          WHEN 'url' THEN nullif(lower(trim(coalesce(url, ''))), '')
          WHEN 'title-company' THEN lower(trim(title)) || '|' || lower(trim(coalesce(company, '')))
          ELSE lower(trim(title)) || '|' || lower(trim(coalesce(company, ''))) || '|' || lower(trim(coalesce(location, '')))
        END AS k
      FROM skilledjobs.jobs
    ),
    ranked AS (
      SELECT id, title, company, k,
        row_number() OVER (
          PARTITION BY k
          ORDER BY CASE WHEN ${keep} = 'oldest' THEN posted_at END ASC NULLS LAST,
                   CASE WHEN ${keep} <> 'oldest' THEN posted_at END DESC NULLS LAST,
                   id DESC
        ) AS rn,
        count(*) OVER (PARTITION BY k) AS n
      FROM keyed WHERE k IS NOT NULL
    )
    SELECT k, max(n)::int AS count, array_agg(id ORDER BY rn) AS ids, min(title) AS title, min(company) AS company
    FROM ranked WHERE n > 1
    GROUP BY k
    ORDER BY max(n) DESC, k
  `
  const groups = rows.map((row) => ({
    key: String(row.k),
    count: Number(row.count),
    ids: (row.ids as number[]).map(Number),
    title: String(row.title),
    company: (row.company as string | null) ?? null,
  }))
  return {
    groups: groups.length,
    removable: groups.reduce((sum, group) => sum + group.count - 1, 0),
    sample: groups.slice(0, 100),
  }
}

export async function deleteDuplicateJobs(match: DuplicateMatch, keep: DuplicateKeep): Promise<number> {
  return deleteLocalJobs(await findAllDuplicateIds(match, keep))
}

async function findAllDuplicateIds(match: DuplicateMatch, keep: DuplicateKeep): Promise<number[]> {
  if (!careerSql) return []
  const rows = await careerSql`
    WITH keyed AS (
      SELECT id, posted_at,
        CASE ${match}
          WHEN 'url' THEN nullif(lower(trim(coalesce(url, ''))), '')
          WHEN 'title-company' THEN lower(trim(title)) || '|' || lower(trim(coalesce(company, '')))
          ELSE lower(trim(title)) || '|' || lower(trim(coalesce(company, ''))) || '|' || lower(trim(coalesce(location, '')))
        END AS k
      FROM skilledjobs.jobs
    )
    SELECT id FROM (
      SELECT id, row_number() OVER (
        PARTITION BY k
        ORDER BY CASE WHEN ${keep} = 'oldest' THEN posted_at END ASC NULLS LAST,
                 CASE WHEN ${keep} <> 'oldest' THEN posted_at END DESC NULLS LAST,
                 id DESC
      ) AS rn
      FROM keyed WHERE k IS NOT NULL
    ) ranked WHERE rn > 1
  `
  return rows.map((row) => Number(row.id))
}

/* ------------------------------------------------------------------ */
/* Staged queue                                                        */
/* ------------------------------------------------------------------ */

export type StagedStatus = "pending" | "approved" | "rejected"

export async function listStagedPage(opts: {
  status?: StagedStatus | null
  country?: string | null
  q?: string | null
  page?: number
  limit?: number
}) {
  if (!careerSql) return { jobs: [], total: 0, countries: [] as Array<{ country: string; count: number }> }
  const status = opts.status ?? null
  const country = opts.country?.trim() || null
  const q = opts.q?.trim() || null
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200)
  const offset = (Math.max(opts.page ?? 1, 1) - 1) * limit
  const [jobs, total, countries] = await Promise.all([
    careerSql`
      SELECT id, title, company, location, country, category, experience_level, job_type, visa_type,
             skills, url, description, status, created_by, created_at
      FROM skilledjobs.staged_jobs
      WHERE (${status}::text IS NULL OR status = ${status})
        AND (${country}::text IS NULL OR coalesce(country, 'Other') = ${country})
        AND (${q}::text IS NULL OR title ILIKE '%' || ${q} || '%' OR company ILIKE '%' || ${q} || '%')
      ORDER BY created_at DESC NULLS LAST, id DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    careerSql`
      SELECT count(*)::int AS n FROM skilledjobs.staged_jobs
      WHERE (${status}::text IS NULL OR status = ${status})
        AND (${country}::text IS NULL OR coalesce(country, 'Other') = ${country})
        AND (${q}::text IS NULL OR title ILIKE '%' || ${q} || '%' OR company ILIKE '%' || ${q} || '%')
    `,
    careerSql`
      SELECT coalesce(country, 'Other') AS country, count(*)::int AS count
      FROM skilledjobs.staged_jobs
      WHERE (${status}::text IS NULL OR status = ${status})
      GROUP BY 1 ORDER BY 2 DESC
    `,
  ])
  return {
    jobs,
    total: Number(total[0]?.n ?? 0),
    countries: countries.map((row) => ({ country: String(row.country), count: Number(row.count) })),
  }
}

export async function approveStaged(ids: number[]) {
  if (!careerSql || ids.length === 0) return 0
  const rows = await careerSql`
    INSERT INTO skilledjobs.jobs (
      title, company, location, description, category, experience_level, job_type, visa_type,
      skills, url, logo_url, posted_at, expires_at, country, external_id, is_partner_job
    )
    SELECT title, company, location, description, category, experience_level, job_type, visa_type,
           skills, url, NULL, coalesce(posted_at, now()), expires_at, country, external_id, is_partner_job
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
  if (!careerSql || ids.length === 0) return 0
  const rows = await careerSql`
    UPDATE skilledjobs.staged_jobs
    SET status = 'rejected'
    WHERE id = ANY(${ids}) AND status = 'pending'
    RETURNING id
  `
  return rows.length
}

export async function deleteStaged(ids: number[]) {
  if (!careerSql || ids.length === 0) return 0
  const rows = await careerSql`DELETE FROM skilledjobs.staged_jobs WHERE id = ANY(${ids}) RETURNING id`
  return rows.length
}

export async function updateStaged(id: number, patch: JobInput) {
  if (!careerSql) throw new Error("Database is not configured")
  await careerSql`
    UPDATE skilledjobs.staged_jobs
    SET title = coalesce(${patch.title?.trim() || null}, title),
        company = coalesce(${patch.company?.trim() || null}, company),
        location = coalesce(${patch.location?.trim() || null}, location),
        country = coalesce(${patch.country?.trim() || null}, country),
        category = coalesce(${patch.category?.trim() || null}, category),
        experience_level = coalesce(${patch.experienceLevel?.trim() || null}, experience_level),
        job_type = coalesce(${patch.jobType?.trim() || null}, job_type),
        visa_type = coalesce(${patch.visaType?.trim() || null}, visa_type),
        skills = coalesce(${patch.skills ?? null}::text[], skills),
        url = coalesce(${patch.url?.trim() || null}, url),
        description = coalesce(${patch.description ?? null}, description)
    WHERE id = ${id}
  `
}

/** Applies an action to a batch of staged jobs matching the filters; callers loop until `remaining` is 0. */
export async function bulkStagedByFilter(opts: {
  action: "approve" | "reject" | "delete"
  status?: StagedStatus | null
  country?: string | null
  batch?: number
}): Promise<{ affected: number; remaining: number }> {
  if (!careerSql) return { affected: 0, remaining: 0 }
  const status = opts.action === "delete" ? opts.status ?? null : "pending"
  const country = opts.country?.trim() || null
  const batch = Math.min(Math.max(opts.batch ?? 500, 1), 2000)
  const idRows = await careerSql`
    SELECT id FROM skilledjobs.staged_jobs
    WHERE (${status}::text IS NULL OR status = ${status})
      AND (${country}::text IS NULL OR coalesce(country, 'Other') = ${country})
    ORDER BY id
    LIMIT ${batch}
  `
  const ids = idRows.map((row) => Number(row.id))
  let affected = 0
  if (ids.length) {
    if (opts.action === "approve") affected = await approveStaged(ids)
    else if (opts.action === "reject") affected = await rejectStaged(ids)
    else affected = await deleteStaged(ids)
  }
  const remaining = await careerSql`
    SELECT count(*)::int AS n FROM skilledjobs.staged_jobs
    WHERE (${status}::text IS NULL OR status = ${status})
      AND (${country}::text IS NULL OR coalesce(country, 'Other') = ${country})
  `
  return { affected, remaining: ids.length ? Number(remaining[0]?.n ?? 0) : 0 }
}

/* ------------------------------------------------------------------ */
/* Saved careers URLs                                                  */
/* ------------------------------------------------------------------ */

export async function listSavedUrls() {
  if (!careerSql) return []
  return careerSql`
    SELECT id, label, url, company, category, created_at, last_fetched_at, last_fetch_status,
           last_fetch_error, last_failed_at, show_on_dashboard
    FROM skilledjobs.saved_job_urls
    ORDER BY created_at ASC NULLS LAST, id ASC
    LIMIT 5000
  `
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

export async function updateSavedUrl(id: number, patch: { label?: string; url?: string; company?: string; category?: string }) {
  if (!careerSql) throw new Error("Database is not configured")
  await careerSql`
    UPDATE skilledjobs.saved_job_urls
    SET label = coalesce(${patch.label?.trim() || null}, label),
        url = coalesce(${patch.url?.trim() || null}, url),
        company = CASE WHEN ${patch.company === undefined} THEN company ELSE ${patch.company?.trim() || null} END,
        category = CASE WHEN ${patch.category === undefined} THEN category ELSE ${patch.category?.trim() || null} END
    WHERE id = ${id}
  `
  clearCompanyIndexCache()
}

export async function deleteSavedUrls(ids: number[]) {
  if (!careerSql || ids.length === 0) return 0
  const rows = await careerSql`DELETE FROM skilledjobs.saved_job_urls WHERE id = ANY(${ids}) RETURNING id`
  clearCompanyIndexCache()
  return rows.length
}

/* ------------------------------------------------------------------ */
/* Fetch history                                                       */
/* ------------------------------------------------------------------ */

let historyEnsured = false

async function ensureFetchHistoryTable() {
  if (!careerSql || historyEnsured) return
  await careerSql`
    CREATE TABLE IF NOT EXISTS skilledjobs.job_fetch_history (
      id serial PRIMARY KEY,
      saved_url_id integer,
      company text,
      url text NOT NULL,
      source text NOT NULL DEFAULT 'single',
      status text NOT NULL,
      found integer NOT NULL DEFAULT 0,
      staged integer NOT NULL DEFAULT 0,
      duplicates integer NOT NULL DEFAULT 0,
      method text,
      error text,
      duration_ms integer,
      created_by text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `
  await careerSql`CREATE INDEX IF NOT EXISTS idx_job_fetch_history_created ON skilledjobs.job_fetch_history (created_at DESC)`
  historyEnsured = true
}

export type FetchRun = {
  savedUrlId?: number | null
  company?: string | null
  url: string
  source?: string
  status: "success" | "failed"
  found?: number
  staged?: number
  duplicates?: number
  method?: string | null
  error?: string | null
  durationMs?: number
  createdBy?: string | null
}

export async function recordFetchRun(run: FetchRun) {
  if (!careerSql) return
  try {
    await ensureFetchHistoryTable()
    await careerSql`
      INSERT INTO skilledjobs.job_fetch_history
        (saved_url_id, company, url, source, status, found, staged, duplicates, method, error, duration_ms, created_by)
      VALUES (${run.savedUrlId ?? null}, ${run.company ?? null}, ${run.url}, ${run.source ?? "single"}, ${run.status},
              ${run.found ?? 0}, ${run.staged ?? 0}, ${run.duplicates ?? 0}, ${run.method ?? null},
              ${run.error?.slice(0, 500) ?? null}, ${run.durationMs ?? null}, ${run.createdBy ?? null})
    `
  } catch {
    /* history is best-effort */
  }
}

export async function listFetchHistory(opts: { status?: string | null; q?: string | null; page?: number; limit?: number }) {
  if (!careerSql) return { rows: [], total: 0, summary: null }
  await ensureFetchHistoryTable()
  const status = opts.status && opts.status !== "all" ? opts.status : null
  const q = opts.q?.trim() || null
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200)
  const offset = (Math.max(opts.page ?? 1, 1) - 1) * limit
  const [rows, total, summary] = await Promise.all([
    careerSql`
      SELECT * FROM skilledjobs.job_fetch_history
      WHERE (${status}::text IS NULL OR status = ${status})
        AND (${q}::text IS NULL OR company ILIKE '%' || ${q} || '%' OR url ILIKE '%' || ${q} || '%')
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    careerSql`
      SELECT count(*)::int AS n FROM skilledjobs.job_fetch_history
      WHERE (${status}::text IS NULL OR status = ${status})
        AND (${q}::text IS NULL OR company ILIKE '%' || ${q} || '%' OR url ILIKE '%' || ${q} || '%')
    `,
    careerSql`
      SELECT
        count(*)::int AS runs,
        count(*) FILTER (WHERE status = 'success')::int AS succeeded,
        count(*) FILTER (WHERE status = 'failed')::int AS failed,
        coalesce(sum(staged), 0)::int AS staged,
        count(*) FILTER (WHERE created_at > now() - interval '24 hours')::int AS last_24h
      FROM skilledjobs.job_fetch_history
    `,
  ])
  return { rows, total: Number(total[0]?.n ?? 0), summary: summary[0] ?? null }
}

export async function clearFetchHistory() {
  if (!careerSql) return
  await ensureFetchHistoryTable()
  await careerSql`DELETE FROM skilledjobs.job_fetch_history`
}

/* ------------------------------------------------------------------ */
/* URL validation                                                      */
/* ------------------------------------------------------------------ */

export async function urlCheckQueue(opts: { limit: number; force: boolean; page: number }) {
  if (!careerSql) return { jobs: [], skipped: 0, remaining: 0, total: 0 }
  const limit = Math.min(Math.max(opts.limit, 1), 100)
  const offset = opts.force ? (Math.max(opts.page, 1) - 1) * limit : 0
  const [jobs, counts] = await Promise.all([
    careerSql`
      SELECT j.id, j.title, j.company, j.url
      FROM skilledjobs.jobs j
      WHERE ${opts.force} OR NOT EXISTS (
        SELECT 1 FROM skilledjobs.url_validation_history h
        WHERE h.job_id = j.id AND h.last_checked > now() - interval '7 days'
      )
      ORDER BY j.id ASC
      LIMIT ${limit} OFFSET ${offset}
    `,
    careerSql`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE EXISTS (
               SELECT 1 FROM skilledjobs.url_validation_history h
               WHERE h.job_id = j.id AND h.last_checked > now() - interval '7 days'
             ))::int AS recent
      FROM skilledjobs.jobs j
    `,
  ])
  const total = Number(counts[0]?.total ?? 0)
  const recent = Number(counts[0]?.recent ?? 0)
  return {
    jobs,
    skipped: opts.force ? 0 : recent,
    remaining: opts.force ? Math.max(total - offset - jobs.length, 0) : Math.max(total - recent - jobs.length, 0),
    total,
  }
}

export async function jobsByIds(ids: number[]) {
  if (!careerSql || ids.length === 0) return []
  return careerSql`SELECT id, title, company, url FROM skilledjobs.jobs WHERE id = ANY(${ids})`
}

export async function recordUrlCheck(jobId: number, url: string, status: string, isValid: boolean, contentAvailable: boolean, errorMessage: string | null) {
  if (!careerSql) return
  await careerSql`
    INSERT INTO skilledjobs.url_validation_history (job_id, url, status, is_valid, content_available, error_message)
    VALUES (${jobId}, ${url}, ${status}, ${isValid}, ${contentAvailable}, ${errorMessage})
  `
}

/* ------------------------------------------------------------------ */
/* Sponsor register companies                                          */
/* ------------------------------------------------------------------ */

export type SponsorCompanyRow = {
  id: number
  name: string
  city: string | null
  county: string | null
  type_and_rating: string | null
  route: string | null
  career_url: string | null
  saved_url_id: number | null
  show_on_sponsors: boolean
  last_fetch_status: string | null
  last_fetch_error: string | null
  last_fetched_at: string | null
}

export async function listSponsorCompanies(opts: {
  q?: string
  hasUrl?: "any" | "yes" | "no"
  shown?: "any" | "yes" | "no"
  page?: number
  limit?: number
}): Promise<{ rows: SponsorCompanyRow[]; total: number }> {
  if (!careerSql) return { rows: [], total: 0 }
  await ensureSponsorShowcaseColumn()
  const q = opts.q?.trim() || null
  const page = Math.max(opts.page ?? 1, 1)
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200)
  const offset = (page - 1) * limit
  const hasUrl = opts.hasUrl ?? "any"
  const shown = opts.shown ?? "any"

  const rows = await careerSql`
    WITH urls AS (
      SELECT DISTINCT ON (lower(trim(company)))
        lower(trim(company)) AS k, id, url, show_on_sponsors, last_fetch_status, last_fetch_error, last_fetched_at
      FROM skilledjobs.saved_job_urls
      WHERE company IS NOT NULL AND trim(company) <> ''
      ORDER BY lower(trim(company)), last_fetched_at DESC NULLS LAST, id DESC
    ),
    sponsors AS (
      SELECT DISTINCT ON (lower(trim(name)))
        lower(trim(name)) AS k, id, name, city, county, type_and_rating, route
      FROM skilledjobs.sponsored_companies
      WHERE (${q}::text IS NULL OR name ILIKE '%' || ${q} || '%' OR coalesce(city, '') ILIKE '%' || ${q} || '%')
      ORDER BY lower(trim(name)), id
    ),
    joined AS (
      SELECT s.id, s.name, s.city, s.county, s.type_and_rating, s.route,
             u.url AS career_url, u.id AS saved_url_id, coalesce(u.show_on_sponsors, false) AS show_on_sponsors,
             u.last_fetch_status, u.last_fetch_error, u.last_fetched_at
      FROM sponsors s
      LEFT JOIN urls u ON u.k = s.k
      WHERE (${hasUrl}::text = 'any'
         OR (${hasUrl}::text = 'yes' AND u.url IS NOT NULL)
         OR (${hasUrl}::text = 'no' AND u.url IS NULL))
        AND (${shown}::text = 'any'
         OR (${shown}::text = 'yes' AND coalesce(u.show_on_sponsors, false))
         OR (${shown}::text = 'no' AND NOT coalesce(u.show_on_sponsors, false)))
    )
    SELECT *, count(*) OVER ()::int AS total_count
    FROM joined
    ORDER BY CASE WHEN career_url IS NULL THEN 1 ELSE 0 END, name ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  return {
    rows: rows.map((row) => {
      const copy = { ...row }
      delete copy.total_count
      return copy as SponsorCompanyRow
    }),
    total: Number(rows[0]?.total_count ?? 0),
  }
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
    SELECT id FROM skilledjobs.saved_job_urls
    WHERE company IS NOT NULL AND lower(trim(company)) = lower(trim(${company}))
    ORDER BY id DESC LIMIT 1
  `

  const rows = existing[0]?.id
    ? await careerSql`
        UPDATE skilledjobs.saved_job_urls
        SET url = ${url}, label = coalesce(${input.label?.trim() || null}, label), company = ${company}
        WHERE id = ${Number(existing[0].id)}
        RETURNING id, url, company
      `
    : await careerSql`
        INSERT INTO skilledjobs.saved_job_urls (label, url, company)
        VALUES (${input.label?.trim() || company}, ${url}, ${company})
        RETURNING id, url, company
      `
  clearCompanyIndexCache()
  return { id: Number(rows[0].id), url: String(rows[0].url), company: String(rows[0].company) }
}

/** Put chosen sponsors on the public page that shows before a search. A careers URL has to exist first. */
export async function setSponsorsShown(companies: string[], shown: boolean): Promise<{ updated: number; missing: string[] }> {
  if (!careerSql) throw new Error("Database is not configured")
  await ensureSponsorShowcaseColumn()
  const names = [...new Set(companies.map((company) => company.trim()).filter(Boolean))]
  if (!names.length) return { updated: 0, missing: [] }
  const rows = await careerSql`
    UPDATE skilledjobs.saved_job_urls
    SET show_on_sponsors = ${shown}
    WHERE company IS NOT NULL
      AND lower(trim(company)) IN (SELECT lower(trim(n)) FROM unnest(${names}::text[]) AS n)
    RETURNING company
  `
  const updated = new Set(rows.map((row) => String(row.company).trim().toLowerCase()))
  return { updated: rows.length, missing: names.filter((name) => !updated.has(name.toLowerCase())) }
}
