"use client"

import { useCallback, useEffect, useState } from "react"
import { DATA_SOURCES, SUBJECTS } from "@/lib/education/catalog"
import {
  STUDY_LEVEL_LABELS,
  STUDY_LEVELS,
  type CourseSearchResult,
  type CourseWithUniversity,
  type UniversitySearchResult,
  type UniversityWithCount,
} from "@/lib/education/types"

type Stats = { universities: number; courses: number; bySource: Array<{ source: string; universities: number; courses: number }> }

type CourseForm = {
  id?: string
  universityId: string
  universityName: string
  title: string
  level: string
  subject: string
  duration: string
  intake: string
  tuitionMin: string
  tuitionMax: string
  currency: string
  feeNote: string
  entryRequirements: string
  englishRequirement: string
  courseUrl: string
}

const EMPTY_COURSE: CourseForm = {
  universityId: "",
  universityName: "",
  title: "",
  level: "postgraduate",
  subject: "",
  duration: "",
  intake: "",
  tuitionMin: "",
  tuitionMax: "",
  currency: "GBP",
  feeNote: "",
  entryRequirements: "",
  englishRequirement: "",
  courseUrl: "",
}

const EMPTY_UNIVERSITY = { name: "", country: "", city: "", website: "", summary: "", studentSponsor: false }

const CURRENCY_BY_COUNTRY: Record<string, string> = { "United Kingdom": "GBP", Australia: "AUD", Canada: "CAD", Ireland: "EUR", Netherlands: "EUR", Germany: "EUR", "United States": "USD" }

const input =
  "h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e0511f]"
const label = "block text-[11px] font-semibold uppercase tracking-wide text-white/50"

const sourceLabel = (source: string) => (source === "manual" ? "Added by admins" : DATA_SOURCES[source]?.label ?? source)

function courseToForm(course: CourseWithUniversity): CourseForm {
  return {
    id: course.id,
    universityId: course.universityId,
    universityName: course.university.name,
    title: course.title,
    level: course.level,
    subject: course.subject,
    duration: course.duration ?? "",
    intake: course.intake ?? "",
    tuitionMin: course.tuitionMin?.toString() ?? "",
    tuitionMax: course.tuitionMax?.toString() ?? "",
    currency: course.currency,
    feeNote: course.feeNote ?? "",
    entryRequirements: course.entryRequirements ?? "",
    englishRequirement: course.englishRequirement ?? "",
    courseUrl: course.courseUrl ?? "",
  }
}

function Pager({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <div className="flex items-center gap-2 text-xs text-white/60">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-md border border-white/10 px-2 py-1 disabled:opacity-30">Prev</button>
      <span>Page {page} of {pages.toLocaleString()}</span>
      <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded-md border border-white/10 px-2 py-1 disabled:opacity-30">Next</button>
    </div>
  )
}

