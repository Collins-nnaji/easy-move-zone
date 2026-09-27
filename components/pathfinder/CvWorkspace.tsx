"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { DragEvent, ReactNode } from "react"
import {
  Award, Check, Download, ExternalLink, File as FileIcon, FileSignature, FileText, FolderOpen, History, IdCard,
  FilePen, Loader2, PenLine, Plus, Save, Trash2, Upload, X,
} from "lucide-react"
import type { BuilderCV, ParsedCV } from "@/lib/documents/cv-ai"
import { normalizeSections, sectionsFromParsed } from "@/lib/documents/cv-sections"
import type { CheckDocumentKind, CheckDocumentMeta } from "@/lib/check/types"
import { DOCUMENT_KINDS, DOCUMENT_KIND_LABELS } from "@/lib/documents/kind"
import { autoBullet, toBulletText } from "@/lib/documents/bullets"
import { CvPagedTemplate } from "@/components/pathfinder/CvPagedTemplate"

type SavedCV = {
  id: number; name: string; createdAt: string; updatedAt: string
  sourceDocumentId: string | null; sourceFileName: string | null
}
type CvSource = { documentId: string; fileName: string }
type UploadStage = "idle" | "uploading" | "reading" | "ready"
type UploadKind = CheckDocumentKind | "auto"

const KIND_ICONS: Record<CheckDocumentKind, typeof FileIcon> = {
  cv: FileText, certificate: Award, offer: FileSignature, passport: IdCard, other: FileIcon,
}
const AI_PROMPTS = [
  "Tailor it for UK employers",
  "Make it more concise",
  "Strengthen achievements with impact",
  "Fix grammar and tone",
]

const emptyCv = (): BuilderCV => ({
  personalInfo: { fullName: "", title: "", email: "", phone: "", location: "", linkedin: "", summary: "" },
  experience: [], education: [], skillCategories: [], sections: [], parsed: {},
})

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function normalizeCv(value: unknown): BuilderCV {
  const root = record(value)
  const personal = record(root.personalInfo ?? root.personal)
  const experiences = Array.isArray(root.experience) ? root.experience.map(record) : []
  const education = Array.isArray(root.education) ? root.education.map(record) : []
  const categories = Array.isArray(root.skillCategories) ? root.skillCategories.map(record) : []
  return {
    personalInfo: {
      fullName: String(personal.fullName ?? ""), title: String(personal.title ?? ""),
      email: String(personal.email ?? ""), phone: String(personal.phone ?? ""),
      location: String(personal.location ?? ""), linkedin: String(personal.linkedin ?? ""),
      summary: String(personal.summary ?? root.summary ?? ""),
    },
    experience: experiences.map((item, index) => ({
      id: String(item.id || `exp-${index}`), company: String(item.company ?? ""), role: String(item.role ?? item.position ?? ""),
      location: String(item.location ?? ""), startDate: String(item.startDate ?? ""), endDate: String(item.endDate ?? ""),
      current: item.current === true, description: String(item.description ?? (Array.isArray(item.bullets) ? toBulletText(item.bullets.map(String)) : "")),
    })),
    education: education.map((item, index) => ({
      id: String(item.id || `edu-${index}`), institution: String(item.institution ?? ""),
      degree: String(item.degree ?? item.qualification ?? ""), field: String(item.field ?? ""),
      location: String(item.location ?? ""), startDate: String(item.startDate ?? ""),
      endDate: String(item.endDate ?? item.date ?? ""), current: item.current === true,
    })),
    skillCategories: categories.length ? categories.map((item, index) => ({
      id: String(item.id || `skills-${index}`), name: String(item.name || "Skills"),
      skills: Array.isArray(item.skills)
        ? item.skills.map((skill) => typeof skill === "string" ? skill : String(record(skill).name ?? "")).filter(Boolean)
        : [],
    })) : [],
    sections: Array.isArray(root.sections)
      ? normalizeSections(root.sections)
      : sectionsFromParsed(record(root.parsed) as ParsedCV, (index) => `section-${index}`),
    parsed: record(root.parsed),
  }
}

