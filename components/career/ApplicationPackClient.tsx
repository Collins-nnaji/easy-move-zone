"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, ClipboardList, Download, FilePen, FileText, Loader2, Plus, Save, Trash2, Upload } from "lucide-react"
import type { ApplicationPackData, PackEducation, PackExperience } from "@/lib/career/application-pack"

type Job = { id: string; title: string; company: string | null; city: string; country: string; flag: string; url: string | null }
type Tab = "cv" | "letter" | "answers"

function Editable({ value, onChange, className = "", multiline = false, placeholder = "Click to edit" }: {
  value: string
  onChange: (value: string) => void
  className?: string
  multiline?: boolean
  placeholder?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const Tag = multiline ? "div" : "span"
  return (
    <Tag
      ref={(node) => { ref.current = node }}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline}
      data-placeholder={placeholder}
      onBlur={(event) => onChange((multiline ? event.currentTarget.innerText : event.currentTarget.textContent || "").trim())}
      className={`rounded-sm outline-none transition hover:bg-orange-50 focus:bg-orange-50 focus:ring-2 focus:ring-[#e0511f]/25 empty:before:text-slate-300 empty:before:content-[attr(data-placeholder)] ${multiline ? "whitespace-pre-wrap" : "inline-block"} ${className}`}
    >
      {value}
    </Tag>
  )
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function ApplicationPackClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null>(null)
  const [cvText, setCvText] = useState("")
  const [cvData, setCvData] = useState<unknown>(null)
  const [sourceReady, setSourceReady] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cvId, setCvId] = useState<number | null>(null)
  const [pack, setPack] = useState<ApplicationPackData | null>(null)
  const [tab, setTab] = useState<Tab>("cv")
  const [question, setQuestion] = useState("")
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([])
  const [answering, setAnswering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void Promise.all([
      fetch(`/api/jobs?id=${encodeURIComponent(jobId)}&limit=1`).then((res) => res.json()),
      fetch("/api/application-pack", { cache: "no-store" }).then((res) => res.ok ? res.json() : null),
    ]).then(([jobData, source]) => {
      setJob(jobData.jobs?.[0] ?? null)
      if (source?.cvText) setCvText(source.cvText)
      if (source?.cvData) setCvData(source.cvData)
      setSourceReady(Boolean(source?.available))
    }).catch(() => setError("Could not load the job or your CV."))
  }, [jobId])

  async function uploadCv(file: File | null) {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.set("cvFile", file)
      form.set("kind", "cv")
      form.set("persist", "1")
      form.set("sessionId", `application-pack-${Date.now()}`)
      const response = await fetch("/api/documents/extract", { method: "POST", body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not read CV")
      setCvText(String(data.text || ""))
      setCvData(data.cvData ?? null)
      setSourceReady(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read CV")
    } finally {
      setUploading(false)
    }
  }

  async function generate() {
    setGenerating(true)
    setError(null)
    try {
      const response = await fetch("/api/application-pack", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, cvText, cvData }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not create application pack")
      setPack(data.data)
      setCvId(data.cvId ?? null)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create application pack")
    } finally {
      setGenerating(false)
    }
  }

  async function save() {
    if (!pack || !cvId || !job) return
    setSaving(true)
    setSaved(false)
    try {
      const response = await fetch("/api/application-pack", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId, jobId: Number(jobId), jobTitle: job.title, data: pack }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not save")
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  async function draftAnswer() {
    if (!question.trim() || !job) return
    setAnswering(true)
    try {
      const response = await fetch("/api/application-pack", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "answer", question, cvText, jobTitle: job.title, company: job.company }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not draft answer")
      setAnswers((current) => [...current, { question: question.trim(), answer: data.answer }])
      setQuestion("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draft answer")
    } finally {
      setAnswering(false)
    }
  }

  function patchPersonal(key: keyof ApplicationPackData["personal"], value: string) {
    setSaved(false)
    setPack((current) => current ? { ...current, personal: { ...current.personal, [key]: value } } : current)
  }

  function patchExperience(itemId: string, changes: Partial<PackExperience>) {
    setSaved(false)
    setPack((current) => current ? { ...current, experience: current.experience.map((item) => item.id === itemId ? { ...item, ...changes } : item) } : current)
  }

  function patchEducation(itemId: string, changes: Partial<PackEducation>) {
    setSaved(false)
    setPack((current) => current ? { ...current, education: current.education.map((item) => item.id === itemId ? { ...item, ...changes } : item) } : current)
  }

  return (
    <div className="min-h-screen bg-[#ebe8e0] text-[#1b231e]">
      <div className="application-pack-toolbar sticky top-14 z-30 border-b border-[#ddd7cc] bg-[#f8f6f1]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
          <Link href="/jobs" className="mr-auto inline-flex items-center gap-1.5 text-sm font-bold text-[#5f655c]"><ArrowLeft className="h-4 w-4" /> Jobs</Link>
          {pack && <>{saved && <span className="hidden items-center gap-1 text-xs font-bold text-emerald-700 sm:flex"><Check className="h-3.5 w-3.5" /> Saved</span>}<button type="button" disabled={saving} onClick={() => void save()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d8d2c6] bg-white px-4 text-xs font-extrabold"><Save className="h-3.5 w-3.5" />{saving ? "Saving…" : "Save"}</button><button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1b231e] px-4 text-xs font-extrabold text-white"><Download className="h-3.5 w-3.5" /> Print / PDF</button></>}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="application-pack-intro mb-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e0511f]">Application pack</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{job?.title || "Loading role…"}</h1>
          {job && <p className="mt-1 text-sm text-[#626861]">{job.company || "Company"} · {job.flag} {job.city}, {job.country}</p>}
        </div>

        {error && <p className="application-pack-intro mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</p>}

        {!pack ? (
          <section className="application-pack-intro mx-auto max-w-2xl rounded-3xl border border-[#e0dbd1] bg-white p-6 shadow-sm sm:p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fbe8dd] text-[#e0511f]"><FileText className="h-5 w-5" /></span>
            <h2 className="mt-5 text-xl font-extrabold">Create this application from your CV</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#626861]">We tailor the wording and ordering to this role without inventing experience. You can edit every field directly inside the finished CV.</p>
            <div className={`mt-5 rounded-2xl border p-4 ${sourceReady ? "border-emerald-200 bg-emerald-50" : "border-[#e4dfd5] bg-[#f8f6f1]"}`}>
              <p className="text-sm font-extrabold">{sourceReady ? "Saved CV found" : "Add your CV"}</p>
              <p className="mt-1 text-xs text-[#667069]">{sourceReady ? "Your latest profile CV will be used as the factual source." : "Upload PDF or DOCX once; it will also be available for future application packs."}</p>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#d8d2c6] bg-white px-4 py-2 text-xs font-bold"><Upload className="h-3.5 w-3.5" />{uploading ? "Reading CV…" : sourceReady ? "Use a different CV" : "Upload CV"}<input type="file" className="hidden" accept=".pdf,.docx,.txt" disabled={uploading} onChange={(event) => void uploadCv(event.target.files?.[0] ?? null)} /></label>
            </div>
            <button type="button" disabled={!sourceReady || generating || !job} onClick={() => void generate()} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#e0511f] text-sm font-extrabold text-white disabled:opacity-45">{generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePen className="h-4 w-4" />}{generating ? "Tailoring your application…" : "Create application pack"}</button>
          </section>
        ) : (
          <>
            <div className="application-pack-tabs mb-5 flex flex-wrap gap-2">
              {([['cv', 'Tailored CV'], ['letter', 'Cover letter'], ['answers', 'Application answers']] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-full px-4 py-2 text-xs font-extrabold ${tab === key ? "bg-[#1b231e] text-white" : "border border-[#d8d2c6] bg-white text-[#5f655c]"}`}>{label}</button>)}
              <span className="ml-auto hidden self-center text-xs font-semibold text-[#777d76] md:block">Click any CV text to edit it</span>
            </div>

            {tab === "cv" && (
              <article id="application-pack-print" className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white px-[8%] py-[7%] shadow-xl print:shadow-none">
                <header className="border-b-2 border-[#e0511f] pb-5">
                  <Editable value={pack.personal.fullName} onChange={(value) => patchPersonal("fullName", value)} className="block text-3xl font-extrabold uppercase tracking-tight" placeholder="Your name" />
                  <Editable value={pack.personal.title} onChange={(value) => patchPersonal("title", value)} className="mt-2 block text-sm font-bold uppercase tracking-[.12em] text-[#e0511f]" placeholder="Professional title" />
                  <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                    {(["email", "phone", "location", "linkedin"] as const).map((key) => <Editable key={key} value={pack.personal[key]} onChange={(value) => patchPersonal(key, value)} placeholder={key} />)}
                  </div>
                </header>
                <section className="mt-6"><h2 className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e0511f]">Profile</h2><Editable multiline value={pack.personal.summary} onChange={(value) => patchPersonal("summary", value)} className="mt-2 block text-sm leading-relaxed text-slate-700" placeholder="Professional summary" /></section>
                <section className="mt-6"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e0511f]">Experience</h2><button type="button" onClick={() => setPack({ ...pack, experience: [...pack.experience, { id: id("exp"), role: "Role", company: "Company", location: "", startDate: "", endDate: "", bullets: [""] }] })} className="application-pack-control inline-flex items-center gap-1 text-[10px] font-bold text-[#e0511f]"><Plus className="h-3 w-3" /> Add</button></div><div className="mt-3 space-y-5">{pack.experience.map((item) => <div key={item.id} className="group relative"><button type="button" onClick={() => setPack({ ...pack, experience: pack.experience.filter((entry) => entry.id !== item.id) })} className="application-pack-control absolute -right-5 top-0 hidden text-rose-500 group-hover:block"><Trash2 className="h-3.5 w-3.5" /></button><div className="flex items-start justify-between gap-4"><div><Editable value={item.role} onChange={(value) => patchExperience(item.id, { role: value })} className="font-extrabold" /><span className="mx-1 text-slate-300">·</span><Editable value={item.company} onChange={(value) => patchExperience(item.id, { company: value })} className="text-sm font-semibold text-slate-600" /></div><div className="shrink-0 text-[11px] text-slate-500"><Editable value={item.startDate} onChange={(value) => patchExperience(item.id, { startDate: value })} placeholder="Start" /> — <Editable value={item.endDate} onChange={(value) => patchExperience(item.id, { endDate: value })} placeholder="End" /></div></div><ul className="mt-2 space-y-1.5 pl-4 text-sm leading-relaxed text-slate-700">{item.bullets.map((bullet, index) => <li key={index} className="list-disc"><Editable multiline value={bullet} onChange={(value) => patchExperience(item.id, { bullets: item.bullets.map((entry, i) => i === index ? value : entry) })} className="block" placeholder="Achievement" /></li>)}</ul><button type="button" onClick={() => patchExperience(item.id, { bullets: [...item.bullets, ""] })} className="application-pack-control mt-2 text-[10px] font-bold text-[#e0511f]">+ Add bullet</button></div>)}</div></section>
                <section className="mt-6"><div className="flex items-center justify-between"><h2 className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e0511f]">Education</h2><button type="button" onClick={() => setPack({ ...pack, education: [...pack.education, { id: id("edu"), qualification: "Qualification", institution: "Institution", date: "" }] })} className="application-pack-control inline-flex items-center gap-1 text-[10px] font-bold text-[#e0511f]"><Plus className="h-3 w-3" /> Add</button></div><div className="mt-3 space-y-3">{pack.education.map((item) => <div key={item.id} className="group flex items-start justify-between gap-4"><div><Editable value={item.qualification} onChange={(value) => patchEducation(item.id, { qualification: value })} className="text-sm font-bold" /><span className="mx-1 text-slate-300">·</span><Editable value={item.institution} onChange={(value) => patchEducation(item.id, { institution: value })} className="text-sm text-slate-600" /></div><div className="flex items-center gap-2"><Editable value={item.date} onChange={(value) => patchEducation(item.id, { date: value })} className="text-[11px] text-slate-500" placeholder="Date" /><button type="button" onClick={() => setPack({ ...pack, education: pack.education.filter((entry) => entry.id !== item.id) })} className="application-pack-control hidden text-rose-500 group-hover:block"><Trash2 className="h-3.5 w-3.5" /></button></div></div>)}</div></section>
                <section className="mt-6"><h2 className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e0511f]">Skills</h2><Editable multiline value={pack.skills.join(" · ")} onChange={(value) => { setSaved(false); setPack({ ...pack, skills: value.split(/[·,\n]/).map((item) => item.trim()).filter(Boolean) }) }} className="mt-2 block text-sm leading-relaxed text-slate-700" placeholder="Skills" /></section>
              </article>
            )}

            {tab === "letter" && <article id="application-pack-print" className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white px-[9%] py-[8%] shadow-xl"><p className="text-sm font-bold">{pack.personal.fullName}</p><p className="mt-1 text-xs text-slate-500">{pack.personal.email} · {pack.personal.phone}</p><p className="mt-10 text-sm font-bold">Application for {job?.title}{job?.company ? ` at ${job.company}` : ""}</p><Editable multiline value={pack.coverLetter} onChange={(value) => { setSaved(false); setPack({ ...pack, coverLetter: value }) }} className="mt-7 block whitespace-pre-wrap text-sm leading-7 text-slate-700" placeholder="Cover letter" /></article>}

            {tab === "answers" && <section id="application-pack-print" className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-8"><ClipboardList className="h-6 w-6 text-[#e0511f]" /><h2 className="mt-3 text-xl font-extrabold">Application questions</h2><p className="mt-1 text-sm text-[#626861]">Paste a question from the employer’s form. The draft uses only evidence from your CV.</p><div className="mt-5 flex gap-2"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Paste one application question…" className="min-h-24 flex-1 rounded-xl border border-[#ddd7cc] p-3 text-sm outline-none focus:border-[#e0511f]" /><button type="button" disabled={answering || !question.trim()} onClick={() => void draftAnswer()} className="self-end rounded-xl bg-[#e0511f] px-4 py-3 text-xs font-extrabold text-white disabled:opacity-40">{answering ? "Drafting…" : "Draft answer"}</button></div><div className="mt-6 space-y-4">{answers.map((item, index) => <div key={`${item.question}-${index}`} className="rounded-2xl bg-[#f7f4ee] p-4"><p className="text-sm font-extrabold">{item.question}</p><textarea value={item.answer} onChange={(event) => setAnswers((current) => current.map((entry, i) => i === index ? { ...entry, answer: event.target.value } : entry))} className="mt-3 min-h-32 w-full resize-y rounded-xl border border-[#e1dcd2] bg-white p-3 text-sm leading-relaxed outline-none" /></div>)}</div></section>}
          </>
        )}
      </div>
    </div>
  )
}
