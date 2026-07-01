import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

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
    destination: string
    timeline: string
}

interface VisaMatch {
    country: string
    visa: string
    score: number
    timeline: string
    costRange: string
}

/* ── Scoring helpers ─────────────────────────────────── */
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
        "under-500k": 1, "500k-2m": 2, "2m-5m": 3, "5m-10m": 4, "10m-plus": 5,
    }
    const got = tiers[budget] ?? 2
    const need = tiers[minTier] ?? 2
    if (got >= need) return 0 // no penalty
    return -(need - got) * 6
}

/* ── Visa definitions ────────────────────────────────── */
const VISA_DEFS = [
    // UK
    {
        country: "United Kingdom", visa: "Skilled Worker Visa",
        idealAge: [24, 45] as [number, number], minEdu: "bachelors", idealExp: 3, minEnglish: "ielts-6.0",
        goals: ["work"], minBudget: "2m-5m", timeline: "3–6 months", costRange: "₦2M – ₦8M",
    },
    {
        country: "United Kingdom", visa: "Student Visa",
        idealAge: [17, 35] as [number, number], minEdu: "secondary", idealExp: 0, minEnglish: "ielts-5.5",
        goals: ["study"], minBudget: "2m-5m", timeline: "2–4 months", costRange: "₦3M – ₦12M",
    },
    {
        country: "United Kingdom", visa: "Health & Care Worker Visa",
        idealAge: [22, 50] as [number, number], minEdu: "diploma", idealExp: 2, minEnglish: "ielts-6.0",
        goals: ["work"], minBudget: "500k-2m", timeline: "3–5 months", costRange: "₦1.5M – ₦5M",
    },
    {
        country: "United Kingdom", visa: "Global Talent Visa",
        idealAge: [25, 55] as [number, number], minEdu: "masters", idealExp: 5, minEnglish: "fluent",
        goals: ["work", "business"], minBudget: "5m-10m", timeline: "3–8 months", costRange: "₦3M – ₦10M",
    },
    {
        country: "United Kingdom", visa: "Innovator Founder Visa",
        idealAge: [25, 50] as [number, number], minEdu: "bachelors", idealExp: 3, minEnglish: "ielts-6.5",
        goals: ["business"], minBudget: "10m-plus", timeline: "3–6 months", costRange: "₦5M – ₦15M+",
    },
    // Canada
    {
        country: "Canada", visa: "Express Entry",
        idealAge: [23, 35] as [number, number], minEdu: "bachelors", idealExp: 3, minEnglish: "ielts-6.5",
        goals: ["work"], minBudget: "2m-5m", timeline: "6–12 months", costRange: "₦2M – ₦6M",
    },
    {
        country: "Canada", visa: "Provincial Nominee Program (PNP)",
        idealAge: [23, 45] as [number, number], minEdu: "diploma", idealExp: 2, minEnglish: "ielts-6.0",
        goals: ["work"], minBudget: "2m-5m", timeline: "6–18 months", costRange: "₦2M – ₦7M",
    },
    {
        country: "Canada", visa: "Study Permit",
        idealAge: [17, 35] as [number, number], minEdu: "secondary", idealExp: 0, minEnglish: "ielts-6.0",
        goals: ["study"], minBudget: "5m-10m", timeline: "2–4 months", costRange: "₦4M – ₦15M",
    },
    {
        country: "Canada", visa: "Spousal Sponsorship",
        idealAge: [18, 55] as [number, number], minEdu: "secondary", idealExp: 0, minEnglish: "intermediate",
        goals: ["family"], minBudget: "500k-2m", timeline: "12–24 months", costRange: "₦1M – ₦3M",
    },
    // Europe
    {
        country: "Europe", visa: "Germany Blue Card",
        idealAge: [24, 45] as [number, number], minEdu: "bachelors", idealExp: 2, minEnglish: "intermediate",
        goals: ["work"], minBudget: "2m-5m", timeline: "2–4 months", costRange: "₦2M – ₦6M",
    },
    {
        country: "Europe", visa: "Portugal D7 Visa",
        idealAge: [25, 60] as [number, number], minEdu: "secondary", idealExp: 0, minEnglish: "beginner",
        goals: ["work", "business", "family"], minBudget: "5m-10m", timeline: "3–6 months", costRange: "₦3M – ₦8M",
    },
    {
        country: "Europe", visa: "Netherlands Highly Skilled Migrant Visa",
        idealAge: [24, 45] as [number, number], minEdu: "bachelors", idealExp: 3, minEnglish: "fluent",
        goals: ["work"], minBudget: "2m-5m", timeline: "1–3 months", costRange: "₦2M – ₦7M",
    },
    {
        country: "Europe", visa: "Ireland Critical Skills Employment Permit",
        idealAge: [24, 45] as [number, number], minEdu: "bachelors", idealExp: 2, minEnglish: "fluent",
        goals: ["work"], minBudget: "2m-5m", timeline: "2–4 months", costRange: "₦2M – ₦6M",
    },
]

