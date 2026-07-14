import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { CommunityReply } from "@/lib/community/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!UUID_RE.test(id)) return Response.json({ error: "Not found." }, { status: 404 })

    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const authorName = user.name || user.email?.split("@")[0] || "Member"

    const body = (await request.json()) as Record<string, unknown>
    const replyBody = String(body.body ?? "").trim().slice(0, 4000)
    if (!replyBody) return Response.json({ error: "Reply can't be empty." }, { status: 400 })

    const topicRows = await sql.query(`select id from community_topics where id = $1`, [id])
    if (!topicRows[0]) return Response.json({ error: "Not found." }, { status: 404 })

    const rowsRaw = await sql.query(
      `insert into community_replies (topic_id, auth_user_id, author_name, body)
       values ($1, $2, $3, $4)
       returning id, topic_id, auth_user_id, author_name, body, is_ai, created_at`,
      [id, authUserId, authorName, replyBody],
    )
    await sql.query(
      `update community_topics set reply_count = reply_count + 1, updated_at = now() where id = $1`,
      [id],
    )

    const row = rowsRaw[0] as {
      id: string
      topic_id: string
      auth_user_id: string
      author_name: string
      body: string
      is_ai: boolean
      created_at: string
    }
    const reply: CommunityReply = {
      id: row.id,
      topicId: row.topic_id,
      authUserId: row.auth_user_id,
      authorName: row.author_name,
      body: row.body,
      isAi: row.is_ai,
      createdAt: new Date(row.created_at).toISOString(),
    }
    return Response.json({ reply }, { status: 201 })
  } catch {
    return Response.json({ error: "Unable to post reply." }, { status: 500 })
  }
}
