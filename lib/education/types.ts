export const STUDY_LEVELS = ["foundation", "undergraduate", "postgraduate", "mba", "phd"] as const
export type StudyLevel = (typeof STUDY_LEVELS)[number]

export const STUDY_LEVEL_LABELS: Record<StudyLevel, string> = {
  foundation: "Foundation",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  mba: "MBA",
  phd: "PhD / research",
}

export const APPLICATION_STATUSES = ["shortlisted", "preparing", "submitted", "offer", "rejected"] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  shortlisted: "Shortlisted",
  preparing: "Preparing",
  submitted: "Submitted",
  offer: "Offer",
  rejected: "Unsuccessful",
}

export type University = {
  id: string
  slug: string
  name: string
  country: string
  city: string
  website: string | null
  summary: string | null
}

export type Course = {
  id: string
  universityId: string
  title: string
  level: StudyLevel
  subject: string
  duration: string | null
  intake: string | null
  tuitionMin: number | null
  tuitionMax: number | null
  currency: string
  feeNote: string | null
  entryRequirements: string | null
  englishRequirement: string | null
  courseUrl: string | null
  updatedAt: string
}

export type CourseWithUniversity = Course & { university: University }

export type CourseFit = {
  score: number
  verdict: "strong" | "possible" | "stretch"
  meets: string[]
  gaps: string[]
  advice: string[]
}

export type EducationApplication = {
  id: string
  courseId: string
  status: ApplicationStatus
  personalStatement: string
  notes: string
  fit: CourseFit | null
  updatedAt: string
  course: CourseWithUniversity
}

export type StatementFormat = "ucas" | "postgraduate"
