import { redirect } from "next/navigation"
import { neonAuth } from "@neondatabase/auth/next/server"
import { getUserRoles, ROLE_HOME, type AccountRole, type SessionRoles } from "@/lib/auth/roles"
import { ensureDriverProfile } from "@/lib/driver/service"
import { ensureFleetProfile } from "@/lib/fleet/service"

/**
 * Server-side gate for a role-scoped app section (/move, /fleet, /app).
 *
 *   no session          -> /auth?redirect=<here>   (sign in)
 *   session, no role    -> provision it, then continue
 *   session, has role   -> continue
 *
 * A signed-in user is NEVER sent back to /auth. Doing so caused a loop:
 * /auth?role=company -> /fleet/dashboard -> guard fails -> /auth?role=company.
 * Since arriving here with a session is an explicit request to use this app,
 * the missing profile row is simply created rather than bounced to a chooser.
 *
 * Call this from a layout so every route beneath it is covered — middleware
 * alone can't check roles, because it can't reach the database.
 */
export async function requireRole(role: AccountRole, currentPath: string): Promise<SessionRoles> {
  const { session, user } = await neonAuth()

  // Genuinely signed out — the only case that may send someone to /auth.
  if (!session || !user?.id) {
    redirect(`/auth?redirect=${encodeURIComponent(currentPath)}`)
  }

  const userId = String(user.id)
  const base = { userId, email: user.email ?? null, name: user.name ?? null }

  // Let a DB failure surface as an error page instead of an infinite redirect.
  let roles = await getUserRoles(userId)

  if (!roles.includes(role)) {
    if (role === "driver") await ensureDriverProfile(userId)
    else await ensureFleetProfile(userId)
    roles = [...roles, role]
  }

  return { ...base, roles }
}

/**
 * Gate for the unified /app portal. Accepts either role; if the account has
 * none yet, provisions a company (shipper) profile by default.
 */
export async function requireAnyAppRole(currentPath: string): Promise<SessionRoles> {
  const { session, user } = await neonAuth()

  if (!session || !user?.id) {
    redirect(`/auth?redirect=${encodeURIComponent(currentPath)}`)
  }

  const userId = String(user.id)
  const base = { userId, email: user.email ?? null, name: user.name ?? null }
  let roles = await getUserRoles(userId)

  if (roles.length === 0) {
    await ensureFleetProfile(userId)
    roles = ["company"]
  }

  return { ...base, roles }
}

/**
 * For /start and post-auth landing: where should this user go next?
 * Sends single-role users straight into their app and leaves dual-role or
 * role-less users on the chooser.
 */
export function defaultHomeForRoles(roles: AccountRole[]): string | null {
  if (roles.length === 1) return ROLE_HOME[roles[0]]
  return null
}
