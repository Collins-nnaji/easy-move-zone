import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const VALID_ROLES = new Set(["farmer", "transporter", "buyer"])

// Called immediately after sign-up to store the agro role chosen on the auth page
export async function POST(req: NextRequest) {
  if (!sql) return NextResponse.json({ ok: false }, { status: 500 })

  try {
    const { session, user } = await neonAuth()
    if (!session || !user) {
      // Accept userId from body as fallback (freshly created user may not have cookie yet)
      const body = await req.json()
      const userId = body.userId as string | undefined
      const agroRole = VALID_ROLES.has(body.agroRole) ? body.agroRole : "buyer"

      if (!userId) return NextResponse.json({ ok: false, error: "No user" }, { status: 401 })

      await sql`
        INSERT INTO user_profiles (user_id, role, agro_role, created_at, updated_at)
        VALUES (${userId}, 'buyer', ${agroRole}, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          agro_role = EXCLUDED.agro_role,
          updated_at = NOW()
      `
      return NextResponse.json({ ok: true })
    }

    const body = await req.json().catch(() => ({}))
    const agroRole = VALID_ROLES.has(body.agroRole) ? body.agroRole : "buyer"

    await sql`
      INSERT INTO user_profiles (user_id, role, agro_role, created_at, updated_at)
      VALUES (${user.id}, 'buyer', ${agroRole}, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        agro_role = EXCLUDED.agro_role,
        updated_at = NOW()
    `
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[profile-init]", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
