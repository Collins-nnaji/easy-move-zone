import { neonAuth } from "@neondatabase/auth/next/server"
import { ensureDriverProfile } from "@/lib/driver/service"
import { ensureFleetProfile } from "@/lib/fleet/service"
import { parseRole, ROLE_HOME } from "@/lib/auth/roles"

export const runtime = "nodejs"

/**
 * Post-OAuth landing. Social sign-in navigates away from the app, so the role
 * chosen before sign-up can't be provisioned client-side the way the email
 * flow does it — it rides along on this callback URL instead.
 *
 * Provisions the role, then forwards into the app. Always redirects rather
 * than rendering, so it never appears in history as a dead end.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const role = parseRole(url.searchParams.get("role"))
  const requested = url.searchParams.get("redirect")

  // Only allow same-origin relative paths — an attacker-supplied absolute URL
  // here would turn sign-in into an open redirect.
  const safeRedirect = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : null

  const { session, user } = await neonAuth()
  if (!session || !user?.id) {
    return Response.redirect(new URL(`/auth${role ? `?role=${role}` : ""}`, url.origin), 303)
  }

  if (role) {
    try {
      if (role === "driver") await ensureDriverProfile(String(user.id))
      else await ensureFleetProfile(String(user.id))
    } catch {
      // Fall through to /start, where the chooser can retry provisioning.
      return Response.redirect(new URL("/start", url.origin), 303)
    }
  }

  const target = safeRedirect ?? (role ? ROLE_HOME[role] : "/start")
  return Response.redirect(new URL(target, url.origin), 303)
}
