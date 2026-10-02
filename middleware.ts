import { forwardAuthRequest } from "@/lib/auth/proxy"
import { safeAuthRedirect } from "@/lib/auth/redirect"
import { NextResponse, type NextRequest } from "next/server"
import { neonAuthMiddleware } from "@neondatabase/auth/next/server"

const authMiddleware = neonAuthMiddleware({ loginUrl: "/auth" })

const VERIFIER_PARAM = "neon_auth_session_verifier"
const PROTECTED = ["/profile", "/admin"]

function isProtected(pathname: string) {
  return PROTECTED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

/**
 * Neon Auth finishes OAuth (Google) by exchanging `neon_auth_session_verifier`
 * for a session cookie inside this middleware, so it must run on whatever page
 * the OAuth redirect lands on — not only on protected routes. Public pages
 * never get bounced to /auth.
 */
export default async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const guarded = isProtected(pathname)

  if (!guarded && !searchParams.has(VERIFIER_PARAM)) return NextResponse.next()

  // Neon skips the login URL and legacy callback before exchanging the verifier.
  // Forward those landings to a public page where the exchange can finish.
  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    const target = new URL(safeAuthRedirect(searchParams.get("redirect")), request.url)
    target.searchParams.set(VERIFIER_PARAM, searchParams.get(VERIFIER_PARAM)!)
    return NextResponse.redirect(target)
  }

  // Exchange OAuth with the same proxy as email sign-in so each session cookie
  // is preserved independently, including cookies with an Expires comma.
  if (searchParams.has(VERIFIER_PARAM) && request.cookies.has("__Secure-neon-auth.session_challange")) {
    const exchange = await forwardAuthRequest(request, ["get-session"])
    const session = exchange.ok ? await exchange.json().catch(() => null) : null
    const target = new URL(request.url)
    target.searchParams.delete(VERIFIER_PARAM)
    if (!session?.session || !session?.user) {
      const login = new URL("/auth", request.url)
      login.searchParams.set("redirect", `${target.pathname}${target.search}`)
      login.searchParams.set("error", "oauth")
      return NextResponse.redirect(login)
    }
    const completed = NextResponse.redirect(target)
    for (const cookie of exchange.headers.getSetCookie()) completed.headers.append("Set-Cookie", cookie)
    return completed
  }

  const response = await authMiddleware(request)
  if (guarded) {
    const location = response.headers.get("location")
    if (location) {
      const target = new URL(location, request.url)
      if (target.pathname === "/auth") {
        target.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`)
        response.headers.set("location", target.href)
      }
    }
  }
  if (!guarded) {
    const location = response.headers.get("location")
    if (location && new URL(location, request.url).pathname === "/auth") return NextResponse.next()
  }
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
