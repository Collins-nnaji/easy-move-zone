import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  // Auth is optional — allow anonymous applications
  let authUserId: string | null = null
  try {
    const { user } = await neonAuth()
    authUserId = user?.id ?? null
  } catch {
    // not logged in — that's fine
  }

  const required = ["country", "city", "propertyPriceUsd", "downPaymentUsd", "loanAmountUsd",
    "monthlyIncomeUsd", "tenureYears", "employmentType", "fullName", "email", "phone"]

  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
    }
  }

  const id = crypto.randomUUID()

  try {
    await sql`
      INSERT INTO mortgage_applications (
        id, auth_user_id, country, city,
        property_price_usd, down_payment_usd, loan_amount_usd,
        monthly_income_usd, other_debt_usd, tenure_years,
        employment_type, is_nhf, is_rsa, is_diaspora,
        credit_score_band, full_name, email, phone,
        lender_id, ai_assessment, ai_score, ai_recommendation,
        status, submitted_at
      ) VALUES (
        ${id},
        ${authUserId},
        ${String(body.country)},
        ${String(body.city)},
        ${Number(body.propertyPriceUsd)},
        ${Number(body.downPaymentUsd)},
        ${Number(body.loanAmountUsd)},
        ${Number(body.monthlyIncomeUsd)},
        ${Number(body.otherDebtUsd ?? 0)},
        ${Number(body.tenureYears)},
        ${String(body.employmentType)},
        ${Boolean(body.isNhf ?? false)},
        ${Boolean(body.isRsa ?? false)},
        ${Boolean(body.isDiaspora ?? false)},
        ${String(body.creditScoreBand ?? "unknown")},
        ${String(body.fullName)},
        ${String(body.email)},
        ${String(body.phone)},
        ${body.lenderId ? String(body.lenderId) : null},
        ${body.aiAssessment ? String(body.aiAssessment) : null},
        ${body.aiScore ? Number(body.aiScore) : null},
        ${body.aiRecommendation ? String(body.aiRecommendation) : null},
        'submitted',
        NOW()
      )
    `

    return NextResponse.json({
      id,
      message: "Application submitted. A lender representative will contact you within 2–3 business days.",
    }, { status: 201 })
  } catch (err) {
    console.error("[mortgage/apply] DB error:", err)
    return NextResponse.json({ error: "Failed to submit application. Please try again." }, { status: 500 })
  }
}
