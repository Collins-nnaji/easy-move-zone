import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { RelocationTask, TaskCategory, TaskPriority } from "@/lib/relocate/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const ALLOWED_CATEGORIES = new Set<TaskCategory>(["visa", "legal", "finance", "logistics", "career", "family", "settling"])
const ALLOWED_PRIORITIES = new Set<TaskPriority>(["low", "medium", "high"])
const ALLOWED_STATUSES = new Set<RelocationTask["status"]>(["todo", "in_progress", "done"])

function safeDate(value: unknown): string | null {
  if (!value) return null
  const cast = String(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cast)) return null
  return cast
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const { id } = await context.params
    if (!id) return Response.json({ error: "Task id is required." }, { status: 400 })

    const body = (await request.json()) as {
      title?: string
      category?: TaskCategory
      dueDate?: string | null
      status?: RelocationTask["status"]
      priority?: TaskPriority
      notes?: string
    }

    const title = String(body.title ?? "").trim()
    const category = ALLOWED_CATEGORIES.has(body.category as TaskCategory) ? (body.category as TaskCategory) : null
    const priority = ALLOWED_PRIORITIES.has(body.priority as TaskPriority) ? (body.priority as TaskPriority) : null
    const status = ALLOWED_STATUSES.has(body.status as RelocationTask["status"]) ? (body.status as RelocationTask["status"]) : null
    const dueDate = body.dueDate === undefined ? undefined : safeDate(body.dueDate)
    const notes = body.notes === undefined ? undefined : String(body.notes ?? "").trim()

    const existingRaw = await sql.query(
      `select id, title, category, due_date, status, priority, notes
       from relocation_tasks
       where id = $1 and auth_user_id = $2
       limit 1`,
      [id, authUserId],
    )
    const existingRows = existingRaw as Array<{
      id: string
      title: string
      category: TaskCategory
      due_date: string | null
      status: RelocationTask["status"]
      priority: TaskPriority
      notes: string | null
    }>
    const current = existingRows[0]
    if (!current) return Response.json({ error: "Task not found." }, { status: 404 })

    const rowsRaw = await sql.query(
      `update relocation_tasks
       set
         title = $1,
         category = $2,
         due_date = $3,
         status = $4,
         priority = $5,
         notes = $6,
         updated_at = now()
       where id = $7 and auth_user_id = $8
       returning id, plan_id, auth_user_id, title, category, due_date, status, priority, notes, created_at, updated_at`,
      [
        title || current.title,
        category ?? current.category,
        dueDate === undefined ? current.due_date : dueDate,
        status ?? current.status,
        priority ?? current.priority,
        notes === undefined ? current.notes : notes || null,
        id,
        authUserId,
      ],
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
    if (!item) return Response.json({ error: "Unable to update task." }, { status: 500 })

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
    return Response.json({ error: "Unable to update relocation task." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const { id } = await context.params
    if (!id) return Response.json({ error: "Task id is required." }, { status: 400 })

    const result = await sql.query(
      `delete from relocation_tasks
       where id = $1 and auth_user_id = $2
       returning id`,
      [id, authUserId],
    )
    const rows = result as Array<{ id: string }>
    if (!rows[0]) return Response.json({ error: "Task not found." }, { status: 404 })

    return Response.json({ ok: true }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to delete relocation task." }, { status: 500 })
  }
}
