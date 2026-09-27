import { openaiClient, getAiProvider, getAzureOpenAiConfig } from "@/lib/ai/openai"
import { recordFetchRun } from "./admin-jobs"
import { careerSql } from "./db"
import { clearCompanyIndexCache } from "./sponsors"
import { UK_VISA_TYPE, isOnUkSponsorRegister, ukSponsorJobPlacement } from "./sponsor-check"

export type ExtractedJob = {
  title: string
  company: string
  location: string
  country: string
  description: string
  category: string
  experienceLevel: string
  jobType: string
  visaType: string
  skills: string[]
  url: string
}

const CATEGORIES = ["Technology", "Finance", "Healthcare", "Engineering", "Marketing", "Education", "Other"]
const LEVELS = ["Entry Level", "Mid Level", "Senior Level"]
const TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote", "Fixed-Term Contract", "Apprenticeship"]
const VISAS = ["H-1B (US)", "EU Blue Card", "UK Skilled Worker", "Canada Work Permit", "Australia Skilled Visa", "Other"]

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
const BOT_UA = "EasyMoveZoneJobFetcher/2.0 (+https://easymovezone.com)"

type AtsRef = { type: string; token: string }

function oneOf(value: string | undefined, allowed: string[], fallback: string) {
  const found = allowed.find((item) => item.toLowerCase() === (value ?? "").toLowerCase())
  return found ?? fallback
}

function stripHtmlTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function fetchPageHtml(url: string): Promise<string> {
  let lastError = ""
  for (const ua of [BROWSER_UA, BOT_UA]) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(20000),
      })
      if (response.ok) return await response.text()
      lastError = `${response.status} ${response.statusText}`
      if (![401, 403, 406, 429, 503].includes(response.status)) break
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Request failed"
    }
  }
  throw new Error(`Failed to fetch URL: ${lastError}`)
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

