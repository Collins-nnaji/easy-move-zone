import { neonAuthMiddleware } from "@neondatabase/auth/next/server"

export default neonAuthMiddleware({ loginUrl: "/auth" })

/**
 * Signed-in-only areas. This is the coarse gate — it proves a session exists
 * but cannot check *which* role the account holds, because middleware runs on
 * the edge without database access. Role checks live in the layouts
 * (lib/auth/guard.ts) and admin checks in lib/auth/admin.ts.
 *
 * Public by design: /, /services, /quote, /track, /about, /contact, /auth, /legal/*.
 */
export const config = {
  matcher: [
    "/app",
    "/app/:path*",
    "/move",
    "/move/:path*",
    "/fleet",
    "/fleet/:path*",
    "/profile",
    "/profile/:path*",
    "/admin",
    "/admin/:path*",
  ],
}