function baseName(fileName: string) {
  return fileName.replace(/\.(pdf|docx?|txt|md)$/i, "")
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function timeAgo(value: string) {
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return ""
  const minutes = Math.round((Date.now() - time) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`
  if (minutes < 60 * 24 * 7) return `${Math.round(minutes / (60 * 24))}d ago`
  return new Date(time).toLocaleDateString(undefined, { day: "numeric", month: "short" })
}

function fileUrl(id: string, mode: "view" | "download") {
  return `/api/profile/documents?id=${encodeURIComponent(id)}&file=${mode}`
}

function Panel({ icon, title, hint, action, children, className = "", ...drop }: {
  icon: ReactNode; title: string; hint: string; action?: ReactNode; children: ReactNode; className?: string
  onDragOver?: (event: DragEvent) => void; onDragLeave?: () => void; onDrop?: (event: DragEvent) => void
}) {
  return (
    <div {...drop} className={`rounded-2xl border bg-white p-4 transition ${className || "border-[#e0dbd1]"}`}>
      <div className="flex items-start justify-between gap-2">
        <div><h3 className="flex items-center gap-2 text-sm font-extrabold">{icon}{title}</h3><p className="mt-0.5 text-[11px] text-[#7b817a]">{hint}</p></div>
        {action}
      </div>
      {children}
    </div>
  )
}

function ConfirmDelete({ onConfirm, onCancel, busy }: { onConfirm: () => void; onCancel: () => void; busy: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={busy} onClick={onConfirm} className="inline-flex h-7 items-center gap-1 rounded-lg bg-rose-600 px-2 text-[11px] font-extrabold text-white disabled:opacity-60">{busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete</button>
      <button type="button" onClick={onCancel} className="h-7 rounded-lg px-2 text-[11px] font-bold text-[#646a63] hover:bg-[#f0ece4]">Cancel</button>
    </div>
  )
}

export function CvWorkspace() {
  const [documents, setDocuments] = useState<CheckDocumentMeta[]>([])
  const [savedCvs, setSavedCvs] = useState<SavedCV[]>([])
  const [libraryLoaded, setLibraryLoaded] = useState(false)
  const [cv, setCv] = useState<BuilderCV | null>(null)
  const [cvId, setCvId] = useState<number | null>(null)
  const [name, setName] = useState("My CV")
  const [source, setSource] = useState<CvSource | null>(null)
  const [snapshot, setSnapshot] = useState("")
  const [stage, setStage] = useState<UploadStage>("idle")
  const [uploadName, setUploadName] = useState("")
  const [uploadKind, setUploadKind] = useState<UploadKind>("auto")
  const [kindFilter, setKindFilter] = useState<CheckDocumentKind | "all">("all")
  const [dragOver, setDragOver] = useState(false)
  const [suggestion, setSuggestion] = useState<{ doc: CheckDocumentMeta; cvData: unknown } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState("")
  const [instruction, setInstruction] = useState("")
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const openedFromLink = useRef(false)
  const saveRef = useRef<() => Promise<void>>(async () => undefined)

  const dirty = cv !== null && JSON.stringify({ name, cv }) !== snapshot
  const linkedCv = useCallback((documentId: string) => savedCvs.find((item) => item.sourceDocumentId === documentId), [savedCvs])
  const presentKinds = useMemo(() => DOCUMENT_KINDS.filter((kind) => documents.some((doc) => doc.kind === kind)), [documents])
  const activeFilter = kindFilter !== "all" && presentKinds.includes(kindFilter) ? kindFilter : "all"
  const visibleDocuments = activeFilter === "all" ? documents : documents.filter((doc) => doc.kind === activeFilter)
  const latestCvDocument = documents.find((doc) => doc.kind === "cv")

  const loadLibrary = useCallback(async () => {
    const [docsRes, cvsRes] = await Promise.all([
      fetch("/api/profile/documents", { cache: "no-store" }), fetch("/api/cvs", { cache: "no-store" }),
    ])
    if (docsRes.ok) setDocuments((await docsRes.json()).documents ?? [])
    if (cvsRes.ok) setSavedCvs((await cvsRes.json()).cvs ?? [])
    setLibraryLoaded(true)
  }, [])

  useEffect(() => { void loadLibrary() }, [loadLibrary])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault() }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        window.setTimeout(() => void saveRef.current(), 0)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  function flash(message: string) { setError(""); setNotice(message) }

  function canLeaveEditor() {
    return !dirty || window.confirm("You have unsaved changes to this CV. Discard them?")
  }

  function openEditor(next: BuilderCV, id: number | null, nextName: string, nextSource: CvSource | null) {
    setCv(next); setCvId(id); setName(nextName); setSource(nextSource); setInstruction("")
    setSnapshot(JSON.stringify({ name: nextName, cv: next }))
  }

  function closeEditor() {
    if (!canLeaveEditor()) return
    setCv(null); setCvId(null); setSource(null); setSnapshot("")
  }

  async function upload(file: File | null) {
    if (!file) return
    setError(""); setNotice(""); setSuggestion(null); setUploadName(file.name); setStage("uploading")
    const stageTimer = window.setTimeout(() => setStage("reading"), 450)
    try {
      const form = new FormData(); form.set("file", file); form.set("kind", uploadKind)
      const response = await fetch("/api/profile/documents", { method: "POST", body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not upload this document")
      const doc = data.document as CheckDocumentMeta
      setDocuments(data.documents ?? []); setKindFilter("all"); setStage("ready")
      if (doc.kind === "cv") setSuggestion({ doc, cvData: data.cvData })
      else flash(`Saved to your documents as ${DOCUMENT_KIND_LABELS[doc.kind].toLowerCase()}.`)
      window.setTimeout(() => setStage("idle"), 2200)
    } catch (err) {
      setStage("idle"); setError(err instanceof Error ? err.message : "Could not upload this document")
    } finally {
      window.clearTimeout(stageTimer)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function createCvFromDocument(doc: CheckDocumentMeta, cvData?: unknown) {
    const existing = linkedCv(doc.id)
    if (existing) return openSaved(existing.id)
    if (!canLeaveEditor()) return
    setBusy(`make-${doc.id}`); setError("")
    try {
      let structured = cvData
      if (!structured) {
        const response = await fetch(`/api/profile/documents?id=${encodeURIComponent(doc.id)}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Could not open document")
        structured = data.document.data
        if (!structured) {
          if (!data.document.text) throw new Error("No readable text in this file. Upload a text-based PDF or Word version to make an editable CV.")
          const parsed = await fetch("/api/cv/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "parse-text", text: data.document.text }) })
          const parsedData = await parsed.json()
          if (!parsed.ok) throw new Error(parsedData.error || "Could not structure this CV")
          structured = parsedData.cvData
        }
      }
      const next = normalizeCv(structured)
      const nextName = next.personalInfo.fullName ? `${next.personalInfo.fullName} CV` : baseName(doc.fileName)
      const nextSource = { documentId: doc.id, fileName: doc.fileName }
      const response = await fetch("/api/cvs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nextName, data: next, source: nextSource }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not create CV")
      openEditor(next, data.cv.id, data.cv.name, nextSource)
      setSuggestion(null)
      flash(`Editable CV created from ${doc.fileName}. The original file stays unchanged in your documents.`)
      await loadLibrary()
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create CV") }
    finally { setBusy("") }
  }

  useEffect(() => {
    if (!libraryLoaded || openedFromLink.current) return
    const id = new URLSearchParams(window.location.search).get("document")
    if (!id) return
    openedFromLink.current = true
    const doc = documents.find((item) => item.id === id)
    if (doc) window.setTimeout(() => void createCvFromDocument(doc), 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryLoaded, documents])

  async function openSaved(id: number) {
    if (id === cvId || !canLeaveEditor()) return
    setBusy(`cv-${id}`); setError("")
    try {
      const response = await fetch(`/api/cvs?id=${id}`); const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not open CV")
      openEditor(normalizeCv(data.cv), id, data.cv.name, data.cv.sourceDocumentId ? { documentId: data.cv.sourceDocumentId, fileName: data.cv.sourceFileName || "uploaded file" } : null)
      setNotice("")
    } catch (err) { setError(err instanceof Error ? err.message : "Could not open CV") }
    finally { setBusy("") }
  }

  async function save() {
    if (!cv || busy === "save") return
    setBusy("save"); setError("")
    try {
      const response = await fetch("/api/cvs", { method: cvId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: cvId, name, data: cv, source }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not save CV")
      setCvId(data.cv.id); setName(data.cv.name); setSnapshot(JSON.stringify({ name: data.cv.name, cv }))
      flash("CV saved."); await loadLibrary()
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save CV") }
    finally { setBusy("") }
  }
  saveRef.current = save

  async function deleteCv(id: number) {
    setBusy(`del-cv-${id}`); setError("")
    try {
      const response = await fetch(`/api/cvs?id=${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error((await response.json()).error || "Could not delete CV")
      if (cvId === id) { setCv(null); setCvId(null); setSource(null); setSnapshot("") }
      setSavedCvs((items) => items.filter((item) => item.id !== id)); flash("CV deleted.")
    } catch (err) { setError(err instanceof Error ? err.message : "Could not delete CV") }
    finally { setBusy(""); setConfirmDelete(null) }
  }

  async function deleteDocument(id: string) {
    setBusy(`del-doc-${id}`); setError("")
    try {
      const response = await fetch(`/api/profile/documents?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not delete document")
      setDocuments(data.documents ?? [])
      if (suggestion?.doc.id === id) setSuggestion(null)
      flash(linkedCv(id) ? "Document deleted. Editable CVs made from it are kept." : "Document deleted.")
    } catch (err) { setError(err instanceof Error ? err.message : "Could not delete document") }
    finally { setBusy(""); setConfirmDelete(null) }
  }

  async function runAi(action: "edit-cv" | "summary" | `experience-${number}`) {
    if (!cv) return
    setBusy(action); setError("")
    try {
      if (action === "edit-cv") {
        const response = await fetch("/api/cv/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, cvData: cv, instruction: instruction || "Improve clarity, impact and ATS readability throughout. Preserve every fact." }) })
        const data = await response.json(); if (!response.ok) throw new Error(data.error || "AI edit failed")
        setCv(normalizeCv(data.cvData)); setInstruction(""); flash("AI edits applied. Review every change, then save.")
      } else {
        const index = action.startsWith("experience-") ? Number(action.split("-")[1]) : -1
        const content = action === "summary" ? cv.personalInfo.summary : cv.experience[index]?.description || ""
        const response = await fetch("/api/cv/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: content ? "refine-section" : "draft-section", section: action === "summary" ? "professional summary" : "experience description", content, context: { title: cv.personalInfo.title, role: index >= 0 ? cv.experience[index]?.role : "", company: index >= 0 ? cv.experience[index]?.company : "" } }) })
        const data = await response.json(); if (!response.ok) throw new Error(data.error || "AI edit failed")
        if (action === "summary") setCv({ ...cv, personalInfo: { ...cv.personalInfo, summary: data.text } })
        else setCv({ ...cv, experience: cv.experience.map((item, i) => i === index ? { ...item, description: autoBullet(String(data.text ?? "")) } : item) })
        flash("AI draft applied. Review it before saving.")
      }
    } catch (err) { setError(err instanceof Error ? err.message : "AI edit failed") }
    finally { setBusy("") }
  }

  function downloadPdf() {
    const previousTitle = document.title
    const safeName = name.trim().replace(/[^a-z0-9_-]+/gi, "-") || "My-CV"
    const cleanup = () => {
      document.body.classList.remove("cv-exporting")
      document.title = previousTitle
      window.removeEventListener("afterprint", cleanup)
    }
    document.title = safeName
    document.body.classList.add("cv-exporting")
    window.addEventListener("afterprint", cleanup)
    window.print()
    window.setTimeout(cleanup, 1500)
  }

  function onDrop(event: DragEvent) {
    event.preventDefault(); setDragOver(false)
    void upload(event.dataTransfer.files?.[0] ?? null)
  }

  const stageLabel = stage === "uploading" ? `Uploading ${uploadName}…` : stage === "reading" ? "Storing and reading your document…" : "Saved to your documents"

  return (
    <section id="cv-workspace" className="mt-5">
      <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => void upload(event.target.files?.[0] ?? null)} />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <Panel
            icon={<FolderOpen className="h-4 w-4 text-[#2f5d50]" />}
            title={`My CVs${savedCvs.length ? ` · ${savedCvs.length}` : ""}`}
            hint="Editable CVs you build and refine here"
            action={<button type="button" onClick={() => { if (canLeaveEditor()) { openEditor(emptyCv(), null, "Untitled CV", null); setNotice("") } }} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#d8d2c6] px-2.5 text-xs font-bold hover:bg-[#f6f3ec]"><Plus className="h-3.5 w-3.5" /> New</button>}
          >
            {!libraryLoaded ? <div className="mt-3 h-10 animate-pulse rounded-xl bg-[#f3efe7]" /> : savedCvs.length ? <ul className="mt-3 space-y-1.5">{savedCvs.map((item) => {
              const active = item.id === cvId
              return (
                <li key={item.id} className={`group rounded-xl border px-3 py-2 ${active ? "border-[#2f5d50] bg-[#eef4f1]" : "border-transparent bg-[#f6f3ec] hover:border-[#e0dbd1]"}`}>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => void openSaved(item.id)} className="min-w-0 flex-1 text-left">
                      <span className="flex items-center gap-1.5 truncate text-xs font-extrabold">{item.name}{active && dirty && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e0511f]" title="Unsaved changes" />}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-[#7b817a]">Edited {timeAgo(item.updatedAt)}{item.sourceFileName ? ` · from ${item.sourceFileName}` : ""}</span>
                    </button>
                    {busy === `cv-${item.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2f5d50]" /> : confirmDelete !== `cv-${item.id}` && <button type="button" onClick={() => setConfirmDelete(`cv-${item.id}`)} className="rounded-md p-1.5 text-[#9a5040] opacity-60 hover:bg-white group-hover:opacity-100" aria-label={`Delete ${item.name}`}><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div>
                  {confirmDelete === `cv-${item.id}` && <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#e6e1d7] pt-2"><span className="text-[11px] font-bold text-rose-800">Delete this CV?</span><ConfirmDelete busy={busy === `del-cv-${item.id}`} onConfirm={() => void deleteCv(item.id)} onCancel={() => setConfirmDelete(null)} /></div>}
                </li>
              )
            })}</ul> : <p className="mt-3 text-xs text-[#7b817a]">No CVs yet. Start a blank one or make one from an uploaded CV.</p>}
          </Panel>

          <Panel
            icon={<FileText className="h-4 w-4 text-[#2f5d50]" />}
            title={`Uploaded documents${documents.length ? ` · ${documents.length}` : ""}`}
            hint="Original files, stored privately"
            className={dragOver ? "border-[#2f5d50] ring-2 ring-[#2f5d50]/15" : ""}
            onDragOver={(event) => { event.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="mt-3 flex gap-2">
              <select value={uploadKind} onChange={(event) => setUploadKind(event.target.value as UploadKind)} aria-label="Document type" className="h-9 min-w-0 flex-1 rounded-lg border border-[#e0dbd1] bg-[#faf8f3] px-2 text-xs font-bold outline-none">
                <option value="auto">Detect type automatically</option>
                {DOCUMENT_KINDS.map((kind) => <option key={kind} value={kind}>{DOCUMENT_KIND_LABELS[kind]}</option>)}
              </select>
              <button type="button" disabled={stage === "uploading" || stage === "reading"} onClick={() => fileRef.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2f5d50] px-3 text-xs font-bold text-white disabled:opacity-60">{stage === "uploading" || stage === "reading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload</button>
            </div>
            {presentKinds.length > 1 && documents.length > 3 && <div className="mt-3 flex flex-wrap gap-1.5">{(["all", ...presentKinds] as const).map((kind) => <button key={kind} type="button" onClick={() => setKindFilter(kind)} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${activeFilter === kind ? "bg-[#1b231e] text-white" : "bg-[#f3efe7] text-[#596059]"}`}>{kind === "all" ? "All" : DOCUMENT_KIND_LABELS[kind]}</button>)}</div>}
            {!libraryLoaded ? <div className="mt-3 h-12 animate-pulse rounded-xl bg-[#f3efe7]" /> : visibleDocuments.length ? <ul className="mt-3 space-y-1.5">{visibleDocuments.map((doc) => {
              const Icon = KIND_ICONS[doc.kind] ?? FileIcon
              const linked = doc.kind === "cv" ? linkedCv(doc.id) : undefined
              return (
                <li key={doc.id} className="rounded-xl bg-[#f6f3ec] px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#2f5d50]"><Icon className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      {doc.hasFile
                        ? <a href={fileUrl(doc.id, "view")} target="_blank" rel="noreferrer" className="block truncate text-xs font-extrabold hover:underline" title={doc.fileName}>{doc.fileName}</a>
                        : <p className="truncate text-xs font-extrabold" title={doc.fileName}>{doc.fileName}</p>}
                      <p className="mt-0.5 truncate text-[11px] text-[#7b817a]">{DOCUMENT_KIND_LABELS[doc.kind]} · {formatBytes(doc.bytes)} · {timeAgo(doc.createdAt)}</p>
                    </div>
                  </div>
                  {confirmDelete === `doc-${doc.id}` ? <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#e6e1d7] pt-2"><span className="text-[11px] font-bold text-rose-800">Delete file?</span><ConfirmDelete busy={busy === `del-doc-${doc.id}`} onConfirm={() => void deleteDocument(doc.id)} onCancel={() => setConfirmDelete(null)} /></div> : <div className="mt-2 flex items-center gap-1">
                    {doc.kind === "cv" && <button type="button" disabled={Boolean(busy)} onClick={() => void createCvFromDocument(doc)} className="inline-flex h-7 items-center gap-1 rounded-lg bg-white px-2 text-[11px] font-extrabold text-[#2f5d50] disabled:opacity-60" title={linked ? `Open ${linked.name}` : "Create an editable CV from this file"}>{busy === `make-${doc.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FilePen className="h-3 w-3" />}{linked ? "Open its CV" : "Make editable CV"}</button>}
                    <span className="ml-auto" />
                    {doc.hasFile && <a href={fileUrl(doc.id, "view")} target="_blank" rel="noreferrer" className="rounded-md p-1.5 text-[#596059] hover:bg-white" aria-label={`Open ${doc.fileName}`} title="Open"><ExternalLink className="h-3.5 w-3.5" /></a>}
                    <a href={fileUrl(doc.id, "download")} className="rounded-md p-1.5 text-[#596059] hover:bg-white" aria-label={`Download ${doc.fileName}`} title="Download"><Download className="h-3.5 w-3.5" /></a>
                    <button type="button" onClick={() => setConfirmDelete(`doc-${doc.id}`)} className="rounded-md p-1.5 text-[#9a5040] hover:bg-white" aria-label={`Delete ${doc.fileName}`} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>}
                </li>
              )
            })}</ul> : <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 flex w-full flex-col items-center rounded-xl border border-dashed border-[#cfc8bc] px-3 py-5 text-center text-xs text-[#7b817a] hover:bg-[#faf8f3]"><Upload className="mb-1.5 h-4 w-4 text-[#2f5d50]" />Drop a CV, certificate, passport or offer letter here<span className="mt-0.5 text-[11px]">PDF, Word, text or image · up to 10 MB</span></button>}
          </Panel>
        </aside>

        <div className="min-w-0">
          {stage !== "idle" && <div className={`mb-4 overflow-hidden rounded-2xl border p-4 transition ${stage === "ready" ? "border-emerald-200 bg-emerald-50" : "border-[#c9ddd6] bg-white"}`}><div className="flex items-center gap-3">{stage === "ready" ? <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white"><Check className="h-5 w-5" /></span> : <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#dfeae6] text-[#2f5d50]"><FileText className="h-5 w-5 animate-pulse" /><span className="absolute inset-0 animate-ping rounded-full border border-[#2f5d50]/20" /></span>}<div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{stageLabel}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#dfe5e1]"><div className={`h-full rounded-full bg-[#2f5d50] transition-all duration-700 ${stage === "uploading" ? "w-1/3" : stage === "reading" ? "w-3/4 animate-pulse" : "w-full"}`} /></div></div></div></div>}
          {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</p>}
          {notice && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{notice}</p>}
          {suggestion && <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#c9ddd6] bg-[#eef4f1] p-4 sm:flex-row sm:items-center">
            <FileText className="h-5 w-5 shrink-0 text-[#2f5d50]" />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{suggestion.doc.fileName} looks like a CV</p><p className="mt-0.5 text-xs text-[#596059]">Saved to your documents. Want an editable copy to refine with AI? The original file stays unchanged.</p></div>
            <div className="flex gap-2"><button type="button" disabled={Boolean(busy)} onClick={() => void createCvFromDocument(suggestion.doc, suggestion.cvData)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2f5d50] px-3 text-xs font-extrabold text-white disabled:opacity-60">{busy === `make-${suggestion.doc.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FilePen className="h-3.5 w-3.5" />} Make editable CV</button><button type="button" onClick={() => setSuggestion(null)} className="h-9 rounded-lg px-3 text-xs font-bold text-[#596059] hover:bg-white">Keep as file only</button></div>
          </div>}

          {!cv ? <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-[#cfc8bc] bg-white/60 p-8 text-center">
            <FilePen className="h-8 w-8 text-[#2f5d50]" />
            {savedCvs[0] ? <>
              <h3 className="mt-4 font-extrabold">Pick up where you left off</h3>
              <p className="mt-2 max-w-sm text-sm text-[#6b716a]">{savedCvs[0].name} was edited {timeAgo(savedCvs[0].updatedAt)}.</p>
              <button type="button" onClick={() => void openSaved(savedCvs[0].id)} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#1b231e] px-4 text-sm font-bold text-white">{busy === `cv-${savedCvs[0].id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />} Continue editing</button>
            </> : latestCvDocument ? <>
              <h3 className="mt-4 font-extrabold">Turn your uploaded CV into an editable one</h3>
              <p className="mt-2 max-w-sm text-sm text-[#6b716a]">We will structure {latestCvDocument.fileName} into the template so you can refine it. The original stays in your documents.</p>
              <button type="button" disabled={Boolean(busy)} onClick={() => void createCvFromDocument(latestCvDocument)} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#2f5d50] px-4 text-sm font-bold text-white disabled:opacity-60">{busy === `make-${latestCvDocument.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePen className="h-4 w-4" />} Make editable CV</button>
            </> : <>
              <h3 className="mt-4 font-extrabold">Build your first CV</h3>
              <p className="mt-2 max-w-sm text-sm text-[#6b716a]">Upload an existing CV to turn it into an editable one, or start from a blank template.</p>
              <button type="button" onClick={() => fileRef.current?.click()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#2f5d50] px-4 text-sm font-bold text-white"><Upload className="h-4 w-4" /> Upload a CV</button>
            </>}
            <button type="button" onClick={() => { openEditor(emptyCv(), null, "Untitled CV", null); setNotice("") }} className="mt-2 text-xs font-bold text-[#596059] underline-offset-2 hover:underline">or start a blank CV</button>
          </div> : <div>
            <div className="mb-3 space-y-2 rounded-2xl border border-[#e0dbd1] bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 min-w-0 flex-1 rounded-xl bg-[#f6f3ec] px-3 text-sm font-bold outline-none" aria-label="CV name" />
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${dirty ? "text-[#b4451b]" : "text-[#2f5d50]"}`}>{dirty ? <><span className="h-1.5 w-1.5 rounded-full bg-[#e0511f]" />Unsaved changes</> : cvId ? <><Check className="h-3.5 w-3.5" />Saved</> : "Not saved yet"}</span>
                <button type="button" disabled={busy === "save"} onClick={() => void save()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1b231e] px-4 text-xs font-extrabold text-white disabled:opacity-60" title="Save (Ctrl/⌘ + S)">{busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
                <button type="button" onClick={downloadPdf} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#d8d2c6] px-3 text-xs font-extrabold"><Download className="h-4 w-4" /> PDF</button>
                <button type="button" onClick={closeEditor} className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#596059] hover:bg-[#f6f3ec]" aria-label="Close editor"><X className="h-4 w-4" /></button>
              </div>
              {source && <p className="px-1 text-[11px] text-[#7b817a]">Made from uploaded file{" "}{documents.some((doc) => doc.id === source.documentId && doc.hasFile) ? <a href={fileUrl(source.documentId, "view")} target="_blank" rel="noreferrer" className="font-bold text-[#2f5d50] hover:underline">{source.fileName}</a> : <span className="font-bold">{source.fileName}</span>}. Edits here never change the original.</p>}
              <div className="flex flex-col gap-2 sm:flex-row">
                <input value={instruction} onChange={(e) => setInstruction(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !busy) void runAi("edit-cv") }} placeholder="Tell AI what to improve, e.g. tailor for a nursing role in the UK" className="h-10 min-w-0 flex-1 rounded-xl border border-[#e2ddd3] px-3 text-sm outline-none focus:border-[#2f5d50]" />
                <button type="button" disabled={Boolean(busy)} onClick={() => void runAi("edit-cv")} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#c9d8d2] px-3 text-xs font-extrabold text-[#2f5d50] disabled:opacity-50">{busy === "edit-cv" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />} AI edit</button>
              </div>
              <div className="flex flex-wrap gap-1.5">{AI_PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => setInstruction(prompt)} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${instruction === prompt ? "bg-[#2f5d50] text-white" : "bg-[#f3efe7] text-[#596059] hover:bg-[#ebe6dc]"}`}>{prompt}</button>)}</div>
            </div>
            <CvPagedTemplate cv={cv} onChange={setCv} busy={busy} onAi={(action) => void runAi(action)} />
          </div>}
        </div>
      </div>
    </section>
  )
}
