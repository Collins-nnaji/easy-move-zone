export type RequestGoal =
  | "work"
  | "study"
  | "visa"
  | "relocate"
  | "export"
  | "import"
  | "freight"
  | "other"

export type RequestStatus = "new" | "in_review" | "contacted" | "closed"

export interface RelocationRequest {
  id: string
  authUserId: string | null
  name: string
  email: string
  phone: string | null
  goal: RequestGoal
  destination: string | null
  timeline: string | null
  message: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
}

export interface NewRequestInput {
  name: string
  email: string
  phone?: string
  goal: RequestGoal
  destination?: string
  timeline?: string
  message?: string
}

export const REQUEST_GOALS: { id: RequestGoal; label: string }[] = [
  { id: "export", label: "Export from Nigeria" },
  { id: "import", label: "Import into Nigeria" },
  { id: "freight", label: "General freight / logistics" },
  { id: "other", label: "Something else" },
  { id: "work", label: "Work / job relocation (legacy)" },
  { id: "study", label: "Study / school admission (legacy)" },
  { id: "visa", label: "Visa help only (legacy)" },
  { id: "relocate", label: "Full relocation (legacy)" },
]

export const REQUEST_STATUSES: RequestStatus[] = ["new", "in_review", "contacted", "closed"]
