import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import { rateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const body = (await request.json()) as Record<string, unknown>
    const targetType = body.targetType === "reply" ? "reply" : body.targetType === "topic" ? "topic" : null
    const targetId = String(body.targetId ?? "")
    const reason = String(body.reason ?? "").trim().slice(0, 500)
    if (!targetType || !UUID_RE.test(targetId)) {
      return Response.json({ error: "Invalid report target." }, { status: 400 })
    }

    // Max 20 reports per hour per user.
    const limit = await rateLimit(sql, authUserId, "community_report", 20, 3600)
    if (!limit.ok) {
      return Response.json(
        { error: "You've reported a lot recently — try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      )
    }

    // Confirm the target exists before recording a report against it.
    const table = targetType === "topic" ? "community_topics" : "community_replies"
    const exists = await sql.query(`select id from ${table} where id = $1`, [targetId])
    if (!exists[0]) return Response.json({ error: "Not found." }, { status: 404 })

    // One report per user per item (idempotent) — silently succeeds on repeat.
    await sql.query(
      `insert into community_reports (target_type, target_id, reporter_user_id, reason)
       values ($1, $2, $3, $4)
       on conflict (target_type, target_id, reporter_user_id) do nothing`,
      [targetType, targetId, authUserId, reason],
    )

    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json({ error: "Unable to submit report." }, { status: 500 })
  }
}
