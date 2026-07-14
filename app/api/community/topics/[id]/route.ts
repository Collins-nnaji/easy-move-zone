import { neon } from "@neondatabase/serverless"
import type { CommunityReply, CommunityTopic } from "@/lib/community/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!UUID_RE.test(id)) return Response.json({ error: "Not found." }, { status: 404 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const topicRows = await sql.query(
      `select id, auth_user_id, author_name, category, title, body, reply_count, created_at, updated_at
       from community_topics where id = $1`,
      [id],
    )
    const topicRow = topicRows[0] as
      | {
          id: string
          auth_user_id: string
          author_name: string
          category: CommunityTopic["category"]
          title: string
          body: string
          reply_count: number
          created_at: string
          updated_at: string
        }
      | undefined
    if (!topicRow) return Response.json({ error: "Not found." }, { status: 404 })

    const replyRows = await sql.query(
      `select id, topic_id, auth_user_id, author_name, body, is_ai, created_at
       from community_replies where topic_id = $1 order by created_at asc limit 500`,
      [id],
    )

    const topic: CommunityTopic = {
      id: topicRow.id,
      authUserId: topicRow.auth_user_id,
      authorName: topicRow.author_name,
      category: topicRow.category,
      title: topicRow.title,
      body: topicRow.body,
      replyCount: topicRow.reply_count,
      createdAt: new Date(topicRow.created_at).toISOString(),
      updatedAt: new Date(topicRow.updated_at).toISOString(),
    }
    const replies: CommunityReply[] = (
      replyRows as {
        id: string
        topic_id: string
        auth_user_id: string
        author_name: string
        body: string
        is_ai: boolean
        created_at: string
      }[]
    ).map((row) => ({
      id: row.id,
      topicId: row.topic_id,
      authUserId: row.auth_user_id,
      authorName: row.author_name,
      body: row.body,
      isAi: row.is_ai,
      createdAt: new Date(row.created_at).toISOString(),
    }))

    return Response.json({ topic, replies }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load topic." }, { status: 500 })
  }
}
