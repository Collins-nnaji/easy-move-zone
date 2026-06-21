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

    try {
      const rows = await sql`
        select
          u.auth_user_id,
          u.full_name,
          u.role,
          u.is_agent,
          u.agent_company,
          u.agent_verified,
          u.created_at,
          u.updated_at,
          sync.email
        from user_profiles u
        left join neon_auth.users_sync sync on sync.id = u.auth_user_id
        order by u.created_at desc
        limit 200
      `
      return NextResponse.json({ users: rows })
    } catch {
      const rows = await sql`
        select
          auth_user_id,
          full_name,
          role,
          is_agent,
          agent_company,
          agent_verified,
          created_at,
          updated_at
        from user_profiles
        order by created_at desc
        limit 200
      `
      return NextResponse.json({
        users: rows.map((row) => ({ ...row, email: null })),
      })
    }
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error("[admin/users]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
