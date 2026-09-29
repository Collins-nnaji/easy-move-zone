import { chatJson } from "@/lib/ai/openai"
import { careerSql } from "./db"
import { companyKey } from "./company-match"
import {
  buildSponsorSearchIndex,
  closeCandidates,
  confidentCloseMatch,
  fallbackVerdict,
  verdictFromAi,
  type SponsorSearchIndex,
} from "./sponsor-similarity"

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
    await sql`
      CREATE TABLE IF NOT EXISTS skilledjobs.company_sponsor_matches (
        register_id text NOT NULL,
        company_norm text NOT NULL,
        status text NOT NULL,
        matched_name text,
        exact boolean NOT NULL DEFAULT false,
        checked_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (register_id, company_norm)
      )
    `
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
  if (input.replace) {
    await careerSql`DELETE FROM skilledjobs.sponsor_register_entries WHERE list_id = ${id}`
    await careerSql`DELETE FROM skilledjobs.company_sponsor_matches WHERE register_id = ${id}`
  }

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
  await careerSql`DELETE FROM skilledjobs.company_sponsor_matches WHERE register_id = ${id}`
  indexCache.delete(id)
}

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

type RegisterIndex = { at: number; byKey: Map<string, string>; sortedKeys: string[]; search: SponsorSearchIndex }
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
  const sortedKeys = [...byKey.keys()].sort()
  const index = { at: Date.now(), byKey, sortedKeys, search: buildSponsorSearchIndex(byKey, sortedKeys) }
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

type CompanyDecision = {
  status: "licensed" | "likely" | "not_listed"
  name: string | null
  exact: boolean
}

const companyNorm = (company: string) => company.trim().toLowerCase()

type AiCompany = { id: string; company: string; candidates: ReturnType<typeof closeCandidates> }

/** Ask the model which close register names are the same organisation. One batch per call. */
async function judgeCloseCompanies(rows: AiCompany[]): Promise<Map<string, { status: "likely" | "not_listed"; name: string | null }>> {
  const out = new Map<string, { status: "likely" | "not_listed"; name: string | null }>()
  for (let i = 0; i < rows.length; i += 25) {
    const chunk = rows.slice(i, i + 25)
    const fallback = { results: [] as Array<{ id?: string; verdict?: string; name?: string | null }> }
    const ai = await chatJson<typeof fallback>(
      `You match job-board employer names to an official visa sponsor register.
The job name is often shorter, reordered, misspelled, or missing a legal suffix. It can also be a different organisation that only shares a word.
For each item choose one verdict:
- match: the same organisation, written differently
- likely: the same group, such as a parent, subsidiary, or regional company, but not clearly the same legal entity
- none: a different organisation
name must be copied exactly from that item's candidates, or null when the verdict is none.
Return JSON only: {"results":[{"id":"...","verdict":"match","name":"..."}]}`,
      JSON.stringify(chunk.map((row) => ({
        id: row.id,
        company: row.company,
        candidates: row.candidates.map((candidate) => candidate.name),
      }))),
      fallback,
      { maxTokens: 1800, temperature: 0 },
    )
    const byId = new Map((ai.results ?? []).map((row) => [String(row.id ?? ""), row]))
    for (const row of chunk) {
      const judged = byId.get(row.id)
      const parsed = judged ? verdictFromAi(judged.verdict, judged.name, row.candidates) : null
      out.set(row.id, parsed ?? fallbackVerdict(row.candidates))
    }
  }
  return out
}

/** Exact names stay licensed. Close names become likely, with AI judging the ambiguous ones. */
async function decideFresh(companies: string[], registerId: string): Promise<{ decisions: Map<string, CompanyDecision>; aiReviewed: number }> {
  const index = await registerIndex(registerId)
  const decisions = new Map<string, CompanyDecision>()
  const pending: AiCompany[] = []
  companies.forEach((company, i) => {
    const hit = matchRegister(company, index)
    if (hit) {
      decisions.set(companyNorm(company), { status: hit.status, name: hit.name, exact: hit.status === "licensed" })
      return
    }
    const candidates = closeCandidates(company, index.search)
    const strong = confidentCloseMatch(candidates)
    if (strong) {
      decisions.set(companyNorm(company), { status: "likely", name: strong.name, exact: false })
      return
    }
    if (candidates.length) pending.push({ id: String(i), company, candidates })
    else decisions.set(companyNorm(company), { status: "not_listed", name: null, exact: false })
  })
  const judged = await judgeCloseCompanies(pending)
  for (const row of pending) {
    const result = judged.get(row.id) ?? fallbackVerdict(row.candidates)
    decisions.set(companyNorm(row.company), { status: result.status, name: result.name, exact: false })
  }
  return { decisions, aiReviewed: pending.length }
}

