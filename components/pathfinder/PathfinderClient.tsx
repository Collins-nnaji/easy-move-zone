"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Gauge,
  Globe2,
  Loader2,
  Plus,
  Route,
  Target,
  TrendingUp,
  Upload,
  X,
} from "lucide-react"
import { WORLD_COUNTRIES, WORLD_COUNTRY_NAMES, getCountryBySlug } from "@/lib/mobility/countries"
import { EXAMPLE_PROFILE, writeProfile } from "@/lib/mobility/profile"
import type { EducationLevel, EnglishLevel, FamilySituation, MobilityProfile } from "@/lib/mobility/types"
import type { CheckResult } from "@/lib/check/types"
import { CvWorkspace } from "@/components/pathfinder/CvWorkspace"

type ModuleId = "move" | "simulate" | "roi" | "twin"
type JourneyMode = "career" | "country" | "both"
type WorkspaceView = "score" | "cvs"

type TwinResult = {
  officialTitle: string
  extractedSkills: string[]
  capabilities: string[]
  tools: string[]
  narrative: string
  occupationOverlaps: Array<{ title: string; overlapPct: number; why: string }>
}

type SimulateResult = {
  feasibility: string
  transferablePct: number
  gapPct: number
  estimatedPreparation: string
  typicalRequiredSkills: string[]
  relevantVacancies: number
  sponsorVacancies: number
  haveSkills: string[]
  missingSkills: string[]
  analysis: string
  whatIf: Array<{ skill: string; matchBefore: number; matchAfter: number; unlockedJobs: number }>
}

type RoiResult = {
  vacancyPool: number
  currentMatches: number
  recommendations: Array<{
    skill: string
    requiredByPct: number
    effort: string
    currentMatches: number
    afterMatches: number
    unlockedJobs: number
    summary: string
  }>
}

type RoleSim = { role: string; result: SimulateResult }
type RoleRoi = { role: string; result: RoiResult }

const SESSION_KEY = "emz.pathfinder.session.v1"
const TWIN_KEY = "emz.career.twin.skills.v1"
const PRIMARY = "#2f5d50"
const MAX_TARGETS = 4
const field =
  "h-11 w-full rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm outline-none focus:border-[#e0511f]"

const MODULES: Array<{ id: ModuleId; label: string; blurb: string }> = [
  { id: "twin", label: "Digital Twin", blurb: "Optional — skills behind your title from your CV" },
  { id: "move", label: "Move chances", blurb: "Immigration routes + web research for your destination" },
  { id: "simulate", label: "Career Simulator", blurb: "Optional — transition feasibility per target career" },
  { id: "roi", label: "Skill ROI", blurb: "Optional — what to learn next from live jobs" },
]

const JOURNEYS: Array<{ id: JourneyMode; title: string; body: string; icon: typeof BriefcaseBusiness }> = [
  { id: "career", title: "Move careers", body: "Assess a career change without planning an international move.", icon: BriefcaseBusiness },
  { id: "country", title: "Move countries", body: "Keep your career direction and focus on relocation routes and readiness.", icon: Globe2 },
  { id: "both", title: "Move countries + careers", body: "Test a new career and destination as one connected plan.", icon: Route },
]

function sessionId() {
  if (typeof window === "undefined") return ""
  let id = window.localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    window.localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function OptionalTag() {
  return <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9aa097]">Optional</span>
}

