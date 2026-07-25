import { redirect } from "next/navigation"
import { getSessionWithRoles, ROLE_HOME, type AccountRole, type SessionRoles } from "@/lib/auth/roles"

/**
 * Server-side gate for a role-scoped app section (/move, /fleet).
 *
 * Three outcomes:
 *   no session          -> /auth?role=<role>&redirect=<here>   (sign in / sign up)
 *   session, wrong role -> /start?add=<role>&redirect=<here>   (add the role)
 *   session, has role   -> returns the session
 *
 * Call this from a layout so every route beneath it is covered, rather than
 * relying on middleware alone — middleware can't read the profile tables.
 */
export async function requireRole(role: AccountRole, currentPath: string): Promise<SessionRoles> {
  const ctx = await getSessionWithRoles()

  if (!ctx) {
    redirect(`/auth?role=${role}&redirect=${encodeURIComponent(currentPath)}`)
  }

  if (!ctx.roles.includes(role)) {
    redirect(`/start?add=${role}&redirect=${encodeURIComponent(currentPath)}`)
  }

  return ctx
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
