import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

/** Accounts from Neon Auth (neon_auth.user), joined to the app profile and session activity. */
export async function GET() {
  try {
    await assertAdminApi()
    if (!DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured." }, { status: 500 })
    }

    const sql = neon(DATABASE_URL)
    const rows = await sql`
      SELECT
        u.id,
        u.name,
        u.email,
        u."emailVerified" AS email_verified,
        u.image,
        u."createdAt" AS created_at,
        u."updatedAt" AS updated_at,
        u.role AS auth_role,
        coalesce(u.banned, false) AS banned,
        p.full_name,
        p.role AS profile_role,
        p.phone,
        p.nationality,
        p.subscription_tier,
        coalesce(p.is_agent, false) AS is_agent,
        p.agent_company,
        coalesce(p.agent_verified, false) AS agent_verified,
        p.id IS NOT NULL AS has_profile,
        s.last_active,
        coalesce(s.active_sessions, 0) AS active_sessions,
        coalesce(a.providers, ARRAY[]::text[]) AS providers,
        EXISTS (SELECT 1 FROM admin_users au WHERE lower(au.email) = lower(u.email)) AS is_admin
      FROM neon_auth."user" u
      LEFT JOIN public.user_profiles p ON p.user_id = u.id::text
      LEFT JOIN LATERAL (
        SELECT max(ss."updatedAt") AS last_active,
               count(*) FILTER (WHERE ss."expiresAt" > now())::int AS active_sessions
        FROM neon_auth.session ss
        WHERE ss."userId" = u.id
      ) s ON true
      LEFT JOIN LATERAL (
        SELECT array_agg(DISTINCT ac."providerId") AS providers
        FROM neon_auth.account ac
        WHERE ac."userId" = u.id
      ) a ON true
      ORDER BY u."createdAt" DESC
      LIMIT 1000
    `
    return NextResponse.json({ users: rows })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error("[admin/users]", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 })
  }
}
