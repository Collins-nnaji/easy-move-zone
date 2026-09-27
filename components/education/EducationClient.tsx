"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Bookmark, BookmarkCheck, BriefcaseBusiness, CalendarDays, ChevronDown, Clock3, ExternalLink, Loader2, Search, SlidersHorizontal, X } from "lucide-react"
import { STUDY_ROUTE_BY_COUNTRY, STUDY_ROUTES } from "@/lib/education/study-routes"
import {
  STUDY_LEVEL_LABELS,
  STUDY_LEVELS,
  type CourseFit,
  type CourseWithUniversity,
  type EducationApplication,
} from "@/lib/education/types"
import { ApplicationHub } from "./ApplicationHub"
import { COUNTRY_FLAGS, FitIcon, FitSummary, INK, PRIMARY, StatementIcon, formatTuition } from "./shared"
import { RouteCompareTable, RouteFacts } from "./StudyRouteInfo"

type Tab = "explore" | "hub"
type FacetKey = "country" | "level" | "subject" | "intake" | "duration" | "budget"
type Filters = Record<FacetKey, string[]>
type Sort = "recommended" | "fees" | "duration"

const EMPTY_FILTERS: Filters = { country: [], level: [], subject: [], intake: [], duration: [], budget: [] }
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DURATION_BANDS = ["Up to 1 year", "1–2 years", "Over 2 years"]
const BUDGET_BANDS = ["No tuition fees", "Under £15k", "£15k–£25k", "£25k–£35k", "Over £35k", "Fees on request"]
/** Rough conversion so fees in different currencies can share one budget filter. */
const GBP_RATE: Record<string, number> = { GBP: 1, EUR: 0.85, USD: 0.79, CAD: 0.58, AUD: 0.52 }

function intakeMonths(course: CourseWithUniversity) {
  return MONTHS.filter((month) => (course.intake ?? "").toLowerCase().includes(month.toLowerCase()))
}

function durationYears(course: CourseWithUniversity) {
  const text = (course.duration ?? "").toLowerCase()
  const value = Number(text.match(/\d+(?:\.\d+)?/)?.[0])
  if (!Number.isFinite(value)) return null
  return text.includes("month") ? value / 12 : value
}

function durationBand(course: CourseWithUniversity) {
  const years = durationYears(course)
  if (years == null) return null
  return years <= 1 ? DURATION_BANDS[0] : years <= 2 ? DURATION_BANDS[1] : DURATION_BANDS[2]
}

function feeGbp(course: CourseWithUniversity) {
  const fee = course.tuitionMin ?? course.tuitionMax
  return fee == null ? null : fee * (GBP_RATE[course.currency] ?? 1)
}

function budgetBand(course: CourseWithUniversity) {
  const fee = feeGbp(course)
  if (fee == null) return BUDGET_BANDS[5]
  if (fee === 0) return BUDGET_BANDS[0]
  if (fee < 15000) return BUDGET_BANDS[1]
  if (fee < 25000) return BUDGET_BANDS[2]
  if (fee < 35000) return BUDGET_BANDS[3]
  return BUDGET_BANDS[4]
}

function facetValues(course: CourseWithUniversity, key: FacetKey): string[] {
  if (key === "country") return [course.university.country]
  if (key === "level") return [course.level]
  if (key === "subject") return course.subject ? [course.subject] : []
  if (key === "intake") return intakeMonths(course)
  if (key === "duration") return [durationBand(course)].filter((value): value is string => Boolean(value))
  return [budgetBand(course)]
}

function matches(course: CourseWithUniversity, filters: Filters, query: string, skip?: FacetKey) {
  if (query && !`${course.title} ${course.university.name} ${course.university.city} ${course.subject}`.toLowerCase().includes(query)) return false
  return (Object.keys(filters) as FacetKey[]).every((key) => {
    if (key === skip || !filters[key].length) return true
    const values = facetValues(course, key)
    return filters[key].some((value) => values.includes(value))
  })
}

