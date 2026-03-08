import { neonAuthMiddleware } from "@neondatabase/auth/next/server"

export default neonAuthMiddleware({ loginUrl: "/contact?view=account" })

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
}
