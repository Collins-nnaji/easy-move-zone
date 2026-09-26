import { chatJson, getAiProvider } from "@/lib/ai/openai"
import { listDestinations } from "@/lib/mobility/catalog"
import { getCountryBySlug } from "@/lib/mobility/countries"
import { assessOne } from "@/lib/mobility/score"
import type { EducationLevel, EnglishLevel, FamilySituation, MobilityProfile } from "@/lib/mobility/types"
import { formatSourcesForPrompt, researchMoveChances } from "./web-research"
import type { CheckInput, CheckResult, CheckSource } from "./types"

const DISCLAIMER =
  "Planning guidance only — not legal advice or an immigration decision. Rules change; verify on official government sites before you apply."

function clampScore(value: unknown, fallback = 45): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(5, Math.min(95, Math.round(n)))
}

function rolesLabel(input: CheckInput) {
  const roles = (input.targetRoles?.length ? input.targetRoles : [input.targetRole]).filter(Boolean)
  if (roles.length === 0) return input.currentRole || "your target role"
  if (roles.length === 1) return roles[0]
  return roles.slice(0, -1).join(", ") + " or " + roles[roles.length - 1]
}

function heuristicResult(input: CheckInput, sources: CheckSource[], docNotes: string[]): CheckResult {
  const primaryTarget = input.targetRole || input.currentRole
  const targetsLabel = rolesLabel(input)
  const profile: MobilityProfile = {
    citizenship: input.fromCountry,
    currentCountry: input.fromCountry,
    age: input.age,
    profession: primaryTarget,
    experienceYears: input.experienceYears,
    education: (input.education as EducationLevel) || "bachelor",
    languages: ["English"],
    englishLevel: (input.englishLevel as EnglishLevel) || "intermediate",
    savingsGbp: input.savingsGbp,
    family: (input.family as FamilySituation) || "single",
    familySize: input.family === "family" ? 3 : input.family === "couple" ? 2 : 1,
    climate: "any",
    desiredSalaryGbp: 45000,
    timelineMonths: 12,
    hasJobOffer: input.hasJobOffer,
  }
  const assessment = assessOne(profile, input.toSlug)
  const routes =
    assessment?.routes.map((route) => ({
      name: route.name,
      likelihood: (route.status === "likely"
        ? "strong"
        : route.status === "unavailable"
          ? "unlikely"
          : "possible") as CheckResult["routes"][number]["likelihood"],
      summary: route.reason,
      requirements: ["Confirm current official criteria", "Prepare identity and skills evidence"],
      nextSteps: route.steps.slice(0, 3).map((step) => step.whatToDo),
    })) ?? []

  return {
    overallChance: clampScore(assessment?.scores.match ?? 40),
    headline: assessment
      ? `${assessment.destination.name}: ${assessment.primary.label}`
      : `Move check for ${input.toCountry}`,
    summary:
      assessment?.why ??
      `We assessed a move from ${input.fromCountry} to ${input.toCountry} targeting ${targetsLabel}.`,
    careerFit: {
      score: clampScore((assessment?.scores.match ?? 40) - (input.currentRole === primaryTarget ? 0 : 8)),
      analysis: `Transition from ${input.currentRole || "your current role"} into ${targetsLabel}.`,
      transferableSkills: input.currentRole ? [input.currentRole] : [],
      missingSkills: [],
    },
    sponsorship: {
      needed: input.needsSponsorship,
      outlook: input.needsSponsorship
        ? `You will likely need a licensed employer sponsor for a work route in ${input.toCountry}.`
        : "You indicated sponsorship may not be required; still confirm the visa category for your destination.",
    },
    routes,
    gaps: [
      {
        area: "Evidence",
        severity: "medium",
        detail: "Official eligibility still depends on documents and current rules.",
        howToFix: "Upload a CV and certificates, then re-run the AI check.",
      },
    ],
    documentInsights: docNotes,
    actionPlan: [
      "Confirm the lead visa route on the official government site",
      input.needsSponsorship
        ? `Search licensed sponsors in ${input.toCountry} for your target role(s)`
        : "Map the points / skilled pathway requirements",
      "Assess each target career and close skill gaps",
    ],
    sources,
    disclaimer: DISCLAIMER,
  }
}

