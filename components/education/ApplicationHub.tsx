"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"
import { Check, ChevronDown, Copy, ExternalLink, Loader2, Trash2 } from "lucide-react"
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  STUDY_LEVEL_LABELS,
  type ApplicationStatus,
  type CourseFit,
  type EducationApplication,
  type StatementFormat,
} from "@/lib/education/types"
import { COUNTRY_FLAGS, CapIcon, FitIcon, FitSummary, PRIMARY, StatementIcon, formatTuition } from "./shared"

const UCAS_CHAR_LIMIT = 4000

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  shortlisted: "bg-[#f6f3ec] text-[#3f463f]",
  preparing: "bg-amber-100 text-amber-900",
  submitted: "bg-sky-100 text-sky-900",
  offer: "bg-emerald-100 text-emerald-900",
  rejected: "bg-rose-100 text-rose-900",
}

type Props = {
  signedIn: boolean
  applications: EducationApplication[]
  setApplications: Dispatch<SetStateAction<EducationApplication[]>>
  focusCourseId: string | null
  onExplore: () => void
}

export function ApplicationHub({ signedIn, applications, setApplications, focusCourseId, onExplore }: Props) {
  if (!signedIn) {
    return (
      <div className="mt-8 rounded-2xl border border-[#e4dfd5] bg-white p-8 text-center">
        <CapIcon className="mx-auto h-10 w-10" />
        <h2 className="mt-3 text-xl font-extrabold tracking-tight">Your application hub</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#5f655c]">
          Shortlist courses, track each application, check your fit and draft personal statements from your CV. Sign in to get started.
        </p>
        <Link href="/auth?redirect=/education" className="mt-5 inline-flex rounded-xl bg-[#e0511f] px-5 py-2.5 text-sm font-extrabold text-white">
          Sign in
        </Link>
      </div>
    )
  }

  if (!applications.length) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-[#d8d2c6] bg-white/60 p-8 text-center">
        <CapIcon className="mx-auto h-10 w-10" />
        <h2 className="mt-3 text-xl font-extrabold tracking-tight">No courses shortlisted yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#5f655c]">Shortlist courses from the explorer to track them and write your personal statements here.</p>
        <button type="button" onClick={onExplore} className="mt-5 rounded-xl bg-[#1b231e] px-5 py-2.5 text-sm font-extrabold text-white">
          Explore courses
        </button>
      </div>
    )
  }

  const counts = APPLICATION_STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }))

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {counts.map(({ status, count }) => (
          <div key={status} className="rounded-2xl border border-[#e4dfd5] bg-white px-4 py-3">
            <p className="text-2xl font-extrabold">{count}</p>
            <p className="text-xs font-bold text-[#6b716a]">{APPLICATION_STATUS_LABELS[status]}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-4">
        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            defaultOpen={application.courseId === focusCourseId}
            setApplications={setApplications}
          />
        ))}
      </div>
    </div>
  )
}

