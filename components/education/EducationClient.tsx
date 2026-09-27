"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Bookmark, BookmarkCheck, CalendarDays, Clock3, ExternalLink, Loader2, Search, X } from "lucide-react"
import { STUDY_ROUTES } from "@/lib/education/study-routes"
import {
  STUDY_LEVEL_LABELS,
  STUDY_LEVELS,
  type CourseFit,
  type CourseWithUniversity,
  type EducationApplication,
} from "@/lib/education/types"
import { ApplicationHub } from "./ApplicationHub"
import { COUNTRY_FLAGS, FitIcon, FitSummary, INK, PRIMARY, StatementIcon, formatTuition } from "./shared"

type Tab = "explore" | "hub"

export function EducationClient({ signedIn }: { signedIn: boolean }) {
  const [tab, setTab] = useState<Tab>("explore")
  const [courses, setCourses] = useState<CourseWithUniversity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [country, setCountry] = useState("")
  const [level, setLevel] = useState("")
  const [subject, setSubject] = useState("")
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

  const countries = useMemo(() => [...new Set(courses.map((c) => c.university.country))].sort(), [courses])
  const subjects = useMemo(() => [...new Set(courses.map((c) => c.subject).filter(Boolean))].sort(), [courses])
  const shortlisted = useMemo(() => new Set(applications.map((a) => a.courseId)), [applications])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter(
      (c) =>
        (!country || c.university.country === country) &&
        (!level || c.level === level) &&
        (!subject || c.subject === subject) &&
        (!q || `${c.title} ${c.university.name} ${c.university.city} ${c.subject}`.toLowerCase().includes(q)),
    )
  }, [courses, country, level, query, subject])

  const universityCount = useMemo(() => new Set(filtered.map((c) => c.universityId)).size, [filtered])

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

  const clearFilters = () => {
    setQuery("")
    setCountry("")
    setLevel("")
    setSubject("")
  }

  return (
    <div style={{ color: INK }}>
        <div className="inline-flex rounded-full bg-white p-1 shadow-sm">
          {([
            ["explore", "Explore courses"],
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
          <>
            <section className="mt-8">
              <h2 className="text-lg font-extrabold tracking-tight">Study routes by destination</h2>
              <p className="mt-1 text-sm text-[#5f655c]">Pick a country to filter courses. Each route shows how you can stay and work after graduating.</p>
              <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
                {STUDY_ROUTES.map((route) => {
                  const active = country === route.country
                  return (
                    <div
                      key={route.country}
                      className={`w-64 shrink-0 snap-start rounded-2xl border bg-white p-4 transition ${active ? "border-[#2f5d50] ring-2 ring-[#2f5d50]/15" : "border-[#e4dfd5]"}`}
                    >
                      <button type="button" onClick={() => setCountry(active ? "" : route.country)} className="w-full text-left">
                        <span className="flex items-center gap-2">
                          <span className="text-2xl" aria-hidden>{route.flag}</span>
                          <span className="font-extrabold">{route.country}</span>
                        </span>
                        <span className="mt-2 block text-xs font-bold text-[#2f5d50]">{route.visa}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-[#5f655c]">{route.afterStudy}</span>
                      </button>
                      <a href={route.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#4a5047] hover:underline">
                        Official guidance <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )
                })}
              </div>
            </section>

            <div className="sticky top-14 z-10 -mx-4 mt-6 bg-[#efece4]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex flex-col gap-2 lg:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa094]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search courses, universities or cities"
                    className="h-11 w-full rounded-xl border border-[#e4dfd5] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#e0511f]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 lg:flex">
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm font-semibold">
                    <option value="">All countries</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className="h-11 rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm font-semibold">
                    <option value="">All levels</option>
                    {STUDY_LEVELS.map((l) => <option key={l} value={l}>{STUDY_LEVEL_LABELS[l]}</option>)}
                  </select>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm font-semibold">
                    <option value="">All subjects</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#5f655c]">
                {loading ? "Loading courses…" : `${filtered.length} courses at ${universityCount} universities`}
              </p>
              {(query || country || level || subject) && (
                <button type="button" onClick={clearFilters} className="text-xs font-bold" style={{ color: PRIMARY }}>
                  Clear filters
                </button>
              )}
            </div>
            {error && <p className="mt-3 rounded-xl bg-[#fbeae0] px-4 py-3 text-sm font-semibold text-[#7a3b24]">{error}</p>}

            <div className="mt-4 space-y-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/70" />)
                : filtered.map((course) => {
                    const saved = shortlisted.has(course.id)
                    const showFit = fitCourseId === course.id
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
                  <button type="button" onClick={clearFilters} className="mt-3 text-sm font-bold" style={{ color: PRIMARY }}>Clear filters</button>
                </div>
              )}
            </div>
            <p className="mt-6 text-xs text-[#8a9086]">
              Fees are indicative annual tuition for international students and change every year. Always confirm fees, entry requirements and deadlines on the university&apos;s website.
            </p>
          </>
        )}
    </div>
  )
}
