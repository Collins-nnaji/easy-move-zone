import { neonAuth } from "@neondatabase/auth/next/server"

export const runtime = "nodejs"

/**
 * Post-OAuth landing. Always redirects into the career product.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const requested = url.searchParams.get("redirect")

  // Only allow same-origin relative paths — an attacker-supplied absolute URL
  // here would turn sign-in into an open redirect.
  const safeRedirect =
    requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : null

  const { session, user } = await neonAuth()
  if (!session || !user?.id) {
    return Response.redirect(new URL("/auth", url.origin), 303)
  }

  const target = safeRedirect ?? "/easymovescore"
  return Response.redirect(new URL(target, url.origin), 303)
}
