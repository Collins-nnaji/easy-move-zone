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
    const body = (await req.json()) as { agentVerified: boolean }

    await sql`
      UPDATE user_profiles
      SET agent_verified = ${body.agentVerified}
      WHERE auth_user_id = ${id}
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[admin/agents/patch]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
