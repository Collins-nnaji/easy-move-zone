import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { RelocationContact } from "@/lib/relocate/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const authUserId = String(user.id)
    const { id } = await context.params
    if (!id) return Response.json({ error: "Contact id is required." }, { status: 400 })

    const body = (await request.json()) as {
      name?: string
      serviceType?: string
      email?: string
      phone?: string
      website?: string
      notes?: string
    }

    const existingRaw = await sql.query(
      `select name, service_type, email, phone, website, notes
       from relocation_contacts
       where id = $1 and auth_user_id = $2
       limit 1`,
      [id, authUserId],
    )
    const current = (existingRaw as Array<{
      name: string
      service_type: string
      email: string | null
      phone: string | null
      website: string | null
      notes: string | null
    }>)[0]
    if (!current) return Response.json({ error: "Contact not found." }, { status: 404 })

    const name = String(body.name ?? current.name).trim()
    const serviceType = String(body.serviceType ?? current.service_type).trim()
    if (!name || !serviceType) {
      return Response.json({ error: "Name and service type are required." }, { status: 400 })
    }

    const rowsRaw = await sql.query(
      `update relocation_contacts
       set
         name = $1,
         service_type = $2,
         email = $3,
         phone = $4,
         website = $5,
         notes = $6,
         updated_at = now()
       where id = $7 and auth_user_id = $8
       returning id, plan_id, auth_user_id, name, service_type, email, phone, website, notes, created_at, updated_at`,
      [
        name,
        serviceType,
        body.email !== undefined ? String(body.email).trim() || null : current.email,
        body.phone !== undefined ? String(body.phone).trim() || null : current.phone,
        body.website !== undefined ? String(body.website).trim() || null : current.website,
        body.notes !== undefined ? String(body.notes).trim() || null : current.notes,
        id,
        authUserId,
      ],
    )

    const item = (rowsRaw as Array<{
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
    }>)[0]
    if (!item) return Response.json({ error: "Unable to update contact." }, { status: 500 })

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
    return Response.json({ error: "Unable to update relocation contact." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const { id } = await context.params
    if (!id) return Response.json({ error: "Contact id is required." }, { status: 400 })

    const result = await sql.query(
      `delete from relocation_contacts
       where id = $1 and auth_user_id = $2
       returning id`,
      [id, authUserId],
    )
    const rows = result as Array<{ id: string }>
    if (!rows[0]) return Response.json({ error: "Contact not found." }, { status: 404 })

    return Response.json({ ok: true }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to delete relocation contact." }, { status: 500 })
  }
}
