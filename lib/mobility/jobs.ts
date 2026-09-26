import type { MobilityProfile, OccupationBand } from "./types"
import { assessOne } from "./score"
import { occupationBand } from "./score"

/**
 * Visa-sponsorship jobs.
 *
 * SAMPLE_JOBS is a preview feed so the match logic works before the jobs app
 * is connected. Replace loadSponsorshipJobs() with that app's listings.
 * scoreJob() should stay: it compares a listing with the mobility profile.
 */
export type SponsorshipJob = {
  id: string
  title: string
  city: string
  country: string
  countrySlug: string
  flag: string
  sponsorship: string
  band: OccupationBand
  minExperience: number
  minEducation: MobilityProfile["education"]
  minEnglish: MobilityProfile["englishLevel"]
}

const SAMPLE_JOBS: SponsorshipJob[] = [
  {
    id: "ber-dev",
    title: "Senior developer",
    city: "Berlin",
    country: "Germany",
    countrySlug: "germany",
    flag: "🇩🇪",
    sponsorship: "Opportunity Card or EU Blue Card eligible",
    band: "tech",
    minExperience: 4,
    minEducation: "bachelor",
    minEnglish: "intermediate",
  },
  {
    id: "ams-pm",
    title: "Product manager",
    city: "Amsterdam",
    country: "Netherlands",
    countrySlug: "netherlands",
    flag: "🇳🇱",
    sponsorship: "Highly skilled migrant eligible",
    band: "tech",
    minExperience: 4,
    minEducation: "bachelor",
    minEnglish: "fluent",
  },
  {
    id: "tor-data",
    title: "Data analyst",
    city: "Toronto",
    country: "Canada",
    countrySlug: "canada",
    flag: "🇨🇦",
    sponsorship: "International applicants considered",
    band: "tech",
    minExperience: 2,
    minEducation: "bachelor",
    minEnglish: "intermediate",
  },
  {
    id: "lon-cyber",
    title: "Cybersecurity analyst",
    city: "London",
    country: "United Kingdom",
    countrySlug: "united-kingdom",
    flag: "🇬🇧",
    sponsorship: "Visa sponsorship available",
    band: "tech",
    minExperience: 3,
    minEducation: "bachelor",
    minEnglish: "intermediate",
  },
  {
    id: "dub-nurse",
    title: "Registered nurse",
    city: "Dublin",
    country: "Ireland",
    countrySlug: "ireland",
    flag: "🇮🇪",
    sponsorship: "Critical Skills employer",
    band: "health",
    minExperience: 2,
    minEducation: "bachelor",
    minEnglish: "fluent",
  },
  {
    id: "syd-cloud",
    title: "Cloud engineer",
    city: "Sydney",
    country: "Australia",
    countrySlug: "australia",
    flag: "🇦🇺",
    sponsorship: "Skilled visa pathway",
    band: "tech",
    minExperience: 4,
    minEducation: "bachelor",
    minEnglish: "fluent",
  },
]

const EDUCATION_RANK = { secondary: 0, bachelor: 1, master: 2, phd: 3 }
const ENGLISH_RANK = { basic: 0, intermediate: 1, fluent: 2 }

export type ScoredJob = SponsorshipJob & {
  met: number
  total: number
  gaps: string[]
}

export function loadSponsorshipJobs(): SponsorshipJob[] {
  return SAMPLE_JOBS
}

export function scoreJob(profile: MobilityProfile, job: SponsorshipJob): ScoredJob {
  const assessment = assessOne(profile, job.countrySlug)
  const checks: { ok: boolean; gap: string }[] = [
    {
      ok: occupationBand(profile.profession) === job.band,
      gap: "Occupation does not match this role family",
    },
    {
      ok: profile.experienceYears >= job.minExperience,
      gap: `Needs about ${job.minExperience} years of experience`,
    },
    {
      ok: EDUCATION_RANK[profile.education] >= EDUCATION_RANK[job.minEducation],
      gap: "Education is below the usual level for this role",
    },
    {
      ok: ENGLISH_RANK[profile.englishLevel] >= ENGLISH_RANK[job.minEnglish],
      gap: "English level is below what this role expects",
    },
    {
      ok: Boolean(assessment && assessment.primary.status !== "unavailable"),
      gap: "No usable route from your profile to this country",
    },
    {
      ok: profile.timelineMonths >= 6,
      gap: "Timeline is tighter than a typical sponsored hire",
    },
    {
      ok: !assessment || profile.savingsGbp >= Math.round(assessment.totalCostGbp * 0.35),
      gap: "Savings are light for the landing costs",
    },
    {
      ok: !assessment?.languageCallout || profile.languages.some((language) => assessment.languageCallout?.includes(language)),
      gap: assessment?.destination.recommendLanguage
        ? `${assessment.destination.recommendLanguage} is recommended for this move`
        : "A local language is recommended",
    },
  ]

  const gaps = checks.filter((check) => !check.ok).map((check) => check.gap)
  return { ...job, met: checks.length - gaps.length, total: checks.length, gaps }
}

export function scoreJobs(profile: MobilityProfile): ScoredJob[] {
  return loadSponsorshipJobs()
    .map((job) => scoreJob(profile, job))
    .sort((a, b) => b.met - a.met)
}
