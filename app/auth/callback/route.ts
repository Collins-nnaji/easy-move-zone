import { safeAuthRedirect } from "@/lib/auth/redirect"

export const runtime = "nodejs"

const VERIFIER_PARAM = "neon_auth_session_verifier"

/**
 * Legacy OAuth landing. The session is not readable here yet — Neon Auth only
 * exchanges the verifier in middleware, which skips /auth/* — so forward to the
 * target with the verifier intact and let middleware finish sign-in there.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const requested = url.searchParams.get("redirect")

  // Only allow same-origin relative paths — an attacker-supplied absolute URL
  // here would turn sign-in into an open redirect.
  const safeRedirect =
    safeAuthRedirect(requested)

  const target = new URL(safeRedirect, url.origin)
  const verifier = url.searchParams.get(VERIFIER_PARAM)
  if (verifier) target.searchParams.set(VERIFIER_PARAM, verifier)

  return Response.redirect(target, 303)
}