function ApplicationCard({
  application,
  defaultOpen,
  setApplications,
}: {
  application: EducationApplication
  defaultOpen: boolean
  setApplications: Dispatch<SetStateAction<EducationApplication[]>>
}) {
  const { course } = application
  const cardRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(defaultOpen)
  const [statement, setStatement] = useState(application.personalStatement)
  const [notes, setNotes] = useState(application.notes)
  const [format, setFormat] = useState<StatementFormat>(course.level === "undergraduate" || course.level === "foundation" ? "ucas" : "postgraduate")
  const [motivation, setMotivation] = useState("")
  const [wordLimit, setWordLimit] = useState(700)
  const [drafting, setDrafting] = useState(false)
  const [fitBusy, setFitBusy] = useState(false)
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle")
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (defaultOpen) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [defaultOpen])

  const dirty = statement !== application.personalStatement || notes !== application.notes
  const chars = statement.length
  const words = statement.trim() ? statement.trim().split(/\s+/).length : 0
  const overLimit = format === "ucas" ? chars > UCAS_CHAR_LIMIT : words > wordLimit * 1.1

  async function patch(body: { status?: ApplicationStatus; personalStatement?: string; notes?: string }) {
    const res = await fetch("/api/education/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: application.courseId, ...body }),
    })
    if (res.ok) setApplications((await res.json()).applications ?? [])
    return res.ok
  }

  async function save() {
    setSaving("saving")
    const ok = await patch({ personalStatement: statement, notes })
    setSaving(ok ? "saved" : "idle")
    if (!ok) setMessage("Could not save. Try again.")
  }

  async function draft() {
    if (statement.trim() && !window.confirm("Replace your current statement with a new AI draft?")) return
    setDrafting(true)
    setMessage(null)
    try {
      const res = await fetch("/api/education/statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: application.courseId, format, motivation, wordLimit }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error ?? "Could not draft a statement.")
        return
      }
      setStatement(data.statement)
      setApplications((prev) =>
        prev.map((a) =>
          a.courseId === application.courseId
            ? { ...a, personalStatement: data.statement, status: a.status === "shortlisted" ? "preparing" : a.status }
            : a,
        ),
      )
      if (!data.hasCv) setMessage("No CV found, so the draft leans on your profile and notes. Add a CV in your Workspace for a stronger draft.")
    } finally {
      setDrafting(false)
    }
  }

  async function checkFit() {
    setFitBusy(true)
    try {
      const res = await fetch("/api/education/fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: application.courseId }),
      })
      if (res.ok) {
        const data = (await res.json()) as { fit: CourseFit }
        setApplications((prev) => prev.map((a) => (a.courseId === application.courseId ? { ...a, fit: data.fit } : a)))
      }
    } finally {
      setFitBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm(`Remove ${course.title} from your hub? Your statement and notes will be deleted.`)) return
    const res = await fetch(`/api/education/applications?courseId=${encodeURIComponent(application.courseId)}`, { method: "DELETE" })
    if (res.ok) setApplications((await res.json()).applications ?? [])
  }

  async function copy() {
    await navigator.clipboard.writeText(statement)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <article ref={cardRef} className="scroll-mt-28 rounded-2xl border border-[#e4dfd5] bg-white shadow-[0_1px_2px_rgba(27,35,30,0.04)]">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <button type="button" onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-left">
          <p className="text-sm font-bold" style={{ color: PRIMARY }}>
            {COUNTRY_FLAGS[course.university.country] ?? "🎓"} {course.university.name}
          </p>
          <h3 className="mt-0.5 text-lg font-extrabold leading-snug tracking-tight">{course.title}</h3>
          <p className="mt-1 text-xs text-[#6b716a]">
            {STUDY_LEVEL_LABELS[course.level]} · {formatTuition(course)} per year
            {application.fit ? ` · Fit ${application.fit.score}/100` : ""}
            {application.personalStatement ? " · Statement drafted" : ""}
          </p>
        </button>
        <div className="flex items-center gap-2">
          <select
            value={application.status}
            onChange={(event) => void patch({ status: event.target.value as ApplicationStatus })}
            className={`h-9 rounded-full border-0 px-3 text-xs font-extrabold ${STATUS_STYLE[application.status]}`}
            aria-label="Application status"
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>{APPLICATION_STATUS_LABELS[status]}</option>
            ))}
          </select>
          <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-full p-2 text-[#6b716a] hover:bg-[#f6f3ec]" aria-label={open ? "Collapse" : "Expand"}>
            <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-6 border-t border-[#efe9dd] p-5 sm:p-6">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-sm font-extrabold"><FitIcon /> Course fit</h4>
              <button type="button" onClick={() => void checkFit()} disabled={fitBusy} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4dfd5] px-3 py-1.5 text-xs font-bold hover:border-[#2f5d50] disabled:opacity-60">
                {fitBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {application.fit ? "Re-check fit" : "Check fit"}
              </button>
            </div>
            <div className="mt-3">
              {application.fit ? (
                <FitSummary fit={application.fit} />
              ) : (
                <p className="text-sm text-[#6b716a]">Compare your CV and profile with this course&apos;s entry requirements.</p>
              )}
            </div>
          </section>

          <section>
            <h4 className="flex items-center gap-2 text-sm font-extrabold"><StatementIcon /> Personal statement</h4>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_280px]">
              <div className="order-2 lg:order-1">
                <textarea
                  value={statement}
                  onChange={(event) => {
                    setStatement(event.target.value)
                    setSaving("idle")
                  }}
                  rows={16}
                  placeholder="Write your statement here, or generate a first draft from your CV with the options on the right."
                  className="w-full rounded-xl border border-[#e4dfd5] bg-[#fffdf9] p-4 text-sm leading-relaxed outline-none focus:border-[#e0511f]"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className={`text-xs font-bold ${overLimit ? "text-[#b3261e]" : "text-[#6b716a]"}`}>
                    {format === "ucas" ? `${chars.toLocaleString()} / ${UCAS_CHAR_LIMIT.toLocaleString()} characters` : `${words} / ~${wordLimit} words`}
                    {format === "ucas" ? ` · ${words} words` : ` · ${chars.toLocaleString()} characters`}
                  </p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => void copy()} disabled={!statement} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4dfd5] px-3 py-1.5 text-xs font-bold disabled:opacity-50">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="order-1 space-y-3 rounded-xl bg-[#faf8f3] p-4 lg:order-2">
                <label className="block">
                  <span className="text-xs font-extrabold">Format</span>
                  <select value={format} onChange={(e) => setFormat(e.target.value as StatementFormat)} className="mt-1 h-10 w-full rounded-lg border border-[#e4dfd5] bg-white px-3 text-sm font-semibold">
                    <option value="ucas">UCAS undergraduate (3 questions)</option>
                    <option value="postgraduate">Postgraduate statement of purpose</option>
                  </select>
                </label>
                {format === "postgraduate" && (
                  <label className="block">
                    <span className="text-xs font-extrabold">Target length (words)</span>
                    <input
                      type="number"
                      min={250}
                      max={1500}
                      step={50}
                      value={wordLimit}
                      onChange={(e) => setWordLimit(Number(e.target.value) || 700)}
                      className="mt-1 h-10 w-full rounded-lg border border-[#e4dfd5] bg-white px-3 text-sm"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="text-xs font-extrabold">Why this course? (optional)</span>
                  <textarea
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    rows={4}
                    placeholder="Your goals, what drew you to this course, experiences you want mentioned…"
                    className="mt-1 w-full rounded-lg border border-[#e4dfd5] bg-white p-2.5 text-xs leading-relaxed outline-none focus:border-[#e0511f]"
                  />
                </label>
                <button type="button" onClick={() => void draft()} disabled={drafting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e0511f] px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-60">
                  {drafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <StatementIcon className="h-4 w-4 [&_path]:stroke-white [&_path]:fill-white" />}
                  {drafting ? "Drafting…" : statement ? "Redraft from my CV" : "Draft from my CV"}
                </button>
                <p className="text-[11px] leading-relaxed text-[#8a9086]">
                  Drafts use only facts from your CV, profile and notes. Edit it so it sounds like you before submitting.
                </p>
              </div>
            </div>
            {message && <p className="mt-2 rounded-lg bg-[#fff5ef] px-3 py-2 text-xs font-medium text-[#7a3b24]">{message}</p>}
          </section>

          <section>
            <h4 className="text-sm font-extrabold">Notes</h4>
            <textarea
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value)
                setSaving("idle")
              }}
              rows={3}
              placeholder="Deadlines, referees, documents to send, scholarship ideas…"
              className="mt-2 w-full rounded-xl border border-[#e4dfd5] bg-white p-3 text-sm outline-none focus:border-[#e0511f]"
            />
          </section>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#efe9dd] pt-4">
            <button type="button" onClick={() => void save()} disabled={!dirty || saving === "saving"} className="inline-flex items-center gap-2 rounded-xl bg-[#1b231e] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-50">
              {saving === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving === "saved" && !dirty ? "Saved" : "Save changes"}
            </button>
            {course.courseUrl && (
              <a href={course.courseUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-[#4a5047] hover:underline">
                Apply on university site <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button type="button" onClick={() => void remove()} className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#9a3b2a] hover:underline">
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
