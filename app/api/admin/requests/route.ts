import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

export async function GET() {
  try {
    await assertAdminApi()
    if (!DATABASE_URL) return NextResponse.json({ error: "Database not configured." }, { status: 500 })

    const sql = neon(DATABASE_URL)
    const rows = await sql`
      select id, auth_user_id, name, email, phone, goal, destination, timeline, message, status, created_at, updated_at
      from relocation_requests
      order by
        case status when 'new' then 0 when 'in_review' then 1 when 'contacted' then 2 else 3 end,
        created_at desc
      limit 300
    `
    return NextResponse.json({ requests: rows })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