function scoreCandidate(form: FormData): VisaMatch[] {
    return VISA_DEFS.map((v) => {
        let score = 0
        score += ageScore(form.age, v.idealAge)
        score += eduScore(form.education, v.minEdu)
        score += expScore(form.experience, v.idealExp)
        score += englishScore(form.english, v.minEnglish)
        score += goalMatch(form.goals, v.goals)
        score += budgetFit(form.budget, v.minBudget)

        // Destination preference bonus
        if (form.destination !== "no-preference") {
            const destMap: Record<string, string> = { uk: "United Kingdom", canada: "Canada", europe: "Europe" }
            if (destMap[form.destination] === v.country) score += 8
            else score -= 4
        }

        // Healthcare profession bonus for Health & Care visa
        const healthTerms = ["nurse", "doctor", "carer", "healthcare", "midwife", "pharmacist", "physiotherapist", "medical", "health"]
        if (v.visa === "Health & Care Worker Visa" && healthTerms.some((t) => form.profession.toLowerCase().includes(t))) {
            score += 15
        }

        // Tech/STEM bonus for Blue Card, HSM, Critical Skills
        const techTerms = ["software", "engineer", "developer", "data", "scientist", "it ", "technology", "tech", "cyber", "ai ", "machine learning"]
        if (["Germany Blue Card", "Netherlands Highly Skilled Migrant Visa", "Ireland Critical Skills Employment Permit"].includes(v.visa) &&
            techTerms.some((t) => form.profession.toLowerCase().includes(t))) {
            score += 10
        }

        return {
            country: v.country,
            visa: v.visa,
            score: clamp(score),
            timeline: v.timeline,
            costRange: v.costRange,
        }
    })
        .sort((a, b) => b.score - a.score)
}

/* ── API handler ─────────────────────────────────────── */
export async function POST(req: NextRequest) {
    try {
        const form: FormData = await req.json()

        // Rule-based scoring
        const allMatches = scoreCandidate(form)
        const topMatches = allMatches.slice(0, 5)

        // Generate personalised summary via OpenAI
        let summary = ""
        let nextSteps: string[] = []

        const apiKey = process.env.OPENAI_API_KEY
        if (apiKey) {
            try {
                const openai = new OpenAI({ apiKey })

                const prompt = `You are an advisor at EasyMoveZone, a Migration Intelligence & Relocation Strategy Firm based in Nigeria. We serve Nigerian professionals, students, healthcare workers, tech professionals, entrepreneurs, and families relocating to UK, Canada, or Europe. Based on the following candidate profile and visa match scores, write a personalised assessment.

CANDIDATE PROFILE:
- Age: ${form.age}
- Education: ${form.education}
- Years of experience: ${form.experience}
- Profession: ${form.profession}
- English proficiency: ${form.english}
- Budget: ${form.budget}
- Family status: ${form.family}
- Goals: ${form.goals.join(", ")}
- Preferred destination: ${form.destination}
- Timeline: ${form.timeline}

TOP VISA MATCHES (score out of 100):
${topMatches.map((m, i) => `${i + 1}. ${m.country} — ${m.visa}: ${m.score}% match (Timeline: ${m.timeline}, Cost: ${m.costRange})`).join("\n")}

Write a response in this exact JSON format (no markdown, just raw JSON):
{
  "summary": "A 2-3 sentence personalised summary of their best options and why they are a good fit. Be encouraging but realistic. Mention their profession and top match specifically.",
  "nextSteps": ["Step 1: specific actionable suggestion", "Step 2: another suggestion", "Step 3: another suggestion"]
}

Be concise. Do not use markdown formatting. Only output valid JSON.`

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 400,
                })

                const raw = completion.choices[0]?.message?.content?.trim() ?? ""
                try {
                    const parsed = JSON.parse(raw)
                    summary = parsed.summary ?? ""
                    nextSteps = parsed.nextSteps ?? []
                } catch {
                    // If parsing fails, use the raw text as summary
                    summary = raw
                    nextSteps = [
                        "Book a strategy call with our team",
                        "Prepare your documents for the recommended visa",
                        "Visit our fees page for pricing details",
                    ]
                }
            } catch (aiError) {
                console.error("OpenAI API error:", aiError)
                summary = `Based on your profile as a ${form.profession} with ${form.experience} years of experience, your strongest match is the ${topMatches[0].visa} in ${topMatches[0].country} with a ${topMatches[0].score}% compatibility score. Your ${form.education} education and ${form.english} English proficiency position you well for this pathway.`
                nextSteps = [
                    "Book a strategy call to discuss your options in detail",
                    "Start gathering your documents (passport, certificates, references)",
                    "Visit our fees page to understand the investment required",
                ]
            }
        } else {
            summary = `Based on your profile as a ${form.profession} with ${form.experience} years of experience, your strongest match is the ${topMatches[0].visa} in ${topMatches[0].country} with a ${topMatches[0].score}% compatibility score. Your ${form.education} education and ${form.english} English proficiency position you well for this pathway.`
            nextSteps = [
                "Book a strategy call to discuss your options in detail",
                "Start gathering your documents (passport, certificates, references)",
                "Visit our fees page to understand the investment required",
            ]
        }

        return NextResponse.json({
            matches: topMatches,
            summary,
            nextSteps,
        })
    } catch (error) {
        console.error("Assessment error:", error)
        return NextResponse.json({ error: "Assessment failed. Please try again." }, { status: 500 })
    }
}
