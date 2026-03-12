import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { RelocationTask, TaskCategory, TaskPriority } from "@/lib/relocate/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const ALLOWED_CATEGORIES = new Set<TaskCategory>(["visa", "legal", "finance", "logistics", "career", "family", "settling"])
const ALLOWED_PRIORITIES = new Set<TaskPriority>(["low", "medium", "high"])

function safeDate(value: unknown): string | null {
  if (!value) return null
  const cast = String(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cast)) return null
  return cast
}

async function ensurePlanForUser(authUserId: string) {
  const rowsRaw = await sql!.query(
    `insert into relocation_plans (auth_user_id, plan_name, status)
     values ($1, 'My relocation plan', 'planning')
     on conflict (auth_user_id) do update set updated_at = now()
     returning id`,
    [authUserId],
  )
  const rows = rowsRaw as Array<{ id: string }>
  return rows[0]?.id ?? null
}

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const body = (await request.json()) as {
      title?: string
      category?: TaskCategory
      dueDate?: string | null
      priority?: TaskPriority
      notes?: string
    }

    const title = String(body.title ?? "").trim()
    if (!title) return Response.json({ error: "Task title is required." }, { status: 400 })

    const category = ALLOWED_CATEGORIES.has(body.category as TaskCategory) ? (body.category as TaskCategory) : "logistics"
    const priority = ALLOWED_PRIORITIES.has(body.priority as TaskPriority) ? (body.priority as TaskPriority) : "medium"
    const dueDate = safeDate(body.dueDate)
    const notes = String(body.notes ?? "").trim()

    const planId = await ensurePlanForUser(authUserId)
    if (!planId) return Response.json({ error: "Unable to initialize relocation plan." }, { status: 500 })

    const rowsRaw = await sql.query(
      `insert into relocation_tasks (
         plan_id, auth_user_id, title, category, due_date, status, priority, notes
       ) values ($1,$2,$3,$4,$5,'todo',$6,$7)
       returning id, plan_id, auth_user_id, title, category, due_date, status, priority, notes, created_at, updated_at`,
      [planId, authUserId, title, category, dueDate, priority, notes || null],
    )

    const rows = rowsRaw as Array<{
      id: string
      plan_id: string
      auth_user_id: string
      title: string
      category: TaskCategory
      due_date: string | null
      status: RelocationTask["status"]
      priority: TaskPriority
      notes: string | null
      created_at: string
      updated_at: string
    }>
    const item = rows[0]
    if (!item) return Response.json({ error: "Unable to create task." }, { status: 500 })

    const task: RelocationTask = {
      id: item.id,
      planId: item.plan_id,
      authUserId: item.auth_user_id,
      title: item.title,
      category: item.category,
      dueDate: item.due_date,
      status: item.status,
      priority: item.priority,
      notes: item.notes ?? "",
      createdAt: new Date(item.created_at).toISOString(),
      updatedAt: new Date(item.updated_at).toISOString(),
    }

    return Response.json({ task }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to create relocation task." }, { status: 500 })
  }
}
