import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/requests/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!DATABASE_URL) return NextResponse.json({ error: "Database not configured." }, { status: 500 })

    const { id } = await context.params
    const body = (await request.json()) as { status?: string }
    if (!body.status || !REQUEST_STATUSES.includes(body.status as RequestStatus)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }

    const sql = neon(DATABASE_URL)
    const rows = await sql`
      update relocation_requests
      set status = ${body.status}, updated_at = now()
      where id = ${id}
      returning id, status, updated_at
    `
    if (!rows[0]) return NextResponse.json({ error: "Request not found" }, { status: 404 })
    return NextResponse.json({ request: rows[0] })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
