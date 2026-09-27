import { redirect } from "next/navigation"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { SessionRoles } from "@/lib/auth/roles"

/** Require a signed-in user for protected server pages. */
export async function requireSignedIn(currentPath: string): Promise<SessionRoles> {
  const { session, user } = await neonAuth()
  if (!session || !user?.id) {
    redirect(`/auth?redirect=${encodeURIComponent(currentPath)}`)
  }
  return {
    userId: String(user.id),
    email: user.email ?? null,
    name: user.name ?? null,
    roles: [],
  }
}

/** @deprecated Logistics apps removed — always sends users to My Workspace. */
export function defaultHomeForRoles(_roles: unknown[]): string {
  return "/workspace"
}
