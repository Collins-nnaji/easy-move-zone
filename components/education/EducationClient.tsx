"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BadgeCheck, Bookmark, BookmarkCheck, BriefcaseBusiness, Building2, CalendarDays, ChevronDown, Clock3, ExternalLink, GraduationCap, Loader2, Search, SlidersHorizontal, X } from "lucide-react"
import { BUDGET_BANDS, DURATION_BANDS, MONTHS } from "@/lib/education/catalog"
import { STUDY_ROUTE_BY_COUNTRY, STUDY_ROUTES } from "@/lib/education/study-routes"
import {
  COURSE_FACETS,
  STUDY_LEVEL_LABELS,
  STUDY_LEVELS,
  type CourseFacet,
  type CourseFit,
  type CourseSearchResult,
  type CourseSort,
  type CourseWithUniversity,
  type EducationApplication,
} from "@/lib/education/types"
import { ApplicationHub } from "./ApplicationHub"
import { InstitutionDirectory } from "./InstitutionDirectory"
import { COUNTRY_FLAGS, DataSourcesNote, FitIcon, FitSummary, INK, PRIMARY, StatementIcon, displayName, formatTuition } from "./shared"
import { RouteCompareTable, RouteFacts } from "./StudyRouteInfo"

type Tab = "explore" | "institutions" | "hub"
type Filters = Record<CourseFacet, string[]>
type Facets = NonNullable<CourseSearchResult["facets"]>

const EMPTY_FILTERS: Filters = { country: [], level: [], subject: [], intake: [], duration: [], budget: [] }
const EMPTY_FACETS: Facets = { country: {}, level: {}, subject: {}, intake: {}, duration: {}, budget: {}, sponsor: 0 }
const COURSELESS_COUNTRIES = new Set(["Canada"])

function searchParams(filters: Filters, query: string, sort: CourseSort, sponsorOnly: boolean, universityId: string | null, page: number) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (universityId) params.set("university", universityId)
  for (const key of COURSE_FACETS) if (filters[key].length) params.set(key, filters[key].join("|"))
  if (sponsorOnly) params.set("sponsor", "1")
  if (sort !== "recommended") params.set("sort", sort)
  if (page > 1) {
    params.set("page", String(page))
    params.set("facets", "0")
  }
  return params.toString()
}

