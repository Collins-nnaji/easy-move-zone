import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { RelocationContact } from "@/lib/relocate/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

async function ensurePlanForUser(authUserId: string) {
  const rowsRaw = await sql!.query(
    `insert into relocation_plans (auth_user_id, plan_name, status)
     values ($1, 'My relocation plan', 'planning')
     on conflict (auth_user_id) do update set updated_at = now()
     returning id`,
    [authUserId],
  )
  const rows = rowsRaw as Array<{ id: string }>
  return rows[0]?.id ?? null
}

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const body = (await request.json()) as {
      name?: string
      serviceType?: string
      email?: string
      phone?: string
      website?: string
      notes?: string
    }

    const name = String(body.name ?? "").trim()
    const serviceType = String(body.serviceType ?? "").trim()
    if (!name) return Response.json({ error: "Contact name is required." }, { status: 400 })
    if (!serviceType) return Response.json({ error: "Service type is required." }, { status: 400 })

    const planId = await ensurePlanForUser(authUserId)
    if (!planId) return Response.json({ error: "Unable to initialize relocation plan." }, { status: 500 })

    const rowsRaw = await sql.query(
      `insert into relocation_contacts (
         plan_id, auth_user_id, name, service_type, email, phone, website, notes
       ) values ($1,$2,$3,$4,$5,$6,$7,$8)
       returning id, plan_id, auth_user_id, name, service_type, email, phone, website, notes, created_at, updated_at`,
      [
        planId,
        authUserId,
        name,
        serviceType,
        String(body.email ?? "").trim() || null,
        String(body.phone ?? "").trim() || null,
        String(body.website ?? "").trim() || null,
        String(body.notes ?? "").trim() || null,
      ],
    )

    const rows = rowsRaw as Array<{
      id: string
      plan_id: string
      auth_user_id: string
      name: string
      service_type: string
      email: string | null
      phone: string | null
      website: string | null
      notes: string | null
      created_at: string
      updated_at: string
    }>
    const item = rows[0]
    if (!item) return Response.json({ error: "Unable to create contact." }, { status: 500 })

    const contact: RelocationContact = {
      id: item.id,
      planId: item.plan_id,
      authUserId: item.auth_user_id,
      name: item.name,
      serviceType: item.service_type,
      email: item.email ?? "",
      phone: item.phone ?? "",
      website: item.website ?? "",
      notes: item.notes ?? "",
      createdAt: new Date(item.created_at).toISOString(),
      updatedAt: new Date(item.updated_at).toISOString(),
    }

    return Response.json({ contact }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to create relocation contact." }, { status: 500 })
  }
}