function detectAtsFromUrl(url: string): AtsRef | null {
  let m: RegExpMatchArray | null
  if ((m = url.match(/(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/(?:embed\/job_board\?for=)?([\w-]+)/i)))
    return { type: "greenhouse", token: m[1] }
  if ((m = url.match(/jobs(?:\.eu)?\.lever\.co\/([\w-]+)/i))) return { type: "lever", token: m[1] }
  if ((m = url.match(/jobs\.ashbyhq\.com\/([\w-]+)/i))) return { type: "ashby", token: m[1] }
  if ((m = url.match(/apply\.workable\.com\/([\w-]+)/i))) return { type: "workable", token: m[1] }
  if ((m = url.match(/https?:\/\/([\w-]+)\.recruitee\.com/i))) return { type: "recruitee", token: m[1] }
  if ((m = url.match(/(?:careers|jobs)\.smartrecruiters\.com\/([\w-]+)/i)))
    return { type: "smartrecruiters", token: m[1] }
  return null
}

function detectAtsFromHtml(html: string): AtsRef | null {
  let m: RegExpMatchArray | null
  if ((m = html.match(/(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/(?:embed\/job_board\?for=)?([\w-]+)/i)))
    return { type: "greenhouse", token: m[1] }
  if ((m = html.match(/jobs(?:\.eu)?\.lever\.co\/([\w-]+)/i))) return { type: "lever", token: m[1] }
  if ((m = html.match(/jobs\.ashbyhq\.com\/([\w-]+)/i))) return { type: "ashby", token: m[1] }
  if ((m = html.match(/apply\.workable\.com\/([\w-]+)/i))) return { type: "workable", token: m[1] }
  if ((m = html.match(/([\w-]+)\.recruitee\.com/i))) return { type: "recruitee", token: m[1] }
  if ((m = html.match(/(?:careers|jobs)\.smartrecruiters\.com\/([\w-]+)/i)))
    return { type: "smartrecruiters", token: m[1] }
  return null
}

function mapAtsJob(raw: {
  title?: string
  company?: string
  location?: string
  description?: string
  jobType?: string
  url?: string
}): ExtractedJob {
  return {
    title: raw.title || "Untitled role",
    company: raw.company || "Unknown",
    location: raw.location || "Remote",
    country: "Other",
    description: (raw.description || "").slice(0, 4000),
    category: "Other",
    experienceLevel: "Mid Level",
    jobType: raw.jobType || "Full-time",
    visaType: "Other",
    skills: [],
    url: raw.url || "",
  }
}

async function fetchAtsJobs(ats: AtsRef): Promise<ExtractedJob[] | null> {
  const { type, token } = ats
  if (type === "greenhouse") {
    const data = (await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`)) as {
      jobs?: Array<{ title?: string; location?: { name?: string }; content?: string; absolute_url?: string; updated_at?: string }>
    } | null
    if (!data?.jobs?.length) return null
    const board = (await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${token}`)) as { name?: string } | null
    const company = board?.name || token
    return data.jobs.map((j) =>
      mapAtsJob({
        title: j.title,
        company,
        location: j.location?.name || "Remote",
        description: stripHtmlTags(j.content || ""),
        url: j.absolute_url,
      }),
    )
  }
  if (type === "lever") {
    const data = (await fetchJson(`https://api.lever.co/v0/postings/${token}?mode=json`)) as
      | Array<{
          text?: string
          categories?: { location?: string; commitment?: string }
          descriptionPlain?: string
          description?: string
          hostedUrl?: string
        }>
      | null
    if (!Array.isArray(data) || data.length === 0) return null
    const company = token.charAt(0).toUpperCase() + token.slice(1)
    return data.map((j) =>
      mapAtsJob({
        title: j.text,
        company,
        location: j.categories?.location || "Remote",
        description: j.descriptionPlain || stripHtmlTags(j.description || ""),
        jobType: /part[- ]?time/i.test(j.categories?.commitment || "")
          ? "Part-time"
          : /intern/i.test(j.categories?.commitment || "")
            ? "Internship"
            : /contract/i.test(j.categories?.commitment || "")
              ? "Contract"
              : "Full-time",
        url: j.hostedUrl,
      }),
    )
  }
  if (type === "ashby") {
    const data = (await fetchJson(
      `https://api.ashbyhq.com/posting-api/job-board/${token}?includeCompensation=false`,
    )) as {
      jobs?: Array<{
        title?: string
        location?: string
        isRemote?: boolean
        descriptionHtml?: string
        descriptionPlain?: string
        employmentType?: string
        jobUrl?: string
        applyUrl?: string
      }>
    } | null
    if (!data?.jobs?.length) return null
    const company = token.charAt(0).toUpperCase() + token.slice(1)
    return data.jobs.map((j) =>
      mapAtsJob({
        title: j.title,
        company,
        location: j.location || (j.isRemote ? "Remote" : "Remote"),
        description: stripHtmlTags(j.descriptionHtml || "") || j.descriptionPlain || "",
        jobType: /part/i.test(j.employmentType || "")
          ? "Part-time"
          : /intern/i.test(j.employmentType || "")
            ? "Internship"
            : /contract/i.test(j.employmentType || "")
              ? "Contract"
              : "Full-time",
        url: j.jobUrl || j.applyUrl,
      }),
    )
  }
  if (type === "workable") {
    const data = (await fetchJson(`https://apply.workable.com/api/v1/widget/accounts/${token}`)) as {
      name?: string
      jobs?: Array<{ title?: string; city?: string; country?: string; description?: string; url?: string; shortcode?: string }>
    } | null
    if (!data?.jobs?.length) return null
    const company = data.name || token
    return data.jobs.map((j) =>
      mapAtsJob({
        title: j.title,
        company,
        location: [j.city, j.country].filter(Boolean).join(", ") || "Remote",
        description: stripHtmlTags(j.description || ""),
        url: j.url || `https://apply.workable.com/${token}/j/${j.shortcode}/`,
      }),
    )
  }
  if (type === "recruitee") {
    const data = (await fetchJson(`https://${token}.recruitee.com/api/offers/`)) as {
      offers?: Array<{
        title?: string
        location?: string
        city?: string
        country?: string
        description?: string
        careers_url?: string
      }>
    } | null
    if (!data?.offers?.length) return null
    const company = token.charAt(0).toUpperCase() + token.slice(1)
    return data.offers.map((j) =>
      mapAtsJob({
        title: j.title,
        company,
        location: j.location || [j.city, j.country].filter(Boolean).join(", ") || "Remote",
        description: stripHtmlTags(j.description || ""),
        url: j.careers_url,
      }),
    )
  }
  if (type === "smartrecruiters") {
    const data = (await fetchJson(`https://api.smartrecruiters.com/v1/companies/${token}/postings?limit=100`)) as {
      content?: Array<{
        name?: string
        company?: { name?: string }
        location?: { city?: string; country?: string }
        id?: string
      }>
    } | null
    if (!data?.content?.length) return null
    return data.content.map((j) =>
      mapAtsJob({
        title: j.name,
        company: j.company?.name || token,
        location: [j.location?.city, j.location?.country].filter(Boolean).join(", ") || "Remote",
        url: `https://jobs.smartrecruiters.com/${token}/${j.id}`,
      }),
    )
  }
  return null
}

function extractJsonLdJobs(html: string, pageUrl: string): ExtractedJob[] {
  const found: ExtractedJob[] = []
  const scriptRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null

  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    const obj = node as Record<string, unknown>
    const type = obj["@type"]
    const isJobPosting = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))
    if (isJobPosting && typeof obj.title === "string") {
      const jobLocation = obj.jobLocation as Record<string, unknown> | Array<Record<string, unknown>> | undefined
      const addrSource = Array.isArray(jobLocation) ? jobLocation[0]?.address : jobLocation?.address
      const addr = (addrSource && typeof addrSource === "object" ? addrSource : null) as Record<string, string> | null
      const locParts = addr ? [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean) : []
      const employmentType = String(obj.employmentType || "")
      const hiring = obj.hiringOrganization as { name?: string } | undefined
      found.push(
        mapAtsJob({
          title: obj.title,
          company: hiring?.name || "",
          location: locParts.join(", ") || (obj.jobLocationType === "TELECOMMUTE" ? "Remote" : "Remote"),
          description: stripHtmlTags(String(obj.description || "")),
          jobType: /part/i.test(employmentType)
            ? "Part-time"
            : /intern/i.test(employmentType)
              ? "Internship"
              : /contract|temporary/i.test(employmentType)
                ? "Contract"
                : "Full-time",
          url: typeof obj.url === "string" ? obj.url : pageUrl,
        }),
      )
    }
    if (obj["@graph"]) visit(obj["@graph"])
    if (obj.itemListElement) {
      const items = Array.isArray(obj.itemListElement) ? obj.itemListElement : [obj.itemListElement]
      items.forEach((it) => {
        const item = it && typeof it === "object" && "item" in it ? (it as { item: unknown }).item : it
        visit(item)
      })
    }
  }

  while ((match = scriptRe.exec(html))) {
    try {
      visit(JSON.parse(match[1]))
    } catch {
      /* malformed JSON-LD */
    }
  }
  return found
}

