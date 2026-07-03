import { NextRequest, NextResponse } from "next/server"
import { type Destination, type Mode } from "@/app/move/data"
import { getMoveDestinations } from "@/lib/move/get-catalog"
import { chatJson } from "@/lib/ai/openai"

/* ── Types ───────────────────────────────────────────── */
interface FormData {
    age: number
    education: string
    experience: number
    profession: string
    english: string
    budget: string
    family: string
    goals: string[]
    nationality: string
    destination: string
    timeline: string
}

interface VisaMatch {
    destinationId: string | null
    country: string
    city: string
    visa: string
    score: number
    timeline: string
    costRange: string
}

interface AssessResult {
    summary: string
    nextSteps: string[]
}

/* ── Goal → Mode mapping ─────────────────────────────── */
// The user's relocation goal maps onto the app's stay "mode", which is how
// destination visa/stats data is keyed. Study/work/family read as a long-term
// move; a break or remote-first goal reads as a nomad stint.
function goalToMode(goals: string[]): Mode {
    if (goals.some((g) => ["study", "work", "family", "business"].includes(g))) return "move"
    if (goals.some((g) => ["remote", "nomad"].includes(g))) return "nomad"
    return "trip"
}

/* ── Scoring helpers (unchanged, transparent & explainable) ── */
function clamp(v: number, min = 0, max = 100) {
    return Math.max(min, Math.min(max, v))
}

function ageScore(age: number, ideal: [number, number]): number {
    if (age >= ideal[0] && age <= ideal[1]) return 20
    const dist = age < ideal[0] ? ideal[0] - age : age - ideal[1]
    return Math.max(0, 20 - dist * 3)
}

function eduScore(edu: string, minLevel: string): number {
    const levels: Record<string, number> = {
        secondary: 1, diploma: 2, bachelors: 3, masters: 4, phd: 5,
    }
    const got = levels[edu] ?? 0
    const need = levels[minLevel] ?? 0
    if (got >= need) return 20
    return Math.max(0, 20 - (need - got) * 7)
}

function expScore(years: number, ideal: number): number {
    if (years >= ideal) return 20
    return Math.max(0, 20 - (ideal - years) * 5)
}

function englishScore(level: string, minLevel: string): number {
    const levels: Record<string, number> = {
        beginner: 1, intermediate: 2, fluent: 3, "ielts-5.5": 2, "ielts-6.0": 3, "ielts-6.5": 3, "ielts-7.0": 4, "ielts-7.5": 4, "ielts-8.0": 5,
    }
    const got = levels[level] ?? 2
    const need = levels[minLevel] ?? 2
    if (got >= need) return 20
    return Math.max(0, 20 - (need - got) * 8)
}

function goalMatch(goals: string[], accepted: string[]): number {
    const match = goals.some((g) => accepted.includes(g))
    return match ? 20 : 3
}

function budgetFit(budget: string, minTier: string): number {
    const tiers: Record<string, number> = {
        lean: 1, comfortable: 2, generous: 3, high: 4,
    }
    const got = tiers[budget] ?? 2
    const need = tiers[minTier] ?? 1
    if (got >= need) return 0 // no penalty
    return -(need - got) * 6
}

/* ── Profile fit (destination-agnostic slice of the score) ─── */
// Applies the same rule-based factors used by the legacy engine, but against
// generic ideals so it can layer on top of any live destination's own match
// score. Returns a 0–100 signal of how ready this profile is to relocate.
function profileFit(form: FormData): number {
    let score = 0
    score += ageScore(form.age, [22, 45]) // 0–20
    score += eduScore(form.education, "bachelors") // 0–20
    score += expScore(form.experience, 3) // 0–20
    score += englishScore(form.english, "ielts-6.0") // 0–20
    score += goalMatch(form.goals, ["work", "study", "family", "business", "remote", "nomad"]) // 3 or 20
    score += budgetFit(form.budget, "comfortable") // 0 or negative
    return clamp(score)
}

