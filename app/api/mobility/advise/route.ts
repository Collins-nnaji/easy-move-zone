import { NextResponse } from "next/server"
import { chatStream, getAiProvider } from "@/lib/ai/openai"
import { advise } from "@/lib/mobility/adviser"
import { assessAll } from "@/lib/mobility/score"
import type { MobilityProfile } from "@/lib/mobility/types"
import { EXAMPLE_PROFILE } from "@/lib/mobility/profile"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    question?: string
    profile?: Partial<MobilityProfile>
  } | null

  const question = body?.question?.trim()
  if (!question) return NextResponse.json({ error: "question is required" }, { status: 400 })

  const profile: MobilityProfile = { ...EXAMPLE_PROFILE, ...(body?.profile ?? {}) }
  const results = assessAll(profile)
  const top = results.slice(0, 3)
  const provider = getAiProvider()

  if (!provider) {
    return NextResponse.json({
      answer: advise(profile, results, question),
      provider: null,
      source: "rules",
    })
  }

  const system = `You are MoveAI for EasyMoveZone, a consumer global-mobility adviser.
Answer clearly in plain English. Be specific to this user's profile and destinations.
Do not invent visa approvals. Prefer cautious planning language.
If unsure, say what to verify next.
Keep answers under 180 words.
End with: This is planning guidance from your profile, not an immigration decision.`

  const user = `Profile:
Citizenship: ${profile.citizenship}
Lives in: ${profile.currentCountry}
Age: ${profile.age}
Profession: ${profile.profession}
Experience: ${profile.experienceYears} years
Education: ${profile.education}
English: ${profile.englishLevel}
Languages: ${profile.languages.join(", ")}
Savings: £${profile.savingsGbp}
Household: ${profile.family} (${profile.familySize})
Timeline: ${profile.timelineMonths} months
Has job offer: ${profile.hasJobOffer ? "yes" : "no"}

Top destinations:
${top.map((item) => `- ${item.destination.name}: ${item.scores.match}% match, readiness ${item.readiness}%, lead route ${item.primary.name} (${item.primary.label}), cost £${item.totalCostGbp}, ${item.why}`).join("\n")}

Question: ${question}`

  const answer = await chatStream(system, user)
  if (!answer || answer.startsWith("Unable to process") || answer.startsWith("AI features")) {
    return NextResponse.json({
      answer: advise(profile, results, question),
      provider,
      source: "rules-fallback",
    })
  }

  return NextResponse.json({ answer, provider, source: "ai" })
}