export function extractLinksAndText(html: string, pageUrl: string) {
  const links: Array<{ text: string; href: string }> = []
  const seen = new Set<string>()
  const anchor = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match: RegExpExecArray | null
  const base = new URL(pageUrl)
  while ((match = anchor.exec(html))) {
    const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    if (text.length < 3 || text.length > 180) continue
    let href = match[1]
    try {
      href = new URL(href, base).href
    } catch {
      continue
    }
    if (seen.has(href)) continue
    seen.add(href)
    links.push({ text, href })
  }

  const jobLinkPatterns = /job|career|position|opening|vacanc|role|apply|posting|hire|recruit/i
  const jobLinks = links
    .filter(
      (link) =>
        (jobLinkPatterns.test(link.href) || jobLinkPatterns.test(link.text)) &&
        !/mailto:|tel:|\.(pdf|png|jpg|zip)$|\/(login|signin|register|search|about|contact|privacy|terms)\b/i.test(link.href) &&
        link.href.split("#")[0] !== pageUrl.split("#")[0],
    )
    .slice(0, 80)

  const text = stripHtmlTags(html).slice(0, 10000)
  return { jobLinks, text }
}

async function extractWithAi(
  pageUrl: string,
  text: string,
  jobLinks: Array<{ text: string; href: string }>,
  companyHint: string | null,
): Promise<ExtractedJob[]> {
  if (!openaiClient) return []
  const provider = getAiProvider()
  const azure = getAzureOpenAiConfig()
  const linksText = jobLinks.map((link) => `- "${link.text}" -> ${link.href}`).join("\n")
  const completion = await openaiClient.chat.completions.create({
    model: provider === "azure-openai" ? azure?.deployment ?? "gpt-4o" : "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You are a job listing data extractor. Extract structured job data from webpage text and links. Always return valid JSON in the format { "jobs": [...] }. Each job has: title, company, location, country (full country name or "Remote"/"Other"), description (max 400 words), category, experienceLevel, jobType, visaType, skills (string array), url (specific job posting URL). If no jobs found return { "jobs": [] }.',
      },
      {
        role: "user",
        content: `Company hint: ${companyHint || "unknown"}
Page: ${pageUrl}

category one of: ${CATEGORIES.join(", ")}
experienceLevel one of: ${LEVELS.join(", ")}
jobType one of: ${TYPES.join(", ")}
visaType one of: ${VISAS.join(", ")}
Use a specific job URL from the links. If none match, use ${pageUrl}.

PAGE TEXT:
${text}

LINKS:
${linksText || "(none)"}`,
      },
    ],
    ...(provider === "azure-openai" ? { max_completion_tokens: 4000 } : { max_tokens: 4000 }),
  })
  const content = completion.choices[0]?.message?.content ?? ""
  const parsed = JSON.parse(content) as { jobs?: ExtractedJob[] }
  return Array.isArray(parsed.jobs) ? parsed.jobs : []
}

