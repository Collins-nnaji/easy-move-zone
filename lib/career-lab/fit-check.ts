import { chatJson, getAiProvider } from "@/lib/ai/openai"
import { careerSql } from "@/lib/career/db"
import { overlapSkills } from "./market"

export type FitLevel = "strong" | "good" | "partial" | "stretch" | "unclear"
export type ApplyAdvice = "apply" | "prepare" | "skip"

export const FIT_LEVEL_LABELS: Record<FitLevel, string> = {
  strong: "Strong fit",
  good: "Good fit",
  partial: "Partial fit",
  stretch: "Stretch role",
  unclear: "Not enough detail",
}

export const APPLY_ADVICE_LABELS: Record<ApplyAdvice, string> = {
  apply: "Apply now",
  prepare: "Worth applying — tailor your CV first",
  skip: "Not worth applying yet",
}

export type FitCheck = {
  jobId: string
  title: string
  company: string | null
  mustHave: string[]
  niceToHave: string[]
  fitLevel: FitLevel
  fitLabel: string
  mustHaveCovered: number
  niceToHaveCovered: number
  matched: string[]
  missing: string[]
  evidence: Array<{ skill: string; present: boolean; mustHave: boolean }>
  sponsorship: {
    employerSignal: "strong" | "weak" | "none"
    vacancyStatement: string
  }
  strongestSellingPoint: string
  applyAdvice: ApplyAdvice
  applyLabel: string
  applyReasons: string[]
}

let requirementsTableReady: Promise<void> | null = null

