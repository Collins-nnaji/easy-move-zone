import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { CommunityCategory, CommunityTopic } from "@/lib/community/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const ALLOWED_CATEGORIES = new Set<CommunityCategory>(["work", "study", "visa", "travel", "settling", "general"])

interface TopicRow {
  id: string
  auth_user_id: string
  author_name: string
  category: CommunityCategory
  title: string
  body: string
  reply_count: number
  created_at: string
  updated_at: string
}

function mapRow(row: TopicRow): CommunityTopic {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    authorName: row.author_name,
    category: row.category,
    title: row.title,
    body: row.body,
    replyCount: row.reply_count,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

const SELECT_COLUMNS = `id, auth_user_id, author_name, category, title, body, reply_count, created_at, updated_at`

export async function GET(request: Request) {
  try {
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const rowsRaw =
      category && ALLOWED_CATEGORIES.has(category as CommunityCategory)
        ? await sql.query(
            `select ${SELECT_COLUMNS} from community_topics where category = $1 order by created_at desc limit 100`,
            [category],
          )
        : await sql.query(`select ${SELECT_COLUMNS} from community_topics order by created_at desc limit 100`)

    const topics = (rowsRaw as TopicRow[]).map(mapRow)
    return Response.json({ topics }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load topics." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const authorName = user.name || user.email?.split("@")[0] || "Member"

    const body = (await request.json()) as Record<string, unknown>
    const category = ALLOWED_CATEGORIES.has(body.category as CommunityCategory)
      ? (body.category as CommunityCategory)
      : "general"
    const title = String(body.title ?? "").trim().slice(0, 160)
    const topicBody = String(body.body ?? "").trim().slice(0, 4000)
    if (!title || !topicBody) {
      return Response.json({ error: "Title and body are required." }, { status: 400 })
    }

    const rowsRaw = await sql.query(
      `insert into community_topics (auth_user_id, author_name, category, title, body)
       values ($1, $2, $3, $4, $5)
       returning ${SELECT_COLUMNS}`,
      [authUserId, authorName, category, title, topicBody],
    )
    const row = (rowsRaw as TopicRow[])[0]
    if (!row) return Response.json({ error: "Unable to create topic." }, { status: 500 })
    return Response.json({ topic: mapRow(row) }, { status: 201 })
  } catch {
    return Response.json({ error: "Unable to create topic." }, { status: 500 })
  }
}