function FilterGroup({ label, options, selected, counts, onToggle, format = (value) => value, defaultOpen = true, loading = false }: {
  loading?: boolean
  label: string
  options: string[]
  selected: string[]
  counts: Record<string, number>
  onToggle: (value: string) => void
  format?: (value: string) => string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const visible = options.filter((option) => counts[option] || selected.includes(option))
  return (
    <section className="border-b border-[#e4dfd5]/70 py-3 last:border-0">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5047]">
          {label}
          {selected.length > 0 && <span className="rounded-full bg-[#fbeae0] px-2 py-0.5 text-[10px] normal-case tracking-normal text-[#7a3b24]">{selected.length}</span>}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9aa094] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-1.5 space-y-0.5">
          {visible.length === 0 ? <p className="px-1 py-1.5 text-xs text-[#7c827a]">{loading ? "Loading…" : "No options for these filters."}</p> : visible.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-[#f6f3ec]">
              <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} className="h-3.5 w-3.5 accent-[#e0511f]" />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#1b231e]">{format(option)}</span>
              <span className="shrink-0 text-xs text-[#9aa094]">{counts[option] ?? 0}</span>
            </label>
          ))}
        </div>
      )}
    </section>
  )
}

export function EducationClient({ signedIn }: { signedIn: boolean }) {
  const [tab, setTab] = useState<Tab>("explore")
  const [courses, setCourses] = useState<CourseWithUniversity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<Sort>("recommended")
  const [mobileFilters, setMobileFilters] = useState(false)
  const [applications, setApplications] = useState<EducationApplication[]>([])
  const [focusCourseId, setFocusCourseId] = useState<string | null>(null)
  const [fitCourseId, setFitCourseId] = useState<string | null>(null)
  const [fitBusy, setFitBusy] = useState(false)
  const [fitResult, setFitResult] = useState<{ fit: CourseFit; hasCv: boolean } | null>(null)
  const [authPrompt, setAuthPrompt] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void fetch("/api/education/courses", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        setCourses(data.courses ?? [])
        if (data.error) setError(data.error)
      })
      .catch(() => active && setError("Could not load courses."))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const refreshApplications = useCallback(async () => {
    if (!signedIn) return
    const res = await fetch("/api/education/applications", { cache: "no-store" })
    if (res.ok) setApplications((await res.json()).applications ?? [])
  }, [signedIn])

  useEffect(() => {
    void refreshApplications()
  }, [refreshApplications])

  const shortlisted = useMemo(() => new Set(applications.map((a) => a.courseId)), [applications])
  const q = query.trim().toLowerCase()

  const options = useMemo(() => ({
    country: [...new Set([...STUDY_ROUTES.map((route) => route.country), ...courses.map((c) => c.university.country)])],
    level: [...STUDY_LEVELS],
    subject: [...new Set(courses.map((c) => c.subject).filter(Boolean))].sort(),
    intake: MONTHS,
    duration: DURATION_BANDS,
    budget: BUDGET_BANDS,
  }), [courses])

  const counts = useMemo(() => {
    const out = Object.fromEntries((Object.keys(EMPTY_FILTERS) as FacetKey[]).map((key) => [key, {} as Record<string, number>])) as Record<FacetKey, Record<string, number>>
    for (const key of Object.keys(out) as FacetKey[]) {
      for (const course of courses) {
        if (!matches(course, filters, q, key)) continue
        for (const value of facetValues(course, key)) out[key][value] = (out[key][value] ?? 0) + 1
      }
    }
    return out
  }, [courses, filters, q])

  const filtered = useMemo(() => {
    const list = courses.filter((course) => matches(course, filters, q))
    if (sort === "fees") return [...list].sort((a, b) => (feeGbp(a) ?? Infinity) - (feeGbp(b) ?? Infinity))
    if (sort === "duration") return [...list].sort((a, b) => (durationYears(a) ?? Infinity) - (durationYears(b) ?? Infinity))
    return list
  }, [courses, filters, q, sort])

  const universityCount = useMemo(() => new Set(filtered.map((c) => c.universityId)).size, [filtered])
  const activeCount = Object.values(filters).reduce((sum, values) => sum + values.length, 0) + (q ? 1 : 0)
  const selectedRoutes = filters.country.map((country) => STUDY_ROUTE_BY_COUNTRY.get(country)).filter((route) => route !== undefined)

  const toggle = (key: FacetKey, value: string) =>
    setFilters((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }))

  const clearFilters = () => {
    setQuery("")
    setFilters(EMPTY_FILTERS)
  }

  function requireSignIn(message: string) {
    if (signedIn) return false
    setAuthPrompt(message)
    return true
  }

  async function toggleShortlist(course: CourseWithUniversity) {
    if (requireSignIn("Sign in to save courses to your application hub.")) return
    const res = shortlisted.has(course.id)
      ? await fetch(`/api/education/applications?courseId=${encodeURIComponent(course.id)}`, { method: "DELETE" })
      : await fetch("/api/education/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course.id }),
        })
    if (res.ok) setApplications((await res.json()).applications ?? [])
  }

  async function runFitCheck(course: CourseWithUniversity) {
    if (requireSignIn("Sign in to check your fit against this course.")) return
    setFitCourseId(course.id)
    setFitResult(null)
    setFitBusy(true)
    try {
      const res = await fetch("/api/education/fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setFitResult({ fit: data.fit, hasCv: data.hasCv })
        void refreshApplications()
      }
    } finally {
      setFitBusy(false)
    }
  }

  async function openStatement(course: CourseWithUniversity) {
    if (requireSignIn("Sign in to write a personal statement for this course.")) return
    if (!shortlisted.has(course.id)) {
      const res = await fetch("/api/education/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      })
      if (res.ok) setApplications((await res.json()).applications ?? [])
    }
    setFocusCourseId(course.id)
    setTab("hub")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const filterPanel = (
    <>
      <div className="flex items-center justify-between pb-1">
        <p className="text-sm font-extrabold">Filters</p>
        {activeCount > 0 && <button type="button" onClick={clearFilters} className="text-xs font-bold" style={{ color: PRIMARY }}>Clear all</button>}
      </div>
      <FilterGroup loading={loading} label="Destination" options={options.country} selected={filters.country} counts={counts.country} onToggle={(value) => toggle("country", value)} format={(value) => `${COUNTRY_FLAGS[value] ?? "🎓"} ${value}`} />
      <FilterGroup loading={loading} label="Level" options={options.level} selected={filters.level} counts={counts.level} onToggle={(value) => toggle("level", value)} format={(value) => STUDY_LEVEL_LABELS[value as keyof typeof STUDY_LEVEL_LABELS] ?? value} />
      <FilterGroup loading={loading} label="Subject" options={options.subject} selected={filters.subject} counts={counts.subject} onToggle={(value) => toggle("subject", value)} />
      <FilterGroup loading={loading} label="Tuition per year (approx.)" options={options.budget} selected={filters.budget} counts={counts.budget} onToggle={(value) => toggle("budget", value)} />
      <FilterGroup loading={loading} label="Course length" options={options.duration} selected={filters.duration} counts={counts.duration} onToggle={(value) => toggle("duration", value)} />
      <FilterGroup loading={loading} label="Start month" options={options.intake} selected={filters.intake} counts={counts.intake} onToggle={(value) => toggle("intake", value)} defaultOpen={false} />
    </>
  )

  return (
    <div style={{ color: INK }}>
      <div className="inline-flex rounded-full bg-white p-1 shadow-sm">
        {([
          ["explore", "Find a course"],
          ["hub", `Application hub${applications.length ? ` (${applications.length})` : ""}`],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${tab === id ? "bg-[#1b231e] text-white" : "text-[#4a5047] hover:text-[#1b231e]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {authPrompt && (
        <div role="status" className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-[#ead4c4] bg-[#fff8f2] p-4 shadow-[0_18px_40px_rgba(27,35,30,0.18)] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#7a3b24]">{authPrompt}</p>
          <div className="flex items-center gap-2">
            <Link href="/auth?redirect=/education" className="rounded-xl bg-[#e0511f] px-4 py-2 text-xs font-extrabold text-white">
              Sign in
            </Link>
            <button type="button" onClick={() => setAuthPrompt(null)} className="rounded-full p-1.5 text-[#9a7a68] hover:bg-white" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {tab === "hub" ? (
        <ApplicationHub
          signedIn={signedIn}
          applications={applications}
          setApplications={setApplications}
          focusCourseId={focusCourseId}
          onExplore={() => setTab("explore")}
        />
      ) : (
        <div className="mt-5 lg:flex lg:gap-6">
          <aside className="hidden w-[230px] shrink-0 self-start rounded-2xl border border-[#e4dfd5] bg-white px-4 py-3 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
            {filterPanel}
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa094]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search courses, universities or cities"
                  className="h-10 w-full rounded-xl border border-[#e4dfd5] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#e0511f]"
                />
              </div>
              <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} aria-label="Sort courses" className="h-10 rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm font-semibold">
                <option value="recommended">Recommended</option>
                <option value="fees">Lowest fees</option>
                <option value="duration">Shortest course</option>
              </select>
              <button type="button" onClick={() => setMobileFilters(!mobileFilters)} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm font-bold lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {activeCount > 0 && <span className="rounded-full bg-[#e0511f] px-1.5 text-[10px] text-white">{activeCount}</span>}
              </button>
            </div>
            {mobileFilters && <div className="mt-3 rounded-2xl border border-[#e4dfd5] bg-white px-4 py-3 lg:hidden">{filterPanel}</div>}

            {selectedRoutes.length > 0 && (
              <div className="mt-4">
                {selectedRoutes.length === 1 ? <RouteFacts route={selectedRoutes[0]} /> : <RouteCompareTable routes={selectedRoutes} />}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#5f655c]">
                {loading ? "Loading courses…" : `${filtered.length} ${filtered.length === 1 ? "course" : "courses"} at ${universityCount} ${universityCount === 1 ? "university" : "universities"}`}
              </p>
              {activeCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-xs font-bold" style={{ color: PRIMARY }}>
                  Clear filters
                </button>
              )}
            </div>
            {error && <p className="mt-3 rounded-xl bg-[#fbeae0] px-4 py-3 text-sm font-semibold text-[#7a3b24]">{error}</p>}

            <div className="mt-3 space-y-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/70" />)
                : filtered.map((course) => {
                    const saved = shortlisted.has(course.id)
                    const showFit = fitCourseId === course.id
                    const route = STUDY_ROUTE_BY_COUNTRY.get(course.university.country)
                    return (
                      <article key={course.id} className="rounded-2xl border border-[#e4dfd5] bg-white p-5 shadow-[0_1px_2px_rgba(27,35,30,0.04)] transition hover:border-[#d6cfc2] hover:shadow-[0_18px_40px_rgba(27,35,30,0.07)] sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-bold" style={{ color: PRIMARY }}>
                              {COUNTRY_FLAGS[course.university.country] ?? "🎓"} {course.university.name}
                              <span className="font-medium text-[#8a9086]"> · {course.university.city}, {course.university.country}</span>
                            </p>
                            <h3 className="mt-1 text-lg font-extrabold leading-snug tracking-tight sm:text-xl">{course.title}</h3>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-[#e8f1ed] px-3 py-1.5 font-bold text-[#285045]">{STUDY_LEVEL_LABELS[course.level]}</span>
                              {course.subject && <span className="rounded-full bg-[#f6f3ec] px-3 py-1.5 font-semibold text-[#3f463f]">{course.subject}</span>}
                              {course.duration && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f3ec] px-3 py-1.5 font-semibold text-[#3f463f]">
                                  <Clock3 className="h-3.5 w-3.5 text-[#8a9086]" /> {course.duration}
                                </span>
                              )}
                              {course.intake && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f3ec] px-3 py-1.5 font-semibold text-[#3f463f]">
                                  <CalendarDays className="h-3.5 w-3.5 text-[#8a9086]" /> {course.intake}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 sm:text-right">
                            <p className="text-lg font-extrabold">{formatTuition(course)}</p>
                            <p className="text-xs text-[#8a9086]">per year · international · indicative</p>
                            {course.feeNote && <p className="mt-1 max-w-[16rem] text-xs text-[#6b716a] sm:ml-auto">{course.feeNote}</p>}
                          </div>
                        </div>

                        {(course.entryRequirements || course.englishRequirement) && (
                          <div className="mt-4 grid gap-3 rounded-xl bg-[#faf8f3] p-3.5 text-[13px] leading-relaxed text-[#4a5047] sm:grid-cols-2">
                            {course.entryRequirements && <p><span className="font-bold text-[#1b231e]">Entry: </span>{course.entryRequirements}</p>}
                            {course.englishRequirement && <p><span className="font-bold text-[#1b231e]">English: </span>{course.englishRequirement}</p>}
                          </div>
                        )}

                        {route && (
                          <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-[#2c3530]">
                            <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PRIMARY }} />
                            <span><span className="font-bold">After you graduate:</span> {route.postStudyShort}, then {route.nextStep.charAt(0).toLowerCase() + route.nextStep.slice(1)}</span>
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#efe9dd] pt-4">
                          <button type="button" onClick={() => void runFitCheck(course)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e4dfd5] bg-white px-4 text-sm font-bold transition hover:border-[#2f5d50] hover:bg-[#f4f8f6]">
                            <FitIcon /> Check fit
                          </button>
                          <button type="button" onClick={() => void openStatement(course)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#f1d6c6] bg-[#fff5ef] px-4 text-sm font-bold text-[#7a3b24] transition hover:border-[#e0511f]">
                            <StatementIcon /> Personal statement
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleShortlist(course)}
                            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${saved ? "bg-[#2f5d50] text-white" : "border border-[#e4dfd5] bg-white hover:border-[#2f5d50]"}`}
                          >
                            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            {saved ? "In your hub" : "Shortlist"}
                          </button>
                          {course.courseUrl && (
                            <a href={course.courseUrl} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-[#4a5047] hover:underline">
                              University site <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>

                        {showFit && (
                          <div className="mt-4 rounded-xl border border-[#e4dfd5] bg-[#f6f3ec]/80 p-4">
                            {fitBusy ? (
                              <p className="flex items-center gap-2 text-sm text-[#6b716a]"><Loader2 className="h-4 w-4 animate-spin" /> Checking your fit…</p>
                            ) : fitResult ? (
                              <>
                                {!fitResult.hasCv && (
                                  <p className="mb-3 rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#7a3b24]">
                                    No CV found, so this is based on your profile only.{" "}
                                    <Link href="/workspace?view=cvs#cv-workspace" className="font-bold underline underline-offset-2">Upload a CV</Link> for a sharper check.
                                  </p>
                                )}
                                <FitSummary fit={fitResult.fit} />
                              </>
                            ) : (
                              <p className="text-sm text-[#7a3b24]">Could not check your fit. Try again.</p>
                            )}
                          </div>
                        )}
                      </article>
                    )
                  })}
              {!loading && filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#d8d2c6] bg-white/60 px-6 py-12 text-center">
                  <p className="font-extrabold">No courses match these filters</p>
                  <p className="mt-1 text-sm text-[#5f655c]">We&apos;re adding more universities — try removing a filter.</p>
                  <button type="button" onClick={clearFilters} className="mt-3 text-sm font-bold" style={{ color: PRIMARY }}>Clear filters</button>
                </div>
              )}
            </div>
            <p className="mt-6 text-xs text-[#8a9086]">
              Fees are indicative annual tuition for international students and change every year. The tuition filter converts fees to pounds approximately. Always confirm fees, entry requirements and deadlines on the university&apos;s website.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
