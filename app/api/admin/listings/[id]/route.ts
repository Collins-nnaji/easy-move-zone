import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"

export const runtime = "nodejs"

const sql = neon(process.env.DATABASE_URL!)
const ADMIN_EMAIL = "collinsnnaji1@gmail.com"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await neonAuth()
    if (!user?.email || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = (await req.json()) as { status: string; notes?: string }
    const validStatuses = ["pending", "approved", "rejected", "draft"]
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await sql`
      UPDATE property_listings
      SET
        submission_status = ${body.status},
        reviewer_notes = ${body.notes ?? null},
        reviewed_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[admin/listings/patch]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
