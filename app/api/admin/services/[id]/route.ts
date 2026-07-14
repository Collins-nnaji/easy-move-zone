import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"
import { SERVICE_STATUSES, type ServiceBookingStatus } from "@/lib/services/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!DATABASE_URL) return NextResponse.json({ error: "Database not configured." }, { status: 500 })

    const { id } = await context.params
    const body = (await request.json()) as { status?: string; managerId?: string | null }
    const sql = neon(DATABASE_URL)

    const currentRows = await sql`select status, manager_id from service_bookings where id = ${id} limit 1`
    const current = currentRows[0] as { status: ServiceBookingStatus; manager_id: string | null } | undefined
    if (!current) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

    const status =
      body.status && SERVICE_STATUSES.includes(body.status as ServiceBookingStatus)
        ? (body.status as ServiceBookingStatus)
        : current.status
    // managerId: explicit null clears assignment; undefined leaves it unchanged.
    const managerId = body.managerId === undefined ? current.manager_id : body.managerId

    const rows = await sql`
      update service_bookings
      set status = ${status}, manager_id = ${managerId}, updated_at = now()
      where id = ${id}
      returning id, status, manager_id, updated_at
    `
    return NextResponse.json({ booking: rows[0] })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
