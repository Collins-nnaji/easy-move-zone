import type { ChecklistCategory, ChecklistPriority, ChecklistStatus, VisaChecklistItem } from "@/lib/visa/types"

export const ALLOWED_CHECKLIST_CATEGORIES = new Set<ChecklistCategory>([
  "documentation",
  "application_form",
  "appointment",
  "fee_payment",
  "biometrics",
  "interview",
  "follow_up",
])

export const ALLOWED_CHECKLIST_STATUSES = new Set<ChecklistStatus>(["todo", "in_progress", "done", "not_applicable"])
export const ALLOWED_CHECKLIST_PRIORITIES = new Set<ChecklistPriority>(["low", "medium", "high"])

export const CHECKLIST_SELECT = `
  id, application_id, auth_user_id, title, description, category, status, priority,
  due_date, is_ai_generated, source_template_id, linked_document_id, sort_order, notes,
  created_at, updated_at
`

export type ChecklistRow = {
  id: string
  application_id: string
  auth_user_id: string
  title: string
  description: string | null
  category: ChecklistCategory
  status: ChecklistStatus
  priority: ChecklistPriority
  due_date: string | null
  is_ai_generated: boolean
  source_template_id: string | null
  linked_document_id: string | null
  sort_order: number
  notes: string | null
  created_at: string
  updated_at: string
}

export function mapChecklistRow(row: ChecklistRow): VisaChecklistItem {
  return {
    id: row.id,
    applicationId: row.application_id,
    authUserId: row.auth_user_id,
    title: row.title,
    description: row.description ?? "",
    category: row.category,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    isAiGenerated: row.is_ai_generated,
    sourceTemplateId: row.source_template_id,
    linkedDocumentId: row.linked_document_id,
    sortOrder: row.sort_order,
    notes: row.notes ?? "",
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}
