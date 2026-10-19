import { neonAuth } from "@neondatabase/auth/next/server"
import { isAdminEmail } from "@/lib/auth/admin"

export class AdminForbiddenError extends Error {
  constructor() {
    super("Forbidden")
    this.name = "AdminForbiddenError"
  }
}

/** Gate admin API routes via admin_users table (same as /admin pages). */
export async function assertAdminApi() {
  const { session, user } = await neonAuth()
  if (!session || !user?.email) throw new AdminForbiddenError()
  const allowed = await isAdminEmail(user.email)
  if (!allowed) throw new AdminForbiddenError()
  return user
}

/** A request the admin sent with bad input (400). */
export class AdminValidationError extends Error {}

/** Admin gate for routes that change data: also refuses cross-site requests. */
export async function guardAdmin(request?: Request) {
  await assertAdminApi()
  if (request && request.method !== "GET") {
    const origin = request.headers.get("origin")
    if (origin && origin !== new URL(request.url).origin) throw new AdminForbiddenError()
  }
}

/** The JSON response for an error thrown by an admin route. */
export function adminError(error: unknown) {
  if (error instanceof AdminForbiddenError) {
    return Response.json({ error: "You need an authorised admin account." }, { status: 403 })
  }
  if (error instanceof AdminValidationError) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  console.error("[admin]", error instanceof Error ? error.name : "Request failed")
  return Response.json(
    { error: "The platform could not save or load data. Check the database connection and try again." },
    { status: 503 },
  )
}
