"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ClipboardCheck,
  FileText,
  Gauge,
  Loader2,
  Plus,
  Sparkles,
  Upload,
  X,
} from "lucide-react"
import { WORLD_COUNTRIES, WORLD_COUNTRY_NAMES, getCountryBySlug } from "@/lib/mobility/countries"
import { EXAMPLE_PROFILE, writeProfile } from "@/lib/mobility/profile"
import type { EducationLevel, EnglishLevel, FamilySituation, MobilityProfile } from "@/lib/mobility/types"
import type { CheckResult } from "@/lib/check/types"

type ModuleId = "move" | "simulate" | "roi" | "twin"

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
const PRIMARY = "#e0511f"
const MAX_TARGETS = 4
const field =
  "h-11 w-full rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm outline-none focus:border-[#e0511f]"

const MODULES: Array<{ id: ModuleId; label: string; blurb: string }> = [
  { id: "twin", label: "Digital Twin", blurb: "Optional — skills behind your title from your CV" },
  { id: "move", label: "Move chances", blurb: "Immigration routes + web research for your destination" },
  { id: "simulate", label: "Career Simulator", blurb: "Optional — transition feasibility per target career" },
  { id: "roi", label: "Skill ROI", blurb: "Optional — what to learn next from live jobs" },
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

export function PathfinderClient({
  userName,
  userEmail,
}: {
  userName: string
  userEmail: string
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [sid, setSid] = useState("")
  const [draft, setDraft] = useState<MobilityProfile>({ ...EXAMPLE_PROFILE, citizenship: "Nigeria" })
  const [to, setTo] = useState("")
  const [targetRoles, setTargetRoles] = useState<string[]>(["Data Analyst"])
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
  const primaryTarget = cleanTargets[0] || draft.profession

  const skills = twin?.extractedSkills?.length
    ? twin.extractedSkills
    : draft.profession
      ? [draft.profession, "Excel", "Communication"]
      : []

  useEffect(() => {
    setSid(sessionId())
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
    if (!to) {
      setError("Choose a destination country.")
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
    const mods = MODULES.filter((m) => selected[m.id])
    if (!mods.length) {
      setError("Select at least one check — or go back and skip modules you do not need.")
      return
    }
    if (!to) {
      setError("Choose a destination country.")
      setStep(1)
      return
    }
    const roles = cleanTargets.length ? cleanTargets : draft.profession ? [draft.profession] : []
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
      setError(err instanceof Error ? err.message : "EasyMove Score failed")
    } finally {
      setRunning(false)
      setProgress("")
    }
  }

  return (
    <div style={{ background: "#efece4", color: "#1b231e" }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-[#e4dfd5] bg-white px-3 py-2 shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e0511f] text-white">
            <Gauge className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9aa097]">EasyMove</p>
            <p className="text-sm font-extrabold tracking-tight text-[#1b231e]">Score</p>
          </div>
        </div>
        <h1 className="page-title mt-4 max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl">
          Your move score, in one place.
        </h1>
        <p className="mt-2 text-sm text-[#5f655c]">
          Signed in as <strong>{userName}</strong>
          {userEmail ? ` · ${userEmail}` : ""}. Pick any country worldwide, add one or more target careers, and only run the checks you need.
        </p>

        <div className="mt-6 flex gap-2 text-sm font-bold text-[#7c827a]">
          {["You", "What to check", "Report"].map((label, index) => (
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
            <div className="grid gap-4 sm:grid-cols-2">
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
              <label className="text-sm font-semibold sm:col-span-2">
                Current role
                <input
                  className={`${field} mt-1.5`}
                  value={draft.profession}
                  placeholder="e.g. Cybersecurity analyst"
                  onChange={(e) => setField("profession", e.target.value)}
                />
              </label>

              <div className="sm:col-span-2">
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
              </div>

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
              <label className="text-sm font-semibold">
                English
                <OptionalTag />
                <select className={`${field} mt-1.5`} value={draft.englishLevel} onChange={(e) => setField("englishLevel", e.target.value as EnglishLevel)}>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="fluent">Fluent</option>
                </select>
              </label>
              <label className="text-sm font-semibold">
                Savings (GBP guide)
                <OptionalTag />
                <input className={`${field} mt-1.5`} type="number" min={0} value={draft.savingsGbp} onChange={(e) => setField("savingsGbp", Number(e.target.value))} />
                <span className="mt-1 block text-[11px] font-medium text-[#9aa097]">Used as a rough planning figure — not locked to any one country.</span>
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
                <input type="checkbox" checked={needsSponsorship} onChange={(e) => setNeedsSponsorship(e.target.checked)} />
                I need visa sponsorship{destination ? ` in ${destination.name}` : ""}
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
                <input type="checkbox" checked={draft.hasJobOffer} onChange={(e) => setField("hasJobOffer", e.target.checked)} />
                I already have a job offer there
                <OptionalTag />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
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
              </label>
            </div>

            <div className="rounded-3xl border border-[#e4dfd5] bg-white p-5">
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
              <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-[#d8d2c6] bg-[#f6f3ec] px-4 py-8 text-center">
                {uploading ? <Loader2 className="h-6 w-6 animate-spin text-[#e0511f]" /> : <FileText className="h-6 w-6 text-[#e0511f]" />}
                <span className="mt-2 text-sm font-bold">{uploading ? "Reading CV…" : cvName || "Choose PDF or DOCX"}</span>
                {cvText && <span className="mt-1 text-xs text-[#7c827a]">{cvText.length.toLocaleString()} characters extracted</span>}
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

            <button type="button" className="h-12 w-full rounded-2xl bg-[#e0511f] text-sm font-bold text-white" onClick={continueFromYou}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-[#5f655c]">
              Everything is optional except picking at least one check for this run. Turn off anything you do not need.
              {cleanTargets.length > 1 ? ` Simulator and ROI run once per target career (${cleanTargets.length}).` : ""}
            </p>
            <div className="space-y-2">
              {MODULES.map((mod) => (
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
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {running ? progress || "Running…" : "Run EasyMove Score"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-5">
            <div className="rounded-3xl border border-[#e4dfd5] bg-white p-5">
              <p className="text-sm font-bold text-[#e0511f]">
                {draft.citizenship} → {destination?.name}
                {draft.profession ? ` · ${draft.profession}` : ""}
                {cleanTargets.length ? ` → ${cleanTargets.join(" · ")}` : ""}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold">Your EasyMove Score report</h2>
            </div>

            {twin && (
              <section className="rounded-3xl border border-[#e4dfd5] bg-white p-5">
                <h3 className="text-lg font-extrabold">Digital Twin</h3>
                <p className="mt-2 text-sm text-[#5f655c]">{twin.narrative}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {twin.extractedSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-[#f6f3ec] px-3 py-1 text-xs font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {sims.map(({ role, result: sim }) => (
              <section key={role} className="rounded-3xl border border-[#e4dfd5] bg-white p-5">
                <h3 className="text-lg font-extrabold">Career Simulator · {role}</h3>
                <p className="mt-1 text-sm">
                  Feasibility: <strong>{sim.feasibility}</strong> · Transferable {sim.transferablePct}% · Gap {sim.gapPct}% · Prep{" "}
                  {sim.estimatedPreparation}
                </p>
                <p className="mt-2 text-sm text-[#5f655c]">{sim.analysis}</p>
                <p className="mt-2 text-sm text-[#5f655c]">
                  Vacancies: {sim.relevantVacancies.toLocaleString()} · Sponsor-relevant sample: {sim.sponsorVacancies.toLocaleString()}
                </p>
                {sim.whatIf.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {sim.whatIf.map((w) => (
                      <li key={w.skill} className="rounded-xl bg-[#f6f3ec] px-3 py-2 text-sm">
                        What if I learn <strong>{w.skill}</strong>? Match {w.matchBefore}% → {w.matchAfter}%
                        {w.unlockedJobs ? ` · ~${w.unlockedJobs} jobs mention it` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {rois.map(({ role, result: roi }) => (
              <section key={role} className="rounded-3xl border border-[#e4dfd5] bg-white p-5">
                <h3 className="text-lg font-extrabold">Skill ROI · {role}</h3>
                <p className="mt-1 text-sm text-[#5f655c]">
                  From {roi.vacancyPool.toLocaleString()} target roles · current matches {roi.currentMatches.toLocaleString()}
                </p>
                <ul className="mt-3 space-y-2">
                  {roi.recommendations.slice(0, 5).map((item) => (
                    <li key={item.skill} className="rounded-xl bg-[#f6f3ec] px-3 py-2 text-sm">
                      <strong>{item.skill}</strong> · required by {item.requiredByPct}% · {item.summary}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {move && (
              <section className="rounded-3xl border border-[#e4dfd5] bg-white p-5">
                <h3 className="text-lg font-extrabold">Move chances · {move.overallChance}%</h3>
                <p className="mt-1 font-bold">{move.headline}</p>
                <p className="mt-2 text-sm text-[#5f655c]">{move.summary}</p>
                <ul className="mt-3 space-y-2">
                  {move.routes.map((route) => (
                    <li key={route.name} className="rounded-xl border border-[#efece4] px-3 py-2 text-sm">
                      <strong>{route.name}</strong> · {route.likelihood}
                      <p className="mt-1 text-[#5f655c]">{route.summary}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            <p className="text-xs text-[#9aa097]">
              Sponsor registers are organised by country — open Sponsors and pick a register (UK is live; more coming).
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
