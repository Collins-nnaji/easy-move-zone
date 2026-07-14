export type RequestGoal = "work" | "study" | "visa" | "relocate" | "other"
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
  { id: "work", label: "Work / job relocation" },
  { id: "study", label: "Study / school admission" },
  { id: "visa", label: "Visa help only" },
  { id: "relocate", label: "Full relocation" },
  { id: "other", label: "Something else" },
]

export const REQUEST_STATUSES: RequestStatus[] = ["new", "in_review", "contacted", "closed"]
