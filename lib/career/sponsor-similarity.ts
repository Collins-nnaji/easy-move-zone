import { companyKey } from "./company-match"

/**
 * Words that show up in many unrelated employer names. They must not
 * be enough, on their own, to call two companies the same.
 */
const GENERIC_TOKENS = new Set([
  "bank", "banks", "royal", "national", "university", "college", "hospital", "hospitals",
  "health", "care", "digital", "solutions", "consulting", "partners", "partner", "capital",
  "energy", "media", "tech", "technology", "data", "software", "systems", "system", "trust",
  "foundation", "council", "authority", "office", "labs", "lab", "studio", "studios",
  "ventures", "venture", "british", "london", "city", "north", "south", "east", "west",
  "new", "first", "general", "public", "private", "management", "financial", "finance",
  "insurance", "properties", "property", "construction", "engineering", "recruitment",
])

const PREFIX_BUCKET_CAP = 1500
const TOKEN_LIST_CAP = 500

export type SponsorSearchIndex = {
  byKey: Map<string, string>
  sortedKeys: string[]
  byPrefix3: Map<string, string[]>
  byToken: Map<string, string[]>
  byInitials: Map<string, string[]>
  compactToKey: Map<string, string>
}

export type CloseCandidate = { name: string; key: string; score: number }

const compact = (key: string) => key.replace(/ /g, "")

export function buildSponsorSearchIndex(byKey: Map<string, string>, sortedKeys: string[]): SponsorSearchIndex {
  const byPrefix3 = new Map<string, string[]>()
  const byToken = new Map<string, string[]>()
  const byInitials = new Map<string, string[]>()
  const compactToKey = new Map<string, string>()
  const overflowTokens = new Set<string>()

  for (const key of sortedKeys) {
    const collapsed = compact(key)
    if (collapsed.length >= 3 && !compactToKey.has(collapsed)) compactToKey.set(collapsed, key)
    if (collapsed.length >= 3) {
      const prefix = collapsed.slice(0, 3)
      const bucket = byPrefix3.get(prefix)
      if (!bucket) byPrefix3.set(prefix, [key])
      else if (bucket.length < PREFIX_BUCKET_CAP) bucket.push(key)
    }
    for (const token of key.split(" ")) {
      if (token.length < 4 || GENERIC_TOKENS.has(token) || overflowTokens.has(token)) continue
      const list = byToken.get(token)
      if (!list) byToken.set(token, [key])
      else if (list.length < TOKEN_LIST_CAP) list.push(key)
      else {
        overflowTokens.add(token)
        byToken.delete(token)
      }
    }
    const tokens = key.split(" ")
    if (tokens.length >= 2) {
      const initials = tokens.map((token) => token[0]).join("")
      if (initials.length >= 2 && initials.length <= 6) {
        const list = byInitials.get(initials)
        if (!list) byInitials.set(initials, [key])
        else if (list.length < 40) list.push(key)
      }
    }
  }

  return { byKey, sortedKeys, byPrefix3, byToken, byInitials, compactToKey }
}

function tokensOf(key: string): string[] {
  return key.split(" ").filter((token) => token.length >= 3)
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const gap = Math.abs(a.length - b.length)
  if (gap > 8 || a.length > 48 || b.length > 48) return 99
  let prev = Array.from({ length: b.length + 1 }, (_, index) => index)
  let curr = new Array<number>(b.length + 1)
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i
    let rowMin = curr[0]
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
      if (curr[j] < rowMin) rowMin = curr[j]
    }
    if (rowMin > 8) return rowMin
    ;[prev, curr] = [curr, prev]
  }
  return prev[b.length]
}

/** True when `shortKey` is the initials of the longer multi-word name. */
function isInitials(shortKey: string, longKey: string): boolean {
  if (shortKey.includes(" ")) return false
  const tokens = longKey.split(" ")
  if (tokens.length < 2) return false
  return tokens.map((token) => token[0]).join("") === compact(shortKey)
}

