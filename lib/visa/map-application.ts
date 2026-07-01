import type { ApplicationStatus, VisaApplication } from "@/lib/visa/types"

export const ALLOWED_APPLICATION_STATUSES = new Set<ApplicationStatus>([
  "researching",
  "gathering_documents",
  "submitted",
  "approved",
  "rejected",
  "expired",
])

export const APPLICATION_SELECT = `
  id, auth_user_id, label, applicant_nationality, destination_country, visa_type,
  visa_type_label, purpose_notes, target_travel_date, status,
  passport_number_last4, passport_expiry_date, created_at, updated_at
`

export type ApplicationRow = {
  id: string
  auth_user_id: string
  label: string
  applicant_nationality: string
  destination_country: string
  visa_type: string
  visa_type_label: string | null
  purpose_notes: string | null
  target_travel_date: string | null
  status: ApplicationStatus
  passport_number_last4: string | null
  passport_expiry_date: string | null
  created_at: string
  updated_at: string
}

export function mapApplicationRow(row: ApplicationRow): VisaApplication {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    label: row.label,
    applicantNationality: row.applicant_nationality,
    destinationCountry: row.destination_country,
    visaType: row.visa_type,
    visaTypeLabel: row.visa_type_label ?? "",
    purposeNotes: row.purpose_notes ?? "",
    targetTravelDate: row.target_travel_date,
    status: row.status,
    passportNumberLast4: row.passport_number_last4 ?? "",
    passportExpiryDate: row.passport_expiry_date,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export function safeDate(value: unknown): string | null {
  if (!value) return null
  const cast = String(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cast)) return null
  return cast
}

export function safePassportLast4(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "").slice(-4)
}
