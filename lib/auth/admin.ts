import { neonAuth } from "@neondatabase/auth/next/server"
import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

/**
 * Returns the signed-in user if their email is listed in admin_users.
 * Uses neonAuth() — same session source as API routes and neonAuthMiddleware.
 */
export async function requireAdmin() {
  const { session, user } = await neonAuth()
  const email = user?.email?.trim()
  if (!session || !user?.id || !email) return null

  const allowed = await isAdminEmail(email)
  if (!allowed) return null

  return { userId: user.id, email, name: user.name ?? null }
}

export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email?.trim() || !DATABASE_URL) return false
  const sql = neon(DATABASE_URL)
  const rows = await sql`
    SELECT 1 FROM admin_users WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1
  `
  return rows.length > 0
}
