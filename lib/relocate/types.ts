export type RelocationStatus = "planning" | "in_progress" | "ready_to_move" | "settled"
export type WorkMode = "onsite" | "hybrid" | "remote" | "business_owner" | "student"
export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"
export type TaskCategory =
  | "visa"
  | "legal"
  | "finance"
  | "logistics"
  | "career"
  | "family"
  | "settling"

export interface RelocationPlan {
  id: string
  authUserId: string
  planName: string
  originCity: string
  originCountry: string
  destinationCity: string
  destinationCountry: string
  moveDate: string | null
  moveReason: string
  householdSize: number
  workMode: WorkMode
  visaPathway: string
  status: RelocationStatus
  budgetHousingUsd: number
  budgetTravelUsd: number
  budgetSetupUsd: number
  budgetBufferUsd: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface RelocationTask {
  id: string
  planId: string
  authUserId: string
  title: string
  category: TaskCategory
  dueDate: string | null
  status: TaskStatus
  priority: TaskPriority
  notes: string
  createdAt: string
  updatedAt: string
}

export interface RelocationContact {
  id: string
  planId: string
  authUserId: string
  name: string
  serviceType: string
  email: string
  phone: string
  website: string
  notes: string
  createdAt: string
  updatedAt: string
}