function normalizeResult(raw: Partial<CheckResult>, fallback: CheckResult, sources: CheckSource[]): CheckResult {
  return {
    overallChance: clampScore(raw.overallChance, fallback.overallChance),
    headline: String(raw.headline || fallback.headline).slice(0, 180),
    summary: String(raw.summary || fallback.summary).slice(0, 1200),
    careerFit: {
      score: clampScore(raw.careerFit?.score, fallback.careerFit.score),
      analysis: String(raw.careerFit?.analysis || fallback.careerFit.analysis).slice(0, 800),
      transferableSkills: Array.isArray(raw.careerFit?.transferableSkills)
        ? raw.careerFit!.transferableSkills.map(String).slice(0, 8)
        : fallback.careerFit.transferableSkills,
      missingSkills: Array.isArray(raw.careerFit?.missingSkills)
        ? raw.careerFit!.missingSkills.map(String).slice(0, 8)
        : fallback.careerFit.missingSkills,
    },
    sponsorship: {
      needed: typeof raw.sponsorship?.needed === "boolean" ? raw.sponsorship.needed : fallback.sponsorship.needed,
      outlook: String(raw.sponsorship?.outlook || fallback.sponsorship.outlook).slice(0, 500),
    },
    routes: Array.isArray(raw.routes) && raw.routes.length
      ? raw.routes.slice(0, 5).map((route) => ({
          name: String(route.name || "Route").slice(0, 80),
          likelihood:
            route.likelihood === "strong" || route.likelihood === "possible" || route.likelihood === "unlikely"
              ? route.likelihood
              : "possible",
          summary: String(route.summary || "").slice(0, 400),
          requirements: Array.isArray(route.requirements) ? route.requirements.map(String).slice(0, 6) : [],
          nextSteps: Array.isArray(route.nextSteps) ? route.nextSteps.map(String).slice(0, 5) : [],
        }))
      : fallback.routes,
    gaps: Array.isArray(raw.gaps) && raw.gaps.length
      ? raw.gaps.slice(0, 6).map((gap) => ({
          area: String(gap.area || "Gap").slice(0, 60),
          severity: gap.severity === "high" || gap.severity === "medium" || gap.severity === "low" ? gap.severity : "medium",
          detail: String(gap.detail || "").slice(0, 400),
          howToFix: String(gap.howToFix || "").slice(0, 300),
        }))
      : fallback.gaps,
    documentInsights: Array.isArray(raw.documentInsights)
      ? raw.documentInsights.map(String).slice(0, 8)
      : fallback.documentInsights,
    actionPlan: Array.isArray(raw.actionPlan) && raw.actionPlan.length
      ? raw.actionPlan.map(String).slice(0, 8)
      : fallback.actionPlan,
    sources: sources.length ? sources : fallback.sources,
    disclaimer: DISCLAIMER,
  }
}

export async function runAiMoveCheck(input: {
  profile: CheckInput
  documents: Array<{ kind: string; fileName: string; text: string }>
}): Promise<CheckResult> {
  const destination =
    listDestinations().find((item) => item.slug === input.profile.toSlug) ||
    getCountryBySlug(input.profile.toSlug)
  const sources = await researchMoveChances({
    fromCountry: input.profile.fromCountry,
    toCountry: input.profile.toCountry || destination?.name || input.profile.toSlug,
    toSlug: input.profile.toSlug,
    targetRole: input.profile.targetRole || input.profile.currentRole,
    needsSponsorship: input.profile.needsSponsorship,
  })

  const docNotes = input.documents.map(
    (doc) => `${doc.kind.toUpperCase()} · ${doc.fileName}: ${doc.text.slice(0, 180).replace(/\s+/g, " ")}…`,
  )
  const fallback = heuristicResult(
    {
      ...input.profile,
      toCountry: input.profile.toCountry || destination?.name || input.profile.toSlug,
    },
    sources,
    docNotes.length
      ? [`Processed ${input.documents.length} uploaded document(s).`]
      : ["No documents uploaded — assessment uses the form answers only."],
  )

  if (!getAiProvider()) {
    return fallback
  }

  const documentBlock =
    input.documents.length === 0
      ? "No documents uploaded."
      : input.documents
          .map(
            (doc, index) =>
              `--- Document ${index + 1} (${doc.kind}): ${doc.fileName} ---\n${doc.text.slice(0, 7000)}`,
          )
          .join("\n\n")

  const system = `You are EasyMoveZone's career-and-immigration move checker.
Return raw JSON only (no markdown) with this shape:
{
  "overallChance": 0-100,
  "headline": "short",
  "summary": "2-4 sentences",
  "careerFit": { "score": 0-100, "analysis": "...", "transferableSkills": [], "missingSkills": [] },
  "sponsorship": { "needed": true|false, "outlook": "..." },
  "routes": [{ "name": "", "likelihood": "strong|possible|unlikely", "summary": "", "requirements": [], "nextSteps": [] }],
  "gaps": [{ "area": "", "severity": "high|medium|low", "detail": "", "howToFix": "" }],
  "documentInsights": ["..."],
  "actionPlan": ["..."]
}
Rules:
- Use the web research snippets and uploaded documents when present.
- Prefer official government requirements over blogs.
- Be honest about gaps; do not invent fees or guarantees.
- If documents contradict the form, trust the documents and note it.
- Focus on career transition realism AND immigration pathway realism.
- If targetRoles lists more than one career, compare fit across them and call out the stronger vs harder paths.
- Do not assume the destination is the UK — use the provided toCountry / toSlug.`

  const user = `Applicant form:
${JSON.stringify(input.profile, null, 2)}

Destination catalog hint:
${destination ? `${destination.name}${"summary" in destination && destination.summary ? ` — ${destination.summary}` : ""}` : "unknown"}

Live web research:
${formatSourcesForPrompt(sources)}

Uploaded documents:
${documentBlock}`

  const ai = await chatJson<Partial<CheckResult>>(system, user, fallback, {
    maxTokens: 2200,
    temperature: 0.25,
  })

  return normalizeResult(ai, fallback, sources)
}
