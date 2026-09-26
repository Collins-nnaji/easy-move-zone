import { chatJson, getAiProvider } from "@/lib/ai/openai"
import { careerSql } from "@/lib/career/db"
import { overlapSkills } from "./market"

export type FitCheck = {
  jobId: string
  title: string
  company: string | null
  mustHave: string[]
  niceToHave: string[]
  overlapPct: number
  missing: string[]
  evidence: Array<{ skill: string; present: boolean }>
  sponsorship: {
    employerSignal: "strong" | "weak" | "none"
    vacancyStatement: string
  }
  strongestSellingPoint: string
  applyAdvice: "prepare" | "skip"
  applyReasons: string[]
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
    SELECT id, title, company, skills, visa_type, description, experience_level, job_type, url
    FROM skilledjobs.jobs
    WHERE id = ${id}
    LIMIT 1
  `
  const row = rows[0]
  if (!row) return null

  const listed = (Array.isArray(row.skills) ? row.skills : []).map(String)
  let mustHave = listed.slice(0, 5)
  let niceToHave = listed.slice(5, 9)

  if (getAiProvider() && (row.description || listed.length < 3)) {
    const ai = await chatJson<{ mustHave: string[]; niceToHave: string[]; sellingPoint: string }>(
      `Decompose a job into a Fit Check. Return JSON:
{"mustHave":[],"niceToHave":[],"sellingPoint":"one sentence for a career switcher"}
Use short skill names.`,
      `Title: ${row.title}\nCompany: ${row.company}\nVisa: ${row.visa_type}\nSkills: ${listed.join(", ")}\nDescription: ${String(row.description || "").slice(0, 2500)}\nCandidate skills: ${input.userSkills.join(", ")}\nCandidate note: ${input.userSummary || ""}`,
      {
        mustHave,
        niceToHave,
        sellingPoint: "Highlight transferable analytical outcomes from your past roles.",
      },
      { maxTokens: 600 },
    )
    if (ai.mustHave?.length) mustHave = ai.mustHave.map(String).slice(0, 6)
    if (ai.niceToHave?.length) niceToHave = ai.niceToHave.map(String).slice(0, 6)
  }

  const required = [...mustHave, ...niceToHave.slice(0, 2)]
  const overlap = overlapSkills(input.userSkills, required.length ? required : mustHave)
  const visa = String(row.visa_type ?? "").toLowerCase()
  const employerSignal: FitCheck["sponsorship"]["employerSignal"] = /sponsor|skilled worker|work visa/.test(visa)
    ? "strong"
    : visa && visa !== "other"
      ? "weak"
      : "none"

  const applyReasons: string[] = []
  if (overlap.transferablePct < 50) applyReasons.push("Skill alignment is weak for this vacancy")
  if (employerSignal === "none") applyReasons.push("Employer sponsorship evidence not identified")
  if (overlap.missing.length >= 4) applyReasons.push(`${overlap.missing.length} mandatory/common skills missing`)
  const applyAdvice: FitCheck["applyAdvice"] = applyReasons.length >= 2 || overlap.transferablePct < 45 ? "skip" : "prepare"

  if (applyAdvice === "prepare") {
    applyReasons.length = 0
    applyReasons.push("Skill alignment looks workable")
    if (employerSignal !== "none") applyReasons.push("Employer sponsorship signal present on listing")
    applyReasons.push("Experience can be positioned against must-haves")
  }

  return {
    jobId: String(row.id),
    title: String(row.title),
    company: row.company ? String(row.company) : null,
    mustHave,
    niceToHave,
    overlapPct: overlap.transferablePct,
    missing: overlap.missing,
    evidence: required.map((skill) => ({
      skill,
      present: overlap.have.some((have) => have.toLowerCase() === skill.toLowerCase()),
    })),
    sponsorship: {
      employerSignal,
      vacancyStatement: row.visa_type ? String(row.visa_type) : "Not identified",
    },
    strongestSellingPoint:
      input.userSummary?.slice(0, 180) ||
      (overlap.have[0] ? `You already show strength in ${overlap.have.slice(0, 2).join(" and ")}.` : "Lead with measurable outcomes from your current role."),
    applyAdvice,
    applyReasons,
  }
}
