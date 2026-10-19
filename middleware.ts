import { forwardAuthRequest } from "@/lib/auth/proxy"
import { safeAuthRedirect } from "@/lib/auth/redirect"
import { NextResponse, type NextRequest } from "next/server"
import { neonAuthMiddleware } from "@neondatabase/auth/next/server"

const authMiddleware = neonAuthMiddleware({ loginUrl: "/auth" })

const VERIFIER_PARAM = "neon_auth_session_verifier"
const PROTECTED = ["/admin"]

function isProtected(pathname: string) {
  return PROTECTED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

/**
 * Neon Auth finishes OAuth (Google) by exchanging `neon_auth_session_verifier`
 * for a session cookie inside this middleware, so it must run on whatever page
 * the OAuth redirect lands on — not only on protected routes. Public pages
 * never get bounced to /auth.
 */
/**
 * The moving site's old pages are now sections of /moving. Old links (SMS
 * updates, bookmarks, search results) land on the right section, keeping the
 * query string (e.g. /track?reference=EMZ-123 → /moving/track?reference=EMZ-123).
 */
const LEGACY_MOVING: Record<string, string> = {
  "/book": "/moving/book",
  "/track": "/moving/track",
  "/profile": "/moving/track#my-moves",
  "/hub": "/moving/crew",
  "/pricing": "/moving/prices",
  "/services": "/moving",
  "/coverage": "/moving",
  "/routes": "/moving",
  "/partners": "/moving/crew",
  "/traders": "/moving/crew",
  "/business": "/moving/crew",
  "/reviews": "/moving/help#reviews",
  "/damage-policy": "/moving/help",
  "/faq": "/moving/help",
  "/moving-tips": "/moving/help",
  "/about": "/moving/help",
  "/export": "/moving",
  "/exporters": "/moving",
  "/farmers": "/moving",
  "/lots": "/moving",
  "/checkout": "/moving/checkout",
  "/legal/terms": "/moving/terms",
  "/legal/privacy": "/moving/privacy",
  "/legal/cookies": "/moving/cookies",
}

function legacyMovingTarget(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const path = pathname.replace(/\/+$/, "") || "/"
  const target = LEGACY_MOVING[path] ?? (path.startsWith("/moving-tips/") ? "/moving/help" : null)
  if (!target) return null
  const [targetPath, hash] = target.split("#")
  const url = new URL(targetPath, request.url)
  url.search = search
  if (hash) url.hash = hash
  return url
}

/** Pages are told the visited path (the property site is one rewritten route). */
function nextWithPath(request: NextRequest) {
  const headers = new Headers(request.headers)
  headers.set("x-emz-path", request.nextUrl.pathname)
  return NextResponse.next({ request: { headers } })
}

export default async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  if (!searchParams.has(VERIFIER_PARAM)) {
    const legacy = legacyMovingTarget(request)
    if (legacy) return NextResponse.redirect(legacy, 308)
  }
  const guarded = isProtected(pathname)

  if (!guarded && !searchParams.has(VERIFIER_PARAM)) return nextWithPath(request)

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
    if (location && new URL(location, request.url).pathname === "/auth") return nextWithPath(request)
  }
  if (!response.headers.get("location")) {
    const passed = nextWithPath(request)
    for (const cookie of response.headers.getSetCookie()) passed.headers.append("Set-Cookie", cookie)
    return passed
  }
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
