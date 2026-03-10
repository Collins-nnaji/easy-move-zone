import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { getLendersByCountry, type MortgageLender } from "@/lib/mortgage/lenders"

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

interface AssessmentInput {
  country: string
  city: string
  propertyPriceUsd: number
  downPaymentUsd: number
  monthlyIncomeUsd: number
  otherDebtUsd: number
  tenureYears: number
  employmentType: string
  isNhf?: boolean
  isRsa?: boolean
  isDiaspora?: boolean
  creditScoreBand: string
  topLenders: Pick<MortgageLender, "id" | "name" | "productName" | "type" | "minRate" | "maxRate" | "maxLoanUsd" | "minDownPct" | "keyFeatures" | "whoIsItFor">[]
}

const fallbackAssessment = (input: AssessmentInput) => ({
  score: 62,
  scoreLabel: "Moderate",
  summary: `Based on your profile for ${input.country}, you appear to have a reasonable chance of mortgage approval. Your down payment of $${input.downPaymentUsd.toLocaleString()} represents ${Math.round((input.downPaymentUsd / input.propertyPriceUsd) * 100)}% of the property value.`,
  strengths: [
    "Down payment meets minimum requirements for several products",
    "Income level appears sufficient for loan amount requested",
  ],
  concerns: [
    "Credit score should be confirmed with a bureau before applying",
    "Ensure all debt obligations are declared accurately",
  ],
  recommendation: `Focus on the lenders pre-matched to your profile. Start with the highest-scoring match and request a pre-approval letter before approaching the seller.`,
  nextSteps: [
    "Gather 6 months of bank statements and payslips",
    "Obtain a credit bureau report",
    "Choose your preferred lender from the matched list",
    "Click 'Connect me' to send your application",
  ],
})

export async function POST(req: NextRequest) {
  let body: AssessmentInput
  try {
    body = (await req.json()) as AssessmentInput
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const loanAmountUsd = body.propertyPriceUsd - body.downPaymentUsd
  const downPct = Math.round((body.downPaymentUsd / body.propertyPriceUsd) * 100)
  const dti = Math.round(((loanAmountUsd / (body.tenureYears * 12)) / body.monthlyIncomeUsd) * 100)

  if (!openai) {
    return NextResponse.json(fallbackAssessment(body))
  }

  const lenderSummary = body.topLenders.slice(0, 3).map(l =>
    `• ${l.name} — ${l.productName} (${l.type}) @ ${l.minRate}–${l.maxRate}%, max $${l.maxLoanUsd.toLocaleString()}, ${l.minDownPct}% min down`
  ).join("\n")

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: `You are a senior mortgage advisor at EasyMoveZone specialising in African real estate markets.
You give honest, practical, country-specific mortgage assessments. Return ONLY valid JSON — no markdown, no explanation outside the JSON.`,
        },
        {
          role: "user",
          content: `Assess this mortgage applicant and return a JSON object:

Country: ${body.country}
City: ${body.city}
Property price: $${body.propertyPriceUsd.toLocaleString()} USD
Down payment: $${body.downPaymentUsd.toLocaleString()} USD (${downPct}%)
Loan amount: $${loanAmountUsd.toLocaleString()} USD
Monthly income: $${body.monthlyIncomeUsd.toLocaleString()} USD
Other monthly debt: $${body.otherDebtUsd.toLocaleString()} USD
Tenure: ${body.tenureYears} years
Employment: ${body.employmentType}
NHF contributor: ${body.isNhf ? "Yes" : "No"}
RSA pension holder: ${body.isRsa ? "Yes" : "No"}
Diaspora applicant: ${body.isDiaspora ? "Yes" : "No"}
Credit score band: ${body.creditScoreBand}
Estimated DTI: ${dti}%

Top matched lenders:
${lenderSummary}

Return this exact JSON structure:
{
  "score": <integer 0-100, your honest eligibility confidence score>,
  "scoreLabel": <"Strong" | "Good" | "Moderate" | "Weak" | "Unlikely">,
  "summary": <2-3 sentence assessment paragraph, country-specific>,
  "strengths": [<up to 3 specific strengths based on the profile>],
  "concerns": [<up to 3 honest concerns or risks>],
  "recommendation": <1 paragraph — which lender type to prioritise and why>,
  "nextSteps": [<4 concrete next steps for this applicant>]
}`,
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? ""
    try {
      const parsed = JSON.parse(raw)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json(fallbackAssessment(body))
    }
  } catch (err) {
    console.error("[mortgage-advisor] OpenAI error:", err)
    return NextResponse.json(fallbackAssessment(body))
  }
}
