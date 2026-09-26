import type {
  CostLine,
  Destination,
  DestinationAssessment,
  EducationLevel,
  EnglishLevel,
  JobOutlook,
  MobilityProfile,
  OccupationBand,
  RouteAssessment,
  RouteDefinition,
  RouteStatus,
  ScoreBreakdown,
} from "./types"
import { DESTINATIONS } from "./catalog"

const EDUCATION_RANK: Record<EducationLevel, number> = {
  secondary: 0,
  bachelor: 1,
  master: 2,
  phd: 3,
}

const ENGLISH_RANK: Record<EnglishLevel, number> = {
  basic: 0,
  intermediate: 1,
  fluent: 2,
}

const OUTLOOK_SCORE: Record<JobOutlook, number> = {
  Strong: 90,
  Moderate: 72,
  Limited: 48,
}

const VISA_SCORE: Record<RouteStatus, number> = {
  likely: 80,
  potential: 72,
  conditional: 52,
  unavailable: 28,
}

export function occupationBand(profession: string): OccupationBand {
  const value = profession.toLowerCase()
  if (/cyber|software|develop|engineer|data|product|devops|cloud|security|analyst|programmer/.test(value)) {
    return "tech"
  }
  if (/nurs|doctor|physician|health|pharma|clinic|midwi|surgeon/.test(value)) return "health"
  if (/teach|lectur|educat|tutor|professor/.test(value)) return "education"
  return "other"
}

export function totalCost(costs: CostLine): number {
  return costs.visa + costs.flight + costs.deposit + costs.rent + costs.emergency + costs.documents + costs.other
}

function speaks(profile: MobilityProfile, language: string): boolean {
  return profile.languages.some((item) => item.toLowerCase() === language.toLowerCase())
}

function scaleCosts(base: CostLine, profile: MobilityProfile): CostLine {
  const people = Math.max(1, profile.familySize)
  const home = profile.family === "family" ? 1.55 : profile.family === "couple" ? 1.28 : 1
  return {
    visa: base.visa + (people - 1) * Math.round(base.visa * 0.55),
    flight: base.flight * people,
    deposit: Math.round(base.deposit * home),
    rent: Math.round(base.rent * home),
    emergency: Math.round(base.emergency * home),
    documents: base.documents + (people - 1) * 120,
    other: Math.round(base.other * home),
  }
}

function routeLabel(route: RouteDefinition, status: RouteStatus): string {
  if (status === "unavailable") return "Not currently applicable"
  if (status === "conditional") return "Requires employer sponsorship"
  if (route.alwaysPotential && /talent/i.test(route.name)) return "Possible depending on professional profile"
  if (route.alwaysPotential) return "Potential route"
  if (status === "potential") return "Potentially eligible"
  return "Likely eligible"
}

function qualify(profile: MobilityProfile, route: RouteDefinition): RouteAssessment {
  const band = occupationBand(profile.profession)
  const base = {
    id: route.id,
    name: route.name,
    needsSponsor: Boolean(route.needsSponsor),
    steps: route.steps,
    languageNote: route.recommendLanguage && !speaks(profile, route.recommendLanguage)
      ? `${route.recommendLanguage} language recommended`
      : undefined,
  }

  const finish = (status: RouteStatus, reason: string): RouteAssessment => ({
    ...base,
    status,
    label: routeLabel(route, status),
    reason,
  })

  if (route.familyOnly && profile.family === "single") {
    return finish("unavailable", "This route needs a partner or family member who can sponsor you.")
  }

  if (route.needsSponsor && !profile.hasJobOffer) {
    return finish("conditional", route.fitReason)
  }

  if (route.needsSponsor && profile.hasJobOffer) {
    return finish("potential", "You have marked a job offer. The employer still has to be allowed to sponsor this route.")
  }

  if (route.alwaysPotential) {
    return finish("potential", route.fitReason)
  }

  if (route.minEducation && EDUCATION_RANK[profile.education] < EDUCATION_RANK[route.minEducation]) {
    return finish("potential", "Your education is below the level this route usually expects.")
  }

  if (route.minExperience && profile.experienceYears < route.minExperience) {
    return finish("potential", "You are short of the work experience this route usually expects.")
  }

  if (route.maxAge && profile.age > route.maxAge) {
    return finish("potential", "Age can reduce points on this route. It is still worth checking the current grid.")
  }

  if (route.minEnglish && ENGLISH_RANK[profile.englishLevel] < ENGLISH_RANK[route.minEnglish]) {
    return finish("potential", "Your English level is below what this route usually asks you to prove.")
  }

  if (route.skilledBands && !route.skilledBands.includes(band)) {
    return finish("potential", "This route is stronger for occupations on its skilled list. Yours may need a closer look.")
  }

  if (route.recommendLanguage && !speaks(profile, route.recommendLanguage)) {
    return finish("potential", route.fitReason)
  }

  return finish("likely", route.fitReason)
}

function routeRank(route: RouteAssessment, featured: boolean): number {
  const statusScore = { likely: 400, potential: 300, conditional: 200, unavailable: 100 }[route.status]
  return statusScore + (featured ? 40 : 0) - (/student/i.test(route.name) ? 25 : 0)
}

function languageReadiness(profile: MobilityProfile, destination: Destination): number {
  if (destination.recommendLanguage && !speaks(profile, destination.recommendLanguage)) {
    if (profile.englishLevel === "fluent" && destination.englishAccepted) return 70
    return 46
  }
  if (destination.englishTestExpected && profile.englishLevel === "fluent") return 52
  if (destination.englishTestExpected && profile.englishLevel === "intermediate") return 44
  if (destination.englishTestExpected) return 32
  if (profile.englishLevel === "fluent") return 88
  if (profile.englishLevel === "intermediate") return 70
  return 42
}

