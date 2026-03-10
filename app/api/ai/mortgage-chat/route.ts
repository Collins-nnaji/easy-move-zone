import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface ExtractedProfile {
  country?: string
  city?: string
  propertyPriceUsd?: number
  downPaymentUsd?: number
  tenureYears?: number
  monthlyIncomeUsd?: number
  otherDebtUsd?: number
  employmentType?: string
  isNhf?: boolean
  isRsa?: boolean
  isDiaspora?: boolean
  creditScoreBand?: string
}

const SYSTEM_PROMPT = `You are an expert mortgage advisor for African real estate (Nigeria, Kenya, Ghana, South Africa).
Your job is to have a friendly conversation to understand the user's situation, then give them an AI assessment and matched lenders.

You must extract these details progressively through conversation (not all at once):
- Country and city (REQUIRED)
- Property price in USD (REQUIRED)
- Down payment or budget for down payment (REQUIRED)
- Monthly income in USD (REQUIRED)
- Loan tenure preference (default 20 years if not mentioned)
- Employment type: government, private, self, diaspora (default: private)
- Other monthly debt payments (default: 0 if not mentioned)
- Credit score: excellent, good, fair, poor, unknown (default: unknown)
- Special eligibility: NHF contributor (Nigeria), RSA pension (Nigeria), diaspora (living abroad)

Guidelines:
1. Be conversational and warm — not clinical or form-like
2. Ask for 1-2 missing details at a time, not all at once
3. If the user mentions they live abroad / overseas / UK / US / etc., set isDiaspora: true
4. Convert local currency mentions to USD (NGN 1600/$, KES 130/$, GHS 16/$, ZAR 19/$)
5. Once you have country, propertyPriceUsd, downPaymentUsd, and monthlyIncomeUsd — you have ENOUGH to provide results
6. When ready to show results, set readyForResults: true in your JSON response

You must ALWAYS respond with valid JSON in this format:
{
  "reply": "Your friendly message to the user",
  "profile": { /* only include fields you extracted/updated in this turn */ },
  "readyForResults": false,
  "assessment": null
}

When readyForResults is true, also include a full assessment:
{
  "reply": "Here's your assessment...",
  "profile": { /* full profile */ },
  "readyForResults": true,
  "assessment": {
    "score": <0-100 number>,
    "scoreLabel": "<Excellent|Good|Fair|Weak>",
    "summary": "<2-sentence summary>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "concerns": ["<concern 1>"],
    "recommendation": "<1-2 sentence recommendation>",
    "nextSteps": ["<step 1>", "<step 2>", "<step 3>"]
  }
}

Score guidelines:
- 80-100: Excellent (DTI<28%, good credit, solid down payment)
- 65-79: Good (DTI<36%, fair credit, adequate down payment)
- 50-64: Fair (DTI<43%, manageable situation)
- Below 50: Weak (high DTI, poor credit, or insufficient down payment)

Country-specific scoring boosts:
- Nigeria: NHF contributes → +10; RSA pension → +8; diaspora earning in forex → +12
- Kenya: Government employee → +8; diaspora → +10
- Ghana: SSNIT contributor → +5
- South Africa: FLISP eligible (income < $2000/mo) → +8`

export async function POST(req: NextRequest) {
  let body: {
    messages: { role: string; content: string }[]
    currentProfile: ExtractedProfile
    supportedCountries: string[]
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { messages, currentProfile } = body

  try {
    const systemWithContext = `${SYSTEM_PROMPT}\n\nCurrent extracted profile so far: ${JSON.stringify(currentProfile)}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemWithContext },
        ...messages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const raw = completion.choices[0]?.message?.content ?? "{}"
    let parsed: {
      reply?: string
      profile?: ExtractedProfile
      readyForResults?: boolean
      assessment?: {
        score: number
        scoreLabel: string
        summary: string
        strengths: string[]
        concerns: string[]
        recommendation: string
        nextSteps: string[]
      } | null
    }

    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = { reply: "Sorry, I had trouble processing that. Could you rephrase?" }
    }

    return NextResponse.json({
      reply: parsed.reply ?? "Sorry, something went wrong.",
      profile: parsed.profile ?? null,
      readyForResults: parsed.readyForResults ?? false,
      assessment: parsed.readyForResults ? parsed.assessment : null,
    })
  } catch (err) {
    console.error("[mortgage-chat] OpenAI error:", err)

    // Fallback: simple keyword extraction
    const lastMessage = messages[messages.length - 1]?.content ?? ""
    const reply = currentProfile.country && currentProfile.propertyPriceUsd && currentProfile.monthlyIncomeUsd
      ? "Thanks for the information! I have enough to assess your eligibility. Let me pull up your results now."
      : "Thanks! Could you tell me the country and city where you're looking to buy, the property price, and your monthly income? That's all I need to get started."

    return NextResponse.json({
      reply,
      profile: null,
      readyForResults: false,
      assessment: null,
    })
  }
}
