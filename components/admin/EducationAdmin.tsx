"use client"

import { useEffect, useMemo, useState } from "react"
import { STUDY_LEVEL_LABELS, STUDY_LEVELS, type CourseWithUniversity, type University } from "@/lib/education/types"

type AdminUniversity = University & { courseCount: number }

type CourseForm = {
  id?: string
  universityId: string
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

const EMPTY_UNIVERSITY = { name: "", country: "", city: "", website: "", summary: "" }

const input =
  "h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e0511f]"
const label = "block text-[11px] font-semibold uppercase tracking-wide text-white/50"

function courseToForm(course: CourseWithUniversity): CourseForm {
  return {
    id: course.id,
    universityId: course.universityId,
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

export function EducationAdmin() {
  const [universities, setUniversities] = useState<AdminUniversity[]>([])
  const [courses, setCourses] = useState<CourseWithUniversity[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [uniForm, setUniForm] = useState(EMPTY_UNIVERSITY)
  const [courseForm, setCourseForm] = useState<CourseForm>(EMPTY_COURSE)
  const [filterUniversity, setFilterUniversity] = useState("")

  async function apply(res: Response, success: string) {
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setNotice(data.error ?? "Something went wrong")
      return false
    }
    setUniversities(data.universities ?? [])
    setCourses(data.courses ?? [])
    setNotice(success)
    return true
  }

  useEffect(() => {
    void fetch("/api/admin/education", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error ?? "Could not load")
        setUniversities(data.universities ?? [])
        setCourses(data.courses ?? [])
      })
      .catch((error: Error) => setNotice(error.message))
      .finally(() => setLoading(false))
  }, [])

  async function post(body: Record<string, unknown>, success: string) {
    setBusy(true)
    try {
      return await apply(
        await fetch("/api/admin/education", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        success,
      )
    } finally {
      setBusy(false)
    }
  }

  async function remove(type: "university" | "course", id: string, name: string) {
    const warning = type === "university" ? `Delete ${name} and all of its courses?` : `Delete ${name}?`
    if (!window.confirm(warning)) return
    setBusy(true)
    try {
      await apply(await fetch(`/api/admin/education?type=${type}&id=${encodeURIComponent(id)}`, { method: "DELETE" }), "Deleted")
      if (type === "course" && courseForm.id === id) setCourseForm(EMPTY_COURSE)
    } finally {
      setBusy(false)
    }
  }

  const visibleCourses = useMemo(
    () => (filterUniversity ? courses.filter((c) => c.universityId === filterUniversity) : courses),
    [courses, filterUniversity],
  )

  const setCourse = (key: keyof CourseForm) => (event: { target: { value: string } }) =>
    setCourseForm((prev) => ({ ...prev, [key]: event.target.value }))

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold">Education catalogue</h1>
        <p className="mt-1 text-sm text-white/50">
          {universities.length} universities · {courses.length} courses. Fees are annual international tuition, shown to users as indicative.
        </p>
        {notice && <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80">{notice}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-semibold">Add or update a university</h2>
          <p className="text-xs text-white/40">Saving an existing name and country updates that university.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className={label}>Name</span><input className={input} value={uniForm.name} onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })} /></label>
            <label><span className={label}>Country</span><input className={input} value={uniForm.country} onChange={(e) => setUniForm({ ...uniForm, country: e.target.value })} placeholder="United Kingdom" /></label>
            <label><span className={label}>City</span><input className={input} value={uniForm.city} onChange={(e) => setUniForm({ ...uniForm, city: e.target.value })} /></label>
            <label className="sm:col-span-2"><span className={label}>Website</span><input className={input} value={uniForm.website} onChange={(e) => setUniForm({ ...uniForm, website: e.target.value })} placeholder="https://" /></label>
            <label className="sm:col-span-2"><span className={label}>Summary</span><textarea className={`${input} h-20 py-2`} value={uniForm.summary} onChange={(e) => setUniForm({ ...uniForm, summary: e.target.value })} /></label>
          </div>
          <button
            type="button"
            disabled={busy || !uniForm.name.trim() || !uniForm.country.trim()}
            onClick={async () => {
              if (await post({ type: "university", ...uniForm }, `Saved ${uniForm.name}`)) setUniForm(EMPTY_UNIVERSITY)
            }}
            className="rounded-lg bg-[#e0511f] px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Save university
          </button>

          <div className="mt-4 max-h-80 space-y-1 overflow-y-auto border-t border-white/10 pt-3">
            {universities.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5">
                <button type="button" onClick={() => setFilterUniversity(u.id)} className="min-w-0 truncate text-left">
                  {u.name} <span className="text-white/40">· {u.country} · {u.courseCount} courses</span>
                </button>
                <button type="button" onClick={() => void remove("university", u.id, u.name)} className="shrink-0 text-xs text-rose-300 hover:underline">
                  Delete
                </button>
              </div>
            ))}
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
            <label className="sm:col-span-2">
              <span className={label}>University</span>
              <select className={input} value={courseForm.universityId} onChange={setCourse("universityId")} disabled={Boolean(courseForm.id)}>
                <option value="">Select…</option>
                {universities.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.country})</option>)}
              </select>
            </label>
            <label className="sm:col-span-2"><span className={label}>Course title</span><input className={input} value={courseForm.title} onChange={setCourse("title")} placeholder="MSc Data Science" /></label>
            <label>
              <span className={label}>Level</span>
              <select className={input} value={courseForm.level} onChange={setCourse("level")}>
                {STUDY_LEVELS.map((l) => <option key={l} value={l}>{STUDY_LEVEL_LABELS[l]}</option>)}
              </select>
            </label>
            <label><span className={label}>Subject</span><input className={input} value={courseForm.subject} onChange={setCourse("subject")} placeholder="Computing" /></label>
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
              if (await post({ type: "course", ...courseForm }, courseForm.id ? "Course updated" : "Course added")) setCourseForm(EMPTY_COURSE)
            }}
            className="rounded-lg bg-[#e0511f] px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            {courseForm.id ? "Save changes" : "Add course"}
          </button>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Courses ({visibleCourses.length})</h2>
          <select className={`${input} w-auto`} value={filterUniversity} onChange={(e) => setFilterUniversity(e.target.value)}>
            <option value="">All universities</option>
            {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-white/50">Loading…</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-white/40">
                <tr>
                  <th className="py-2 pr-3">Course</th>
                  <th className="py-2 pr-3">University</th>
                  <th className="py-2 pr-3">Level</th>
                  <th className="py-2 pr-3">Fees</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {visibleCourses.map((c) => (
                  <tr key={c.id} className="border-t border-white/5">
                    <td className="py-2 pr-3 font-medium">{c.title}</td>
                    <td className="py-2 pr-3 text-white/60">{c.university.name}</td>
                    <td className="py-2 pr-3 text-white/60">{STUDY_LEVEL_LABELS[c.level]}</td>
                    <td className="py-2 pr-3 text-white/60">
                      {c.tuitionMin ?? "–"}{c.tuitionMax != null && c.tuitionMax !== c.tuitionMin ? `–${c.tuitionMax}` : ""} {c.currency}
                    </td>
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
