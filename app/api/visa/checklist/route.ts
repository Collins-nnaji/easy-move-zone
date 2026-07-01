import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import {
  ALLOWED_CHECKLIST_CATEGORIES,
  ALLOWED_CHECKLIST_PRIORITIES,
  CHECKLIST_SELECT,
  mapChecklistRow,
  type ChecklistRow,
} from "@/lib/visa/map-checklist"
import { safeDate } from "@/lib/visa/map-application"
import type { ChecklistCategory, ChecklistPriority } from "@/lib/visa/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

async function ownsApplication(authUserId: string, applicationId: string): Promise<boolean> {
  const rowsRaw = await sql!.query(
    `select id from visa_applications where id = $1 and auth_user_id = $2 limit 1`,
    [applicationId, authUserId],
  )
  return (rowsRaw as Array<{ id: string }>).length > 0
}

export async function GET(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const { searchParams } = new URL(request.url)
    const applicationId = String(searchParams.get("applicationId") ?? "").trim()
    if (!applicationId) return Response.json({ error: "applicationId is required." }, { status: 400 })

    const rowsRaw = await sql.query(
      `select ${CHECKLIST_SELECT} from visa_checklist_items
       where auth_user_id = $1 and application_id = $2
       order by sort_order asc,
         case status when 'in_progress' then 1 when 'todo' then 2 when 'done' then 3 else 4 end,
         due_date asc nulls last, created_at asc`,
      [authUserId, applicationId],
    )
    const items = (rowsRaw as ChecklistRow[]).map(mapChecklistRow)
    return Response.json({ items }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load checklist." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const body = (await request.json()) as {
      applicationId?: string
      title?: string
      description?: string
      category?: ChecklistCategory
      priority?: ChecklistPriority
      dueDate?: string | null
      notes?: string
      isAiGenerated?: boolean
      sortOrder?: number
    }

    const applicationId = String(body.applicationId ?? "").trim()
    const title = String(body.title ?? "").trim()
    if (!applicationId || !title) {
      return Response.json({ error: "applicationId and title are required." }, { status: 400 })
    }
    if (!(await ownsApplication(authUserId, applicationId))) {
      return Response.json({ error: "Application not found." }, { status: 404 })
    }

    const category = ALLOWED_CHECKLIST_CATEGORIES.has(body.category as ChecklistCategory)
      ? (body.category as ChecklistCategory)
      : "documentation"
    const priority = ALLOWED_CHECKLIST_PRIORITIES.has(body.priority as ChecklistPriority)
      ? (body.priority as ChecklistPriority)
      : "medium"
    const dueDate = safeDate(body.dueDate)
    const description = String(body.description ?? "").trim()
    const notes = String(body.notes ?? "").trim()
    const isAiGenerated = Boolean(body.isAiGenerated)
    const sortOrder = Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 0

    const rowsRaw = await sql.query(
      `insert into visa_checklist_items (
        application_id, auth_user_id, title, description, category, status, priority,
        due_date, is_ai_generated, sort_order, notes
      ) values ($1,$2,$3,$4,$5,'todo',$6,$7,$8,$9,$10)
      returning ${CHECKLIST_SELECT}`,
      [applicationId, authUserId, title, description || null, category, priority, dueDate, isAiGenerated, sortOrder, notes || null],
    )

    const row = (rowsRaw as ChecklistRow[])[0]
    if (!row) return Response.json({ error: "Unable to create checklist item." }, { status: 500 })
    return Response.json({ item: mapChecklistRow(row) }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to create checklist item." }, { status: 500 })
  }
}