const COLLAPSED_OPTIONS = 6
const COLLAPSE_AFTER = 8

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
  const [expanded, setExpanded] = useState(false)
  const visible = options.filter((option) => counts[option] || selected.includes(option))
  const collapsible = visible.length > COLLAPSE_AFTER
  const shown = expanded || !collapsible ? visible : visible.slice(0, COLLAPSED_OPTIONS)
  return (
    <section className="border-b border-[#ece7dd] py-4 last:border-0">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5047]">
          {label}
          {selected.length > 0 && <span className="rounded-full bg-[#fbeae0] px-2 py-0.5 text-[10px] normal-case tracking-normal text-[#7a3b24]">{selected.length}</span>}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9aa094] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-0.5">
          {visible.length === 0 ? <p className="px-2 py-1.5 text-xs text-[#7c827a]">{loading ? "Loading…" : "No options for these filters."}</p> : shown.map((option) => {
            const checked = selected.includes(option)
            return (
              <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition ${checked ? "bg-[#fff3ec]" : "hover:bg-[#f6f3ec]"}`}>
                <input type="checkbox" checked={checked} onChange={() => onToggle(option)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#e0511f]" />
                <span className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-[#1b231e]">{format(option)}</span>
                <span className="shrink-0 pt-px text-xs tabular-nums text-[#9aa094]">{(counts[option] ?? 0).toLocaleString()}</span>
              </label>
            )
          })}
          {collapsible && (
            <button type="button" onClick={() => setExpanded(!expanded)} className="px-2 pt-1.5 text-xs font-bold" style={{ color: PRIMARY }}>
              {expanded ? "Show fewer" : `Show all ${visible.length}`}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export function EducationClient({ signedIn }: { signedIn: boolean }) {
  const [tab, setTab] = useState<Tab>("explore")
  const [courses, setCourses] = useState<CourseWithUniversity[]>([])
  const [total, setTotal] = useState(0)
  const [universityCount, setUniversityCount] = useState(0)
  const [facets, setFacets] = useState<Facets>(EMPTY_FACETS)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sponsorOnly, setSponsorOnly] = useState(false)
  const [sort, setSort] = useState<CourseSort>("recommended")
  const [institutionCountry, setInstitutionCountry] = useState<string[]>([])
  const [university, setUniversity] = useState<{ id: string; name: string } | null>(null)
  const requestId = useRef(0)
  const [mobileFilters, setMobileFilters] = useState(false)
  const [applications, setApplications] = useState<EducationApplication[]>([])
  const [focusCourseId, setFocusCourseId] = useState<string | null>(null)
  const [fitCourseId, setFitCourseId] = useState<string | null>(null)
  const [fitBusy, setFitBusy] = useState(false)
  const [fitResult, setFitResult] = useState<{ fit: CourseFit; hasCv: boolean } | null>(null)
  const [authPrompt, setAuthPrompt] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    void fetch(`/api/education/courses?${searchParams(filters, debouncedQuery, sort, sponsorOnly, university?.id ?? null, 1)}`, { cache: "no-store" })
      .then((res) => res.json() as Promise<CourseSearchResult & { error?: string }>)
      .then((data) => {
        if (id !== requestId.current) return
        setCourses(data.courses ?? [])
        setTotal(data.total ?? 0)
        setUniversityCount(data.universityCount ?? 0)
        setFacets(data.facets ?? EMPTY_FACETS)
        setPage(1)
        if (data.error) setError(data.error)
      })
      .catch(() => id === requestId.current && setError("Could not load courses."))
      .finally(() => id === requestId.current && setLoading(false))
  }, [filters, debouncedQuery, sort, sponsorOnly, university])

  async function loadMore() {
    const id = requestId.current
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/education/courses?${searchParams(filters, debouncedQuery, sort, sponsorOnly, university?.id ?? null, page + 1)}`, { cache: "no-store" })
      const data = (await res.json()) as CourseSearchResult
      if (id !== requestId.current) return
      setCourses((current) => [...current, ...(data.courses ?? []).filter((course) => !current.some((c) => c.id === course.id))])
      setPage(page + 1)
    } finally {
      setLoadingMore(false)
    }
  }

  const refreshApplications = useCallback(async () => {
    if (!signedIn) return
    const res = await fetch("/api/education/applications", { cache: "no-store" })
    if (res.ok) setApplications((await res.json()).applications ?? [])
  }, [signedIn])

  useEffect(() => {
    void refreshApplications()
  }, [refreshApplications])

  useEffect(() => {
    if (!mobileFilters) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileFilters])

  const shortlisted = useMemo(() => new Set(applications.map((a) => a.courseId)), [applications])

  const options = useMemo(() => ({
    country: [...new Set([...STUDY_ROUTES.map((route) => route.country), ...Object.keys(facets.country)])].sort((a, b) => (facets.country[b] ?? 0) - (facets.country[a] ?? 0)),
    level: [...STUDY_LEVELS],
    subject: [...new Set([...Object.keys(facets.subject), ...filters.subject])].sort(),
    intake: MONTHS,
    duration: [...DURATION_BANDS],
    budget: [...BUDGET_BANDS],
  }), [facets, filters.subject])

  const activeCount = Object.values(filters).reduce((sum, values) => sum + values.length, 0) + (query.trim() ? 1 : 0) + (sponsorOnly ? 1 : 0) + (university ? 1 : 0)
  const selectedRoutes = filters.country.map((country) => STUDY_ROUTE_BY_COUNTRY.get(country)).filter((route) => route !== undefined)
  const courselessSelected = filters.country.filter((country) => COURSELESS_COUNTRIES.has(country))

  const toggle = (key: CourseFacet, value: string) =>
    setFilters((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }))

  const clearFilters = () => {
    setQuery("")
    setFilters(EMPTY_FILTERS)
    setSponsorOnly(false)
    setUniversity(null)
  }

  const browseInstitutions = (countries: string[]) => {
    setInstitutionCountry(countries)
    setTab("institutions")
    window.scrollTo({ top: 0, behavior: "smooth" })
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

  const levelLabel = (value: string) => STUDY_LEVEL_LABELS[value as keyof typeof STUDY_LEVEL_LABELS] ?? value
  const activeChips = [
    ...(university ? [{ id: "university", label: university.name, remove: () => setUniversity(null) }] : []),
    ...(sponsorOnly ? [{ id: "sponsor", label: "Licensed for student visas", remove: () => setSponsorOnly(false) }] : []),
    ...COURSE_FACETS.flatMap((key) =>
      filters[key].map((value) => ({
        id: `${key}:${value}`,
        label: key === "country" ? `${COUNTRY_FLAGS[value] ?? "🎓"} ${value}` : key === "level" ? levelLabel(value) : value,
        remove: () => toggle(key, value),
      })),
    ),
  ]

  const filterPanel = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold">Filters</p>
        {activeCount > 0 && <button type="button" onClick={clearFilters} className="text-xs font-bold" style={{ color: PRIMARY }}>Clear all</button>}
      </div>
      <label className={`mt-3 flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition ${sponsorOnly ? "border-[#2f5d50] bg-[#e4f0ea]" : "border-transparent bg-[#eef5f1]"}`}>
        <input type="checkbox" checked={sponsorOnly} onChange={() => setSponsorOnly(!sponsorOnly)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#2f5d50]" />
        <span className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-[#1b231e]">
          <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 shrink-0 text-[#2f5d50]" /> Licensed for student visas</span>
          <span className="mt-0.5 block text-xs font-medium text-[#5f655c]">{facets.sponsor.toLocaleString()} courses at registered sponsors</span>
        </span>
      </label>
      <FilterGroup loading={loading} label="Destination" options={options.country} selected={filters.country} counts={facets.country} onToggle={(value) => toggle("country", value)} format={(value) => `${COUNTRY_FLAGS[value] ?? "🎓"} ${value}`} />
      <FilterGroup loading={loading} label="Level" options={options.level} selected={filters.level} counts={facets.level} onToggle={(value) => toggle("level", value)} format={levelLabel} />
      <FilterGroup loading={loading} label="Subject" options={options.subject} selected={filters.subject} counts={facets.subject} onToggle={(value) => toggle("subject", value)} />
      <FilterGroup loading={loading} label="Tuition per year (approx.)" options={options.budget} selected={filters.budget} counts={facets.budget} onToggle={(value) => toggle("budget", value)} />
      <FilterGroup loading={loading} label="Course length" options={options.duration} selected={filters.duration} counts={facets.duration} onToggle={(value) => toggle("duration", value)} />
      <FilterGroup loading={loading} label="Start month" options={options.intake} selected={filters.intake} counts={facets.intake} onToggle={(value) => toggle("intake", value)} defaultOpen={false} />
    </>
  )

  return (
    <div style={{ color: INK }}>
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <div role="tablist" className="inline-flex gap-1 rounded-full bg-white p-1 shadow-sm">
          {([
            ["explore", "Find a course", "Courses", GraduationCap],
            ["institutions", "Universities & colleges", "Institutions", Building2],
            ["hub", "Application hub", "My hub", Bookmark],
          ] as const).map(([id, label, short, Icon]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold transition sm:px-4 ${tab === id ? "bg-[#1b231e] text-white" : "text-[#4a5047] hover:text-[#1b231e]"}`}
            >
              <Icon className="h-4 w-4" />
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
              {id === "hub" && applications.length > 0 && (
                <span className={`rounded-full px-1.5 text-[11px] ${tab === id ? "bg-white/20" : "bg-[#fbeae0] text-[#7a3b24]"}`}>{applications.length}</span>
              )}
            </button>
          ))}
        </div>
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
      ) : tab === "institutions" ? (
        <InstitutionDirectory
          key={institutionCountry.join("|")}
          initialCountries={institutionCountry}
          onFindCourses={(picked) => {
            setQuery("")
            setFilters(EMPTY_FILTERS)
            setUniversity({ id: picked.id, name: displayName(picked.name) })
            setTab("explore")
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        />
      ) : (
        <div className="mt-6 lg:grid lg:grid-cols-[296px_minmax(0,1fr)] lg:gap-7">
          <aside className="hidden self-start rounded-2xl border border-[#e4dfd5] bg-white px-5 py-4 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
            {filterPanel}
          </aside>

          <div className="min-w-0">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa094]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search courses, universities or cities"
                  className="h-11 w-full rounded-xl border border-[#e4dfd5] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#e0511f]"
                />
              </div>
              <div className="flex gap-2">
                <select value={sort} onChange={(event) => setSort(event.target.value as CourseSort)} aria-label="Sort courses" className="h-11 min-w-0 flex-1 rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm font-semibold sm:flex-none">
                  <option value="recommended">Recommended</option>
                  <option value="fees">Lowest fees</option>
                  <option value="duration">Shortest course</option>
                </select>
                <button type="button" onClick={() => setMobileFilters(true)} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#e4dfd5] bg-white px-4 text-sm font-bold lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {activeCount > 0 && <span className="rounded-full bg-[#e0511f] px-1.5 text-[10px] text-white">{activeCount}</span>}
                </button>
              </div>
            </div>

            {mobileFilters && (
              <div className="fixed inset-0 z-50 flex flex-col bg-[#f6f3ec] lg:hidden" role="dialog" aria-modal="true" aria-label="Course filters">
                <div className="flex items-center justify-between border-b border-[#e4dfd5] bg-white px-4 py-3">
                  <p className="text-base font-extrabold">Filter courses</p>
                  <button type="button" onClick={() => setMobileFilters(false)} className="rounded-full p-2 hover:bg-[#f6f3ec]" aria-label="Close filters">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-white px-4 py-4">{filterPanel}</div>
                <div className="border-t border-[#e4dfd5] bg-white p-4">
                  <button type="button" onClick={() => setMobileFilters(false)} className="h-12 w-full rounded-xl bg-[#1b231e] text-sm font-extrabold text-white">
                    {loading ? "Updating…" : `Show ${total.toLocaleString()} ${total === 1 ? "course" : "courses"}`}
                  </button>
                </div>
              </div>
            )}

            {activeChips.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <span key={chip.id} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#e4dfd5] bg-white py-1 pl-3 pr-1 text-xs font-bold text-[#1b231e]">
                    <span className="truncate">{chip.label}</span>
                    <button type="button" onClick={chip.remove} className="rounded-full p-1 text-[#8a9086] hover:bg-[#f6f3ec] hover:text-[#1b231e]" aria-label={`Remove ${chip.label}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {activeChips.length > 1 && (
                  <button type="button" onClick={clearFilters} className="px-1 text-xs font-bold" style={{ color: PRIMARY }}>Clear all</button>
                )}
              </div>
            )}

            {selectedRoutes.length > 0 && (
              <div className="mt-4">
                {selectedRoutes.length === 1 ? <RouteFacts route={selectedRoutes[0]} /> : <RouteCompareTable routes={selectedRoutes} />}
              </div>
            )}

            {courselessSelected.length > 0 && (
              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#d9e6df] bg-[#f4f8f6] p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] leading-relaxed text-[#2c3530]">
                  <span className="font-bold">{courselessSelected.join(" and ")} doesn&apos;t publish a national course list.</span> Browse every designated learning institution instead, then check courses on each school&apos;s site.
                </p>
                <button type="button" onClick={() => browseInstitutions(courselessSelected)} className="shrink-0 rounded-xl bg-[#2f5d50] px-4 py-2 text-xs font-extrabold text-white">
                  Browse institutions
                </button>
              </div>
            )}

            <p className="mt-5 text-sm font-medium text-[#5f655c]">
              {loading ? "Loading courses…" : (
                <><span className="font-extrabold text-[#1b231e]">{total.toLocaleString()}</span> {total === 1 ? "course" : "courses"} at {universityCount.toLocaleString()} {universityCount === 1 ? "university" : "universities"}</>
              )}
            </p>
            {error && <p className="mt-3 rounded-xl bg-[#fbeae0] px-4 py-3 text-sm font-semibold text-[#7a3b24]">{error}</p>}

            <div className="mt-3 space-y-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/70" />)
                : courses.map((course) => {
                    const saved = shortlisted.has(course.id)
                    const showFit = fitCourseId === course.id
                    const route = STUDY_ROUTE_BY_COUNTRY.get(course.university.country)
                    const hasFee = course.tuitionMin != null || course.tuitionMax != null
                    const siteUrl = course.courseUrl ?? course.university.website
                    return (
                      <article key={course.id} className="rounded-2xl border border-[#e4dfd5] bg-white p-5 shadow-[0_1px_2px_rgba(27,35,30,0.04)] transition hover:border-[#d6cfc2] hover:shadow-[0_18px_40px_rgba(27,35,30,0.07)] sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-bold" style={{ color: PRIMARY }}>
                              {COUNTRY_FLAGS[course.university.country] ?? "🎓"} {displayName(course.university.name)}
                              <span className="font-medium text-[#8a9086]"> · {[course.university.city, course.university.country].filter(Boolean).join(", ")}</span>
                            </p>
                            <h3 className="mt-1 text-lg font-extrabold leading-snug tracking-tight sm:text-xl">{course.title}</h3>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              {course.university.studentSponsor && (
                                <span title={course.university.sponsorNote ?? undefined} className="inline-flex items-center gap-1.5 rounded-full bg-[#2f5d50] px-3 py-1.5 font-bold text-white">
                                  <BadgeCheck className="h-3.5 w-3.5" /> Student visa sponsor
                                </span>
                              )}
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
                            <p className={hasFee ? "text-lg font-extrabold" : "text-base font-bold text-[#5f655c]"}>{formatTuition(course)}</p>
                            {hasFee && <p className="text-xs text-[#8a9086]">per year · international · indicative</p>}
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
                          {siteUrl && (
                            <a href={siteUrl} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-[#4a5047] hover:underline">
                              {course.courseUrl ? "Course page" : "University site"} <ExternalLink className="h-3.5 w-3.5" />
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
              {!loading && courses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#d8d2c6] bg-white/60 px-6 py-12 text-center">
                  <p className="font-extrabold">No courses match these filters</p>
                  <p className="mt-1 text-sm text-[#5f655c]">Try a broader search or remove a filter.</p>
                  <button type="button" onClick={clearFilters} className="mt-3 text-sm font-bold" style={{ color: PRIMARY }}>Clear filters</button>
                </div>
              )}
              {!loading && courses.length < total && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => void loadMore()}
                    disabled={loadingMore}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e4dfd5] bg-white px-6 text-sm font-bold transition hover:border-[#2f5d50] disabled:opacity-60"
                  >
                    {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />} Show more courses
                  </button>
                  <p className="text-xs text-[#8a9086]">Showing {courses.length.toLocaleString()} of {total.toLocaleString()}</p>
                </div>
              )}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-[#8a9086]">
              Fees are indicative annual tuition for international students and change every year. The tuition filter converts fees to pounds approximately. Where a national dataset doesn&apos;t publish international fees, the course shows &ldquo;Fees on request&rdquo;. Always confirm fees, entry requirements and deadlines on the university&apos;s website.
            </p>
            <DataSourcesNote />
          </div>
        </div>
      )}
    </div>
  )
}