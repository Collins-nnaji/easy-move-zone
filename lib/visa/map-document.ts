import type { DocumentStatus, DocumentType, VisaDocument } from "@/lib/visa/types"

export const ALLOWED_DOCUMENT_TYPES = new Set<DocumentType>([
  "passport",
  "photo",
  "bank_statement",
  "invitation_letter",
  "travel_insurance",
  "employment_letter",
  "itinerary",
  "other",
])

export const ALLOWED_DOCUMENT_STATUSES = new Set<DocumentStatus>([
  "uploaded",
  "verified",
  "rejected",
  "expired",
  "needs_replacement",
])

export const DOCUMENT_SELECT = `
  id, application_id, auth_user_id, document_type, label, file_key, file_url,
  mime_type, file_size_bytes, status, expiry_date, admin_review_notes,
  uploaded_at, updated_at
`

export type DocumentRow = {
  id: string
  application_id: string
  auth_user_id: string
  document_type: DocumentType
  label: string
  file_key: string
  file_url: string
  mime_type: string
  file_size_bytes: number
  status: DocumentStatus
  expiry_date: string | null
  admin_review_notes: string | null
  uploaded_at: string
  updated_at: string
}

export function mapDocumentRow(row: DocumentRow, viewUrl?: string): VisaDocument {
  return {
    id: row.id,
    applicationId: row.application_id,
    authUserId: row.auth_user_id,
    documentType: row.document_type,
    label: row.label,
    fileKey: row.file_key,
    fileUrl: viewUrl ?? row.file_url,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    status: row.status,
    expiryDate: row.expiry_date,
    adminReviewNotes: row.admin_review_notes ?? "",
    uploadedAt: new Date(row.uploaded_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}
