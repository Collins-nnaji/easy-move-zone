import { jobsByIds, recordUrlCheck } from "./admin-jobs"

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

const GONE_PATTERNS = [
  /no longer (?:available|accepting|open|active)/i,
  /(?:job|position|vacancy|role|posting) (?:has been|is) (?:filled|closed|expired|removed)/i,
  /(?:job|position|vacancy|posting) (?:not found|does not exist|has expired)/i,
  /this (?:job|position|vacancy|posting) (?:is )?(?:closed|expired)/i,
  /applications? (?:are |is )?(?:now )?closed/i,
  /sorry,? (?:the|this) (?:job|page) (?:you (?:are|were) looking for )?(?:is|was|has been)? ?(?:not found|no longer)/i,
]

export type UrlCheckResult = {
  id: number
  title: string
  company: string | null
  url: string
  status: string
  isValid: boolean
  contentAvailable: boolean
  error: string | null
}

async function checkOne(url: string): Promise<Omit<UrlCheckResult, "id" | "title" | "company" | "url">> {
  if (!url) return { status: "no-url", isValid: false, contentAvailable: false, error: "No URL" }
  const headers = { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Language": "en-GB,en;q=0.9" }
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow", headers, signal: AbortSignal.timeout(6000) }).catch(() => null)
    if (head && [404, 410].includes(head.status)) {
      return { status: String(head.status), isValid: false, contentAvailable: false, error: `HTTP ${head.status}` }
    }
    const response = await fetch(url, { method: "GET", redirect: "follow", headers, signal: AbortSignal.timeout(8000) })
    const status = response.status
    if (status < 200 || status >= 400) {
      return { status: String(status), isValid: false, contentAvailable: false, error: `HTTP ${status}` }
    }
    const type = response.headers.get("content-type") ?? ""
    if (!type.includes("html")) return { status: String(status), isValid: true, contentAvailable: true, error: null }
    const html = (await response.text()).slice(0, 200_000)
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")
    const gone = GONE_PATTERNS.some((pattern) => pattern.test(text))
    return {
      status: String(status),
      isValid: !gone,
      contentAvailable: !gone,
      error: gone ? "Job content no longer available" : null,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed"
    const timeout = /timeout|aborted/i.test(message)
    return { status: timeout ? "timeout" : "error", isValid: false, contentAvailable: false, error: message.slice(0, 200) }
  }
}

/** Checks up to ~15 job URLs concurrently and records each result in url_validation_history. */
export async function checkJobUrls(ids: number[]): Promise<UrlCheckResult[]> {
  const jobs = await jobsByIds(ids.slice(0, 15))
  return Promise.all(
    jobs.map(async (job) => {
      const url = String(job.url ?? "").trim()
      const result = await checkOne(url)
      await recordUrlCheck(Number(job.id), url, result.status, result.isValid, result.contentAvailable, result.error).catch(() => {})
      return {
        id: Number(job.id),
        title: String(job.title ?? ""),
        company: (job.company as string | null) ?? null,
        url,
        ...result,
      }
    }),
  )
}
