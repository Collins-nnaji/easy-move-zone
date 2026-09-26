/**
 * Legacy logistics roles are retired. Kept as empty stubs so any leftover
 * imports compile without pointing at the old driver/fleet apps.
 */
export type AccountRole = never

export const ACCOUNT_ROLES: readonly AccountRole[] = [] as const

export const ROLE_HOME: Record<string, string> = {}

export function parseRole(_value: string | null | undefined): null {
  return null
}

export async function getUserRoles(_authUserId: string): Promise<AccountRole[]> {
  return []
}

export type SessionRoles = {
  userId: string
  email: string | null
  name: string | null
  roles: AccountRole[]
}

export async function getSessionWithRoles(): Promise<SessionRoles | null> {
  const { neonAuth } = await import("@neondatabase/auth/next/server")
  const { session, user } = await neonAuth()
  if (!session || !user?.id) return null
  return {
    userId: String(user.id),
    email: user.email ?? null,
    name: user.name ?? null,
    roles: [],
  }
}

export function hasRole(_roles: AccountRole[], _role: AccountRole): boolean {
  return false
}
