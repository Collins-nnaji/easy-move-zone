import { careerSql } from "./db"
import { companyKey } from "./company-match"

/* ------------------------------------------------------------------ */
/* Registers                                                           */
/* ------------------------------------------------------------------ */

export type SponsorStatus = "licensed" | "likely" | "not_listed" | "no_register" | "no_company"

export type RegisterInfo = {
  id: string
  country: string
  label: string
  visaType: string | null
  sourceUrl: string | null
  countries: string[]
  entries: number
  builtIn: boolean
  updatedAt: string | null
}

/** The UK list lives in its own table; every other country is imported into sponsor_register_entries. */
const UK_REGISTER = {
  id: "uk",
  country: "United Kingdom",
  label: "UK register of licensed sponsors",
  visaType: "UK Skilled Worker",
  sourceUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers",
  countries: ["United Kingdom", "UK", "Great Britain", "England", "Scotland", "Wales", "Northern Ireland"],
}

const REGISTER_TTL_MS = 30 * 60 * 1000

let tablesReady: Promise<void> | null = null

export function ensureSponsorCheckTables(): Promise<void> {
  if (!careerSql) return Promise.resolve()
  const sql = careerSql
  tablesReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS skilledjobs.sponsor_register_lists (
        id text PRIMARY KEY,
        country text NOT NULL,
        label text NOT NULL,
        visa_type text,
        source_url text,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `
    await sql`
      CREATE TABLE IF NOT EXISTS skilledjobs.sponsor_register_entries (
        id serial PRIMARY KEY,
        list_id text NOT NULL REFERENCES skilledjobs.sponsor_register_lists(id) ON DELETE CASCADE,
        name text NOT NULL,
        name_key text NOT NULL,
        city text,
        route text
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS sponsor_register_entries_list_key ON skilledjobs.sponsor_register_entries (list_id, name_key)`
    await sql`
      CREATE TABLE IF NOT EXISTS skilledjobs.job_sponsor_checks (
        job_id integer PRIMARY KEY,
        status text NOT NULL,
        register_id text,
        matched_name text,
        company text,
        tag_applied text,
        checked_at timestamptz NOT NULL DEFAULT now()
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS job_sponsor_checks_status ON skilledjobs.job_sponsor_checks (status)`
  })().catch((error) => {
    tablesReady = null
    throw error
  })
  return tablesReady
}

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

export async function listRegisters(): Promise<RegisterInfo[]> {
  if (!careerSql) return []
  await ensureSponsorCheckTables()
  const [ukCount, lists] = await Promise.all([
    careerSql`SELECT count(DISTINCT lower(trim(name)))::int AS n FROM skilledjobs.sponsored_companies`,
    careerSql`
      SELECT l.id, l.country, l.label, l.visa_type, l.source_url, l.updated_at,
             (SELECT count(*)::int FROM skilledjobs.sponsor_register_entries e WHERE e.list_id = l.id) AS entries
      FROM skilledjobs.sponsor_register_lists l
      ORDER BY l.country
    `,
  ])
  return [
    { ...UK_REGISTER, entries: Number(ukCount[0]?.n ?? 0), builtIn: true, updatedAt: null },
    ...lists.map((row) => ({
      id: String(row.id),
      country: String(row.country),
      label: String(row.label),
      visaType: row.visa_type ? String(row.visa_type) : null,
      sourceUrl: row.source_url ? String(row.source_url) : null,
      countries: [String(row.country)],
      entries: Number(row.entries ?? 0),
      builtIn: false,
      updatedAt: row.updated_at ? String(row.updated_at) : null,
    })),
  ]
}

export type RegisterRowInput = { name: string; city?: string | null; route?: string | null }

/** Add rows to a country's register. Pass replace on the first chunk to start the list afresh. */
export async function importRegisterRows(input: {
  country: string
  label?: string | null
  visaType?: string | null
  sourceUrl?: string | null
  rows: RegisterRowInput[]
  replace?: boolean
}): Promise<{ id: string; inserted: number }> {
  if (!careerSql) throw new Error("Database is not configured")
  const country = input.country.trim()
  if (!country) throw new Error("Country is required")
  if (UK_REGISTER.countries.some((c) => c.toLowerCase() === country.toLowerCase())) {
    throw new Error("The UK register is built in and updated separately.")
  }
  await ensureSponsorCheckTables()
  const id = slug(country)
  await careerSql`
    INSERT INTO skilledjobs.sponsor_register_lists (id, country, label, visa_type, source_url, updated_at)
    VALUES (${id}, ${country}, ${input.label?.trim() || `${country} sponsor register`}, ${input.visaType?.trim() || null}, ${input.sourceUrl?.trim() || null}, now())
    ON CONFLICT (id) DO UPDATE SET
      label = coalesce(${input.label?.trim() || null}, skilledjobs.sponsor_register_lists.label),
      visa_type = coalesce(${input.visaType?.trim() || null}, skilledjobs.sponsor_register_lists.visa_type),
      source_url = coalesce(${input.sourceUrl?.trim() || null}, skilledjobs.sponsor_register_lists.source_url),
      updated_at = now()
  `
  if (input.replace) await careerSql`DELETE FROM skilledjobs.sponsor_register_entries WHERE list_id = ${id}`

  const clean = input.rows
    .map((row) => ({ name: String(row.name ?? "").trim(), city: row.city?.trim() || null, route: row.route?.trim() || null }))
    .filter((row) => row.name.length > 1)
    .map((row) => ({ ...row, key: companyKey(row.name) }))
    .filter((row) => row.key.length > 1)
  if (clean.length) {
    await careerSql`
      INSERT INTO skilledjobs.sponsor_register_entries (list_id, name, name_key, city, route)
      SELECT ${id}, u.name, u.name_key, u.city, u.route
      FROM unnest(${clean.map((r) => r.name)}::text[], ${clean.map((r) => r.key)}::text[],
                  ${clean.map((r) => r.city)}::text[], ${clean.map((r) => r.route)}::text[]) AS u(name, name_key, city, route)
    `
  }
  indexCache.delete(id)
  return { id, inserted: clean.length }
}

export async function deleteRegister(id: string): Promise<void> {
  if (!careerSql || id === UK_REGISTER.id) return
  await ensureSponsorCheckTables()
  await careerSql`DELETE FROM skilledjobs.sponsor_register_lists WHERE id = ${id}`
  await careerSql`DELETE FROM skilledjobs.job_sponsor_checks WHERE register_id = ${id}`
  indexCache.delete(id)
}

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

type RegisterIndex = { at: number; byKey: Map<string, string>; sortedKeys: string[] }
const indexCache = new Map<string, RegisterIndex>()

async function registerIndex(id: string): Promise<RegisterIndex> {
  const cached = indexCache.get(id)
  if (cached && Date.now() - cached.at < REGISTER_TTL_MS) return cached
  const byKey = new Map<string, string>()
  if (careerSql) {
    if (id === UK_REGISTER.id) {
      const rows = await careerSql`SELECT DISTINCT name FROM skilledjobs.sponsored_companies WHERE name IS NOT NULL`
      for (const row of rows) {
        const name = String(row.name)
        const key = companyKey(name)
        if (key.length > 1 && !byKey.has(key)) byKey.set(key, name)
      }
    } else {
      const rows = await careerSql`SELECT name, name_key FROM skilledjobs.sponsor_register_entries WHERE list_id = ${id}`
      for (const row of rows) {
        const key = String(row.name_key)
        if (!byKey.has(key)) byKey.set(key, String(row.name))
      }
    }
  }
  const index = { at: Date.now(), byKey, sortedKeys: [...byKey.keys()].sort() }
  indexCache.set(id, index)
  return index
}

function lowerBound(sorted: string[], target: string): number {
  let lo = 0
  let hi = sorted.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sorted[mid] < target) lo = mid + 1
    else hi = mid
  }
  return lo
}

/**
 * Exact collapsed-name match is "licensed". A shared leading name ("Deloitte" vs "Deloitte Digital")
 * is "likely" and wants a human look before anyone relies on it.
 */
export function matchRegister(company: string, index: RegisterIndex): { status: "licensed" | "likely"; name: string } | null {
  const key = companyKey(company)
  if (key.length < 2) return null
  const exact = index.byKey.get(key)
  if (exact) return { status: "licensed", name: exact }

  const tokens = key.split(" ")
  for (let n = tokens.length - 1; n >= 1; n -= 1) {
    const prefix = tokens.slice(0, n).join(" ")
    if (prefix.length < 5) break
    const hit = index.byKey.get(prefix)
    if (hit) return { status: "likely", name: hit }
  }

  if (key.length >= 5) {
    const probe = `${key} `
    const at = lowerBound(index.sortedKeys, probe)
    const candidate = index.sortedKeys[at]
    if (candidate?.startsWith(probe)) return { status: "likely", name: index.byKey.get(candidate) ?? candidate }
  }
  return null
}

/** True when the company is on the UK register by exact collapsed name. */
export async function isOnUkSponsorRegister(company: string | null | undefined): Promise<boolean> {
  if (!company?.trim()) return false
  try {
    return matchRegister(company, await registerIndex(UK_REGISTER.id))?.status === "licensed"
  } catch {
    return false
  }
}

export const UK_VISA_TYPE = UK_REGISTER.visaType

const UK_COUNTRY_NAMES = new Set(UK_REGISTER.countries.map((c) => c.toLowerCase()))
const UNKNOWN_COUNTRY = new Set(["", "other", "remote", "international", "worldwide"])
const UK_LOCATION =
  /\b(united kingdom|uk|england|scotland|wales|northern ireland|great britain|london|manchester|birmingham|edinburgh|glasgow|leeds|bristol|cardiff|belfast|liverpool|newcastle|sheffield|nottingham|cambridge|oxford|reading|milton keynes|leicester|coventry|southampton|brighton|aberdeen)\b/i
const ELSEWHERE_LOCATION =
  /(united states|\busa\b|\bu\.s\.|canada|india|germany|france|netherlands|\bireland\b|singapore|australia|japan|brazil|mexico|spain|poland|new york|san francisco|seattle|austin|boston|chicago|los angeles|toronto|vancouver|bangalore|bengaluru|berlin|munich|paris|amsterdam|dublin|tokyo|sydney|,\s*[A-Z]{2}$)/

/**
 * For a job from a UK licensed sponsor: UK roles (or roles with no clear location) get the
 * Skilled Worker tag; roles plainly in another country are left alone.
 */
export function ukSponsorJobPlacement(job: { country: string | null; location: string | null }): { tag: boolean; country: string | null } {
  const country = job.country?.trim() ?? ""
  const location = job.location?.trim() ?? ""
  if (UK_COUNTRY_NAMES.has(country.toLowerCase())) return { tag: true, country }
  if (!UNKNOWN_COUNTRY.has(country.toLowerCase())) return { tag: false, country }
  if (UK_LOCATION.test(location)) return { tag: true, country: "United Kingdom" }
  if (ELSEWHERE_LOCATION.test(location)) return { tag: false, country: country || null }
  return { tag: true, country: country || null }
}

type RegisterDef = { id: string; visaType: string | null; countries: string[] }

async function registersByCountry(): Promise<Map<string, RegisterDef>> {
  const map = new Map<string, RegisterDef>()
  for (const country of UK_REGISTER.countries) map.set(country.toLowerCase(), UK_REGISTER)
  if (!careerSql) return map
  await ensureSponsorCheckTables()
  const lists = await careerSql`SELECT id, country, visa_type FROM skilledjobs.sponsor_register_lists`
  for (const row of lists) {
    map.set(String(row.country).toLowerCase(), {
      id: String(row.id),
      visaType: row.visa_type ? String(row.visa_type) : null,
      countries: [String(row.country)],
    })
  }
  return map
}

export type SponsorCheckResult = {
  jobId: number
  company: string | null
  country: string | null
  status: SponsorStatus
  registerId: string | null
  matchedName: string | null
  tagApplied: string | null
}

const isUntagged = (visaType: string | null) => !visaType || !visaType.trim() || visaType.trim() === "Other"

/** Check jobs against the register for their country, save the flag, and tag exact matches that are untagged. */
export async function checkJobSponsors(ids: number[], opts: { applyTags?: boolean } = {}): Promise<SponsorCheckResult[]> {
  if (!careerSql || ids.length === 0) return []
  await ensureSponsorCheckTables()
  const applyTags = opts.applyTags ?? true
  const [jobs, registers] = await Promise.all([
    careerSql`SELECT id, company, country, visa_type FROM skilledjobs.jobs WHERE id = ANY(${ids})`,
    registersByCountry(),
  ])

  const results: SponsorCheckResult[] = []
  for (const job of jobs) {
    const company = job.company ? String(job.company).trim() : null
    const country = job.country ? String(job.country).trim() : null
    const visaType = job.visa_type ? String(job.visa_type) : null
    const base = { jobId: Number(job.id), company, country, registerId: null, matchedName: null, tagApplied: null }
    const register = country ? registers.get(country.toLowerCase()) : undefined
    if (!register) {
      results.push({ ...base, status: "no_register" })
      continue
    }
    if (!company || company.toLowerCase() === "unknown") {
      results.push({ ...base, registerId: register.id, status: "no_company" })
      continue
    }
    const hit = matchRegister(company, await registerIndex(register.id))
    const tag = hit?.status === "licensed" && applyTags && register.visaType && isUntagged(visaType) ? register.visaType : null
    results.push({
      ...base,
      registerId: register.id,
      status: hit ? hit.status : "not_listed",
      matchedName: hit?.name ?? null,
      tagApplied: tag,
    })
  }

  if (results.length) {
    await careerSql`
      INSERT INTO skilledjobs.job_sponsor_checks (job_id, status, register_id, matched_name, company, tag_applied, checked_at)
      SELECT u.job_id, u.status, u.register_id, u.matched_name, u.company, u.tag_applied, now()
      FROM unnest(${results.map((r) => r.jobId)}::int[], ${results.map((r) => r.status)}::text[],
                  ${results.map((r) => r.registerId)}::text[], ${results.map((r) => r.matchedName)}::text[],
                  ${results.map((r) => r.company)}::text[], ${results.map((r) => r.tagApplied)}::text[])
        AS u(job_id, status, register_id, matched_name, company, tag_applied)
      ON CONFLICT (job_id) DO UPDATE SET
        status = EXCLUDED.status,
        register_id = EXCLUDED.register_id,
        matched_name = EXCLUDED.matched_name,
        company = EXCLUDED.company,
        tag_applied = coalesce(EXCLUDED.tag_applied, skilledjobs.job_sponsor_checks.tag_applied),
        checked_at = now()
    `
    const tagged = results.filter((r) => r.tagApplied)
    const byTag = new Map<string, number[]>()
    for (const r of tagged) byTag.set(r.tagApplied!, [...(byTag.get(r.tagApplied!) ?? []), r.jobId])
    for (const [tag, jobIds] of byTag) {
      await careerSql`
        UPDATE skilledjobs.jobs SET visa_type = ${tag}
        WHERE id = ANY(${jobIds}) AND (visa_type IS NULL OR trim(visa_type) IN ('', 'Other'))
      `
    }
  }
  return results
}

/** Next jobs to check. Pass `before` (ISO time a full recheck started) to walk every job once. */
export async function sponsorCheckQueue(opts: {
  limit?: number
  before?: string | null
  country?: string | null
}): Promise<{ ids: number[]; remaining: number }> {
  if (!careerSql) return { ids: [], remaining: 0 }
  await ensureSponsorCheckTables()
  const limit = Math.min(Math.max(opts.limit ?? 500, 1), 2000)
  const before = opts.before || null
  const country = opts.country?.trim().toLowerCase() || null
  const countries = country && UK_REGISTER.countries.some((c) => c.toLowerCase() === country)
    ? UK_REGISTER.countries.map((c) => c.toLowerCase())
    : country
      ? [country]
      : null
  const [rows, counts] = await Promise.all([
    careerSql`
      SELECT j.id
      FROM skilledjobs.jobs j
      LEFT JOIN skilledjobs.job_sponsor_checks c ON c.job_id = j.id
      WHERE (c.job_id IS NULL OR (${before}::timestamptz IS NOT NULL AND c.checked_at < ${before}::timestamptz))
        AND (${countries}::text[] IS NULL OR lower(trim(j.country)) = ANY(${countries}))
      ORDER BY j.id
      LIMIT ${limit}
    `,
    careerSql`
      SELECT count(*)::int AS n
      FROM skilledjobs.jobs j
      LEFT JOIN skilledjobs.job_sponsor_checks c ON c.job_id = j.id
      WHERE (c.job_id IS NULL OR (${before}::timestamptz IS NOT NULL AND c.checked_at < ${before}::timestamptz))
        AND (${countries}::text[] IS NULL OR lower(trim(j.country)) = ANY(${countries}))
    `,
  ])
  return { ids: rows.map((row) => Number(row.id)), remaining: Number(counts[0]?.n ?? 0) }
}

export async function sponsorCheckSummary(): Promise<{
  total: number
  unchecked: number
  byStatus: Record<SponsorStatus, number>
  taggedNotListed: number
  tagsApplied: number
}> {
  const empty = { licensed: 0, likely: 0, not_listed: 0, no_register: 0, no_company: 0 }
  if (!careerSql) return { total: 0, unchecked: 0, byStatus: empty, taggedNotListed: 0, tagsApplied: 0 }
  await ensureSponsorCheckTables()
  const [rows, totals] = await Promise.all([
    careerSql`
      SELECT c.status, count(*)::int AS n
      FROM skilledjobs.job_sponsor_checks c
      JOIN skilledjobs.jobs j ON j.id = c.job_id
      GROUP BY c.status
    `,
    careerSql`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE c.job_id IS NULL)::int AS unchecked,
             count(*) FILTER (WHERE c.status = 'not_listed' AND j.visa_type IS NOT NULL AND trim(j.visa_type) NOT IN ('', 'Other'))::int AS tagged_not_listed,
             count(*) FILTER (WHERE c.tag_applied IS NOT NULL)::int AS tags_applied
      FROM skilledjobs.jobs j
      LEFT JOIN skilledjobs.job_sponsor_checks c ON c.job_id = j.id
    `,
  ])
  const byStatus = { ...empty }
  for (const row of rows) byStatus[String(row.status) as SponsorStatus] = Number(row.n ?? 0)
  return {
    total: Number(totals[0]?.total ?? 0),
    unchecked: Number(totals[0]?.unchecked ?? 0),
    byStatus,
    taggedNotListed: Number(totals[0]?.tagged_not_listed ?? 0),
    tagsApplied: Number(totals[0]?.tags_applied ?? 0),
  }
}

/** Job ids whose company matched the sponsor register exactly. */
export async function registeredSponsorJobIds(ids: number[]): Promise<Set<number>> {
  if (!careerSql || ids.length === 0) return new Set()
  try {
    const rows = await careerSql`
      SELECT job_id FROM skilledjobs.job_sponsor_checks WHERE job_id = ANY(${ids}) AND status = 'licensed'
    `
    return new Set(rows.map((row) => Number(row.job_id)))
  } catch {
    return new Set()
  }
}

/** Set selected jobs back to "Other" (e.g. a sponsorship tag the register does not back up). */
export async function clearVisaTags(ids: number[]): Promise<number> {
  if (!careerSql || ids.length === 0) return 0
  const rows = await careerSql`
    UPDATE skilledjobs.jobs SET visa_type = 'Other'
    WHERE id = ANY(${ids}) AND visa_type IS DISTINCT FROM 'Other'
    RETURNING id
  `
  return rows.length
}

export async function clearCheckResults(): Promise<void> {
  if (!careerSql) return
  await ensureSponsorCheckTables()
  await careerSql`DELETE FROM skilledjobs.job_sponsor_checks`
}
