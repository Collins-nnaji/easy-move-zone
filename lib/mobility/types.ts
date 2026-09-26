export type EducationLevel = "secondary" | "bachelor" | "master" | "phd"
export type EnglishLevel = "basic" | "intermediate" | "fluent"
export type FamilySituation = "single" | "couple" | "family"
export type Climate = "warm" | "mild" | "cold" | "any"
export type OccupationBand = "tech" | "health" | "education" | "other"
export type JobOutlook = "Strong" | "Moderate" | "Limited"
export type RouteStatus = "likely" | "potential" | "conditional" | "unavailable"

export type MobilityProfile = {
  citizenship: string
  currentCountry: string
  age: number
  profession: string
  experienceYears: number
  education: EducationLevel
  languages: string[]
  englishLevel: EnglishLevel
  savingsGbp: number
  family: FamilySituation
  familySize: number
  climate: Climate
  desiredSalaryGbp: number
  timelineMonths: number
  hasJobOffer: boolean
}

export type CostLine = {
  visa: number
  flight: number
  deposit: number
  rent: number
  emergency: number
  documents: number
  other: number
}

export type PathStep = {
  id: string
  title: string
  documents: string[]
  costGbp: number
  time: string
  whatToDo: string
  whoCanHelp: string
}

export type RouteDefinition = {
  id: string
  name: string
  featured?: boolean
  needsSponsor?: boolean
  familyOnly?: boolean
  skilledBands?: OccupationBand[]
  minEducation?: EducationLevel
  minExperience?: number
  maxAge?: number
  minEnglish?: EnglishLevel
  recommendLanguage?: string
  alwaysPotential?: boolean
  fitReason: string
  steps: PathStep[]
}

export type SettlementTask = {
  id: string
  title: string
  detail: string
}

export type Destination = {
  slug: string
  name: string
  flag: string
  climate: Exclude<Climate, "any">
  summary: string
  englishFriendly: boolean
  englishAccepted: boolean
  /** A formal English test is usually expected, even when the person already speaks English. */
  englishTestExpected: boolean
  recommendLanguage?: string
  settlementBase: number
  prepMonths: number
  documentCount: number
  housingGbp: number
  costs: CostLine
  jobStrength: Record<OccupationBand, JobOutlook>
  jobCount: Record<OccupationBand, number>
  routes: RouteDefinition[]
  settlement: SettlementTask[]
  channels: string[]
}

export type RouteAssessment = {
  id: string
  name: string
  status: RouteStatus
  label: string
  reason: string
  needsSponsor: boolean
  languageNote?: string
  steps: PathStep[]
}

export type ScoreBreakdown = {
  visa: number
  career: number
  affordability: number
  lifestyle: number
  settlement: number
  match: number
}

export type DestinationAssessment = {
  destination: Destination
  routes: RouteAssessment[]
  primary: RouteAssessment
  scores: ScoreBreakdown
  readiness: number
  totalCostGbp: number
  costs: CostLine
  prepMonths: number
  documents: number
  housingGbp: number
  jobLabel: JobOutlook
  jobCount: number
  why: string
  languageCallout?: string
}
