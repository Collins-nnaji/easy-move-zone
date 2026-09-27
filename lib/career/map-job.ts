import type { MobilityProfile, OccupationBand } from "@/lib/mobility/types"
import { occupationBand } from "@/lib/mobility/score"
import type { SponsorshipJob } from "@/lib/mobility/jobs"

export type JobRow = {
  id: number
  title: string
  company: string | null
  location: string | null
  country: string | null
  category: string | null
  experience_level: string | null
  job_type: string | null
  visa_type: string | null
  skills: string[] | null
  url: string | null
  logo_url: string | null
  posted_at: string | null
  description: string | null
}

const COUNTRY_SLUG: Record<string, string> = {
  canada: "canada",
  germany: "germany",
  "united kingdom": "united-kingdom",
  uk: "united-kingdom",
  australia: "australia",
  netherlands: "netherlands",
  ireland: "ireland",
  portugal: "portugal",
  "united arab emirates": "united-arab-emirates",
  uae: "united-arab-emirates",
}

const FLAG: Record<string, string> = {
  canada: "🇨🇦",
  germany: "🇩🇪",
  "united-kingdom": "🇬🇧",
  australia: "🇦🇺",
  netherlands: "🇳🇱",
  ireland: "🇮🇪",
  portugal: "🇵🇹",
  "united-arab-emirates": "🇦🇪",
  "united states": "🇺🇸",
  remote: "🌐",
}

export function countryToSlug(country: string | null | undefined): string | null {
  if (!country) return null
  const key = country.trim().toLowerCase()
  return COUNTRY_SLUG[key] ?? null
}

function bandFromJob(row: JobRow): OccupationBand {
  const hay = `${row.category ?? ""} ${row.title ?? ""} ${(row.skills ?? []).join(" ")}`.toLowerCase()
  if (/nurs|doctor|health|clinic|pharma|medical|care /.test(hay)) return "health"
  if (/teach|educat|lectur|school|professor/.test(hay)) return "education"
  if (/tech|software|engineer|develop|data|cyber|cloud|product|analyst|devops|security|it /.test(hay)) {
    return "tech"
  }
  return occupationBand(row.title || row.category || "other")
}

function experienceYears(level: string | null | undefined): number {
  const value = (level ?? "").toLowerCase()
  if (/entry|junior|intern|graduate/.test(value)) return 0
  if (/senior|lead|principal|staff|director/.test(value)) return 5
  if (/mid/.test(value)) return 3
  return 2
}

export function mapJob(row: JobRow): SponsorshipJob & {
  company: string | null
  url: string | null
  category: string | null
  visaType: string | null
  postedAt: string | null
} {
  const slug = countryToSlug(row.country)
  const countryName = row.country?.trim() || "International"
  const city = (row.location || countryName).split(",")[0]?.trim() || countryName
  return {
    id: String(row.id),
    title: row.title,
    city,
    country: countryName,
    countrySlug: slug ?? "united-kingdom",
    flag: FLAG[slug ?? ""] ?? FLAG[countryName.toLowerCase()] ?? "🌍",
    sponsorship: row.visa_type?.trim() && row.visa_type.trim() !== "Other" ? row.visa_type.trim() : "International applicants considered",
    band: bandFromJob(row),
    minExperience: experienceYears(row.experience_level),
    minEducation: "bachelor",
    minEnglish: /uk|canada|australia|ireland|united states/i.test(countryName) ? "intermediate" : "basic",
    company: row.company,
    url: row.url,
    category: row.category,
    visaType: row.visa_type,
    postedAt: row.posted_at,
  }
}

export function estimateEducation(profile: MobilityProfile): MobilityProfile["education"] {
  return profile.education
}
