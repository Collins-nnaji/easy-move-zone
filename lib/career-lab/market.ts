import { careerSql } from "@/lib/career/db"

export type MarketSnapshot = {
  targetRole: string
  totalVacancies: number
  sponsorVacancies: number
  skillDemand: Array<{ skill: string; count: number; pct: number }>
  sampleTitles: string[]
}

function normalizeSkill(raw: string): string {
  return raw.trim().replace(/\s+/g, " ")
}

function skillKey(raw: string): string {
  return normalizeSkill(raw).toLowerCase()
}

/** Build ILIKE patterns for a target role / query. */
function rolePatterns(role: string): string[] {
  const cleaned = role.trim()
  if (!cleaned) return []
  const parts = cleaned.split(/\s+/).filter((part) => part.length > 2)
  const patterns = [`%${cleaned}%`]
  if (parts.length >= 2) patterns.push(`%${parts[parts.length - 1]}%`)
  return patterns.slice(0, 3)
}

export async function analyseTargetMarket(targetRole: string, limitJobs = 800): Promise<MarketSnapshot | null> {
  if (!careerSql) return null
  const patterns = rolePatterns(targetRole)
  if (!patterns.length) {
    return { targetRole, totalVacancies: 0, sponsorVacancies: 0, skillDemand: [], sampleTitles: [] }
  }

  // Match title/category against role patterns; pull skills for demand.
  const rows = await careerSql`
    SELECT title, skills, visa_type, category
    FROM skilledjobs.jobs
    WHERE (
      title ILIKE ${patterns[0]}
      OR coalesce(category, '') ILIKE ${patterns[0]}
      OR (${patterns[1] ?? null}::text IS NOT NULL AND title ILIKE ${patterns[1] ?? patterns[0]})
    )
    ORDER BY posted_at DESC NULLS LAST
    LIMIT ${limitJobs}
  `

  const skillCounts = new Map<string, { label: string; count: number }>()
  let sponsorVacancies = 0
  const sampleTitles: string[] = []

  for (const row of rows) {
    const visa = String(row.visa_type ?? "").toLowerCase()
    if (/sponsor|skilled worker|work visa|tier 2|sms/.test(visa) || visa.includes("worker")) {
      sponsorVacancies += 1
    }
    if (sampleTitles.length < 8 && row.title) sampleTitles.push(String(row.title))
    const skills = Array.isArray(row.skills) ? row.skills : []
    for (const skill of skills) {
      const label = normalizeSkill(String(skill))
      if (!label || label.length < 2) continue
      const key = skillKey(label)
      const existing = skillCounts.get(key)
      if (existing) existing.count += 1
      else skillCounts.set(key, { label, count: 1 })
    }
  }

  const total = rows.length
  const skillDemand = [...skillCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 24)
    .map((item) => ({
      skill: item.label,
      count: item.count,
      pct: total ? Math.round((item.count / total) * 100) : 0,
    }))

  // Broader count without skill-join limit for headline vacancy number
  const countRows = await careerSql`
    SELECT count(*)::int AS n
    FROM skilledjobs.jobs
    WHERE title ILIKE ${patterns[0]}
       OR coalesce(category, '') ILIKE ${patterns[0]}
  `

  return {
    targetRole,
    totalVacancies: Number(countRows[0]?.n ?? total),
    sponsorVacancies,
    skillDemand,
    sampleTitles,
  }
}

export async function countJobsWithSkill(input: {
  targetRole: string
  skill: string
}): Promise<number> {
  if (!careerSql) return 0
  const patterns = rolePatterns(input.targetRole)
  if (!patterns.length || !input.skill.trim()) return 0
  const needle = input.skill.trim().toLowerCase()

  const rows = await careerSql`
    SELECT skills
    FROM skilledjobs.jobs
    WHERE title ILIKE ${patterns[0]}
       OR coalesce(category, '') ILIKE ${patterns[0]}
    ORDER BY posted_at DESC NULLS LAST
    LIMIT 1500
  `

  let n = 0
  for (const row of rows) {
    const skills = (Array.isArray(row.skills) ? row.skills : []).map((s) => String(s).toLowerCase())
    if (skills.some((skill) => skill.includes(needle) || needle.includes(skill))) n += 1
  }
  return n
}

export async function countJobsRequiringSkills(input: {
  targetRole: string
  mustHave: string[]
  mode?: "all" | "any"
}): Promise<{ matching: number }> {
  if (!careerSql) return { matching: 0 }
  const patterns = rolePatterns(input.targetRole)
  if (!patterns.length) return { matching: 0 }

  const must = input.mustHave.map(skillKey).filter(Boolean).slice(0, 8)
  const mode = input.mode ?? "all"

  const rows = await careerSql`
    SELECT skills
    FROM skilledjobs.jobs
    WHERE title ILIKE ${patterns[0]}
       OR coalesce(category, '') ILIKE ${patterns[0]}
    ORDER BY posted_at DESC NULLS LAST
    LIMIT 1500
  `

  if (must.length === 0) return { matching: rows.length }

  let matching = 0
  for (const row of rows) {
    const skills = (Array.isArray(row.skills) ? row.skills : []).map((s) => skillKey(String(s)))
    const hits = must.filter((need) => skills.some((skill) => skill.includes(need) || need.includes(skill)))
    const ok = mode === "any" ? hits.length > 0 : hits.length === must.length
    if (ok) matching += 1
  }

  return { matching }
}

export function overlapSkills(userSkills: string[], required: string[]) {
  const userKeys = userSkills.map(skillKey)
  const have: string[] = []
  const missing: string[] = []
  for (const skill of required) {
    const key = skillKey(skill)
    const found = userKeys.some((user) => user.includes(key) || key.includes(user))
    if (found) have.push(skill)
    else missing.push(skill)
  }
  const transferablePct = required.length ? Math.round((have.length / required.length) * 100) : 0
  return { have, missing, transferablePct, gapPct: 100 - transferablePct }
}

export function estimatePrepMonths(gapPct: number, experienceYears: number): string {
  if (gapPct <= 15) return "2–6 weeks"
  if (gapPct <= 30) return experienceYears >= 3 ? "2–3 months" : "3–5 months"
  if (gapPct <= 50) return "4–7 months"
  return "6–12 months"
}

export function feasibilityFromOverlap(transferablePct: number): "High" | "Medium" | "Low" {
  if (transferablePct >= 65) return "High"
  if (transferablePct >= 40) return "Medium"
  return "Low"
}
