import { neonAuthMiddleware } from "@neondatabase/auth/next/server"

export default neonAuthMiddleware({ loginUrl: "/auth" })

/**
 * Signed-in-only areas. This is the coarse gate — it proves a session exists
 * but cannot check *which* role the account holds, because middleware runs on
 * the edge without database access. Role checks live in the layouts
 * (lib/auth/guard.ts) and admin checks in lib/auth/admin.ts.
 *
 * Public by design: /, /start, /driver, /company, /contact, /auth, /legal/*.
 * Note /driver and /company are marketing pages — the driver *app* is /move
 * and the company *app* is /fleet.
 *
 * Bare paths are listed alongside :path* because "/move/:path*" does not
 * match "/move" itself.
 */
export const config = {
  matcher: [
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
