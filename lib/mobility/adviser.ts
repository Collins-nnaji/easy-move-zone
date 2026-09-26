import type { DestinationAssessment, MobilityProfile } from "./types"
import { formatGbp } from "./format"

const DISCLAIMER = "This is planning guidance from your profile, not an immigration decision."

export function advise(profile: MobilityProfile, results: DestinationAssessment[], question: string): string {
  const text = question.toLowerCase()
  const focus = results.find((item) => text.includes(item.destination.name.toLowerCase()))
    ?? results.find((item) => text.includes(item.destination.slug.replace("-", " ")))
    ?? results[0]

  if (!focus) return `Save a mobility profile first. ${DISCLAIMER}`

  if (/spouse|partner|wife|husband|child|family/.test(text)) {
    if (profile.family === "single") {
      return `On this profile you are moving alone, so family and dependant routes are marked not applicable. Add a partner or child in Explore and the routes will be scored again. ${DISCLAIMER}`
    }
    return `You have marked a ${profile.family} move of ${profile.familySize}. Dependant visas, extra documents, and a higher fund are included in the ${focus.destination.name} estimate (${formatGbp(focus.totalCostGbp)}). Each route still has its own rule for who can come with you. ${DISCLAIMER}`
  }

  if (/ielts|english test|language test|toefl|pte/.test(text)) {
    if (focus.destination.englishTestExpected) {
      return `${focus.destination.name} usually wants a formal English result even when you already speak English. Your level is ${profile.englishLevel}, and the test is its own step on the path. ${DISCLAIMER}`
    }
    if (focus.languageCallout) {
      return `${focus.languageCallout}. English at ${profile.englishLevel} still counts toward the file, and a ${focus.destination.recommendLanguage ?? "local"} course makes settlement easier. ${DISCLAIMER}`
    }
    return `${focus.destination.name} can usually accept your ${profile.englishLevel} English without making a language test the centre of the route. Keep certificates anyway. ${DISCLAIMER}`
  }

  if (/work while stud|student/.test(text)) {
    const student = focus.routes.find((route) => /student/i.test(route.name))
    if (!student) return `${focus.destination.name} is not showing a student route on this profile. ${DISCLAIMER}`
    return `The student route for ${focus.destination.name} is “${student.label}”. Work rights depend on that visa and are not the same as a skilled worker visa. ${student.reason} ${DISCLAIMER}`
  }

  if (/how much|money|cost|fund|savings|budget/.test(text)) {
    return `For ${focus.destination.name} the planning budget is ${formatGbp(focus.totalCostGbp)}. You have saved ${formatGbp(profile.savingsGbp)}, which is ${focus.scores.affordability}% of that budget. The fund splits visa, flight, deposit, first month, an emergency buffer, documents, and other landing costs. ${DISCLAIMER}`
  }

  if (/which visa|what visa|route|eligible|can i/.test(text)) {
    const lines = focus.routes.map((route) => `${route.name}: ${route.label}`).join(". ")
    return `For ${focus.destination.name}, the lead route is ${focus.primary.name} (${focus.primary.label}). ${lines}. ${DISCLAIMER}`
  }

  if (/translat|document|police|certificate/.test(text)) {
    return `${focus.destination.name} is planned around ${focus.documents} core documents. Degrees, police certificates, and civil documents often need a certified translation if they are not in the language the visa mission accepts. The Move Passport is where those files are collected once, then shared. ${DISCLAIMER}`
  }

  if (/job|sponsor|work/.test(text)) {
    return `${focus.destination.name} shows ${focus.jobLabel.toLowerCase()} prospects for your occupation, with ${focus.jobCount} preview roles in this band. ${focus.primary.needsSponsor ? "The lead route needs an employer to sponsor you." : "The lead route does not start with an employer sponsor."} ${DISCLAIMER}`
  }

  if (/hous|rent|live/.test(text)) {
    return `A first-month housing estimate for ${focus.destination.name} is ${formatGbp(focus.housingGbp)}. That sits inside the ${formatGbp(focus.totalCostGbp)} move fund, together with the deposit. ${DISCLAIMER}`
  }

  return `${focus.destination.name} is a ${focus.scores.match}% match. ${focus.why} Readiness is ${focus.readiness}%: ${focus.primary.name} is “${focus.primary.label}”, preparation is about ${focus.prepMonths} months, and the fund is ${formatGbp(focus.totalCostGbp)}. Ask about a spouse, English tests, cost, documents, or jobs if you want that slice. ${DISCLAIMER}`
}

export const ADVISER_PROMPTS = [
  "Can my spouse come?",
  "Do I need IELTS?",
  "Can I work while studying?",
  "How much money do I need?",
  "Which visa applies to me?",
  "What documents need translating?",
] as const