/* ── DB-driven ranking (primary path) ────────────────── */
// Blends each destination's own suitability for the chosen mode with the
// profile-readiness signal, then surfaces that destination's real visa
// headline/tag for the mode as the recommended pathway.
function rankDestinations(form: FormData, destinations: Destination[]): VisaMatch[] {
    const mode = goalToMode(form.goals)
    const fit = profileFit(form) // shared across all destinations

    return destinations
        .map((d) => {
            const destMatch = d.match?.[mode] ?? 60 // destination's own 0–100 suitability
            let score = Math.round(destMatch * 0.6 + fit * 0.4)

            // Region/destination preference bonus.
            if (form.destination && form.destination !== "no-preference") {
                const pref = form.destination.toLowerCase()
                if (d.region.toLowerCase().includes(pref) || d.country.toLowerCase().includes(pref) || d.city.toLowerCase().includes(pref)) {
                    score += 8
                } else {
                    score -= 4
                }
            }

            const visa = d.visa?.[mode]
            const costStat = (d.stats?.[mode] ?? []).find(([k]) => /cost|rent|1-bed|furnished/i.test(k))
            return {
                destinationId: d.id,
                country: d.country,
                city: d.city,
                visa: visa?.headline ?? "Entry route varies",
                score: clamp(score),
                timeline: form.timeline || "Varies",
                costRange: costStat ? `${costStat[0]}: ${costStat[1]}` : (visa?.tag ?? "Varies"),
            }
        })
        .sort((a, b) => b.score - a.score)
}

/* ── Static fallback (used only when catalog is empty) ── */
// A trimmed, globalized pathway list so the engine still returns matches when
// no destinations are seeded. USD, no country hardcoding beyond the visa itself.
const VISA_DEFS = [
    { country: "United Kingdom", city: "London", visa: "Skilled Worker Visa", idealAge: [24, 45] as [number, number], minEdu: "bachelors", idealExp: 3, minEnglish: "ielts-6.0", goals: ["work"], minBudget: "comfortable", timeline: "3–6 months", costRange: "$2,600 – $10,000" },
    { country: "United Kingdom", city: "London", visa: "Student Visa", idealAge: [17, 35] as [number, number], minEdu: "secondary", idealExp: 0, minEnglish: "ielts-5.5", goals: ["study"], minBudget: "comfortable", timeline: "2–4 months", costRange: "$4,000 – $16,000" },
    { country: "Canada", city: "Toronto", visa: "Express Entry", idealAge: [23, 35] as [number, number], minEdu: "bachelors", idealExp: 3, minEnglish: "ielts-6.5", goals: ["work"], minBudget: "comfortable", timeline: "6–12 months", costRange: "$2,600 – $8,000" },
    { country: "Canada", city: "Toronto", visa: "Study Permit", idealAge: [17, 35] as [number, number], minEdu: "secondary", idealExp: 0, minEnglish: "ielts-6.0", goals: ["study"], minBudget: "generous", timeline: "2–4 months", costRange: "$5,000 – $20,000" },
    { country: "Germany", city: "Berlin", visa: "EU Blue Card", idealAge: [24, 45] as [number, number], minEdu: "bachelors", idealExp: 2, minEnglish: "intermediate", goals: ["work"], minBudget: "comfortable", timeline: "2–4 months", costRange: "$2,600 – $8,000" },
    { country: "Portugal", city: "Lisbon", visa: "D7 / D8 Visa", idealAge: [25, 60] as [number, number], minEdu: "secondary", idealExp: 0, minEnglish: "beginner", goals: ["work", "business", "family", "remote"], minBudget: "generous", timeline: "3–6 months", costRange: "$4,000 – $10,000" },
    { country: "Netherlands", city: "Amsterdam", visa: "Highly Skilled Migrant Visa", idealAge: [24, 45] as [number, number], minEdu: "bachelors", idealExp: 3, minEnglish: "fluent", goals: ["work"], minBudget: "comfortable", timeline: "1–3 months", costRange: "$2,600 – $9,000" },
]

