import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import { rateLimit } from "@/lib/rate-limit"
import { servicePackage, type ServiceBooking } from "@/lib/services/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

interface ManagerRow {
  id: string
  name: string
  email: string
  title: string
}

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Sign in to book a service." }, { status: 401 })
    if (!sql) return Response.json({ error: "Services aren't available right now." }, { status: 503 })
    const authUserId = String(user.id)

    const body = (await request.json()) as Record<string, unknown>
    const pkg = servicePackage(String(body.serviceKey ?? ""))
    if (!pkg) return Response.json({ error: "Unknown service." }, { status: 400 })

    const name = String(body.name ?? "").trim().slice(0, 120) || (user.name ?? "")
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254) || (user.email ?? "")
    const phone = String(body.phone ?? "").trim().slice(0, 40) || null
    const destination = String(body.destination ?? "").trim().slice(0, 120) || null
    const notes = String(body.notes ?? "").trim().slice(0, 4000)
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "A name and valid email are required." }, { status: 400 })
    }

    // Max 10 service bookings per hour per user.
    const limit = await rateLimit(sql, authUserId, "service_booking", 10, 3600)
    if (!limit.ok) {
      return Response.json(
        { error: "You've booked several services already — we're on it. Try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      )
    }

    // Auto-assign: prefer an active manager who covers this goal, breaking ties
    // by current open workload (fewest active bookings), then sort order.
    const managerRows = await sql.query(
      `select m.id, m.name, m.email, m.title
       from service_managers m
       where m.active = true
       order by
         (case when $1 = any(m.specialties) then 0 else 1 end),
         (select count(*) from service_bookings b where b.manager_id = m.id and b.status in ('assigned','in_progress')) asc,
         m.sort_order asc
       limit 1`,
      [pkg.goal],
    )
    const manager = (managerRows as ManagerRow[])[0] ?? null

    const inserted = await sql.query(
      `insert into service_bookings
         (auth_user_id, service_key, service_name, goal, destination, name, email, phone, notes, manager_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning id, service_key, service_name, goal, destination, status, created_at`,
      [authUserId, pkg.key, pkg.name, pkg.goal, destination, name, email, phone, notes, manager?.id ?? null],
    )
    const row = inserted[0] as {
      id: string
      service_key: string
      service_name: string
      goal: string
      destination: string | null
      status: ServiceBooking["status"]
      created_at: string
    }

    const booking: ServiceBooking = {
      id: row.id,
      serviceKey: row.service_key,
      serviceName: row.service_name,
      goal: row.goal,
      destination: row.destination,
      status: row.status,
      manager: manager ? { id: manager.id, name: manager.name, email: manager.email, title: manager.title } : null,
      createdAt: new Date(row.created_at).toISOString(),
    }
    return Response.json({ booking }, { status: 201 })
  } catch {
    return Response.json({ error: "Couldn't book that service. Please try again." }, { status: 500 })
  }
}
