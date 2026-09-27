export type StudyRoute = {
  country: string
  flag: string
  visa: string
  afterStudy: string
  url: string
}

/** Student visa and post-study work routes by destination. */
export const STUDY_ROUTES: StudyRoute[] = [
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    visa: "Student visa",
    afterStudy: "Graduate route to stay and work after your degree, then switch to Skilled Worker.",
    url: "https://www.gov.uk/student-visa",
  },
  {
    country: "Ireland",
    flag: "🇮🇪",
    visa: "Study visa (Stamp 2)",
    afterStudy: "Stay Back Option (Stamp 1G) to look for work, then an employment permit.",
    url: "https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/third-level-graduate-programme/",
  },
  {
    country: "Netherlands",
    flag: "🇳🇱",
    visa: "Student residence permit",
    afterStudy: "Orientation year to find work, often leading to the Highly Skilled Migrant route.",
    url: "https://ind.nl/en/residence-permits/work/residence-permit-for-orientation-year",
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    visa: "Student visa",
    afterStudy: "Job-seeker residence after graduation, then an EU Blue Card or skilled worker permit.",
    url: "https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    visa: "Study permit",
    afterStudy: "Post-Graduation Work Permit for eligible programmes, with Canadian experience counting towards residence.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    visa: "Student visa (subclass 500)",
    afterStudy: "Temporary Graduate visa (subclass 485) to gain Australian work experience.",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
  },
  {
    country: "United States",
    flag: "🇺🇸",
    visa: "F-1 student visa",
    afterStudy: "Optional Practical Training (OPT), with an extension for eligible STEM degrees.",
    url: "https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20",
  },
]
