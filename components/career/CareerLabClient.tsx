"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, Play, TrendingUp } from "lucide-react"
import { AssessmentsClient } from "@/components/career/AssessmentsClient"

type Tab = "simulator" | "roi" | "practice"

type SimulateResult = {
  feasibility: "High" | "Medium" | "Low"
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
  sampleTitles: string[]
}

type RoiResult = {
  targetRole: string
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
  topDemand: Array<{ skill: string; pct: number; count: number }>
}

const PRIMARY = "#2f5d50"
const field =
  "h-11 w-full rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm outline-none focus:border-[#e0511f]"

const FEASIBILITY: Record<string, string> = {
  High: "bg-emerald-100 text-emerald-900",
  Medium: "bg-amber-100 text-amber-900",
  Low: "bg-rose-100 text-rose-900",
}

export function CareerLabClient() {
  const [tab, setTab] = useState<Tab>("simulator")
  const [currentRole, setCurrentRole] = useState("Accountant")
  const [targetRole, setTargetRole] = useState("Data Analyst")
  const [skillsText, setSkillsText] = useState("Excel, financial reporting, reconciliation, stakeholder management, attention to detail")
  const [experienceYears, setExperienceYears] = useState(4)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sim, setSim] = useState<SimulateResult | null>(null)
  const [roi, setRoi] = useState<RoiResult | null>(null)
  const [learned, setLearned] = useState<string[]>([])

  const userSkills = useMemo(
    () =>
      skillsText
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    [skillsText],
  )

  async function runSimulate(extraLearn: string[] = learned) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/career-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate",
          currentRole,
          targetRole,
          userSkills,
          experienceYears,
          learnSkills: extraLearn,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Simulation failed")
      setSim(data.result)
      setTab("simulator")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed")
    } finally {
      setBusy(false)
    }
  }

  async function runRoi() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/career-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "skill-roi",
          targetRole,
          userSkills: [...userSkills, ...learned],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "ROI failed")
      setRoi(data.result)
      setTab("roi")
    } catch (err) {
      setError(err instanceof Error ? err.message : "ROI failed")
    } finally {
      setBusy(false)
    }
  }

  async function learnSkill(skill: string) {
    const next = learned.includes(skill) ? learned : [...learned, skill]
    setLearned(next)
    await runSimulate(next)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["simulator", "Career Simulator"],
            ["roi", "Skill ROI"],
            ["practice", "Work Simulation"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === id ? "bg-[#1b231e] text-white" : "bg-white text-[#4a5047] border border-[#e4dfd5]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-[#fbeae0] px-4 py-3 text-sm font-semibold text-[#7a3b24]">{error}</p>
      )}

      {(tab === "simulator" || tab === "roi") && (
        <div className="mt-6 grid gap-4 rounded-3xl border border-[#e4dfd5] bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold sm:col-span-1">
            Current role
            <input className={`${field} mt-1.5`} value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} />
          </label>
          <label className="text-sm font-semibold sm:col-span-1">
            Target role
            <input className={`${field} mt-1.5`} value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          </label>
          <label className="text-sm font-semibold">
            Years experience
            <input
              className={`${field} mt-1.5`}
              type="number"
              min={0}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void runSimulate()}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: PRIMARY }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Simulate
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void runRoi()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e4dfd5] bg-[#f6f3ec] px-3 text-sm font-bold disabled:opacity-60"
            >
              <TrendingUp className="h-4 w-4" />
              ROI
            </button>
          </div>
          <label className="text-sm font-semibold sm:col-span-2 lg:col-span-4">
            Your skills (from CV twin or manual)
            <textarea
              className="mt-1.5 min-h-20 w-full rounded-xl border border-[#e4dfd5] bg-white px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Excel, SQL, stakeholder management…"
            />
            <span className="mt-1 block text-xs text-[#7c827a]">
              Tip: build a Digital Twin on{" "}
              <Link href="/can-i-move" className="font-bold text-[#e0511f]">
                Check
              </Link>{" "}
              then paste the extracted skills here.
            </span>
          </label>
          {learned.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#7c827a]">What-if skills learned</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {learned.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      const next = learned.filter((item) => item !== skill)
                      setLearned(next)
                      void runSimulate(next)
                    }}
                    className="rounded-full bg-[#fbeae0] px-3 py-1 text-xs font-bold text-[#7a3b24]"
                  >
                    {skill} ×
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "simulator" && sim && (
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-[#e4dfd5] bg-white p-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-bold text-[#7c827a]">
                {currentRole} → {targetRole}
              </p>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${FEASIBILITY[sim.feasibility]}`}>
                Transition feasibility: {sim.feasibility}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5f655c]">{sim.analysis}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Skills transferable", `${sim.transferablePct}%`],
                ["Skills gap", `${sim.gapPct}%`],
                ["Estimated preparation", sim.estimatedPreparation],
                ["Relevant vacancies", sim.relevantVacancies.toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#f6f3ec] px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#7c827a]">{label}</p>
                  <p className="mt-1 text-2xl font-extrabold">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-[#5f655c]">
              Sponsor-relevant in sample: <strong>{sim.sponsorVacancies.toLocaleString()}</strong>
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-[#e4dfd5] bg-white p-5">
              <h3 className="font-extrabold">Typical required skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {sim.typicalRequiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      sim.haveSkills.some((have) => have.toLowerCase() === skill.toLowerCase())
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-[#f6f3ec] text-[#4a5047]"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {sim.missingSkills.length > 0 && (
                <p className="mt-3 text-sm text-[#5f655c]">
                  Missing: {sim.missingSkills.slice(0, 6).join(", ")}
                </p>
              )}
            </article>

            <article className="rounded-2xl border border-[#e4dfd5] bg-white p-5">
              <h3 className="font-extrabold">What if I learn…</h3>
              <p className="mt-1 text-sm text-[#5f655c]">Data-driven learning decisions from live vacancy demand.</p>
              <ul className="mt-4 space-y-3">
                {sim.whatIf.map((step) => (
                  <li key={step.skill} className="rounded-xl border border-[#efece4] bg-[#f6f3ec]/80 px-3 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">{step.skill}</p>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void learnSkill(step.skill)}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                        style={{ background: PRIMARY }}
                      >
                        Apply what-if
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-[#5f655c]">
                      Match {step.matchBefore}% → <strong>{step.matchAfter}%</strong>
                      {step.unlockedJobs > 0 ? ` · unlocks ~${step.unlockedJobs} more matching jobs` : ""}
                    </p>
                  </li>
                ))}
                {sim.whatIf.length === 0 && (
                  <li className="text-sm text-[#7c827a]">No major skill gaps detected against the current demand set.</li>
                )}
              </ul>
            </article>
          </div>
        </div>
      )}

      {tab === "roi" && roi && (
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-[#e4dfd5] bg-white p-6">
            <h2 className="text-2xl font-extrabold">What should I learn next?</h2>
            <p className="mt-2 text-sm text-[#5f655c]">
              Based on {roi.vacancyPool.toLocaleString()} {roi.targetRole} roles analysed in EasyMoveZone. Current
              matching pool with your skills: {roi.currentMatches.toLocaleString()}.
            </p>
          </div>
          <div className="space-y-3">
            {roi.recommendations.map((item) => (
              <article key={item.skill} className="rounded-2xl border border-[#e4dfd5] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-extrabold">{item.skill}</h3>
                    <p className="mt-1 text-sm text-[#5f655c]">
                      Required by <strong>{item.requiredByPct}%</strong> of your target jobs · You currently lack it ·
                      Effort: {item.effort}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-[#1b231e]">
                      Current matches: {item.currentMatches} → After {item.skill}: {item.afterMatches}
                    </p>
                    <p className="mt-1 text-sm text-[#e0511f] font-bold">{item.summary}</p>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void learnSkill(item.skill)}
                    className="rounded-xl px-4 py-2 text-sm font-bold text-white"
                    style={{ background: PRIMARY }}
                  >
                    Simulate learning it
                  </button>
                </div>
              </article>
            ))}
          </div>
          {roi.topDemand.length > 0 && (
            <div className="rounded-2xl border border-[#e4dfd5] bg-white p-5">
              <h3 className="font-extrabold">Top demand in this search</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {roi.topDemand.map((item) => (
                  <span key={item.skill} className="rounded-full bg-[#f6f3ec] px-3 py-1 text-xs font-bold">
                    {item.skill} · {item.pct}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "practice" && (
        <div className="mt-6">
          <p className="mb-4 max-w-2xl text-sm text-[#5f655c]">
            Timed work simulations with badges — still useful after you pick a target in the simulator.
          </p>
          <AssessmentsClient />
        </div>
      )}

      {tab === "simulator" && !sim && !busy && (
        <p className="mt-8 text-sm text-[#7c827a]">Run a simulation to see feasibility, gaps, and what-if learning paths.</p>
      )}
    </div>
  )
}
