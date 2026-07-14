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
    const [bookings, managers] = await Promise.all([
      sql`
        select b.id, b.auth_user_id, b.service_name, b.goal, b.destination, b.name, b.email, b.phone,
               b.notes, b.status, b.manager_id, b.created_at,
               m.name as manager_name
        from service_bookings b
        left join service_managers m on m.id = b.manager_id
        order by
          case b.status when 'assigned' then 0 when 'in_progress' then 1 when 'completed' then 2 else 3 end,
          b.created_at desc
        limit 300
      `,
      sql`select id, name, title, active from service_managers order by sort_order asc`,
    ])
    return NextResponse.json({ bookings, managers })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
