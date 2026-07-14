import type { RequestGoal } from "@/lib/requests/types"

export type ServiceBookingStatus = "assigned" | "in_progress" | "completed" | "cancelled"

export interface ServicePackage {
  key: string
  name: string
  tagline: string
  priceLabel: string
  goal: RequestGoal
  includes: string[]
}

export interface ServiceManager {
  id: string
  name: string
  email: string
  title: string
}

export interface ServiceBooking {
  id: string
  serviceKey: string
  serviceName: string
  goal: string
  destination: string | null
  status: ServiceBookingStatus
  manager: ServiceManager | null
  createdAt: string
}

export interface NewServiceBookingInput {
  serviceKey: string
  destination?: string
  name: string
  email: string
  phone?: string
  notes?: string
}

export const SERVICE_STATUSES: ServiceBookingStatus[] = ["assigned", "in_progress", "completed", "cancelled"]

// The bookable service catalogue. Static — these are the agency's products.
export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    key: "full-relocation",
    name: "Full Relocation Concierge",
    tagline: "End-to-end: visa, housing, banking and settling in, managed for you.",
    priceLabel: "From $2,499",
    goal: "relocate",
    includes: ["Dedicated relocation manager", "Visa strategy & paperwork", "Housing shortlist & viewings", "Banking, SIM & registration setup"],
  },
  {
    key: "visa-handling",
    name: "Visa Application Handling",
    tagline: "We prepare, check and submit your visa application end to end.",
    priceLabel: "From $499",
    goal: "visa",
    includes: ["Eligibility review", "Document checklist & vetting", "Application preparation", "Submission & follow-up guidance"],
  },
  {
    key: "school-placement",
    name: "School & University Placement",
    tagline: "Get matched, apply and secure a student-visa-eligible admission.",
    priceLabel: "From $799",
    goal: "study",
    includes: ["Program matching", "Application support", "Admissions liaison", "Student visa guidance"],
  },
  {
    key: "job-search",
    name: "Job Search & Sponsorship",
    tagline: "Find visa-sponsoring roles and land the offer that moves you.",
    priceLabel: "From $699",
    goal: "work",
    includes: ["Sponsoring-employer shortlist", "CV & profile tuning", "Interview prep", "Offer & work-visa guidance"],
  },
  {
    key: "settle-in",
    name: "Settling-In Package",
    tagline: "Land softly — housing, banking, healthcare and local know-how.",
    priceLabel: "From $399",
    goal: "relocate",
    includes: ["Neighbourhood guidance", "Bank & SIM setup", "Healthcare registration", "First-month checklist"],
  },
]

export function servicePackage(key: string): ServicePackage | undefined {
  return SERVICE_PACKAGES.find((p) => p.key === key)
}
