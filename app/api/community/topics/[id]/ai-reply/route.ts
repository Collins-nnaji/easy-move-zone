import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import { chatJson, getAiProvider } from "@/lib/ai/openai"
import type { CommunityCategory, CommunityReply } from "@/lib/community/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AI_AUTHOR_ID = "ai-assistant"
const AI_AUTHOR_NAME = "EasyMoveZone AI"

const CATEGORY_FRAME: Record<CommunityCategory, string> = {
  work: "a work visa or job-related relocation question",
  study: "a school admissions or student visa question",
  visa: "a visa or immigration question",
  travel: "a travel logistics question",
  settling: "a settling-in question (housing, banking, healthcare, day-to-day life)",
  general: "a general relocation question",
}

interface AiReplyResult {
  answer: string
}

function fallbackAnswer(category: CommunityCategory): AiReplyResult {
  return {
    answer:
      `I don't have a confident answer for this one — it's ${CATEGORY_FRAME[category]}, and those details vary a lot by nationality and destination. ` +
      "Worth checking the official visa/immigration portal for the destination in question, and flagging your nationality and timeline here so other members can compare notes.",
  }
}

interface TopicRow {
  id: string
  category: CommunityCategory
  title: string
  body: string
}

interface ReplyRow {
  id: string
  topic_id: string
  auth_user_id: string
  author_name: string
  body: string
  is_ai: boolean
  created_at: string
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!UUID_RE.test(id)) return Response.json({ error: "Not found." }, { status: 404 })

    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })

    const topicRows = await sql.query(
      `select id, category, title, body from community_topics where id = $1`,
      [id],
    )
    const topic = topicRows[0] as TopicRow | undefined
    if (!topic) return Response.json({ error: "Not found." }, { status: 404 })

    const priorReplyRows = await sql.query(
      `select body from community_replies where topic_id = $1 order by created_at asc limit 10`,
      [id],
    )
    const priorReplies = (priorReplyRows as { body: string }[]).map((r) => r.body)

    const fallback = fallbackAnswer(topic.category)
    let answer = fallback.answer

    if (getAiProvider()) {
      const contextLines = [
        `Category: ${CATEGORY_FRAME[topic.category]}`,
        `Topic title: ${topic.title}`,
        `Topic details: ${topic.body}`,
        ...(priorReplies.length ? [`Existing replies so far:\n${priorReplies.join("\n---\n")}`] : []),
      ]
      const result = await chatJson<AiReplyResult>(
        "You are a knowledgeable relocation assistant posting a reply inside a community discussion board about moving abroad for work, study, or a visa. " +
          "Give a genuinely useful starting answer: practical, specific where you reasonably can be, and honest about what varies by nationality/destination/employer and should be double-checked officially. " +
          "Do not invent specific visa fees, processing times, or legal rules you aren't confident about — speak in general, well-known patterns instead when unsure. " +
          "Keep it to 3-6 sentences, warm but direct, like a helpful peer who's been through this. Respond with raw JSON: {\"answer\": \"...\"}.",
        contextLines.join("\n\n"),
        fallback,
      )
      if (typeof result.answer === "string" && result.answer.trim()) {
        answer = result.answer.trim()
      }
    }

    const rowsRaw = await sql.query(
      `insert into community_replies (topic_id, auth_user_id, author_name, body, is_ai)
       values ($1, $2, $3, $4, true)
       returning id, topic_id, auth_user_id, author_name, body, is_ai, created_at`,
      [id, AI_AUTHOR_ID, AI_AUTHOR_NAME, answer],
    )
    await sql.query(
      `update community_topics set reply_count = reply_count + 1, updated_at = now() where id = $1`,
      [id],
    )

    const row = rowsRaw[0] as ReplyRow
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
    return Response.json({ error: "Unable to get an AI reply." }, { status: 500 })
  }
}
