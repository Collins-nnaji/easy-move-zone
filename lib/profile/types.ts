import type { CareerProfile } from "@/lib/career/profile-store"
import type { CheckDocumentMeta } from "@/lib/check/types"

export type ContactMethod = "email" | "phone" | "whatsapp"
export type MoveStayPreference = "trip" | "nomad" | "move"
export type WorkMode = "onsite" | "hybrid" | "remote" | "business_owner" | "student"

export interface UserProfile {
  role: "buyer" | "seller"
  fullName: string
  phone: string
  preferredContactMethod: ContactMethod
  nationality: string
  movePreferredDestinations: string[]
  moveWorkMode: WorkMode | null
  moveStayPreference: MoveStayPreference | null
  moveNotes: string
  isAgent: boolean
  agentLicense: string
  agentCompany: string
  agentBio: string
  agentVerified: boolean
}

export interface SavedSearch {
  id: string
  name: string
  citySlug: string | null
  budgetMin: number | null
  budgetMax: number | null
  createdAt: string
}

export interface ProfileWorkspaceData {
  profile: UserProfile
  career: CareerProfile
  documents: CheckDocumentMeta[]
  savedSearches: SavedSearch[]
}

export const EMPTY_PROFILE: UserProfile = {
  role: "buyer",
  fullName: "",
  phone: "",
  preferredContactMethod: "email",
  nationality: "",
  movePreferredDestinations: [],
  moveWorkMode: null,
  moveStayPreference: null,
  moveNotes: "",
  isAgent: false,
  agentLicense: "",
  agentCompany: "",
  agentBio: "",
  agentVerified: false,
}
