import { neonAuth } from "@neondatabase/auth/next/server"
import { isAdminEmail } from "@/lib/auth/admin"

export class AdminForbiddenError extends Error {
  constructor() {
    super("Forbidden")
    this.name = "AdminForbiddenError"
  }
}

/** Gate admin API routes via admin_users table (same as /admin pages). */
export async function assertAdminApi() {
  const { session, user } = await neonAuth()
  if (!session || !user?.email) throw new AdminForbiddenError()
  const allowed = await isAdminEmail(user.email)
  if (!allowed) throw new AdminForbiddenError()
  return user
}
