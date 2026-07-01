export type ApplicationStatus =
  | "researching"
  | "gathering_documents"
  | "submitted"
  | "approved"
  | "rejected"
  | "expired"

export type ChecklistCategory =
  | "documentation"
  | "application_form"
  | "appointment"
  | "fee_payment"
  | "biometrics"
  | "interview"
  | "follow_up"

export type ChecklistStatus = "todo" | "in_progress" | "done" | "not_applicable"
export type ChecklistPriority = "low" | "medium" | "high"

export type DocumentType =
  | "passport"
  | "photo"
  | "bank_statement"
  | "invitation_letter"
  | "travel_insurance"
  | "employment_letter"
  | "itinerary"
  | "other"

export type DocumentStatus = "uploaded" | "verified" | "rejected" | "expired" | "needs_replacement"

export type TemplateSource = "curated" | "ai_generated" | "admin_edited"

export type MissionType = "embassy" | "consulate" | "consulate_general" | "visa_application_center" | "trade_office"

export interface VisaApplication {
  id: string
  authUserId: string
  label: string
  applicantNationality: string
  destinationCountry: string
  visaType: string
  visaTypeLabel: string
  purposeNotes: string
  targetTravelDate: string | null
  status: ApplicationStatus
  passportNumberLast4: string
  passportExpiryDate: string | null
  createdAt: string
  updatedAt: string
}

export interface VisaChecklistItem {
  id: string
  applicationId: string
  authUserId: string
  title: string
  description: string
  category: ChecklistCategory
  status: ChecklistStatus
  priority: ChecklistPriority
  dueDate: string | null
  isAiGenerated: boolean
  sourceTemplateId: string | null
  linkedDocumentId: string | null
  sortOrder: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface VisaDocument {
  id: string
  applicationId: string
  authUserId: string
  documentType: DocumentType
  label: string
  fileKey: string
  fileUrl: string
  mimeType: string
  fileSizeBytes: number
  status: DocumentStatus
  expiryDate: string | null
  adminReviewNotes: string
  uploadedAt: string
  updatedAt: string
}

export interface RequiredDocumentSpec {
  documentType: DocumentType
  label: string
  description: string
  mandatory: boolean
}

export interface ChecklistTemplateItem {
  title: string
  category: ChecklistCategory
  description: string
  sortOrder: number
}

export interface VisaRequirementTemplate {
  id: string
  nationality: string
  destinationCountry: string
  visaType: string
  visaTypeLabel: string
  summary: string
  requiredDocuments: RequiredDocumentSpec[]
  checklistTemplate: ChecklistTemplateItem[]
  processingTimeEstimate: string
  feeEstimate: string
  validityNotes: string
  source: TemplateSource
  lastVerifiedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Embassy {
  id: string
  country: string
  locatedInCountry: string
  missionType: MissionType
  city: string
  address: string
  phone: string
  email: string
  website: string
  appointmentBookingUrl: string
  latitude: number | null
  longitude: number | null
  jurisdictionNotes: string
  operatingHours: string
  services: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}
