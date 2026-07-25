import { neonAuth } from "@neondatabase/auth/next/server"
import { ensureDriverProfile } from "@/lib/driver/service"
import { ensureFleetProfile } from "@/lib/fleet/service"
import { getUserRoles, parseRole, ROLE_HOME } from "@/lib/auth/roles"

export const runtime = "nodejs"

/** Which roles the signed-in user holds. Drives the role chooser + switcher. */
export async function GET() {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user?.id) {
      return Response.json({ error: "Sign in required." }, { status: 401 })
    }

    const roles = await getUserRoles(String(user.id))
    return Response.json({ roles })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load roles."
    return Response.json({ error: message }, { status: 500 })
  }
}

/**
 * Provision a role on the signed-in account. Called after sign-up with the
 * role carried through /auth?role=, and by "add a company profile" on an
 * account that already drives.
 *
 * Idempotent: ensure*Profile upserts with `on conflict do nothing`, so
 * re-posting an existing role is a no-op rather than an error.
 */
export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user?.id) {
      return Response.json({ error: "Sign in required." }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as { role?: string }
    const role = parseRole(body.role)
    if (!role) {
      return Response.json({ error: "Unknown role." }, { status: 400 })
    }

    const authUserId = String(user.id)
    if (role === "driver") {
      await ensureDriverProfile(authUserId)
    } else {
      // Seed the company name from the account name so the console isn't
      // stuck on the "My Fleet" default before onboarding runs.
      await ensureFleetProfile(authUserId)
    }

    const roles = await getUserRoles(authUserId)
    return Response.json({ roles, role, home: ROLE_HOME[role] })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to add role."
    return Response.json({ error: message }, { status: 500 })
  }
}
