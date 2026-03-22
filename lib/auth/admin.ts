import { neon } from "@neondatabase/serverless"
import { authServer } from "@/lib/auth/server"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

/**
 * Returns the signed-in user if their email is listed in admin_users.
 */
export async function requireAdmin() {
  const session = await authServer.getSession()
  const user = session?.data?.user
  const email = user?.email?.trim()
  if (!user?.id || !email || !DATABASE_URL) return null

  const sql = neon(DATABASE_URL)
  const rows = await sql`
    SELECT email FROM admin_users WHERE LOWER(email) = LOWER(${email}) LIMIT 1
  `
  if (rows.length === 0) return null

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