export function PathfinderClient() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("score")
  const [journey, setJourney] = useState<JourneyMode | null>(null)
  const [sid, setSid] = useState("")
  const [draft, setDraft] = useState<MobilityProfile>({ ...EXAMPLE_PROFILE, citizenship: "Nigeria" })
  const [to, setTo] = useState("")
  const [targetRoles, setTargetRoles] = useState<string[]>([])
  const [roleDraft, setRoleDraft] = useState("")
  const [needsSponsorship, setNeedsSponsorship] = useState(true)
  const [selected, setSelected] = useState<Record<ModuleId, boolean>>({
    twin: true,
    move: true,
    simulate: true,
    roi: false,
  })
  const [cvName, setCvName] = useState<string | null>(null)
  const [cvText, setCvText] = useState("")
  const [documentIds, setDocumentIds] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState("")

  const [twin, setTwin] = useState<TwinResult | null>(null)
  const [move, setMove] = useState<CheckResult | null>(null)
  const [sims, setSims] = useState<RoleSim[]>([])
  const [rois, setRois] = useState<RoleRoi[]>([])

  const destination = useMemo(() => getCountryBySlug(to), [to])
  const cleanTargets = useMemo(
    () => [...new Set(targetRoles.map((r) => r.trim()).filter(Boolean))].slice(0, MAX_TARGETS),
    [targetRoles],
  )
  const needsCountry = journey === "country" || journey === "both"
  const needsCareer = journey === "career" || journey === "both"
  const activeTargets = needsCareer ? cleanTargets : []
  const primaryTarget = activeTargets[0] || draft.profession
  const availableModules = MODULES.filter((module) => {
    if (journey === "career") return module.id !== "move"
    if (journey === "country") return module.id === "move" || module.id === "twin"
    return true
  })

  const skills = twin?.extractedSkills?.length
    ? twin.extractedSkills
    : draft.profession
      ? [draft.profession, "Excel", "Communication"]
      : []

  useEffect(() => {
    setSid(sessionId())
    const view = new URLSearchParams(window.location.search).get("view")
    if (view === "cvs" || window.location.hash === "#cv-workspace") setWorkspaceView("cvs")
  }, [])

  function setField<K extends keyof MobilityProfile>(key: K, value: MobilityProfile[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function addTargetRole() {
    const next = roleDraft.trim()
    if (!next) return
    setTargetRoles((current) => {
      const merged = [...new Set([...current.map((r) => r.trim()).filter(Boolean), next])]
      return merged.slice(0, MAX_TARGETS)
    })
    setRoleDraft("")
  }

  function removeTargetRole(role: string) {
    setTargetRoles((current) => current.filter((item) => item !== role))
  }

  function continueFromYou() {
    setError(null)
    if (!journey) {
      setError("Choose the kind of move you want to assess.")
      return
    }
    if (needsCountry && !to) {
      setError("Choose a destination country.")
      return
    }
    if (!draft.profession.trim() && (needsCareer || journey === "country")) {
      setError("Add your current role so we can assess your experience.")
      return
    }
    if (needsCareer && cleanTargets.length === 0) {
      setError("Add at least one target career.")
      return
    }
    if (!draft.profession.trim() && cleanTargets.length === 0) {
      setError("Add your current role or at least one target career.")
      return
    }
    setStep(2)
  }

  async function onUpload(file: File | null) {
    if (!file || !sid) return
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.set("cvFile", file)
      form.set("sessionId", sid)
      form.set("kind", "cv")
      form.set("persist", "1")
      const res = await fetch("/api/documents/extract", {
        method: "POST",
        headers: { "x-check-session": sid },
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not read CV")
      setCvName(file.name)
      setCvText(String(data.text || ""))
      if (data.documentId) setDocumentIds([String(data.documentId)])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function runPathfinder() {
    const mods = availableModules.filter((m) => selected[m.id])
    if (!mods.length) {
      setError("Select at least one check — or go back and skip modules you do not need.")
      return
    }
    if (needsCountry && !to) {
      setError("Choose a destination country.")
      setStep(1)
      return
    }
    const roles = activeTargets.length ? activeTargets : draft.profession ? [draft.profession] : []
    if (!roles.length && !draft.profession.trim()) {
      setError("Add at least one target career or your current role.")
      setStep(1)
      return
    }

    setRunning(true)
    setError(null)
    setTwin(null)
    setMove(null)
    setSims([])
    setRois([])

    try {
      let twinSkills = skills
      let twinResult: TwinResult | null = null

      if (selected.twin || selected.simulate || selected.roi) {
        setProgress("Building your Digital Twin…")
        const res = await fetch("/api/career-lab", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-check-session": sid },
          body: JSON.stringify({
            action: "twin",
            sessionId: sid,
            officialTitle: draft.profession,
            experienceText: cvText || `${draft.profession}. Targets: ${roles.join(", ")}.`,
            documentIds,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Twin failed")
        twinResult = data.result
        twinSkills = data.result?.extractedSkills?.length ? data.result.extractedSkills : twinSkills
        if (selected.twin) setTwin(twinResult)
        window.localStorage.setItem(TWIN_KEY, JSON.stringify(data.result))
      }

      if (selected.move) {
        setProgress("Researching move chances…")
        const res = await fetch("/api/check/assess", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-check-session": sid },
          body: JSON.stringify({
            sessionId: sid,
            documentIds,
            profile: {
              fromCountry: draft.citizenship,
              toCountry: destination?.name || to,
              toSlug: to,
              currentRole: draft.profession,
              targetRole: roles[0] || draft.profession,
              targetRoles: roles,
              age: draft.age,
              experienceYears: draft.experienceYears,
              education: draft.education,
              englishLevel: draft.englishLevel,
              savingsGbp: draft.savingsGbp,
              family: draft.family,
              needsSponsorship,
              hasJobOffer: draft.hasJobOffer,
            },
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Move check failed")
        setMove(data.result)
      }

      if (selected.simulate) {
        const simResults: RoleSim[] = []
        for (let i = 0; i < roles.length; i += 1) {
          const role = roles[i]
          setProgress(`Running Career Simulator (${i + 1}/${roles.length}): ${role}…`)
          const res = await fetch("/api/career-lab", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "simulate",
              currentRole: draft.profession,
              targetRole: role,
              userSkills: twinSkills,
              experienceYears: draft.experienceYears,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || `Simulation failed for ${role}`)
          simResults.push({ role, result: data.result })
        }
        setSims(simResults)
      }

      if (selected.roi) {
        const roiResults: RoleRoi[] = []
        for (let i = 0; i < roles.length; i += 1) {
          const role = roles[i]
          setProgress(`Calculating Skill ROI (${i + 1}/${roles.length}): ${role}…`)
          const res = await fetch("/api/career-lab", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "skill-roi",
              targetRole: role,
              userSkills: twinSkills,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || `ROI failed for ${role}`)
          roiResults.push({ role, result: data.result })
        }
        setRois(roiResults)
      }

      writeProfile({
        ...draft,
        currentCountry: draft.citizenship,
        profession: primaryTarget || draft.profession,
      })
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your workspace analysis failed")
    } finally {
      setRunning(false)
      setProgress("")
    }
  }

  function chooseJourney(next: JourneyMode) {
    setJourney(next)
    setError(null)
    if (next === "career") {
      setSelected({ twin: true, move: false, simulate: true, roi: true })
    } else if (next === "country") {
      setSelected({ twin: false, move: true, simulate: false, roi: false })
    } else {
      setSelected({ twin: true, move: true, simulate: true, roi: true })
    }
  }

  const reportScore = move?.overallChance ?? (sims.length
    ? Math.round(sims.reduce((sum, item) => sum + item.result.transferablePct, 0) / sims.length)
    : null)

  return (
    <div style={{ background: "#efece4", color: "#1b231e" }}>
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 sm:py-4 lg:py-5">
        <h1 className="page-title max-w-2xl text-2xl font-extrabold tracking-tight sm:text-4xl">
          Everything for your next move, in one workspace.
        </h1>

        <div className="mt-4 grid gap-2 rounded-2xl border border-[#ddd7cb] bg-white/70 p-2 sm:grid-cols-2">
          {([
            ["score", "Plan & score", Gauge],
            ["cvs", "CVs & documents", FileText],
          ] as const).map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setWorkspaceView(id)} className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition ${workspaceView === id ? "bg-[#1b231e] text-white shadow-sm" : "text-[#596059] hover:bg-white"}`}><Icon className="h-4 w-4" />{label}</button>)}
        </div>

        {workspaceView === "score" && <>
        <div className="mt-6 flex gap-2 text-sm font-bold text-[#7c827a]">
          {["Your direction", "Choose analysis", "Action report"].map((label, index) => (
            <span key={label} className={step === index + 1 ? "text-[#e0511f]" : undefined}>
              {index + 1}. {label}
            </span>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-2xl bg-[#fbeae0] px-4 py-3 text-sm font-semibold text-[#7a3b24]">{error}</p>
        )}

        {step === 1 && (
          <div className="mt-6 space-y-4">
            <div>
              <p className="mb-3 text-sm font-extrabold">What are you planning?</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {JOURNEYS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => chooseJourney(option.id)}
                    className={`rounded-2xl border p-4 text-left transition ${journey === option.id ? "border-[#e0511f] bg-white shadow-md ring-2 ring-[#e0511f]/10" : "border-[#ded8cc] bg-white/65 hover:bg-white"}`}
                  >
                    <option.icon className={`h-5 w-5 ${journey === option.id ? "text-[#e0511f]" : "text-[#70766f]"}`} />
                    <span className="mt-3 block text-sm font-extrabold">{option.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#747a73]">{option.body}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`${journey ? "grid" : "hidden"} gap-4 rounded-3xl border border-[#e4dfd5] bg-white/55 p-4 sm:grid-cols-2 sm:p-5`}>
              {needsCountry && (<>
              <label className="text-sm font-semibold">
                From
                <select className={`${field} mt-1.5`} value={draft.citizenship} onChange={(e) => setField("citizenship", e.target.value)}>
                  {WORLD_COUNTRY_NAMES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                To
                <select className={`${field} mt-1.5`} value={to} onChange={(e) => setTo(e.target.value)}>
                  <option value="">Choose destination…</option>
                  {WORLD_COUNTRIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              </>)}
              <label className="text-sm font-semibold sm:col-span-2">
                Current role <span className="text-[#e0511f]">*</span>
                <input
                  className={`${field} mt-1.5`}
                  value={draft.profession}
                  placeholder="e.g. Cybersecurity analyst"
                  onChange={(e) => setField("profession", e.target.value)}
                />
              </label>

              {needsCareer && <div className="sm:col-span-2">
                <p className="text-sm font-semibold">
                  Target career(s)
                  <span className="ml-1.5 text-[11px] font-semibold text-[#7c827a]">up to {MAX_TARGETS} · add as many as you are considering</span>
                </p>
                {cleanTargets.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cleanTargets.map((role, index) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#1b231e] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        {index === 0 ? "Primary · " : ""}
                        {role}
                        <button
                          type="button"
                          aria-label={`Remove ${role}`}
                          onClick={() => removeTargetRole(role)}
                          className="rounded-full p-0.5 hover:bg-white/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <input
                    className={`${field} min-w-0 flex-1`}
                    value={roleDraft}
                    placeholder={cleanTargets.length ? "Add another target career" : "e.g. Data Analyst, Product Manager"}
                    disabled={cleanTargets.length >= MAX_TARGETS}
                    onChange={(e) => setRoleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTargetRole()
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={!roleDraft.trim() || cleanTargets.length >= MAX_TARGETS}
                    onClick={addTargetRole}
                    className="inline-flex h-11 shrink-0 items-center gap-1 rounded-xl border border-[#ded7cb] bg-white px-3 text-sm font-bold disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>}

              <label className="text-sm font-semibold">
                Experience (years)
                <input className={`${field} mt-1.5`} type="number" min={0} value={draft.experienceYears} onChange={(e) => setField("experienceYears", Number(e.target.value))} />
              </label>
              <label className="text-sm font-semibold">
                Education
                <OptionalTag />
                <select className={`${field} mt-1.5`} value={draft.education} onChange={(e) => setField("education", e.target.value as EducationLevel)}>
                  <option value="secondary">Secondary</option>
                  <option value="bachelor">Bachelor&apos;s</option>
                  <option value="master">Master&apos;s</option>
                  <option value="phd">Doctorate</option>
                </select>
              </label>
              {needsCountry && <label className="text-sm font-semibold">
                English
                <OptionalTag />
                <select className={`${field} mt-1.5`} value={draft.englishLevel} onChange={(e) => setField("englishLevel", e.target.value as EnglishLevel)}>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="fluent">Fluent</option>
                </select>
              </label>}
              {needsCountry && <label className="text-sm font-semibold">
                Savings (GBP guide)
                <OptionalTag />
                <input className={`${field} mt-1.5`} type="number" min={0} value={draft.savingsGbp} onChange={(e) => setField("savingsGbp", Number(e.target.value))} />
                <span className="mt-1 block text-[11px] font-medium text-[#9aa097]">Used as a rough planning figure — not locked to any one country.</span>
              </label>}
              {needsCountry && <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
                <input type="checkbox" checked={needsSponsorship} onChange={(e) => setNeedsSponsorship(e.target.checked)} />
                I need visa sponsorship{destination ? ` in ${destination.name}` : ""}
              </label>}
              {needsCountry && <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
                <input type="checkbox" checked={draft.hasJobOffer} onChange={(e) => setField("hasJobOffer", e.target.checked)} />
                I already have a job offer there
                <OptionalTag />
              </label>}
              {needsCountry && <label className="text-sm font-semibold sm:col-span-2">
                Household
                <OptionalTag />
                <select
                  className={`${field} mt-1.5`}
                  value={draft.family}
                  onChange={(e) => {
                    const family = e.target.value as FamilySituation
                    setDraft((c) => ({ ...c, family, familySize: family === "single" ? 1 : family === "couple" ? 2 : 3 }))
                  }}
                >
                  <option value="single">Just me</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                </select>
              </label>}
            </div>

            <div className={`${journey ? "block" : "hidden"} rounded-3xl border border-[#e4dfd5] bg-white p-5`}>
              <div className="flex items-start gap-2">
                <Upload className="mt-0.5 h-5 w-5 text-[#e0511f]" />
                <div>
                  <h2 className="font-extrabold">
                    CV upload
                    <OptionalTag />
                  </h2>
                  <p className="mt-1 text-sm text-[#5f655c]">
                    Improves Digital Twin and move checking. PDF / DOCX — skip if you prefer form-only.
                  </p>
                </div>
              </div>
              <label className={`mt-4 flex cursor-pointer flex-col items-center overflow-hidden rounded-2xl border border-dashed px-4 py-8 text-center transition ${uploading ? "border-[#8db5a8] bg-[#edf5f2]" : cvText ? "border-emerald-300 bg-emerald-50/60" : "border-[#d8d2c6] bg-[#f6f3ec]"}`}>
                {uploading ? <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2f5d50] shadow-sm"><FileText className="h-5 w-5 animate-pulse" /><span className="absolute inset-0 animate-ping rounded-full border border-[#2f5d50]/25" /></span> : cvText ? <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white"><CheckCircle2 className="h-5 w-5" /></span> : <FileText className="h-6 w-6 text-[#2f5d50]" />}
                <span className="mt-3 text-sm font-bold">{uploading ? "Uploading, reading and structuring your CV…" : cvText ? `${cvName || "CV"} is ready` : cvName || "Choose PDF or DOCX"}</span>
                {uploading && <span className="mt-3 flex gap-1" aria-hidden>{[0, 1, 2].map((dot) => <span key={dot} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#2f5d50]" style={{ animationDelay: `${dot * 120}ms` }} />)}</span>}
                {cvText && !uploading && <span className="mt-1 text-xs font-semibold text-emerald-700">Uploaded and read · {cvText.length.toLocaleString()} characters extracted</span>}
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    void onUpload(e.target.files?.[0] ?? null)
                    e.target.value = ""
                  }}
                />
              </label>
            </div>

            <button type="button" className={`${journey ? "block" : "hidden"} h-12 w-full rounded-2xl bg-[#e0511f] text-sm font-bold text-white`} onClick={continueFromYou}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-[#e4dfd5] bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#e0511f]">Selected plan</p>
              <p className="mt-1 text-sm font-extrabold">{JOURNEYS.find((item) => item.id === journey)?.title}</p>
            </div>
            <p className="text-sm leading-relaxed text-[#5f655c]">
              We have preselected the most useful analysis for this plan. Adjust it if you want a lighter or deeper report.
              {activeTargets.length > 1 ? ` Simulator and ROI run once per target career (${activeTargets.length}).` : ""}
            </p>
            <div className="space-y-2">
              {availableModules.map((mod) => (
                <label
                  key={mod.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${
                    selected[mod.id] ? "border-[#e0511f]/40 bg-white" : "border-[#e4dfd5] bg-white/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 accent-[#e0511f]"
                    checked={selected[mod.id]}
                    onChange={(e) => setSelected((c) => ({ ...c, [mod.id]: e.target.checked }))}
                  />
                  <span>
                    <span className="block text-sm font-bold">{mod.label}</span>
                    <span className="block text-xs text-[#7c827a]">{mod.blurb}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" className="h-12 rounded-2xl border border-[#d8d2c6] bg-white px-5 text-sm font-semibold" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                disabled={running}
                onClick={() => void runPathfinder()}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: PRIMARY }}
              >
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
                {running ? progress || "Running…" : "Build my plan"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-4">
            <section className="overflow-hidden rounded-3xl bg-[#1b231e] text-white shadow-xl shadow-[#1b231e]/10">
              <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#9bc2b5]">Your action report</p>
                  <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{JOURNEYS.find((item) => item.id === journey)?.title}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                    {needsCountry ? `${draft.citizenship} → ${destination?.name || "Destination"}` : "Career transition"}
                    {draft.profession ? ` · From ${draft.profession}` : ""}
                    {activeTargets.length ? ` · Toward ${activeTargets.join(", ")}` : ""}
                  </p>
                </div>
                {reportScore !== null && (
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[7px] border-[#e0511f] bg-white/5">
                    <span className="text-3xl font-extrabold">{reportScore}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-white/60">{move ? "move score" : "skill match"}</span>
                  </div>
                )}
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-3">
              {move && <div className="rounded-2xl border border-[#e4dfd5] bg-white p-4"><Globe2 className="h-4 w-4 text-[#e0511f]" /><p className="mt-3 text-2xl font-extrabold">{move.routes.length}</p><p className="text-xs font-semibold text-[#757b74]">routes assessed</p></div>}
              {sims.length > 0 && <div className="rounded-2xl border border-[#e4dfd5] bg-white p-4"><Target className="h-4 w-4 text-[#e0511f]" /><p className="mt-3 text-2xl font-extrabold">{sims.length}</p><p className="text-xs font-semibold text-[#757b74]">careers compared</p></div>}
              {rois.length > 0 && <div className="rounded-2xl border border-[#e4dfd5] bg-white p-4"><TrendingUp className="h-4 w-4 text-[#e0511f]" /><p className="mt-3 text-2xl font-extrabold">{rois.reduce((sum, item) => sum + item.result.recommendations.length, 0)}</p><p className="text-xs font-semibold text-[#757b74]">skill opportunities</p></div>}
              {twin && <div className="rounded-2xl border border-[#e4dfd5] bg-white p-4"><BarChart3 className="h-4 w-4 text-[#e0511f]" /><p className="mt-3 text-2xl font-extrabold">{twin.extractedSkills.length}</p><p className="text-xs font-semibold text-[#757b74]">skills evidenced</p></div>}
            </div>

            {move && (
              <section className="rounded-3xl border border-[#e4dfd5] bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fbe8dd] text-[#e0511f]"><Globe2 className="h-4 w-4" /></span><div><h3 className="font-extrabold">Country move outlook</h3><p className="mt-1 text-sm font-bold text-[#e0511f]">{move.headline}</p></div></div>
                <p className="mt-4 text-sm leading-relaxed text-[#60665f]">{move.summary}</p>
                <div className="mt-5 space-y-2">
                  {move.routes.map((route) => (
                    <details key={route.name} className="group rounded-2xl bg-[#f7f4ee] px-4 py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold"><span>{route.name} <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${route.likelihood === "strong" ? "bg-emerald-100 text-emerald-800" : route.likelihood === "possible" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>{route.likelihood}</span></span><ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary>
                      <p className="mt-3 text-sm leading-relaxed text-[#626861]">{route.summary}</p>
                      {route.nextSteps.length > 0 && <ul className="mt-3 space-y-1.5">{route.nextSteps.slice(0, 3).map((item) => <li key={item} className="flex gap-2 text-xs text-[#555b55]"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e0511f]" />{item}</li>)}</ul>}
                    </details>
                  ))}
                </div>
              </section>
            )}

            {sims.map(({ role, result: sim }) => (
              <section key={role} className="rounded-3xl border border-[#e4dfd5] bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-[#e0511f]">Career fit</p><h3 className="mt-1 text-lg font-extrabold">{role}</h3></div><span className="self-start rounded-full bg-[#1b231e] px-3 py-1.5 text-xs font-bold text-white">{sim.feasibility}</span></div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-[#f7f4ee] p-3"><p className="text-xl font-extrabold">{sim.transferablePct}%</p><p className="text-[10px] font-bold text-[#777d76]">transferable</p></div><div className="rounded-xl bg-[#f7f4ee] p-3"><p className="text-xl font-extrabold">{sim.gapPct}%</p><p className="text-[10px] font-bold text-[#777d76]">skill gap</p></div><div className="rounded-xl bg-[#f7f4ee] p-3"><p className="text-sm font-extrabold">{sim.estimatedPreparation}</p><p className="text-[10px] font-bold text-[#777d76]">preparation</p></div></div>
                <p className="mt-4 text-sm leading-relaxed text-[#60665f]">{sim.analysis}</p>
                {sim.whatIf.length > 0 && <details className="group mt-4 rounded-2xl border border-[#ece7dd] px-4 py-3"><summary className="flex cursor-pointer list-none items-center justify-between text-sm font-extrabold">Highest-impact skill scenarios <ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary><div className="mt-3 space-y-2">{sim.whatIf.map((item) => <div key={item.skill} className="rounded-xl bg-[#f7f4ee] p-3 text-xs"><strong>{item.skill}</strong><span className="ml-2 text-[#626861]">{item.matchBefore}% → {item.matchAfter}% match{item.unlockedJobs ? ` · ~${item.unlockedJobs} jobs` : ""}</span></div>)}</div></details>}
              </section>
            ))}

            {rois.map(({ role, result: roi }) => (
              <section key={role} className="rounded-3xl border border-[#e4dfd5] bg-white p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[#e0511f]">Best skill investment</p><h3 className="mt-1 text-lg font-extrabold">{role}</h3><p className="mt-1 text-xs text-[#747a73]">Based on {roi.vacancyPool.toLocaleString()} relevant roles</p>
                <div className="mt-4 space-y-3">{roi.recommendations.slice(0, 4).map((item, index) => <div key={item.skill} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbe8dd] text-xs font-extrabold text-[#e0511f]">{index + 1}</span><div><p className="text-sm font-extrabold">{item.skill}</p><p className="line-clamp-1 text-xs text-[#727871]">{item.summary}</p></div><span className="text-xs font-bold text-[#626861]">{item.requiredByPct}% demand</span></div>)}</div>
              </section>
            ))}

            {twin && <details className="group rounded-3xl border border-[#e4dfd5] bg-white p-5"><summary className="flex cursor-pointer list-none items-center justify-between"><span className="font-extrabold">Your evidence profile · {twin.officialTitle}</span><ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary><p className="mt-4 text-sm leading-relaxed text-[#60665f]">{twin.narrative}</p><div className="mt-3 flex flex-wrap gap-2">{twin.extractedSkills.map((skill) => <span key={skill} className="rounded-full bg-[#f6f3ec] px-3 py-1 text-xs font-bold">{skill}</span>)}</div></details>}

            {move?.gaps?.length ? <details className="group rounded-3xl border border-[#f0d9ca] bg-[#fff8f3] p-5"><summary className="flex cursor-pointer list-none items-center justify-between"><span className="flex items-center gap-2 font-extrabold"><AlertTriangle className="h-4 w-4 text-[#e0511f]" /> Readiness gaps ({move.gaps.length})</span><ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary><div className="mt-4 space-y-3">{move.gaps.map((gap) => <div key={gap.area} className="rounded-xl bg-white p-3 text-sm"><strong>{gap.area}</strong><p className="mt-1 text-xs leading-relaxed text-[#626861]">{gap.detail}</p><p className="mt-2 text-xs font-bold text-[#e0511f]">Next: {gap.howToFix}</p></div>)}</div></details> : null}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#d8d2c6] bg-white px-5 text-sm font-semibold sm:w-auto"
                onClick={() => setStep(2)}
              >
                Change checks & re-run
              </button>
              <Link
                href="/sponsors"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#e0511f] px-5 text-sm font-bold text-white sm:w-auto"
              >
                Find sponsors
              </Link>
              <Link href="/jobs" className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#d8d2c6] bg-white px-5 text-sm font-semibold sm:w-auto">
                Browse jobs
              </Link>
              <Link href="/work-simulation" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white px-5 text-sm font-semibold sm:w-auto">
                <ClipboardCheck className="h-4 w-4" />
                Work Simulation
              </Link>
            </div>
          </div>
        )}
        </>}
        {workspaceView === "cvs" && <CvWorkspace />}
      </div>
    </div>
  )
}
