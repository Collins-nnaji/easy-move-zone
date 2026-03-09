import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const authUserId = String(user.id)
    const { id } = await context.params
    await sql.query(
      `delete from user_saved_searches
       where id = $1 and auth_user_id = $2`,
      [id, authUserId],
    )

    return Response.json({ ok: true }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to delete saved search." }, { status: 500 })
  }
}
