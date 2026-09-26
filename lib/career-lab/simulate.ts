import { chatJson, getAiProvider } from "@/lib/ai/openai"
import {
  analyseTargetMarket,
  countJobsRequiringSkills,
  countJobsWithSkill,
  estimatePrepMonths,
  feasibilityFromOverlap,
  overlapSkills,
} from "./market"

export type SimulateInput = {
  currentRole: string
  targetRole: string
  userSkills: string[]
  experienceYears?: number
  /** Skills the user hypothetically learns (what-if). */
  learnSkills?: string[]
}

export type WhatIfStep = {
  skill: string
  matchBefore: number
  matchAfter: number
  unlockedJobs: number
}

export type SimulateResult = {
  feasibility: "High" | "Medium" | "Low"
  transferablePct: number
  gapPct: number
  estimatedPreparation: string
  typicalRequiredSkills: string[]
  relevantVacancies: number
  sponsorVacancies: number
  haveSkills: string[]
  missingSkills: string[]
  analysis: string
  whatIf: WhatIfStep[]
  sampleTitles: string[]
}

export async function runCareerSimulation(input: SimulateInput): Promise<SimulateResult> {
  const market = await analyseTargetMarket(input.targetRole)
  const typical =
    market?.skillDemand.slice(0, 8).map((item) => item.skill) ??
    ["SQL", "Excel", "Communication", "Problem solving", "Reporting"]

  // Optionally enrich typical skills with AI if market is thin
  let required = typical
  if (getAiProvider() && typical.length < 4) {
    const ai = await chatJson<{ skills: string[] }>(
      'Return JSON {"skills":["..."]} with 6-8 typical skills for the target role. Short skill names only.',
      `Current role: ${input.currentRole}\nTarget role: ${input.targetRole}`,
      { skills: typical },
      { maxTokens: 400 },
    )
    if (Array.isArray(ai.skills) && ai.skills.length) {
      required = [...new Set([...typical, ...ai.skills.map(String)])].slice(0, 10)
    }
  }

  const effectiveSkills = [...input.userSkills, ...(input.learnSkills ?? [])]
  const overlap = overlapSkills(effectiveSkills, required)
  const baseOverlap = overlapSkills(input.userSkills, required)

  const topMissing = overlap.missing.slice(0, 4)
  const whatIf: WhatIfStep[] = []
  const baseMatches = await countJobsRequiringSkills({
    targetRole: input.targetRole,
    mustHave: baseOverlap.have.slice(0, 3),
    mode: "any",
  })
  for (const skill of topMissing) {
    const withSkill = await countJobsWithSkill({ targetRole: input.targetRole, skill })
    const nextPct = overlapSkills([...input.userSkills, skill], required).transferablePct
    whatIf.push({
      skill,
      matchBefore: baseOverlap.transferablePct,
      matchAfter: nextPct,
      unlockedJobs: Math.max(0, withSkill),
    })
  }
  // Prefer showing incremental unlock vs roles that already mention user skills
  for (const step of whatIf) {
    step.unlockedJobs = Math.max(0, step.unlockedJobs - Math.floor(baseMatches.matching * 0.15))
  }

  let analysis = `Moving from ${input.currentRole || "your current role"} into ${input.targetRole} looks ${feasibilityFromOverlap(overlap.transferablePct).toLowerCase()} based on skill overlap against live vacancy demand.`
  if (getAiProvider()) {
    const ai = await chatJson<{ analysis: string }>(
      'Return JSON {"analysis":"2-3 honest sentences about transition feasibility"}. No markdown.',
      `Current: ${input.currentRole}\nTarget: ${input.targetRole}\nHave: ${overlap.have.join(", ")}\nMissing: ${overlap.missing.join(", ")}\nVacancies: ${market?.totalVacancies ?? 0}\nSponsor-ish vacancies in sample: ${market?.sponsorVacancies ?? 0}`,
      { analysis },
      { maxTokens: 350 },
    )
    if (ai.analysis) analysis = String(ai.analysis).slice(0, 600)
  }

  return {
    feasibility: feasibilityFromOverlap(overlap.transferablePct),
    transferablePct: overlap.transferablePct,
    gapPct: overlap.gapPct,
    estimatedPreparation: estimatePrepMonths(overlap.gapPct, input.experienceYears ?? 3),
    typicalRequiredSkills: required,
    relevantVacancies: market?.totalVacancies ?? 0,
    sponsorVacancies: market?.sponsorVacancies ?? 0,
    haveSkills: overlap.have,
    missingSkills: overlap.missing,
    analysis,
    whatIf,
    sampleTitles: market?.sampleTitles ?? [],
  }
}

export async function runSkillRoi(input: {
  targetRole: string
  userSkills: string[]
  candidateSkills?: string[]
}) {
  const market = await analyseTargetMarket(input.targetRole)
  const demand = market?.skillDemand ?? []
  const userKeys = input.userSkills.map((s) => s.toLowerCase())

  const lacking = demand.filter(
    (item) => !userKeys.some((user) => user.includes(item.skill.toLowerCase()) || item.skill.toLowerCase().includes(user)),
  )

  const focus = (input.candidateSkills?.length
    ? demand.filter((item) =>
        input.candidateSkills!.some(
          (skill) =>
            skill.toLowerCase().includes(item.skill.toLowerCase()) ||
            item.skill.toLowerCase().includes(skill.toLowerCase()),
        ),
      )
    : lacking
  ).slice(0, 6)

  const base = await countJobsRequiringSkills({
    targetRole: input.targetRole,
    mustHave: input.userSkills.slice(0, 4),
    mode: "any",
  })

  const recommendations = []
  for (const item of focus) {
    const withSkill = await countJobsWithSkill({ targetRole: input.targetRole, skill: item.skill })
    const unlocked = Math.max(0, withSkill - Math.floor(base.matching * 0.2))
    recommendations.push({
      skill: item.skill,
      requiredByPct: item.pct,
      youHaveIt: false,
      effort: item.pct >= 50 ? "Medium" : item.pct >= 25 ? "Low–Medium" : "Low",
      currentMatches: base.matching,
      afterMatches: Math.max(base.matching, base.matching + unlocked),
      unlockedJobs: unlocked,
      summary: `Learning ${item.skill} could unlock ${unlocked} additional jobs in your current search.`,
    })
  }

  recommendations.sort((a, b) => b.unlockedJobs - a.unlockedJobs || b.requiredByPct - a.requiredByPct)

  return {
    targetRole: input.targetRole,
    vacancyPool: market?.totalVacancies ?? 0,
    currentMatches: base.matching,
    recommendations,
    topDemand: demand.slice(0, 12),
  }
}
