import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await assertAdminApi()
    if (!DATABASE_URL) return NextResponse.json({ error: "Database not configured." }, { status: 500 })

    const { id } = await context.params
    const body = (await request.json()) as {
      isAgent?: boolean
      agentVerified?: boolean
      role?: "buyer" | "seller"
    }
    const sql = neon(DATABASE_URL)

    const currentRows = await sql`
      select is_agent, agent_verified, role from user_profiles where user_id = ${id} limit 1
    `
    const current = currentRows[0] as { is_agent: boolean; agent_verified: boolean; role: string } | undefined
    if (!current) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const isAgent = body.isAgent ?? current.is_agent
    const agentVerified = body.agentVerified ?? current.agent_verified
    const role = body.role ?? current.role

    const rows = await sql`
      update user_profiles
      set is_agent = ${isAgent},
          agent_verified = ${agentVerified},
          role = ${role},
          updated_at = now()
      where user_id = ${id}
      returning is_agent, agent_company, agent_verified
    `
    return NextResponse.json({ user: rows[0] })
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
