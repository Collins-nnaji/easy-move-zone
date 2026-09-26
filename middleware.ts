import { neonAuthMiddleware } from "@neondatabase/auth/next/server"

export default neonAuthMiddleware({ loginUrl: "/auth" })

/**
 * Signed-in-only areas. Coarse session gate only — role checks live elsewhere.
 * Public: /, /easymovescore (redirects to auth itself), /sponsors, /jobs,
 * /work-simulation, /news, /contact, /specialist-support, /auth, /legal/*.
 */
export const config = {
  matcher: ["/profile", "/profile/:path*", "/admin", "/admin/:path*"],
}