async function deepCrawlJobLinks(
  jobLinks: Array<{ text: string; href: string }>,
  maxPages: number,
  companyHint: string | null,
): Promise<ExtractedJob[]> {
  const candidates = jobLinks
    .filter((l) => /\/(job|jobs|careers?|position|opening|vacanc|posting)s?[/-]/i.test(l.href) || /\d{4,}/.test(l.href))
    .slice(0, maxPages)
  if (candidates.length === 0) return []

  const results: ExtractedJob[] = []
  const queue = [...candidates]
  const worker = async () => {
    while (queue.length > 0) {
      const link = queue.shift()
      if (!link) return
      try {
        const html = await fetchPageHtml(link.href)
        const ldJobs = extractJsonLdJobs(html, link.href)
        if (ldJobs.length > 0) {
          results.push(...ldJobs.map((j) => ({ ...j, url: j.url || link.href })))
          continue
        }
        const text = stripHtmlTags(html).slice(0, 6000)
        if (text.length < 100) continue
        const jobs = await extractWithAi(
          link.href,
          text,
          [{ text: link.text, href: link.href }],
          companyHint,
        )
        results.push(...jobs.map((j) => ({ ...j, url: j.url || link.href })))
      } catch {
        /* skip failed detail pages */
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, candidates.length) }, () => worker()))
  return results
}

function fallbackFromLinks(pageUrl: string, company: string | null, jobLinks: Array<{ text: string; href: string }>): ExtractedJob[] {
  return jobLinks.slice(0, 25).map((link) => ({
    title: link.text,
    company: company || "Unknown",
    location: "Remote",
    country: "Other",
    description: `Imported from ${pageUrl}`,
    category: "Other",
    experienceLevel: "Mid Level",
    jobType: "Full-time",
    visaType: "Other",
    skills: [],
    url: link.href,
  }))
}

function normalise(job: ExtractedJob, pageUrl: string, companyHint: string | null): ExtractedJob {
  return {
    title: (job.title || "Untitled role").slice(0, 200),
    company: (job.company || companyHint || "Unknown").slice(0, 200),
    location: job.location || "Remote",
    country: job.country || "Other",
    description: (job.description || `Imported from ${pageUrl}`).slice(0, 4000),
    category: oneOf(job.category, CATEGORIES, "Other"),
    experienceLevel: oneOf(job.experienceLevel, LEVELS, "Mid Level"),
    jobType: oneOf(job.jobType, TYPES, "Full-time"),
    visaType: oneOf(job.visaType, VISAS, "Other"),
    skills: Array.isArray(job.skills) ? job.skills.map(String).slice(0, 12) : [],
    url: job.url || pageUrl,
  }
}

async function recordFetchFailure(savedUrlId: number | null | undefined, error: string) {
  if (!careerSql || !savedUrlId) return
  await careerSql`
    UPDATE skilledjobs.saved_job_urls
    SET last_fetched_at = now(), last_fetch_status = 'failed', last_fetch_error = ${error}, last_failed_at = now()
    WHERE id = ${savedUrlId}
  `
}

export type FetchResult = { staged: number; found: number; duplicates: number; method: string }

