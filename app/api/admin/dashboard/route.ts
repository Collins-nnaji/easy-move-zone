import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

export async function GET() {
  try {
    await assertAdminApi()
    if (!DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured." }, { status: 500 })
    }

    const sql = neon(DATABASE_URL)

    const usersRaw = await sql`
      SELECT
        u.auth_user_id,
        u.full_name,
        u.role,
        u.is_agent,
        u.agent_company,
        u.agent_verified,
        u.created_at,
        u.updated_at
      FROM user_profiles u
      ORDER BY u.created_at DESC
      LIMIT 200
    `

    const agentsRaw = await sql`
      SELECT
        u.auth_user_id,
        u.full_name,
        u.agent_company,
        u.agent_license,
        u.agent_bio,
        u.agent_verified,
        u.seller_service_cities,
        u.updated_at
      FROM user_profiles u
      WHERE u.is_agent = TRUE
      ORDER BY u.updated_at DESC
    `

    let listingsRaw: unknown[] = []
    let mortgagesRaw: unknown[] = []
    try {
      listingsRaw = await sql`
        SELECT
          id, title, city_slug, country, submission_status,
          submitted_by, submitted_at, reviewed_at, reviewer_notes,
          price_usd
        FROM property_listings
        WHERE submitted_by IS NOT NULL
        ORDER BY submitted_at DESC NULLS LAST
        LIMIT 200
      `
    } catch {
      listingsRaw = []
    }
    try {
      mortgagesRaw = await sql`
        SELECT
          id, full_name, email, country, city,
          property_price_usd, loan_amount_usd,
          ai_score, status, submitted_at, lender_id
        FROM mortgage_applications
        ORDER BY submitted_at DESC
        LIMIT 200
      `
    } catch {
      mortgagesRaw = []
    }

    return NextResponse.json({
      users: usersRaw,
      listings: listingsRaw,
      mortgageApplications: mortgagesRaw,
      agents: agentsRaw,
      stats: {
        totalUsers: usersRaw.length,
        totalBuyers: (usersRaw as { role: string }[]).filter((u) => u.role === "buyer").length,
        totalSellers: (usersRaw as { role: string }[]).filter((u) => u.role === "seller").length,
        totalAgents: agentsRaw.length,
        pendingListings: (listingsRaw as { submission_status: string }[]).filter((l) => l.submission_status === "pending").length,
        approvedListings: (listingsRaw as { submission_status: string }[]).filter((l) => l.submission_status === "approved").length,
        totalMortgages: mortgagesRaw.length,
      },
    })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error("[admin/dashboard]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
