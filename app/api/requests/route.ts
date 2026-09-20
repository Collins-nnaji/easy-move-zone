import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import { rateLimit } from "@/lib/rate-limit"
import type { RequestGoal } from "@/lib/requests/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const GOALS = new Set<RequestGoal>([
  "work",
  "study",
  "visa",
  "relocate",
  "export",
  "import",
  "freight",
  "other",
])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    if (!sql) return Response.json({ error: "Requests aren't available right now." }, { status: 503 })

    // Auth is optional — capture the user id when present so admins can link back.
    let authUserId: string | null = null
    try {
      const { user } = await neonAuth()
      authUserId = user ? String(user.id) : null
    } catch {
      authUserId = null
    }

    const body = (await request.json()) as Record<string, unknown>
    const name = String(body.name ?? "").trim().slice(0, 120)
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254)
    const phone = String(body.phone ?? "").trim().slice(0, 40) || null
    const goalRaw = GOALS.has(body.goal as RequestGoal) ? (body.goal as RequestGoal) : "freight"
    // DB check constraint still allows only legacy goals — map freight intents to "other".
    const LEGACY_GOALS = new Set(["work", "study", "visa", "relocate", "other"])
    const goal = LEGACY_GOALS.has(goalRaw) ? goalRaw : "other"
    const destination = String(body.destination ?? "").trim().slice(0, 120) || null
    const timeline = String(body.timeline ?? "").trim().slice(0, 80) || null
    const messageRaw = String(body.message ?? "").trim().slice(0, 4000)
    const message =
      goalRaw !== goal ? `[${goalRaw}] ${messageRaw}`.trim().slice(0, 4000) : messageRaw

    if (name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 })
    if (!EMAIL_RE.test(email)) return Response.json({ error: "Please enter a valid email." }, { status: 400 })

    // Rate limit by user id when signed in, else by email — 5 per hour.
    const rateKey = authUserId ?? `email:${email}`
    const limit = await rateLimit(sql, rateKey, "relocation_request", 5, 3600)
    if (!limit.ok) {
      return Response.json(
        { error: "You've sent a few requests already — we'll be in touch. Try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      )
    }

    await sql.query(
      `insert into relocation_requests (auth_user_id, name, email, phone, goal, destination, timeline, message)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [authUserId, name, email, phone, goal, destination, timeline, message],
    )

    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json({ error: "Couldn't save your request. Please try again." }, { status: 500 })
  }
}
