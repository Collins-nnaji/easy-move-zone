import { neonAuth } from "@neondatabase/auth/next/server"
import { driverSql } from "@/lib/driver/db"

/**
 * Account roles. One Neon Auth user may hold BOTH roles — the driver app
 * (/move) and the fleet console (/fleet) are keyed by the same auth_user_id,
 * so "sign up as a company" on an existing account adds a role rather than
 * creating a second login.
 *
 * Role membership is derived from the existence of a profile row:
 *   driver  -> driver_profiles.auth_user_id
 *   company -> fleet_operator_profiles.auth_user_id
 *
 * There is no separate roles table; the profile rows ARE the source of truth.
 * That keeps this consistent with ensureDriverProfile / ensureFleetProfile,
 * which already upsert on first access.
 */
export type AccountRole = "driver" | "company"

export const ACCOUNT_ROLES: readonly AccountRole[] = ["driver", "company"] as const

/** Where each role's app lives. */
export const ROLE_HOME: Record<AccountRole, string> = {
  driver: "/move/shifts",
  company: "/fleet/dashboard",
}

/** Narrow an untrusted string (query param, request body) to a role. */
export function parseRole(value: string | null | undefined): AccountRole | null {
  return value === "driver" || value === "company" ? value : null
}

/**
 * Which roles this user already holds. Returns an empty array for a signed-in
 * user who has not yet picked a role, so callers can send them to /start.
 */
export async function getUserRoles(authUserId: string): Promise<AccountRole[]> {
  if (!driverSql) return []

  const [driverRows, fleetRows] = await Promise.all([
    driverSql.query(`select 1 from driver_profiles where auth_user_id = $1 limit 1`, [authUserId]),
    driverSql.query(`select 1 from fleet_operator_profiles where auth_user_id = $1 limit 1`, [authUserId]),
  ])

  const roles: AccountRole[] = []
  if ((driverRows as unknown[]).length > 0) roles.push("driver")
  if ((fleetRows as unknown[]).length > 0) roles.push("company")
  return roles
}

export type SessionRoles = {
  userId: string
  email: string | null
  name: string | null
  roles: AccountRole[]
}

/**
 * Session + roles in one call. Returns null when there is no valid session,
 * so route handlers and layouts can `if (!ctx) redirect(...)`.
 */
export async function getSessionWithRoles(): Promise<SessionRoles | null> {
  const { session, user } = await neonAuth()
  if (!session || !user?.id) return null

  const userId = String(user.id)
  return {
    userId,
    email: user.email ?? null,
    name: user.name ?? null,
    roles: await getUserRoles(userId),
  }
}

export function hasRole(roles: AccountRole[], role: AccountRole): boolean {
  return roles.includes(role)
}
