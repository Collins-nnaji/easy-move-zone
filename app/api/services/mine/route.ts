import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { ServiceBooking } from "@/lib/services/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

interface Row {
  id: string
  service_key: string
  service_name: string
  goal: string
  destination: string | null
  status: ServiceBooking["status"]
  created_at: string
  manager_id: string | null
  manager_name: string | null
  manager_email: string | null
  manager_title: string | null
}

export async function GET() {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ bookings: [] })
    if (!sql) return Response.json({ bookings: [] })

    const rows = await sql.query(
      `select b.id, b.service_key, b.service_name, b.goal, b.destination, b.status, b.created_at,
              m.id as manager_id, m.name as manager_name, m.email as manager_email, m.title as manager_title
       from service_bookings b
       left join service_managers m on m.id = b.manager_id
       where b.auth_user_id = $1
       order by b.created_at desc`,
      [String(user.id)],
    )

    const bookings: ServiceBooking[] = (rows as Row[]).map((r) => ({
      id: r.id,
      serviceKey: r.service_key,
      serviceName: r.service_name,
      goal: r.goal,
      destination: r.destination,
      status: r.status,
      manager: r.manager_id
        ? { id: r.manager_id, name: r.manager_name ?? "", email: r.manager_email ?? "", title: r.manager_title ?? "" }
        : null,
      createdAt: new Date(r.created_at).toISOString(),
    }))
    return Response.json({ bookings })
  } catch {
    return Response.json({ bookings: [] })
  }
}
