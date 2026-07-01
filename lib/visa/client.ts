"use client"

import type {
  ChecklistCategory,
  ChecklistPriority,
  ChecklistStatus,
  DocumentType,
  Embassy,
  VisaApplication,
  VisaChecklistItem,
  VisaDocument,
  VisaRequirementTemplate,
} from "@/lib/visa/types"

export async function fetchApplications(): Promise<VisaApplication[]> {
  const res = await fetch("/api/visa/applications", { cache: "no-store" })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { applications: VisaApplication[] }).applications
}

export async function fetchApplication(id: string): Promise<VisaApplication | null> {
  const res = await fetch(`/api/visa/applications/${id}`, { cache: "no-store" })
  if (!res.ok) return null
  return ((await res.json()) as { application: VisaApplication }).application
}

export async function createApplication(input: {
  label?: string
  applicantNationality: string
  destinationCountry: string
  visaType: string
  visaTypeLabel?: string
  purposeNotes?: string
  targetTravelDate?: string | null
  passportExpiryDate?: string | null
}): Promise<VisaApplication> {
  const res = await fetch("/api/visa/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { application: VisaApplication }).application
}

export async function updateApplication(id: string, input: Partial<VisaApplication>): Promise<VisaApplication> {
  const res = await fetch(`/api/visa/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { application: VisaApplication }).application
}

export async function deleteApplication(id: string): Promise<void> {
  const res = await fetch(`/api/visa/applications/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("failed")
}

export async function fetchChecklist(applicationId: string): Promise<VisaChecklistItem[]> {
  const res = await fetch(`/api/visa/checklist?applicationId=${encodeURIComponent(applicationId)}`, { cache: "no-store" })
  if (!res.ok) return []
  return ((await res.json()) as { items: VisaChecklistItem[] }).items
}

export async function addChecklistItem(input: {
  applicationId: string
  title: string
  description?: string
  category?: ChecklistCategory
  priority?: ChecklistPriority
  dueDate?: string | null
  notes?: string
}): Promise<VisaChecklistItem> {
  const res = await fetch("/api/visa/checklist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { item: VisaChecklistItem }).item
}

export async function updateChecklistItem(
  id: string,
  input: Partial<Pick<VisaChecklistItem, "title" | "description" | "category" | "status" | "priority" | "dueDate" | "notes" | "linkedDocumentId">>,
): Promise<VisaChecklistItem> {
  const res = await fetch(`/api/visa/checklist/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { item: VisaChecklistItem }).item
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const res = await fetch(`/api/visa/checklist/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("failed")
}

export async function updateChecklistStatus(id: string, status: ChecklistStatus): Promise<VisaChecklistItem> {
  return updateChecklistItem(id, { status })
}

export async function fetchDocuments(applicationId: string): Promise<VisaDocument[]> {
  const res = await fetch(`/api/visa/documents?applicationId=${encodeURIComponent(applicationId)}`, { cache: "no-store" })
  if (!res.ok) return []
  return ((await res.json()) as { documents: VisaDocument[] }).documents
}

export async function uploadDocumentFile(file: File): Promise<{ url: string; key: string }> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("type", "document")
  const res = await fetch("/api/upload", { method: "POST", body: formData })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? "Upload failed")
  }
  return (await res.json()) as { url: string; key: string }
}

export async function registerDocument(input: {
  applicationId: string
  documentType: DocumentType
  label: string
  fileKey: string
  mimeType: string
  fileSizeBytes: number
  expiryDate?: string | null
}): Promise<VisaDocument> {
  const res = await fetch("/api/visa/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { document: VisaDocument }).document
}

export async function updateDocument(
  id: string,
  input: Partial<Pick<VisaDocument, "label" | "documentType" | "status" | "expiryDate">>,
): Promise<VisaDocument> {
  const res = await fetch(`/api/visa/documents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { document: VisaDocument }).document
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/visa/documents/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("failed")
}

export async function fetchEmbassies(filters: { country?: string; locatedIn?: string; city?: string } = {}): Promise<Embassy[]> {
  const params = new URLSearchParams()
  if (filters.country) params.set("country", filters.country)
  if (filters.locatedIn) params.set("locatedIn", filters.locatedIn)
  if (filters.city) params.set("city", filters.city)
  const url = params.size ? `/api/embassies?${params}` : "/api/embassies"
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) return []
  return ((await res.json()) as { embassies: Embassy[] }).embassies
}

export async function fetchEmbassy(id: string): Promise<Embassy | null> {
  const res = await fetch(`/api/embassies/${id}`, { cache: "no-store" })
  if (!res.ok) return null
  return ((await res.json()) as { embassy: Embassy }).embassy
}

export async function generateChecklist(applicationId: string): Promise<VisaChecklistItem[]> {
  const res = await fetch("/api/visa/checklist/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ applicationId }),
  })
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { items: VisaChecklistItem[] }).items
}

export async function askVisaQuestion(input: {
  question: string
  nationality: string
  destinationCountry: string
  visaType: string
}): Promise<string> {
  const res = await fetch("/api/visa/qa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { answer: string }).answer
}

export interface RequirementsResponse {
  template: VisaRequirementTemplate
  verified: boolean
  unavailable?: boolean
}

export async function fetchRequirements(nationality: string, destination: string, visaType: string): Promise<RequirementsResponse | null> {
  const params = new URLSearchParams({ nationality, destination, visaType })
  const res = await fetch(`/api/visa/requirements?${params}`, { cache: "no-store" })
  if (!res.ok) return null
  return (await res.json()) as RequirementsResponse
}