/** 0–1 likeness of two collapsed company keys. Generic shared words score low. */
export function scoreCompanyKeys(query: string, candidate: string): number {
  if (query === candidate) return 1
  const qa = compact(query)
  const qb = compact(candidate)
  if (qa === qb && qa.length >= 3) return 0.96
  if (isInitials(query, candidate) || isInitials(candidate, query)) {
    const initials = query.includes(" ") ? compact(candidate) : qa
    return initials.length >= 3 ? 0.9 : 0.78
  }
  if (qa.length < 3 || qb.length < 3) return 0

  let score = 0

  const shorter = qa.length <= qb.length ? qa : qb
  const longer = qa.length <= qb.length ? qb : qa
  if (shorter.length >= 4 && !GENERIC_TOKENS.has(shorter) && longer.startsWith(shorter)) {
    score = Math.max(score, shorter.length >= 6 ? 0.86 : 0.8)
  }

  const distance = levenshtein(qa, qb)
  const maxLen = Math.max(qa.length, qb.length)
  if (distance <= 2 && Math.min(qa.length, qb.length) >= 6) {
    score = Math.max(score, 1 - distance / maxLen)
  }

  const queryTokens = tokensOf(query)
  const candidateTokens = tokensOf(candidate)
  if (queryTokens.length && candidateTokens.length) {
    const candidateSet = new Set(candidateTokens)
    const shared = queryTokens.filter((token) => candidateSet.has(token) && !GENERIC_TOKENS.has(token))
    if (shared.length) {
      const union = new Set([...queryTokens, ...candidateTokens]).size
      score = Math.max(score, shared.length / union)
    }
  }
  return score
}

/** Register names close enough to be worth a decision. Exact keys are left to the exact matcher. */
export function closeCandidates(company: string, index: SponsorSearchIndex, limit = 4): CloseCandidate[] {
  const key = companyKey(company)
  if (key.length < 2) return []
  const best = new Map<string, number>()
  const consider = (candidateKey: string | undefined) => {
    if (!candidateKey || candidateKey === key) return
    const score = scoreCompanyKeys(key, candidateKey)
    if (score < 0.45) return
    const prev = best.get(candidateKey)
    if (prev == null || score > prev) best.set(candidateKey, score)
  }

  const collapsed = compact(key)
  consider(index.compactToKey.get(collapsed))

  if (collapsed.length >= 3) {
    const bucket = index.byPrefix3.get(collapsed.slice(0, 3)) ?? []
    if (bucket.length < PREFIX_BUCKET_CAP) {
      for (const candidateKey of bucket) consider(candidateKey)
    }
  }

  for (const token of key.split(" ")) {
    if (token.length < 4 || GENERIC_TOKENS.has(token)) continue
    for (const candidateKey of index.byToken.get(token) ?? []) consider(candidateKey)
  }

  if (!key.includes(" ") && collapsed.length >= 2 && collapsed.length <= 6) {
    for (const candidateKey of index.byInitials.get(collapsed) ?? []) consider(candidateKey)
  } else {
    const initials = key.split(" ").map((token) => token[0]).join("")
    consider(index.compactToKey.get(initials))
  }

  return [...best.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([candidateKey, score]) => ({
      key: candidateKey,
      name: index.byKey.get(candidateKey) ?? candidateKey,
      score,
    }))
}

/**
 * A single candidate far enough ahead, or a near-identical spelling, can be
 * accepted without a model. Anything ambiguous is left for AI.
 */
export function confidentCloseMatch(candidates: CloseCandidate[]): CloseCandidate | null {
  const best = candidates[0]
  if (!best || best.score < 0.84) return null
  const second = candidates[1]
  if (second && best.score - second.score < 0.08 && best.score < 0.96) return null
  return best
}

export function verdictFromAi(
  verdict: unknown,
  registerName: unknown,
  candidates: CloseCandidate[],
): { status: "likely"; name: string } | { status: "not_listed"; name: null } | null {
  const allowed = new Map(candidates.map((candidate) => [candidate.name.toLowerCase(), candidate.name]))
  const name = typeof registerName === "string" ? allowed.get(registerName.trim().toLowerCase()) : undefined
  if (verdict === "none") return { status: "not_listed", name: null }
  if ((verdict === "match" || verdict === "likely") && name) return { status: "likely", name }
  return null
}

/** Used when AI is off or returns something we cannot trust. */
export function fallbackVerdict(candidates: CloseCandidate[]): { status: "likely"; name: string } | { status: "not_listed"; name: null } {
  const best = candidates[0]
  if (best && best.score >= 0.72) return { status: "likely", name: best.name }
  return { status: "not_listed", name: null }
}
