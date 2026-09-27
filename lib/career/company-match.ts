const LEGAL_WORDS =
  /\b(limited|ltd|llc|llp|plc|inc|incorporated|uk|the|and|company|co|group|holdings|holding|services|service|international|global)\b/g

/** Collapse a legal employer name so "GOOGLE UK LIMITED" and "Google" can meet. */
export function companyKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(LEGAL_WORDS, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export type CompanyIndexEntry = {
  key: string
  name: string
  jobCount: number
  latestUrl: string | null
  /** Careers page saved by the job fetcher, when this employer has one. */
  savedCareerUrl: string | null
}

/**
 * Match a licensed sponsor to an employer we already have jobs for.
 * A longer shared name wins, so "Royal Mail" beats a bare "Royal".
 */
export function matchSponsorCompany(
  sponsorName: string,
  entries: CompanyIndexEntry[],
): CompanyIndexEntry | null {
  const key = companyKey(sponsorName)
  if (key.length < 3) return null

  let best: { entry: CompanyIndexEntry; score: number } | null = null
  for (const entry of entries) {
    if (entry.key.length < 4) continue
    let score = 0
    if (entry.key === key) score = 1000 + entry.key.length
    else if (key.startsWith(`${entry.key} `) || entry.key.startsWith(`${key} `)) score = entry.key.length
    else continue

    if (
      !best ||
      score > best.score ||
      (score === best.score && entry.jobCount > best.entry.jobCount)
    ) {
      best = { entry, score }
    }
  }
  return best?.entry ?? null
}

/** The employer's own site, taken from a real job URL we hold for them. */
export function careerSiteFromJobUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (!parsed.hostname) return null
    const host = parsed.hostname.toLowerCase()
    const segments = parsed.pathname.split("/").filter(Boolean)
    const boardDepth = ATS_BOARD_DEPTH.find(([suffix]) => host === suffix || host.endsWith(`.${suffix}`))?.[1]
    if (boardDepth && segments.length >= boardDepth) {
      return `${parsed.origin}/${segments.slice(0, boardDepth).join("/")}`
    }
    return parsed.origin
  } catch {
    return null
  }
}

/** Shared job-board hosts where the company's board lives under the first path segment(s). */
const ATS_BOARD_DEPTH: Array<[string, number]> = [
  ["greenhouse.io", 1],
  ["ashbyhq.com", 1],
  ["lever.co", 1],
  ["smartrecruiters.com", 1],
  ["workable.com", 1],
  ["careerpuck.com", 2],
]
