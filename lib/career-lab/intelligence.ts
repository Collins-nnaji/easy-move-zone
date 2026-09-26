import { chatJson, getAiProvider } from "@/lib/ai/openai"

export type DigitalTwin = {
  officialTitle: string
  extractedSkills: string[]
  capabilities: string[]
  tools: string[]
  domains: string[]
  narrative: string
  occupationOverlaps: Array<{ title: string; overlapPct: number; why: string }>
}

const FALLBACK_SKILLS: Record<string, string[]> = {
  customer: ["Customer communication", "CRM", "Complaint resolution", "Account retention", "Excel", "Reporting"],
  account: ["Financial reporting", "Excel", "Reconciliation", "Stakeholder management", "Attention to detail"],
  data: ["SQL", "Excel", "Dashboards", "Analysis", "Reporting", "Python"],
  market: ["Campaigns", "Analytics", "Copywriting", "CRM", "Stakeholder management"],
  engineer: ["Problem solving", "Debugging", "Collaboration", "CI/CD", "Documentation"],
}

function heuristicTwin(title: string, text: string): DigitalTwin {
  const hay = `${title} ${text}`.toLowerCase()
  let skills: string[] = []
  for (const [key, list] of Object.entries(FALLBACK_SKILLS)) {
    if (hay.includes(key)) skills = [...skills, ...list]
  }
  if (!skills.length) skills = ["Communication", "Problem solving", "Excel", "Reporting", "Teamwork"]
  skills = [...new Set(skills)].slice(0, 12)

  return {
    officialTitle: title || "Professional",
    extractedSkills: skills,
    capabilities: skills.slice(0, 6),
    tools: skills.filter((s) => /sql|excel|python|salesforce|power bi|crm|tableau/i.test(s)),
    domains: [],
    narrative: `Your title is “${title || "not specified"}”, but your experience likely includes transferable capabilities beyond that label.`,
    occupationOverlaps: [
      { title: "Business Analyst", overlapPct: 62, why: "Reporting and stakeholder work often transfer." },
      { title: "Customer Success Manager", overlapPct: 58, why: "Client communication and retention map well." },
      { title: "Operations Analyst", overlapPct: 55, why: "Process and reporting skills are reusable." },
    ],
  }
}

export async function buildDigitalTwin(input: {
  officialTitle: string
  experienceText: string
}): Promise<DigitalTwin> {
  const fallback = heuristicTwin(input.officialTitle, input.experienceText)
  if (!getAiProvider() || input.experienceText.trim().length < 40) return fallback

  const ai = await chatJson<DigitalTwin>(
    `You build a Career Digital Twin — structured skills from real experience, not just job titles.
Return JSON only:
{
  "officialTitle": "",
  "extractedSkills": ["short skills"],
  "capabilities": ["verbs/capabilities"],
  "tools": ["tools"],
  "domains": ["domains"],
  "narrative": "2 sentences",
  "occupationOverlaps": [{"title":"","overlapPct":0-100,"why":""}]
}
Do not invent credentials. Extract only what the text supports.`,
    `Official title: ${input.officialTitle}\n\nExperience / CV text:\n${input.experienceText.slice(0, 9000)}`,
    fallback,
    { maxTokens: 1200, temperature: 0.2 },
  )

  return {
    officialTitle: String(ai.officialTitle || fallback.officialTitle).slice(0, 120),
    extractedSkills: Array.isArray(ai.extractedSkills) ? ai.extractedSkills.map(String).slice(0, 20) : fallback.extractedSkills,
    capabilities: Array.isArray(ai.capabilities) ? ai.capabilities.map(String).slice(0, 16) : fallback.capabilities,
    tools: Array.isArray(ai.tools) ? ai.tools.map(String).slice(0, 12) : fallback.tools,
    domains: Array.isArray(ai.domains) ? ai.domains.map(String).slice(0, 8) : fallback.domains,
    narrative: String(ai.narrative || fallback.narrative).slice(0, 500),
    occupationOverlaps: Array.isArray(ai.occupationOverlaps)
      ? ai.occupationOverlaps.slice(0, 6).map((item) => ({
          title: String(item.title || "").slice(0, 80),
          overlapPct: Math.max(0, Math.min(100, Number(item.overlapPct) || 0)),
          why: String(item.why || "").slice(0, 200),
        }))
      : fallback.occupationOverlaps,
  }
}