function ensureRequirementsTable(): Promise<void> {
  if (!careerSql) return Promise.resolve()
  const sql = careerSql
  requirementsTableReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS skilledjobs.job_fit_requirements (
        job_id bigint PRIMARY KEY,
        must_have text[] NOT NULL,
        nice_to_have text[] NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `
  })().catch((error) => {
    requirementsTableReady = null
    throw error
  })
  return requirementsTableReady
}

function uniqueSkills(skills: unknown[], limit: number) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of skills) {
    const skill = String(raw ?? "").replace(/\s+/g, " ").trim()
    const key = skill.toLowerCase()
    if (!skill || seen.has(key)) continue
    seen.add(key)
    out.push(skill)
    if (out.length === limit) break
  }
  return out
}

/**
 * A job's must-haves are worked out once and stored, so every Fit Check against the same
 * job compares against the same list. They depend only on the job, never on the candidate.
 */
async function jobRequirements(row: Record<string, unknown>): Promise<{ mustHave: string[]; niceToHave: string[] }> {
  const id = Number(row.id)
  await ensureRequirementsTable()
  const cached = await careerSql!`SELECT must_have, nice_to_have FROM skilledjobs.job_fit_requirements WHERE job_id = ${id}`
  if (cached[0]) return { mustHave: cached[0].must_have as string[], niceToHave: cached[0].nice_to_have as string[] }

  const listed = uniqueSkills(Array.isArray(row.skills) ? row.skills : [], 20)
  let mustHave = listed.slice(0, 5)
  let niceToHave = listed.slice(5, 9)
  if (getAiProvider() && (row.description || listed.length < 3)) {
    const ai = await chatJson<{ mustHave: string[]; niceToHave: string[] }>(
      `List the skills a job asks for. Return JSON {"mustHave":[],"niceToHave":[]}.
mustHave: 3-6 skills the vacancy clearly requires. niceToHave: up to 4 desirable extras.
Use short, standard skill names (e.g. "SQL", "Stakeholder management"). No duplicates.`,
      `Title: ${row.title}\nCompany: ${row.company}\nListed skills: ${listed.join(", ")}\nDescription: ${String(row.description || "").slice(0, 2500)}`,
      { mustHave, niceToHave },
      { maxTokens: 400, temperature: 0 },
    )
    if (Array.isArray(ai.mustHave) && ai.mustHave.length) mustHave = uniqueSkills(ai.mustHave, 6)
    if (Array.isArray(ai.niceToHave)) {
      const mustKeys = new Set(mustHave.map((skill) => skill.toLowerCase()))
      niceToHave = uniqueSkills(ai.niceToHave, 6).filter((skill) => !mustKeys.has(skill.toLowerCase())).slice(0, 4)
    }
  }

  if (!mustHave.length) return { mustHave, niceToHave }
  await careerSql!`
    INSERT INTO skilledjobs.job_fit_requirements (job_id, must_have, nice_to_have)
    VALUES (${id}, ${mustHave}, ${niceToHave})
    ON CONFLICT (job_id) DO NOTHING
  `
  const stored = await careerSql!`SELECT must_have, nice_to_have FROM skilledjobs.job_fit_requirements WHERE job_id = ${id}`
  return stored[0] ? { mustHave: stored[0].must_have as string[], niceToHave: stored[0].nice_to_have as string[] } : { mustHave, niceToHave }
}

export function fitLevelFor(mustHaveCovered: number, mustHaveTotal: number): FitLevel {
  if (!mustHaveTotal) return "unclear"
  const share = mustHaveCovered / mustHaveTotal
  if (share >= 0.8) return "strong"
  if (share >= 0.6) return "good"
  if (share >= 0.3) return "partial"
  return "stretch"
}

export function employerSignalFor(visaType: string | null | undefined): FitCheck["sponsorship"]["employerSignal"] {
  const visa = String(visaType ?? "").toLowerCase().trim()
  if (/sponsor|skilled worker|work visa|work permit|blue card/.test(visa)) return "strong"
  return visa && visa !== "other" ? "weak" : "none"
}

/** Same skills + same job requirements always give the same verdict. */
export function assessFit(input: {
  mustHave: string[]
  niceToHave: string[]
  userSkills: string[]
  visaType?: string | null
}) {
  const userSkills = uniqueSkills([...input.userSkills].sort((a, b) => a.localeCompare(b)), 200)
  const must = overlapSkills(userSkills, input.mustHave)
  const nice = overlapSkills(userSkills, input.niceToHave)
  const fitLevel = fitLevelFor(must.have.length, input.mustHave.length)
  const employerSignal = employerSignalFor(input.visaType)

  let applyAdvice: ApplyAdvice
  if (fitLevel === "strong") applyAdvice = "apply"
  else if (fitLevel === "good") applyAdvice = "prepare"
  else if (fitLevel === "partial") applyAdvice = employerSignal === "none" ? "skip" : "prepare"
  else applyAdvice = fitLevel === "unclear" ? "prepare" : "skip"

  const applyReasons: string[] = []
  if (fitLevel === "unclear") applyReasons.push("The listing doesn't state clear skill requirements — read the full advert")
  else applyReasons.push(`You cover ${must.have.length} of ${input.mustHave.length} must-have skills`)
  if (input.niceToHave.length && fitLevel !== "unclear") applyReasons.push(`${nice.have.length} of ${input.niceToHave.length} nice-to-haves`)
  if (employerSignal === "strong") applyReasons.push("Listing mentions visa sponsorship")
  else if (employerSignal === "weak") applyReasons.push("Listing mentions a visa route — confirm sponsorship with the employer")
  else applyReasons.push("No sponsorship mentioned on the listing")

  return {
    fitLevel,
    fitLabel: FIT_LEVEL_LABELS[fitLevel],
    mustHaveCovered: must.have.length,
    niceToHaveCovered: nice.have.length,
    matched: [...must.have, ...nice.have],
    missing: must.missing,
    evidence: [
      ...input.mustHave.map((skill) => ({ skill, present: must.have.includes(skill), mustHave: true })),
      ...input.niceToHave.map((skill) => ({ skill, present: nice.have.includes(skill), mustHave: false })),
    ],
    employerSignal,
    applyAdvice,
    applyLabel: APPLY_ADVICE_LABELS[applyAdvice],
    applyReasons,
  }
}

export async function buildFitCheck(input: {
  jobId: string
  userSkills: string[]
  userSummary?: string
}): Promise<FitCheck | null> {
  if (!careerSql) return null
  const id = Number(input.jobId)
  if (!Number.isFinite(id)) return null

  const rows = await careerSql`
    SELECT id, title, company, skills, visa_type, description
    FROM skilledjobs.jobs
    WHERE id = ${id}
    LIMIT 1
  `
  const row = rows[0]
  if (!row) return null

  const { mustHave, niceToHave } = await jobRequirements(row)
  const fit = assessFit({ mustHave, niceToHave, userSkills: input.userSkills, visaType: row.visa_type ? String(row.visa_type) : null })
  const strengths = fit.matched.slice(0, 2)

  return {
    jobId: String(row.id),
    title: String(row.title),
    company: row.company ? String(row.company) : null,
    mustHave,
    niceToHave,
    fitLevel: fit.fitLevel,
    fitLabel: fit.fitLabel,
    mustHaveCovered: fit.mustHaveCovered,
    niceToHaveCovered: fit.niceToHaveCovered,
    matched: fit.matched,
    missing: fit.missing,
    evidence: fit.evidence,
    sponsorship: {
      employerSignal: fit.employerSignal,
      vacancyStatement: row.visa_type && String(row.visa_type) !== "Other" ? String(row.visa_type) : "Not stated",
    },
    strongestSellingPoint:
      input.userSummary?.slice(0, 180) ||
      (strengths.length ? `Lead with your ${strengths.join(" and ")} experience — the advert asks for it.` : "Lead with measurable outcomes from your current role."),
    applyAdvice: fit.applyAdvice,
    applyLabel: fit.applyLabel,
    applyReasons: fit.applyReasons,
  }
}
