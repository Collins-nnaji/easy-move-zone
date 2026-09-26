export type CheckDocumentKind = "cv" | "passport" | "certificate" | "offer" | "other"

export type CheckDocumentMeta = {
  id: string
  kind: CheckDocumentKind
  fileName: string
  fileMime: string | null
  bytes: number
  excerpt: string | null
  createdAt: string
}

export type CheckInput = {
  fromCountry: string
  toCountry: string
  toSlug: string
  currentRole: string
  /** Primary target career (first of targetRoles when multiple). */
  targetRole: string
  /** Optional additional target careers — Pathfinder may send several. */
  targetRoles?: string[]
  age: number
  experienceYears: number
  education: string
  englishLevel: string
  savingsGbp: number
  family: string
  needsSponsorship: boolean
  hasJobOffer: boolean
  notes?: string
}

export type CheckRoute = {
  name: string
  likelihood: "strong" | "possible" | "unlikely"
  summary: string
  requirements: string[]
  nextSteps: string[]
}

export type CheckGap = {
  area: string
  severity: "high" | "medium" | "low"
  detail: string
  howToFix: string
}

export type CheckSource = {
  title: string
  url: string
  snippet?: string
}

export type CheckResult = {
  overallChance: number
  headline: string
  summary: string
  careerFit: {
    score: number
    analysis: string
    transferableSkills: string[]
    missingSkills: string[]
  }
  sponsorship: {
    needed: boolean
    outlook: string
  }
  routes: CheckRoute[]
  gaps: CheckGap[]
  documentInsights: string[]
  actionPlan: string[]
  sources: CheckSource[]
  disclaimer: string
}