async function saveCompanyDecisions(registerId: string, decisions: Map<string, CompanyDecision>): Promise<void> {
  if (!careerSql || decisions.size === 0) return
  const rows = [...decisions.entries()]
  await careerSql`
    INSERT INTO skilledjobs.company_sponsor_matches (register_id, company_norm, status, matched_name, exact, checked_at)
    SELECT ${registerId}, u.company_norm, u.status, u.matched_name, u.exact, now()
    FROM unnest(
      ${rows.map(([norm]) => norm)}::text[],
      ${rows.map(([, decision]) => decision.status)}::text[],
      ${rows.map(([, decision]) => decision.name)}::text[],
      ${rows.map(([, decision]) => decision.exact)}::boolean[]
    ) AS u(company_norm, status, matched_name, exact)
    ON CONFLICT (register_id, company_norm) DO UPDATE SET
      status = EXCLUDED.status,
      matched_name = EXCLUDED.matched_name,
      exact = EXCLUDED.exact,
      checked_at = now()
  `
}

/**
 * One decision per distinct company name on a register.
 * A full recheck ignores saved decisions and asks again.
 */
async function matchCompaniesOnRegister(
  registerId: string,
  companies: string[],
  refresh: boolean,
): Promise<{ decisions: Map<string, CompanyDecision>; aiReviewed: number }> {
  const unique = [...new Set(companies.map((company) => company.trim()).filter((company) => company && company.toLowerCase() !== "unknown"))]
  const decisions = new Map<string, CompanyDecision>()
  let todo = unique
  if (!refresh && careerSql && unique.length) {
    const cached = await careerSql`
      SELECT company_norm, status, matched_name, exact
      FROM skilledjobs.company_sponsor_matches
      WHERE register_id = ${registerId} AND company_norm = ANY(${unique.map(companyNorm)})
    `
    const known = new Map(cached.map((row) => [String(row.company_norm), row]))
    todo = []
    for (const company of unique) {
      const row = known.get(companyNorm(company))
      const status = row ? String(row.status) : ""
      if (row && (status === "licensed" || status === "likely" || status === "not_listed")) {
        decisions.set(companyNorm(company), {
          status: status as CompanyDecision["status"],
          name: row.matched_name ? String(row.matched_name) : null,
          exact: Boolean(row.exact),
        })
      } else todo.push(company)
    }
  }
  if (!todo.length) return { decisions, aiReviewed: 0 }
  const fresh = await decideFresh(todo, registerId)
  await saveCompanyDecisions(registerId, fresh.decisions)
  for (const [norm, decision] of fresh.decisions) decisions.set(norm, decision)
  return { decisions, aiReviewed: fresh.aiReviewed }
}