export function EducationAdmin() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [universities, setUniversities] = useState<UniversitySearchResult | null>(null)
  const [courses, setCourses] = useState<CourseSearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [uniForm, setUniForm] = useState(EMPTY_UNIVERSITY)
  const [courseForm, setCourseForm] = useState<CourseForm>(EMPTY_COURSE)
  const [uniQuery, setUniQuery] = useState("")
  const [uniPage, setUniPage] = useState(1)
  const [courseQuery, setCourseQuery] = useState("")
  const [coursePage, setCoursePage] = useState(1)
  const [filterUniversity, setFilterUniversity] = useState<{ id: string; name: string } | null>(null)
  const [search, setSearch] = useState({ uq: "", cq: "" })

  useEffect(() => {
    const timer = setTimeout(() => setSearch({ uq: uniQuery.trim(), cq: courseQuery.trim() }), 300)
    return () => clearTimeout(timer)
  }, [uniQuery, courseQuery])

  const load = useCallback(async () => {
    const params = new URLSearchParams({ upage: String(uniPage), cpage: String(coursePage) })
    if (search.uq) params.set("uq", search.uq)
    if (search.cq) params.set("cq", search.cq)
    if (filterUniversity) params.set("university", filterUniversity.id)
    try {
      const res = await fetch(`/api/admin/education?${params}`, { cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Could not load")
      setStats(data.stats)
      setUniversities(data.universities)
      setCourses(data.courses)
    } catch (error) {
      setNotice((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [uniPage, coursePage, search, filterUniversity])

  useEffect(() => {
    void load()
  }, [load])

  async function send(requestInit: { url: string; method: string; body?: Record<string, unknown> }, success: string) {
    setBusy(true)
    try {
      const res = await fetch(requestInit.url, {
        method: requestInit.method,
        headers: requestInit.body ? { "Content-Type": "application/json" } : undefined,
        body: requestInit.body ? JSON.stringify(requestInit.body) : undefined,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setNotice(data.error ?? "Something went wrong")
        return false
      }
      setNotice(success)
      await load()
      return true
    } finally {
      setBusy(false)
    }
  }

  async function remove(type: "university" | "course", id: string, name: string) {
    const warning = type === "university" ? `Delete ${name} and all of its courses?` : `Delete ${name}?`
    if (!window.confirm(warning)) return
    if (await send({ url: `/api/admin/education?type=${type}&id=${encodeURIComponent(id)}`, method: "DELETE" }, "Deleted")) {
      if (type === "course" && courseForm.id === id) setCourseForm(EMPTY_COURSE)
      if (type === "university" && filterUniversity?.id === id) setFilterUniversity(null)
    }
  }

  function pickUniversity(u: UniversityWithCount) {
    setFilterUniversity({ id: u.id, name: u.name })
    setCoursePage(1)
    setUniForm({ name: u.name, country: u.country, city: u.city, website: u.website ?? "", summary: u.summary ?? "", studentSponsor: u.studentSponsor })
    if (!courseForm.id) {
      setCourseForm((prev) => ({ ...prev, universityId: u.id, universityName: u.name, currency: CURRENCY_BY_COUNTRY[u.country] ?? prev.currency }))
    }
  }

  const setCourse = (key: keyof CourseForm) => (event: { target: { value: string } }) =>
    setCourseForm((prev) => ({ ...prev, [key]: event.target.value }))

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold">Education catalogue</h1>
        <p className="mt-1 text-sm text-white/50">
          {(stats?.universities ?? 0).toLocaleString()} institutions · {(stats?.courses ?? 0).toLocaleString()} courses. Fees are annual international tuition, shown to users as indicative.
        </p>
        {stats && stats.bySource.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.bySource.map((row) => (
              <span key={row.source} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {sourceLabel(row.source)}: {row.universities.toLocaleString()} institutions · {row.courses.toLocaleString()} courses
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-white/40">
          Official lists refresh with <code className="rounded bg-white/10 px-1">npm run education:import -- all</code>. Courses you edit here are kept as they are when the lists refresh.
        </p>
        {notice && <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80">{notice}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-semibold">Add or update a university</h2>
          <p className="text-xs text-white/40">Pick one from the list below to edit it. Saving an existing name and country updates that university.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className={label}>Name</span><input className={input} value={uniForm.name} onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })} /></label>
            <label><span className={label}>Country</span><input className={input} value={uniForm.country} onChange={(e) => setUniForm({ ...uniForm, country: e.target.value })} placeholder="United Kingdom" /></label>
            <label><span className={label}>City</span><input className={input} value={uniForm.city} onChange={(e) => setUniForm({ ...uniForm, city: e.target.value })} /></label>
            <label className="sm:col-span-2"><span className={label}>Website</span><input className={input} value={uniForm.website} onChange={(e) => setUniForm({ ...uniForm, website: e.target.value })} placeholder="https://" /></label>
            <label className="sm:col-span-2"><span className={label}>Summary</span><textarea className={`${input} h-20 py-2`} value={uniForm.summary} onChange={(e) => setUniForm({ ...uniForm, summary: e.target.value })} /></label>
            <label className="flex items-center gap-2 text-sm text-white/80 sm:col-span-2">
              <input type="checkbox" checked={uniForm.studentSponsor} onChange={(e) => setUniForm({ ...uniForm, studentSponsor: e.target.checked })} className="h-4 w-4 accent-[#e0511f]" />
              Licensed to sponsor student visas
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || !uniForm.name.trim() || !uniForm.country.trim()}
              onClick={async () => {
                if (await send({ url: "/api/admin/education", method: "POST", body: { type: "university", ...uniForm } }, `Saved ${uniForm.name}`)) setUniForm(EMPTY_UNIVERSITY)
              }}
              className="rounded-lg bg-[#e0511f] px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Save university
            </button>
            {uniForm.name && (
              <button type="button" onClick={() => setUniForm(EMPTY_UNIVERSITY)} className="text-xs text-white/60 hover:text-white">Clear</button>
            )}
          </div>

          <div className="space-y-2 border-t border-white/10 pt-3">
            <div className="flex items-center justify-between gap-2">
              <input className={input} value={uniQuery} onChange={(e) => { setUniQuery(e.target.value); setUniPage(1) }} placeholder={`Search ${(stats?.universities ?? 0).toLocaleString()} institutions`} />
            </div>
            <div className="max-h-96 space-y-1 overflow-y-auto">
              {(universities?.universities ?? []).map((u) => (
                <div key={u.id} className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5 ${filterUniversity?.id === u.id ? "bg-white/10" : ""}`}>
                  <button type="button" onClick={() => pickUniversity(u)} className="min-w-0 truncate text-left">
                    {u.name} <span className="text-white/40">· {u.country} · {u.courseCount} courses{u.studentSponsor ? " · sponsor" : ""}</span>
                  </button>
                  <button type="button" onClick={() => void remove("university", u.id, u.name)} className="shrink-0 text-xs text-rose-300 hover:underline">
                    Delete
                  </button>
                </div>
              ))}
            </div>
            {universities && <Pager page={universities.page} pageSize={universities.pageSize} total={universities.total} onPage={setUniPage} />}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{courseForm.id ? "Edit course" : "Add a course"}</h2>
            {courseForm.id && (
              <button type="button" onClick={() => setCourseForm(EMPTY_COURSE)} className="text-xs text-white/60 hover:text-white">
                Cancel edit
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <span className={label}>University</span>
              <p className={`${input} flex items-center ${courseForm.universityId ? "" : "text-white/30"}`}>
                {courseForm.universityName || "Pick a university from the list on the left"}
              </p>
            </div>
            <label className="sm:col-span-2"><span className={label}>Course title</span><input className={input} value={courseForm.title} onChange={setCourse("title")} placeholder="MSc Data Science" /></label>
            <label>
              <span className={label}>Level</span>
              <select className={input} value={courseForm.level} onChange={setCourse("level")}>
                {STUDY_LEVELS.map((l) => <option key={l} value={l}>{STUDY_LEVEL_LABELS[l]}</option>)}
              </select>
            </label>
            <label>
              <span className={label}>Subject</span>
              <input className={input} value={courseForm.subject} onChange={setCourse("subject")} list="education-subjects" placeholder="Computing & data" />
              <datalist id="education-subjects">{SUBJECTS.map((s) => <option key={s} value={s} />)}</datalist>
            </label>
            <label><span className={label}>Duration</span><input className={input} value={courseForm.duration} onChange={setCourse("duration")} placeholder="1 year full-time" /></label>
            <label><span className={label}>Intake</span><input className={input} value={courseForm.intake} onChange={setCourse("intake")} placeholder="September" /></label>
            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <label><span className={label}>Fee from</span><input className={input} inputMode="numeric" value={courseForm.tuitionMin} onChange={setCourse("tuitionMin")} /></label>
              <label><span className={label}>Fee to</span><input className={input} inputMode="numeric" value={courseForm.tuitionMax} onChange={setCourse("tuitionMax")} /></label>
              <label><span className={label}>Currency</span><input className={input} value={courseForm.currency} onChange={setCourse("currency")} maxLength={3} /></label>
            </div>
            <label className="sm:col-span-2"><span className={label}>Fee note</span><input className={input} value={courseForm.feeNote} onChange={setCourse("feeNote")} placeholder="2026/27 international fee" /></label>
            <label className="sm:col-span-2"><span className={label}>Entry requirements</span><textarea className={`${input} h-16 py-2`} value={courseForm.entryRequirements} onChange={setCourse("entryRequirements")} /></label>
            <label className="sm:col-span-2"><span className={label}>English requirement</span><input className={input} value={courseForm.englishRequirement} onChange={setCourse("englishRequirement")} placeholder="IELTS 6.5 overall" /></label>
            <label className="sm:col-span-2"><span className={label}>Course URL</span><input className={input} value={courseForm.courseUrl} onChange={setCourse("courseUrl")} placeholder="https://" /></label>
          </div>
          <button
            type="button"
            disabled={busy || !courseForm.universityId || !courseForm.title.trim()}
            onClick={async () => {
              const { universityName: _name, ...body } = courseForm
              void _name
              if (await send({ url: "/api/admin/education", method: "POST", body: { type: "course", ...body } }, courseForm.id ? "Course updated" : "Course added")) {
                setCourseForm({ ...EMPTY_COURSE, universityId: courseForm.universityId, universityName: courseForm.universityName, currency: courseForm.currency })
              }
            }}
            className="rounded-lg bg-[#e0511f] px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            {courseForm.id ? "Save changes" : "Add course"}
          </button>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">
            Courses ({(courses?.total ?? 0).toLocaleString()})
            {filterUniversity && (
              <button type="button" onClick={() => { setFilterUniversity(null); setCoursePage(1) }} className="ml-2 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-normal text-white/80 hover:bg-white/20">
                {filterUniversity.name} ✕
              </button>
            )}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <input className={`${input} w-72`} value={courseQuery} onChange={(e) => { setCourseQuery(e.target.value); setCoursePage(1) }} placeholder="Search courses, universities or cities" />
            {courses && <Pager page={courses.page} pageSize={courses.pageSize} total={courses.total} onPage={setCoursePage} />}
          </div>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-white/50">Loading…</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-white/40">
                <tr>
                  <th className="py-2 pr-3">Course</th>
                  <th className="py-2 pr-3">University</th>
                  <th className="py-2 pr-3">Level</th>
                  <th className="py-2 pr-3">Fees</th>
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {(courses?.courses ?? []).map((c) => (
                  <tr key={c.id} className="border-t border-white/5">
                    <td className="py-2 pr-3 font-medium">{c.title}</td>
                    <td className="py-2 pr-3 text-white/60">{c.university.name}</td>
                    <td className="py-2 pr-3 text-white/60">{STUDY_LEVEL_LABELS[c.level]}</td>
                    <td className="py-2 pr-3 text-white/60">
                      {c.tuitionMin == null && c.tuitionMax == null ? "–" : `${c.tuitionMin ?? ""}${c.tuitionMax != null && c.tuitionMax !== c.tuitionMin ? `–${c.tuitionMax}` : ""} ${c.currency}`}
                    </td>
                    <td className="py-2 pr-3 text-xs text-white/40">{sourceLabel(c.source)}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setCourseForm(courseToForm(c))
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }}
                        className="mr-3 text-xs text-white/70 hover:text-white"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => void remove("course", c.id, c.title)} className="text-xs text-rose-300 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
