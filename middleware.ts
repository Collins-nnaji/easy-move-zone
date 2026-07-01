import { neonAuthMiddleware } from "@neondatabase/auth/next/server"

export default neonAuthMiddleware({ loginUrl: "/auth" })

export const config = {
  matcher: [
    "/profile",
    "/profile/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/visa/applications",
    "/visa/applications/:path*",
  ],
}
