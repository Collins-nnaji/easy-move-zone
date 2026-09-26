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

  const response = await authMiddleware(request)
  if (!guarded) {
    const location = response.headers.get("location")
    if (location && new URL(location, request.url).pathname === "/auth") return NextResponse.next()
  }
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