export async function fetchJobsFromUrl(input: {
  url: string
  company?: string | null
  savedUrlId?: number | null
  source?: string
  createdBy?: string | null
}): Promise<FetchResult> {
  if (!careerSql) throw new Error("Database is not configured")
  const pageUrl = input.url.trim()
  const companyHint = input.company ?? null
  const startedAt = Date.now()
  let method = "none"

  let html = ""
  try {
    // Strategy 1: ATS APIs from the URL itself (no HTML needed)
    const atsFromUrl = detectAtsFromUrl(pageUrl)
    let jobs: ExtractedJob[] = []
    if (atsFromUrl) {
      const atsJobs = await fetchAtsJobs(atsFromUrl)
      if (atsJobs?.length) {
        jobs = atsJobs
        method = `${atsFromUrl.type} API`
      }
    }

    if (jobs.length === 0) {
      html = await fetchPageHtml(pageUrl)

      // Strategy 2: ATS embedded in careers page HTML
      const atsFromHtml = detectAtsFromHtml(html)
      if (atsFromHtml) {
        const atsJobs = await fetchAtsJobs(atsFromHtml)
        if (atsJobs?.length) {
          jobs = atsJobs
          method = `${atsFromHtml.type} API (embedded)`
        }
      }

      // Strategy 3: JSON-LD JobPosting
      if (jobs.length === 0) {
        jobs = extractJsonLdJobs(html, pageUrl)
        if (jobs.length) method = "JSON-LD"
      }

      const { jobLinks, text } = extractLinksAndText(html, pageUrl)

      // Strategy 4: AI extraction from page text + links
      if (jobs.length === 0) {
        try {
          jobs = await extractWithAi(pageUrl, text, jobLinks, companyHint)
          if (jobs.length) method = "AI extraction"
        } catch {
          jobs = []
        }
      }

      // Strategy 5: deep-crawl individual job links
      if (jobs.length === 0 && jobLinks.length > 0) {
        jobs = await deepCrawlJobLinks(jobLinks, 8, companyHint)
        if (jobs.length) method = "deep crawl"
      }

      // Strategy 6: link-text fallback
      if (jobs.length === 0) {
        jobs = fallbackFromLinks(pageUrl, companyHint, jobLinks)
        if (jobs.length) method = "link fallback"
      }
    }

    const clean = jobs
      .map((job) => normalise(job, pageUrl, companyHint))
      .filter((job) => job.title && job.url)

    // Deduplicate by URL
    const seen = new Set<string>()
    const unique = clean.filter((job) => {
      const key = job.url.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const fromUkSponsor =
      input.source === "sponsor" || (await isOnUkSponsorRegister(companyHint ?? unique[0]?.company ?? null))
    if (fromUkSponsor) {
      for (const job of unique) {
        const placement = ukSponsorJobPlacement(job)
        if (placement.country) job.country = placement.country
        if (placement.tag && (!job.visaType || job.visaType === "Other")) job.visaType = UK_VISA_TYPE
      }
    }

    let staged = 0
    const createdBy = input.source === "bulk" || input.source === "sponsor" ? "Bulk Fetcher" : "Job Fetcher"
    for (const job of unique) {
      const inserted = await careerSql`
        INSERT INTO skilledjobs.staged_jobs (
          title, company, location, description, category, experience_level, job_type, visa_type,
          skills, url, posted_at, status, created_by, country
        )
        SELECT ${job.title}, ${job.company}, ${job.location}, ${job.description}, ${job.category},
               ${job.experienceLevel}, ${job.jobType}, ${job.visaType}, ${job.skills}, ${job.url},
               now(), 'pending', ${createdBy}, ${job.country}
        WHERE NOT EXISTS (SELECT 1 FROM skilledjobs.jobs WHERE url = ${job.url})
          AND NOT EXISTS (SELECT 1 FROM skilledjobs.staged_jobs WHERE url = ${job.url} AND status = 'pending')
        RETURNING id
      `
      staged += inserted.length
    }
    const duplicates = unique.length - staged

    if (input.savedUrlId) {
      await careerSql`
        UPDATE skilledjobs.saved_job_urls
        SET last_fetched_at = now(),
            last_fetch_status = 'success',
            last_fetch_error = null,
            company = coalesce(company, ${companyHint ?? unique[0]?.company ?? null})
        WHERE id = ${input.savedUrlId}
      `
    }
    clearCompanyIndexCache()
    await recordFetchRun({
      savedUrlId: input.savedUrlId,
      company: companyHint ?? unique[0]?.company ?? null,
      url: pageUrl,
      source: input.source,
      status: "success",
      found: unique.length,
      staged,
      duplicates,
      method,
      durationMs: Date.now() - startedAt,
      createdBy: input.createdBy,
    })
    return { staged, found: unique.length, duplicates, method }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed"
    await recordFetchFailure(input.savedUrlId, message)
    await recordFetchRun({
      savedUrlId: input.savedUrlId,
      company: companyHint,
      url: pageUrl,
      source: input.source,
      status: "failed",
      method,
      error: message,
      durationMs: Date.now() - startedAt,
      createdBy: input.createdBy,
    })
    throw error
  }
}
