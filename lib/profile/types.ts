export type ContactMethod = "email" | "phone" | "whatsapp"

export interface UserProfile {
  role: "buyer" | "seller"
  fullName: string
  phone: string
  preferredContactMethod: ContactMethod
  nationality: string
  isAgent: boolean
  agentLicense: string
  agentCompany: string
  agentBio: string
  agentVerified: boolean
}

export interface ProfileWorkspaceData {
  profile: UserProfile
}

export const EMPTY_PROFILE: UserProfile = {
  role: "buyer",
  fullName: "",
  phone: "",
  preferredContactMethod: "email",
  nationality: "",
  isAgent: false,
  agentLicense: "",
  agentCompany: "",
  agentBio: "",
  agentVerified: false,
}
