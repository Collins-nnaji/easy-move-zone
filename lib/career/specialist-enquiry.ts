import { careerSql } from "@/lib/career/db"

export type SpecialistEnquiryInput = {
  fullName: string
  email: string
  phone: string | null
  nationality: string | null
  currentCountry: string | null
  destinationCountries: string[]
  primaryGoal: string
  timeline: string | null
  currentOccupation: string | null
  targetOccupation: string | null
  yearsExperience: number | null
  educationLevel: string | null
  englishLevel: string | null
  visaStatus: string | null
  alreadyAbroad: boolean
  dependents: number
  budgetRange: string | null
  challenges: string[]
  preferredContact: string
  message: string
  consent: boolean
}

export async function createSpecialistEnquiry(input: SpecialistEnquiryInput) {
  if (!careerSql) throw new Error("Database is not configured")
  if (!input.consent) throw new Error("Consent is required")

  const rows = (await careerSql`
    INSERT INTO career.specialist_enquiries (
      full_name, email, phone, nationality, current_country, destination_countries,
      primary_goal, timeline, current_occupation, target_occupation, years_experience,
      education_level, english_level, visa_status, already_abroad, dependents,
      budget_range, challenges, preferred_contact, message, consent
    ) VALUES (
      ${input.fullName.trim()},
      ${input.email.trim().toLowerCase()},
      ${input.phone?.trim() || null},
      ${input.nationality?.trim() || null},
      ${input.currentCountry?.trim() || null},
      ${input.destinationCountries},
      ${input.primaryGoal},
      ${input.timeline?.trim() || null},
      ${input.currentOccupation?.trim() || null},
      ${input.targetOccupation?.trim() || null},
      ${input.yearsExperience},
      ${input.educationLevel?.trim() || null},
      ${input.englishLevel?.trim() || null},
      ${input.visaStatus?.trim() || null},
      ${input.alreadyAbroad},
      ${input.dependents},
      ${input.budgetRange?.trim() || null},
      ${input.challenges},
      ${input.preferredContact},
      ${input.message.trim()},
      ${input.consent}
    )
    RETURNING id
  `) as { id: string }[]

  return rows[0]!
}
