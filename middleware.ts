import { neonAuthMiddleware } from "@neondatabase/auth/next/server"

export default neonAuthMiddleware({ loginUrl: "/auth" })

export const config = {
  matcher: [
    "/profile",
    "/profile/:path*",
    "/admin",
    "/admin/:path*",
  ],
}
