import type { ChecklistTemplateItem, RequiredDocumentSpec, TemplateSource, VisaRequirementTemplate } from "@/lib/visa/types"

export const TEMPLATE_SELECT = `
  id, nationality, destination_country, visa_type, visa_type_label, summary,
  required_documents, checklist_template, processing_time_estimate, fee_estimate,
  validity_notes, source, last_verified_at, created_at, updated_at
`

export type TemplateRow = {
  id: string
  nationality: string
  destination_country: string
  visa_type: string
  visa_type_label: string
  summary: string
  required_documents: RequiredDocumentSpec[]
  checklist_template: ChecklistTemplateItem[]
  processing_time_estimate: string | null
  fee_estimate: string | null
  validity_notes: string | null
  source: TemplateSource
  last_verified_at: string | null
  created_at: string
  updated_at: string
}

export function mapTemplateRow(row: TemplateRow): VisaRequirementTemplate {
  return {
    id: row.id,
    nationality: row.nationality,
    destinationCountry: row.destination_country,
    visaType: row.visa_type,
    visaTypeLabel: row.visa_type_label,
    summary: row.summary,
    requiredDocuments: Array.isArray(row.required_documents) ? row.required_documents : [],
    checklistTemplate: Array.isArray(row.checklist_template) ? row.checklist_template : [],
    processingTimeEstimate: row.processing_time_estimate ?? "",
    feeEstimate: row.fee_estimate ?? "",
    validityNotes: row.validity_notes ?? "",
    source: row.source,
    lastVerifiedAt: row.last_verified_at ? new Date(row.last_verified_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}