/** Check jobs against the register for their country, save the flag, and tag exact matches that are untagged. */
export async function checkJobSponsors(ids: number[], opts: { applyTags?: boolean } = {}): Promise<SponsorCheckResult[]> {
  if (!careerSql || ids.length === 0) return []
  await ensureSponsorCheckTables()
  const applyTags = opts.applyTags ?? true
  const [jobs, registers] = await Promise.all([
    careerSql`SELECT id, company, country, visa_type FROM skilledjobs.jobs WHERE id = ANY(${ids})`,
    registersByCountry(),
  ])

  const prepared: Array<{
    jobId: number
    company: string | null
    country: string | null
    visaType: string | null
    register: RegisterDef | undefined
  }> = []
  const pending = new Map<string, string[]>()
  for (const job of jobs) {
    const company = job.company ? String(job.company).trim() : null
    const country = job.country ? String(job.country).trim() : null
    const register = country ? registers.get(country.toLowerCase()) : undefined
    prepared.push({ jobId: Number(job.id), company, country, visaType: job.visa_type ? String(job.visa_type) : null, register })
    if (register && company && company.toLowerCase() !== "unknown") {
      pending.set(register.id, [...(pending.get(register.id) ?? []), company])
    }
  }

  const matched = new Map<string, Map<string, CompanyDecision>>()
  for (const [registerId, companies] of pending) {
    const { decisions } = await matchCompaniesOnRegister(registerId, companies, true)
    matched.set(registerId, decisions)
  }

  const results: SponsorCheckResult[] = prepared.map((job) => {
    const base = {
      jobId: job.jobId,
      company: job.company,
      country: job.country,
      registerId: job.register?.id ?? null,
      matchedName: null as string | null,
      tagApplied: null as string | null,
    }
    if (!job.register) return { ...base, status: "no_register" as const }
    if (!job.company || job.company.toLowerCase() === "unknown") return { ...base, status: "no_company" as const }
    const decision = matched.get(job.register.id)?.get(companyNorm(job.company))
    const tag = decision?.exact && applyTags && job.register.visaType && isUntagged(job.visaType) ? job.register.visaType : null
    return {
      ...base,
      status: decision?.status ?? "not_listed",
      matchedName: decision?.name ?? null,
      tagApplied: tag,
    }
  })

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

function countriesForFilter(country: string | null | undefined): string[] | null {
  const value = country?.trim().toLowerCase() || null
  if (!value) return null
  if (UK_REGISTER.countries.some((name) => name.toLowerCase() === value)) {
    return UK_REGISTER.countries.map((name) => name.toLowerCase())
  }
  return [value]
}

export type DistinctSponsorCheck = {
  companies: number
  jobs: number
  remaining: number
  licensed: number
  likely: number
  notListed: number
  tagged: number
  aiReviewed: number
}

/**
 * Check distinct company names, not every job. Exact register names stay "licensed".
 * Similar names are shortlisted from the register and judged by AI as "likely".
 * The decision is then written onto every pending job for that company and country.
 */
export async function checkDistinctSponsors(opts: {
  limit?: number
  before?: string | null
  country?: string | null
  applyTags?: boolean
} = {}): Promise<DistinctSponsorCheck> {
  const empty: DistinctSponsorCheck = {
    companies: 0, jobs: 0, remaining: 0, licensed: 0, likely: 0, notListed: 0, tagged: 0, aiReviewed: 0,
  }
  if (!careerSql) return empty
  await ensureSponsorCheckTables()
  const limit = Math.min(Math.max(opts.limit ?? 40, 1), 80)
  const before = opts.before || null
  const applyTags = opts.applyTags ?? true
  const countries = countriesForFilter(opts.country)

  const [groups, counts] = await Promise.all([
    careerSql`
      SELECT
        lower(trim(coalesce(j.company, ''))) AS norm,
        min(nullif(trim(j.company), '')) AS company,
        lower(trim(coalesce(j.country, ''))) AS country_norm,
        min(nullif(trim(j.country), '')) AS country,
        count(*)::int AS jobs
      FROM skilledjobs.jobs j
      LEFT JOIN skilledjobs.job_sponsor_checks c ON c.job_id = j.id
      WHERE (c.job_id IS NULL OR (${before}::timestamptz IS NOT NULL AND c.checked_at < ${before}::timestamptz))
        AND (${countries}::text[] IS NULL OR lower(trim(coalesce(j.country, ''))) = ANY(${countries}))
      GROUP BY 1, 3
      ORDER BY count(*) DESC, 1
      LIMIT ${limit}
    `,
    careerSql`
      SELECT count(*)::int AS n
      FROM (
        SELECT 1
        FROM skilledjobs.jobs j
        LEFT JOIN skilledjobs.job_sponsor_checks c ON c.job_id = j.id
        WHERE (c.job_id IS NULL OR (${before}::timestamptz IS NOT NULL AND c.checked_at < ${before}::timestamptz))
          AND (${countries}::text[] IS NULL OR lower(trim(coalesce(j.country, ''))) = ANY(${countries}))
        GROUP BY lower(trim(coalesce(j.company, ''))), lower(trim(coalesce(j.country, '')))
      ) groups
    `,
  ])
  if (!groups.length) return empty

  const registers = await registersByCountry()
  type Planned = {
    norm: string
    company: string | null
    countryNorm: string
    country: string | null
    jobs: number
    status: SponsorStatus
    registerId: string | null
    matchedName: string | null
    visaTag: string | null
  }
  const planned: Planned[] = []
  const byRegister = new Map<string, string[]>()
  for (const row of groups) {
    const company = row.company ? String(row.company).trim() : null
    const country = row.country ? String(row.country).trim() : null
    const register = country ? registers.get(country.toLowerCase()) : undefined
    const group: Planned = {
      norm: String(row.norm ?? ""),
      company,
      countryNorm: String(row.country_norm ?? ""),
      country,
      jobs: Number(row.jobs ?? 0),
      status: "not_listed",
      registerId: register?.id ?? null,
      matchedName: null,
      visaTag: null,
    }
    if (!register) group.status = "no_register"
    else if (!company || company.toLowerCase() === "unknown") group.status = "no_company"
    else byRegister.set(register.id, [...(byRegister.get(register.id) ?? []), company])
    planned.push(group)
  }

  let aiReviewed = 0
  const decisionsByRegister = new Map<string, Map<string, CompanyDecision>>()
  for (const [registerId, companies] of byRegister) {
    const matched = await matchCompaniesOnRegister(registerId, companies, Boolean(before))
    decisionsByRegister.set(registerId, matched.decisions)
    aiReviewed += matched.aiReviewed
  }
  for (const group of planned) {
    if (!group.registerId || !group.company) continue
    const decision = decisionsByRegister.get(group.registerId)?.get(companyNorm(group.company))
    if (!decision) continue
    group.status = decision.status
    group.matchedName = decision.name
    const register = group.country ? registers.get(group.country.toLowerCase()) : undefined
    if (decision.exact && applyTags && register?.visaType) group.visaTag = register.visaType
  }

  const written = await careerSql`
    INSERT INTO skilledjobs.job_sponsor_checks (job_id, status, register_id, matched_name, company, tag_applied, checked_at)
    SELECT j.id, u.status, u.register_id, u.matched_name, coalesce(nullif(trim(j.company), ''), u.company),
           CASE
             WHEN u.visa_tag IS NOT NULL AND (j.visa_type IS NULL OR trim(j.visa_type) IN ('', 'Other')) THEN u.visa_tag
             ELSE NULL
           END,
           now()
    FROM skilledjobs.jobs j
    JOIN unnest(
      ${planned.map((group) => group.norm)}::text[],
      ${planned.map((group) => group.countryNorm)}::text[],
      ${planned.map((group) => group.status)}::text[],
      ${planned.map((group) => group.registerId)}::text[],
      ${planned.map((group) => group.matchedName)}::text[],
      ${planned.map((group) => group.company)}::text[],
      ${planned.map((group) => group.visaTag)}::text[]
    ) AS u(norm, country_norm, status, register_id, matched_name, company, visa_tag)
      ON lower(trim(coalesce(j.company, ''))) = u.norm
     AND lower(trim(coalesce(j.country, ''))) = u.country_norm
    WHERE (
      NOT EXISTS (SELECT 1 FROM skilledjobs.job_sponsor_checks c WHERE c.job_id = j.id)
      OR (${before}::timestamptz IS NOT NULL AND EXISTS (
        SELECT 1 FROM skilledjobs.job_sponsor_checks c
        WHERE c.job_id = j.id AND c.checked_at < ${before}::timestamptz
      ))
    )
    ON CONFLICT (job_id) DO UPDATE SET
      status = EXCLUDED.status,
      register_id = EXCLUDED.register_id,
      matched_name = EXCLUDED.matched_name,
      company = EXCLUDED.company,
      tag_applied = coalesce(EXCLUDED.tag_applied, skilledjobs.job_sponsor_checks.tag_applied),
      checked_at = now()
    RETURNING job_id, tag_applied
  `

  const taggedIds = written.filter((row) => row.tag_applied).map((row) => Number(row.job_id))
  let tagged = 0
  if (taggedIds.length) {
    const taggedRows = await careerSql`
      UPDATE skilledjobs.jobs j
      SET visa_type = c.tag_applied
      FROM skilledjobs.job_sponsor_checks c
      WHERE j.id = c.job_id
        AND j.id = ANY(${taggedIds})
        AND (j.visa_type IS NULL OR trim(j.visa_type) IN ('', 'Other'))
      RETURNING j.id
    `
    tagged = taggedRows.length
  }

  const jobsWith = (status: SponsorStatus) =>
    planned.filter((group) => group.status === status).reduce((sum, group) => sum + group.jobs, 0)

  return {
    companies: planned.length,
    jobs: written.length,
    remaining: Math.max(Number(counts[0]?.n ?? 0) - planned.length, 0),
    licensed: jobsWith("licensed"),
    likely: jobsWith("likely"),
    notListed: jobsWith("not_listed"),
    tagged,
    aiReviewed,
  }
}

export async function sponsorCheckSummary(): Promise<{
  total: number
  unchecked: number
  uncheckedCompanies: number
  byStatus: Record<SponsorStatus, number>
  taggedNotListed: number
  tagsApplied: number
}> {
  const empty = { licensed: 0, likely: 0, not_listed: 0, no_register: 0, no_company: 0 }
  if (!careerSql) return { total: 0, unchecked: 0, uncheckedCompanies: 0, byStatus: empty, taggedNotListed: 0, tagsApplied: 0 }
  await ensureSponsorCheckTables()
  const [rows, totals, companyTotals] = await Promise.all([
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
    careerSql`
      SELECT count(*)::int AS n
      FROM (
        SELECT 1
        FROM skilledjobs.jobs j
        LEFT JOIN skilledjobs.job_sponsor_checks c ON c.job_id = j.id
        WHERE c.job_id IS NULL
        GROUP BY lower(trim(coalesce(j.company, ''))), lower(trim(coalesce(j.country, '')))
      ) groups
    `,
  ])
  const byStatus = { ...empty }
  for (const row of rows) byStatus[String(row.status) as SponsorStatus] = Number(row.n ?? 0)
  return {
    total: Number(totals[0]?.total ?? 0),
    unchecked: Number(totals[0]?.unchecked ?? 0),
    uncheckedCompanies: Number(companyTotals[0]?.n ?? 0),
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
  await careerSql`DELETE FROM skilledjobs.company_sponsor_matches`
}