function readinessScore(
  profile: MobilityProfile,
  destination: Destination,
  primary: RouteAssessment,
  cost: number,
): number {
  const fund = clamp(Math.round((profile.savingsGbp / cost) * 100), 0, 100)
  const time = clamp(Math.round((profile.timelineMonths / destination.prepMonths) * 100), 0, 120)
  const language = languageReadiness(profile, destination)
  const routeScore = { likely: 78, potential: 82, conditional: 30, unavailable: 18 }[primary.status]
  let score = Math.round(fund * 0.34 + Math.min(time, 100) * 0.16 + language * 0.28 + routeScore * 0.22)
  if (primary.needsSponsor && !profile.hasJobOffer) score = Math.round(score * 0.85)
  return clamp(score, 18, 96)
}

function lifestyleScore(profile: MobilityProfile, destination: Destination): number {
  let score = 70
  if (profile.climate === "any" || profile.climate === destination.climate) score += 14
  else score -= 8
  return clamp(score, 40, 94)
}

function settlementScore(profile: MobilityProfile, destination: Destination): number {
  let score = destination.settlementBase
  if (!destination.englishFriendly && !destination.recommendLanguage) score -= 4
  if (destination.recommendLanguage && !speaks(profile, destination.recommendLanguage)) score -= 6
  if (profile.family === "family") score -= 4
  if (destination.englishFriendly && profile.englishLevel === "fluent") score += 0
  return clamp(score, 35, 94)
}

function whyText(profile: MobilityProfile, destination: Destination, assessment: {
  scores: ScoreBreakdown
  primary: RouteAssessment
  languageCallout?: string
}): string {
  const parts: string[] = []
  if (assessment.scores.career >= 80) {
    parts.push(`your occupation appears in relevant employment categories for ${destination.name}`)
  } else {
    parts.push(`your occupation is a partial fit for the roles ${destination.name} recruits most easily`)
  }
  if (destination.englishFriendly && profile.englishLevel !== "basic") {
    parts.push("your English proficiency meets typical requirements")
  }
  if (assessment.scores.affordability >= 85) {
    parts.push("your savings cover the estimated relocation budget")
  } else if (assessment.scores.affordability >= 55) {
    parts.push("your savings are close to your estimated relocation budget")
  } else {
    parts.push("your savings are below the estimated relocation budget")
  }
  if (assessment.primary.needsSponsor && !profile.hasJobOffer) {
    parts.push("the main route depends on an employer sponsoring the visa")
  }
  if (assessment.languageCallout) {
    parts.push(assessment.languageCallout.charAt(0).toLowerCase() + assessment.languageCallout.slice(1))
  }

  const sentence = parts.join(", ")
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + "."
}

export function assessDestination(profile: MobilityProfile, destination: Destination): DestinationAssessment {
  const routes = destination.routes.map((route) => qualify(profile, route))
  const featuredId = destination.routes.find((route) => route.featured)?.id
  const featured = routes.find((route) => route.id === featuredId)
  const fallback = [...routes].sort((a, b) => routeRank(b, false) - routeRank(a, false))[0]
  const primary = featured && featured.status !== "unavailable" ? featured : fallback
  if (!primary) {
    throw new Error(`No routes configured for ${destination.slug}`)
  }

  const band = occupationBand(profile.profession)
  const costs = scaleCosts(destination.costs, profile)
  const totalCostGbp = totalCost(costs)
  const people = Math.max(1, profile.familySize)
  const affordability = clamp(Math.round((profile.savingsGbp / totalCostGbp) * 100), 30, 95)
  const scoresWithoutMatch: Omit<ScoreBreakdown, "match"> = {
    visa: VISA_SCORE[primary.status],
    career: OUTLOOK_SCORE[destination.jobStrength[band]],
    affordability,
    lifestyle: lifestyleScore(profile, destination),
    settlement: settlementScore(profile, destination),
  }
  const match = clamp(Math.round(
    scoresWithoutMatch.visa * 0.3 +
    scoresWithoutMatch.career * 0.25 +
    scoresWithoutMatch.affordability * 0.18 +
    scoresWithoutMatch.lifestyle * 0.14 +
    scoresWithoutMatch.settlement * 0.13,
  ), 1, 99)

  const languageCallout = destination.recommendLanguage && !speaks(profile, destination.recommendLanguage)
    ? `${destination.recommendLanguage} language → recommended`
    : undefined

  const scores = { ...scoresWithoutMatch, match }
  const prepBump = languageCallout ? 2 : 0
  const partial = {
    destination,
    routes,
    primary,
    scores,
    readiness: readinessScore(profile, destination, primary, totalCostGbp),
    totalCostGbp,
    costs,
    prepMonths: destination.prepMonths + prepBump,
    documents: destination.documentCount + (people - 1) * 3,
    housingGbp: costs.rent,
    jobLabel: destination.jobStrength[band],
    jobCount: destination.jobCount[band],
    languageCallout,
  }

  return {
    ...partial,
    why: whyText(profile, destination, partial),
  }
}

export function assessAll(profile: MobilityProfile): DestinationAssessment[] {
  return DESTINATIONS
    .map((destination) => assessDestination(profile, destination))
    .sort((a, b) => b.scores.match - a.scores.match || b.readiness - a.readiness)
}

export function assessOne(profile: MobilityProfile, slug: string): DestinationAssessment | undefined {
  const destination = DESTINATIONS.find((item) => item.slug === slug)
  if (!destination) return undefined
  return assessDestination(profile, destination)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