export async function translateExperience(input: { bullet: string; targets?: string[] }) {
  const targets = input.targets?.length
    ? input.targets
    : ["Customer Success", "Business Analysis", "Project Coordination"]

  const fallback = {
    original: input.bullet,
    translations: targets.map((target) => ({
      target,
      skills: ["Stakeholder communication", "Issue management", "Reporting"],
      reframed: `Experience relevant to ${target}: ${input.bullet}`,
    })),
  }

  if (!getAiProvider() || input.bullet.trim().length < 20) return fallback

  return chatJson<typeof fallback>(
    `You are an Experience Translator. Do not invent skills — reframe transferable evidence already in the sentence.
Return JSON:
{"original":"","translations":[{"target":"","skills":["..."],"reframed":"one sentence"}]}`,
    `Experience: ${input.bullet}\nTargets: ${targets.join(", ")}`,
    fallback,
    { maxTokens: 900 },
  )
}

export async function diagnoseApplications(input: {
  applications: number
  rejected: number
  noResponse: number
  interviews: number
  notes?: string
  twinSkills?: string[]
  targetRole?: string
}) {
  const total = Math.max(input.applications, 1)
  const interviewRate = Math.round((input.interviews / total) * 1000) / 10
  const fallback = {
    interviewRate,
    summary: `Your interview rate is ${interviewRate}% across ${input.applications} applications.`,
    issues: [
      {
        area: "Role targeting",
        detail: "Some applications may be below strong skill alignment.",
        severity: "medium" as const,
      },
      {
        area: "Sponsorship targeting",
        detail: "Some employers may lack clear sponsorship signals.",
        severity: "medium" as const,
      },
      {
        area: "CV evidence",
        detail: "Common target skills may be under-demonstrated as outcomes.",
        severity: "high" as const,
      },
    ],
    fixes: [
      "Filter to roles with ≥70% skill overlap before applying",
      "Prioritise employers with sponsor evidence",
      "Rewrite bullets as analytical outcomes, not duties",
    ],
  }

  if (!getAiProvider()) return fallback

  const ai = await chatJson<typeof fallback>(
    `Diagnose why interviews are low. Return JSON:
{"interviewRate":number,"summary":"","issues":[{"area":"","detail":"","severity":"high|medium|low"}],"fixes":["..."]}
Be specific and actionable. No legal claims.`,
    `Apps ${input.applications}, rejected ${input.rejected}, no response ${input.noResponse}, interviews ${input.interviews}.
Target: ${input.targetRole || "unspecified"}
Skills: ${(input.twinSkills || []).join(", ")}
Notes: ${input.notes || "none"}`,
    fallback,
    { maxTokens: 1000 },
  )
  return {
    ...ai,
    interviewRate: typeof ai.interviewRate === "number" ? ai.interviewRate : interviewRate,
  }
}

export async function buildGapProject(input: { missingSkill: string; targetRole: string }) {
  const fallback = {
    missingSkill: input.missingSkill,
    title: `${input.missingSkill} proof project`,
    brief: `Build a realistic mini-project that proves ${input.missingSkill} for a ${input.targetRole} role.`,
    deliverables: ["Written summary", "Artefact (dashboard, query, or doc)", "3 bullet outcomes for your CV"],
    rubric: ["Correctness", "Clarity for a hiring manager", "Relevance to the target role"],
    timeEstimate: "1–2 weekends",
  }

  if (!getAiProvider()) return fallback

  return chatJson<typeof fallback>(
    `Create a Career Gap Builder project. Return JSON:
{"missingSkill":"","title":"","brief":"","deliverables":[],"rubric":[],"timeEstimate":""}
Make it concrete and portfolio-worthy.`,
    `Missing skill: ${input.missingSkill}\nTarget role: ${input.targetRole}`,
    fallback,
    { maxTokens: 700 },
  )
}
