/** SEO landing pages built from paid-search intent clusters. Drives the sitemap, footer and footer visibility. */
export const LANDING_PAGES = [
  { href: "/visa-sponsor-checker", label: "Visa sponsor checker", priority: 0.9 },
  { href: "/jobs-in-uk", label: "Jobs in the UK", priority: 0.9 },
  { href: "/jobs-abroad", label: "Jobs abroad", priority: 0.9 },
  { href: "/ai-job-search", label: "AI job search", priority: 0.8 },
  { href: "/cv-builder", label: "CV builder", priority: 0.8 },
  { href: "/ats-friendly-cv", label: "ATS-friendly CV", priority: 0.8 },
  { href: "/cover-letter-generator", label: "Cover letter generator", priority: 0.8 },
  { href: "/career-change", label: "Career change planner", priority: 0.8 },
  { href: "/alternatives/indeed", label: "Indeed alternative", priority: 0.7 },
] as const

export type LandingHref = (typeof LANDING_PAGES)[number]["href"]

export const LANDING_HREFS: readonly string[] = LANDING_PAGES.map((page) => page.href)
