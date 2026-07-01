import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import {
  ALLOWED_CHECKLIST_CATEGORIES,
  ALLOWED_CHECKLIST_PRIORITIES,
  ALLOWED_CHECKLIST_STATUSES,
  CHECKLIST_SELECT,
  mapChecklistRow,
  type ChecklistRow,
} from "@/lib/visa/map-checklist"
import { safeDate } from "@/lib/visa/map-application"
import type { ChecklistCategory, ChecklistPriority, ChecklistStatus } from "@/lib/visa/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const { id } = await context.params

    const body = (await request.json()) as {
      title?: string
      description?: string
      category?: ChecklistCategory
      status?: ChecklistStatus
      priority?: ChecklistPriority
      dueDate?: string | null
      notes?: string
      linkedDocumentId?: string | null
    }

    const existingRaw = await sql.query(
      `select ${CHECKLIST_SELECT} from visa_checklist_items where id = $1 and auth_user_id = $2 limit 1`,
      [id, authUserId],
    )
    const current = (existingRaw as ChecklistRow[])[0]
    if (!current) return Response.json({ error: "Checklist item not found." }, { status: 404 })

    const title = body.title === undefined ? current.title : String(body.title).trim() || current.title
    const description = body.description === undefined ? current.description : String(body.description).trim() || null
    const category = ALLOWED_CHECKLIST_CATEGORIES.has(body.category as ChecklistCategory)
      ? (body.category as ChecklistCategory)
      : current.category
    const status = ALLOWED_CHECKLIST_STATUSES.has(body.status as ChecklistStatus)
      ? (body.status as ChecklistStatus)
      : current.status
    const priority = ALLOWED_CHECKLIST_PRIORITIES.has(body.priority as ChecklistPriority)
      ? (body.priority as ChecklistPriority)
      : current.priority
    const dueDate = body.dueDate === undefined ? current.due_date : safeDate(body.dueDate)
    const notes = body.notes === undefined ? current.notes : String(body.notes).trim() || null
    const linkedDocumentId = body.linkedDocumentId === undefined ? current.linked_document_id : body.linkedDocumentId

    const rowsRaw = await sql.query(
      `update visa_checklist_items set
        title = $1, description = $2, category = $3, status = $4, priority = $5,
        due_date = $6, notes = $7, linked_document_id = $8, updated_at = now()
       where id = $9 and auth_user_id = $10
       returning ${CHECKLIST_SELECT}`,
      [title, description, category, status, priority, dueDate, notes, linkedDocumentId, id, authUserId],
    )

    const row = (rowsRaw as ChecklistRow[])[0]
    if (!row) return Response.json({ error: "Unable to update checklist item." }, { status: 500 })
    return Response.json({ item: mapChecklistRow(row) }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to update checklist item." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const { id } = await context.params

    const result = await sql.query(
      `delete from visa_checklist_items where id = $1 and auth_user_id = $2 returning id`,
      [id, authUserId],
    )
    const rows = result as Array<{ id: string }>
    if (!rows[0]) return Response.json({ error: "Checklist item not found." }, { status: 404 })
    return Response.json({ ok: true }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to delete checklist item." }, { status: 500 })
  }
}