function scoreStaticFallback(form: FormData): VisaMatch[] {
    return VISA_DEFS.map((v) => {
        let score = 0
        score += ageScore(form.age, v.idealAge)
        score += eduScore(form.education, v.minEdu)
        score += expScore(form.experience, v.idealExp)
        score += englishScore(form.english, v.minEnglish)
        score += goalMatch(form.goals, v.goals)
        score += budgetFit(form.budget, v.minBudget)

        const healthTerms = ["nurse", "doctor", "carer", "healthcare", "midwife", "pharmacist", "physiotherapist", "medical", "health"]
        if (v.visa.includes("Health") && healthTerms.some((t) => form.profession.toLowerCase().includes(t))) score += 15
        const techTerms = ["software", "engineer", "developer", "data", "scientist", "technology", "tech", "cyber", "machine learning"]
        if (["EU Blue Card", "Highly Skilled Migrant Visa"].includes(v.visa) && techTerms.some((t) => form.profession.toLowerCase().includes(t))) score += 10

        return {
            destinationId: null,
            country: v.country,
            city: v.city,
            visa: v.visa,
            score: clamp(score),
            timeline: v.timeline,
            costRange: v.costRange,
        }
    }).sort((a, b) => b.score - a.score)
}

/* ── Deterministic fallback narrative (no-AI-key path) ── */
function fallbackNarrative(form: FormData, top: VisaMatch): AssessResult {
    return {
        summary: `As a ${form.profession || "professional"} with ${form.experience} year${form.experience === 1 ? "" : "s"} of experience, your strongest match is the ${top.visa} in ${top.city}, ${top.country} at ${top.score}% fit. Your ${form.education} education and ${form.english} English position you well for this pathway.`,
        nextSteps: [
            `Confirm ${top.visa} eligibility on the official ${top.country} immigration site`,
            "Gather core documents — passport, education certificates, proof of funds",
            "Get your document checklist below and start the highest-priority items",
        ],
    }
}

/* ── API handler ─────────────────────────────────────── */
export async function POST(req: NextRequest) {
    try {
        const form: FormData = await req.json()

        // DB-first: rank live destinations; fall back to static pathways only
        // when the catalog is empty/unreachable.
        const { destinations, source } = await getMoveDestinations()
        const allMatches = source === "database" && destinations.length > 0
            ? rankDestinations(form, destinations)
            : scoreStaticFallback(form)
        const topMatches = allMatches.slice(0, 5)

        if (topMatches.length === 0) {
            return NextResponse.json({ matches: [], summary: "We couldn't find a matching pathway. Try widening your preferences.", nextSteps: [] })
        }

        const fallback = fallbackNarrative(form, topMatches[0])

        const system = `You are a relocation strategist inside a global Relocation OS app. You advise people worldwide on visa pathways. Based on the candidate profile and their top visa matches (which are already scored), write an encouraging but realistic assessment. Never invent visa rules, fees or eligibility criteria beyond what is implied by the matches given. Use USD for any money. Reference the person's profession and their #1 match specifically. Respond with raw JSON only: {"summary": "2-3 sentences", "nextSteps": ["step 1", "step 2", "step 3"]}.`

        const user = `CANDIDATE PROFILE
- Nationality: ${form.nationality || "unspecified"}
- Age: ${form.age}
- Education: ${form.education}
- Experience: ${form.experience} years
- Profession: ${form.profession}
- English: ${form.english}
- Budget: ${form.budget}
- Family: ${form.family}
- Goals: ${form.goals.join(", ")}
- Preferred destination: ${form.destination}
- Timeline: ${form.timeline}

TOP VISA MATCHES (score out of 100)
${topMatches.map((m, i) => `${i + 1}. ${m.city}, ${m.country} — ${m.visa}: ${m.score}% match (Timeline: ${m.timeline}, Cost: ${m.costRange})`).join("\n")}`

        const narrative = await chatJson<AssessResult>(system, user, fallback)
        const summary = typeof narrative.summary === "string" && narrative.summary.trim() ? narrative.summary.trim() : fallback.summary
        const nextSteps = Array.isArray(narrative.nextSteps) && narrative.nextSteps.length ? narrative.nextSteps : fallback.nextSteps

        return NextResponse.json({ matches: topMatches, summary, nextSteps })
    } catch (error) {
        console.error("Assessment error:", error)
        return NextResponse.json({ error: "Assessment failed. Please try again." }, { status: 500 })
    }
}
