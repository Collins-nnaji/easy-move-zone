"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  ListChecks,
  Loader2,
  Search,
  ShieldCheck,
  Target,
  Wrench,
} from "lucide-react"

type Role = {
  id: string
  title: string
  category: string
  categoryLabel: string
  description: string
  coreSkills: string[]
  toolOptions: string[]
  focusOptions: string[]
  questionCount: number
}

type Question = {
  id: string
  prompt: string
  options: Array<{ id: string; text: string }>
}

type Badge = {
  roleKey: string
  roleTitle: string
  category: string | null
  tier: string
  bestScore: number
  latestScore: number
  attempts: number
  earnedAt: string | null
}

type Attempt = {
  id: string
  roleKey: string
  roleTitle: string
  score: number
  tier: string | null
  createdAt: string
}

type View = "roles" | "badges" | "progress"

const PRIMARY = "#e0511f"
const INK = "#1b231e"
const TIER_STYLE: Record<string, string> = {
  gold: "bg-amber-100 text-amber-900",
  silver: "bg-slate-200 text-slate-800",
  bronze: "bg-orange-100 text-orange-900",
}

const ROLES_PER_PAGE = 12

export function AssessmentsClient() {
  const [view, setView] = useState<View>("roles")
  const [roles, setRoles] = useState<Role[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; label: string; count: number }>>([])
  const [levels, setLevels] = useState<Array<{ id: string; label: string }>>([])
  const [category, setCategory] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [seniority, setSeniority] = useState("mid")
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedFocus, setSelectedFocus] = useState<string[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [taking, setTaking] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ score: number; tier: string | null; saved: boolean; roleTitle: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    void fetch("/api/assessments")
      .then((res) => res.json())
      .then((data) => {
        setRoles(data.roles ?? [])
        setCategories(data.categories ?? [])
        setLevels(data.levels ?? [])
        if (!selectedId && data.roles?.[0]) setSelectedId(data.roles[0].id)
      })
      .catch(() => setError("Could not load assessments."))
    void refreshUserData()
  }, [])

  async function refreshUserData() {
    try {
      const [badgeRes, progressRes] = await Promise.all([
        fetch("/api/assessments?badges=1"),
        fetch("/api/assessments?progress=1"),
      ])
      const badgeData = await badgeRes.json()
      const progressData = await progressRes.json()
      setBadges(badgeData.badges ?? [])
      setAttempts(progressData.attempts ?? [])
    } catch {
      /* signed-out is fine */
    }
  }

  const selected = roles.find((role) => role.id === selectedId) ?? null

  useEffect(() => {
    if (!selected) return
    setSelectedTools(selected.toolOptions.slice(0, 3))
    setSelectedFocus(selected.focusOptions.slice(0, 2))
    setSeniority("mid")
  }, [selected?.id])

  const filtered = useMemo(() => {
    return roles.filter((role) => {
      if (category && role.category !== category) return false
      if (!query.trim()) return true
      const hay = `${role.title} ${role.description} ${role.coreSkills.join(" ")}`.toLowerCase()
      return hay.includes(query.trim().toLowerCase())
    })
  }, [roles, category, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROLES_PER_PAGE))
  const pageRoles = filtered.slice((page - 1) * ROLES_PER_PAGE, page * ROLES_PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [category, query])

  function toggle(list: string[], value: string, setList: (next: string[]) => void) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  async function startAssessment(role: Role) {
    setBusy(true)
    setError(null)
    setResult(null)
    setAnswers({})
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", roleId: role.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not start")
      setSelectedId(role.id)
      setAttemptId(data.attemptId)
      setQuestions(data.questions ?? [])
      setTaking(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start")
    } finally {
      setBusy(false)
    }
  }

  async function submit() {
    if (!attemptId) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", attemptId, answers }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not score")
      setResult({ score: data.score, tier: data.tier, saved: data.saved, roleTitle: data.roleTitle })
      await refreshUserData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not score")
    } finally {
      setBusy(false)
    }
  }

  const viewSwitch = (
    <div className="flex flex-wrap gap-1">
      {([
        ["roles", "Roles", ListChecks],
        ["badges", badges.length ? `Badges (${badges.length})` : "Badges", ShieldCheck],
        ["progress", "Progress", BarChart3],
      ] as const).map(([id, label, Icon]) => (
        <button
          key={id}
          type="button"
          onClick={() => { setView(id); setTaking(false); setResult(null) }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
            view === id
              ? "bg-[#1b231e] text-white"
              : "bg-white/80 text-[#5f655c] ring-1 ring-[#e4dfd5] hover:text-[#1b231e]"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  )

  const pageHeader = (
    <div className="mx-auto w-full max-w-[1600px] px-3 pt-5 sm:px-5 lg:px-6">
      <p className="text-sm font-extrabold tracking-tight" style={{ color: PRIMARY }}>
        Work Simulation
      </p>
      <h1 className="page-title mt-1 max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl">
        Prove the role with a timed simulation.
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm text-[#5f655c]">
        Pick a role, run the assessment, earn a badge for your transition.
      </p>
      <div className="mt-4">{viewSwitch}</div>
    </div>
  )

  if (taking && selected && questions.length > 0) {
    return (
      <div className="bg-[#efece4] pb-12" style={{ color: INK }}>
        <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setTaking(false); setResult(null); setQuestions([]) }}
              className="inline-flex items-center gap-1 rounded-xl border border-[#e4dfd5] bg-white px-3 py-2 text-xs font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Roles
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold sm:text-lg">{selected.title}</h1>
              <p className="text-[11px] text-[#7c827a]">{questions.length} questions · 60%+ earns a badge</p>
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6">
            {result ? (
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: PRIMARY }}>Score</p>
                <p className="mt-1 text-4xl font-extrabold">{result.score}%</p>
                <p className="mt-2 text-sm text-[#5f655c]">
                  {result.tier
                    ? `You earned a ${result.tier} badge for ${result.roleTitle}.`
                    : "Below 60%. Review the role skills and try again — a weaker retake never removes a badge."}
                </p>
                {!result.saved && (
                  <p className="mt-3 text-sm font-semibold">
                    <Link href="/auth?redirect=/work-simulation" className="text-[#e0511f]">Sign in</Link> to keep the badge on your profile.
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => { setTaking(false); setResult(null); setView("badges") }} className="rounded-xl bg-[#1b231e] px-4 py-2 text-sm font-bold text-white">
                    View badges
                  </button>
                  <button type="button" onClick={() => { setTaking(false); setResult(null) }} className="rounded-xl border border-[#ded7cb] px-4 py-2 text-sm font-bold">
                    Test another role
                  </button>
                </div>
              </div>
            ) : (
              <>
                {questions.map((question, index) => (
                  <fieldset key={question.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <legend className="text-sm font-bold">{index + 1}. {question.prompt}</legend>
                    <div className="mt-3 space-y-2">
                      {question.options.map((option) => (
                        <label key={option.id} className="flex cursor-pointer items-start gap-2 rounded-xl border border-[#efece4] px-3 py-2 text-sm">
                          <input
                            type="radio"
                            name={question.id}
                            checked={answers[question.id] === option.id}
                            onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                          />
                          <span>{option.text}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
                {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}
                <button
                  type="button"
                  disabled={busy || Object.keys(answers).length < questions.length}
                  onClick={() => void submit()}
                  className="inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: PRIMARY }}
                >
                  {busy ? "Scoring…" : "Submit assessment"}
                </button>
              </>
            )}
        </div>
      </div>
    )
  }

  if (view === "progress") {
    const best = attempts.length ? Math.max(...attempts.map((item) => item.score)) : null
    const average = attempts.length
      ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length)
      : null
    return (
      <div className="bg-[#efece4] pb-10" style={{ color: INK }}>
        {pageHeader}
        <div className="mx-auto max-w-[1600px] px-3 pt-6 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Your assessment progress</h2>
              <p className="mt-1 max-w-2xl text-sm text-[#5f655c]">Compare scores over time and see which roles you still need to prove.</p>
            </div>
            <button type="button" onClick={() => setView("roles")} className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-bold text-white" style={{ background: PRIMARY }}>
              New assessment <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#e4dfd5] bg-[#e4dfd5] sm:grid-cols-4">
            {[
              ["Assessments", attempts.length],
              ["Best score", best == null ? "—" : `${best}%`],
              ["Average", average == null ? "—" : `${average}%`],
              ["Badges", badges.length],
            ].map(([label, value]) => (
              <div key={label} className="bg-white p-4 sm:p-5">
                <p className="text-xs font-bold text-[#7c827a]">{label}</p>
                <p className="mt-2 text-3xl font-extrabold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {attempts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#ded7cb] bg-white p-8 text-center text-sm text-[#7c827a]">
                No assessments yet. Start a role to build your progress chart.
              </div>
            ) : attempts.map((attempt) => (
              <article key={attempt.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e4dfd5] bg-white p-4 shadow-sm">
                <div>
                  <p className="font-bold">{attempt.roleTitle}</p>
                  <p className="text-xs text-[#7c827a]">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold tabular-nums">{attempt.score}%</p>
                  {attempt.tier && <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${TIER_STYLE[attempt.tier]}`}>{attempt.tier}</span>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (view === "badges") {
    const locked = categories.slice(0, 6).map((cat) => {
      const role = roles.find((item) => item.category === cat.id)
      return role ? { id: role.id, title: role.title, category: cat.label } : null
    }).filter(Boolean) as Array<{ id: string; title: string; category: string }>

    return (
      <div className="bg-[#efece4] pb-10" style={{ color: INK }}>
        {pageHeader}
        <div className="mx-auto grid max-w-[1600px] gap-5 px-3 pt-6 sm:px-5 lg:px-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Roles you have proved</h2>
            <p className="mt-1 text-sm text-[#5f655c]">60% bronze · 75% silver · 88% gold. A weaker retake never takes a badge away.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {badges.map((badge) => (
                <article key={badge.roleKey} className="rounded-2xl border border-[#e4dfd5] bg-white p-4 shadow-sm">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${TIER_STYLE[badge.tier]}`}>{badge.tier}</span>
                  <h3 className="mt-3 text-lg font-bold">{badge.roleTitle}</h3>
                  <p className="mt-1 text-sm text-[#5f655c]">Best {badge.bestScore}% · {badge.attempts} attempt{badge.attempts === 1 ? "" : "s"}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const role = roles.find((item) => item.id === badge.roleKey)
                      if (role) void startAssessment(role)
                    }}
                    className="mt-3 text-sm font-bold"
                    style={{ color: PRIMARY }}
                  >
                    Retake
                  </button>
                </article>
              ))}
              {locked.filter((role) => !badges.some((badge) => badge.roleKey === role.id)).map((role) => (
                <article key={role.id} className="rounded-2xl border border-dashed border-[#ded7cb] bg-white/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa097]">{role.category}</p>
                  <h3 className="mt-2 text-lg font-bold text-[#7c827a]">{role.title}</h3>
                  <p className="mt-1 text-sm text-[#9aa097]">Locked until you score 60%+</p>
                  <button type="button" onClick={() => { setSelectedId(role.id); setView("roles") }} className="mt-3 text-sm font-bold" style={{ color: PRIMARY }}>
                    Open role
                  </button>
                </article>
              ))}
              {badges.length === 0 && locked.length === 0 && (
                <p className="text-sm text-[#7c827a] sm:col-span-2">No badges yet — open Roles and start an assessment.</p>
              )}
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#e4dfd5] bg-white p-4 shadow-sm">
              <p className="text-sm font-bold">Recent activity</p>
              <ul className="mt-3 space-y-3">
                {(attempts.length ? attempts : []).slice(0, 5).map((attempt) => (
                  <li key={attempt.id} className="flex items-start gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-[#e0511f]">
                      <ClipboardCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[12.5px] font-bold">{attempt.roleTitle}</p>
                      <p className="text-[11px] text-[#9aa097]">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="rounded-full bg-[#f6f3ec] px-2 py-0.5 text-[11px] font-black tabular-nums">{attempt.score}%</span>
                  </li>
                ))}
                {attempts.length === 0 && <p className="text-sm text-[#7c827a]">Take an assessment to fill this shelf.</p>}
              </ul>
            </div>
            <div className="rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-50 via-[#fff7f0] to-white p-4">
              <p className="text-sm font-bold">Want more badges?</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#5f655c]">Browse roles and prove another title for your career transition.</p>
              <button type="button" onClick={() => setView("roles")} className="mt-3 inline-flex h-10 items-center rounded-xl px-4 text-[13px] font-bold text-white" style={{ background: PRIMARY }}>
                Explore roles <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    )
  }

  const filterBody = (
    <div className="space-y-1">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aa097]">Category</p>
      <button
        type="button"
        onClick={() => {
          setCategory("")
          setMobileFiltersOpen(false)
        }}
        className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left text-[13px] font-medium ${
          !category ? "bg-[#1b231e] text-white" : "text-[#5f655c] hover:bg-[#f6f3ec]"
        }`}
      >
        <span>All roles</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${!category ? "bg-white/20" : "bg-[#efece4] text-[#7c827a]"}`}>
          {roles.length}
        </span>
      </button>
      {categories.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            setCategory(item.id === category ? "" : item.id)
            setMobileFiltersOpen(false)
          }}
          className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left text-[13px] font-medium ${
            category === item.id ? "bg-[#1b231e] text-white" : "text-[#5f655c] hover:bg-[#f6f3ec]"
          }`}
        >
          <span className="min-w-0 truncate">{item.label}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${category === item.id ? "bg-white/20" : "bg-[#efece4] text-[#7c827a]"}`}>
            {item.count}
          </span>
        </button>
      ))}
    </div>
  )

  const activeCategoryLabel = category
    ? categories.find((item) => item.id === category)?.label ?? "Filtered"
    : null

  return (
    <div className="bg-[#efece4] pb-16" style={{ color: INK }}>
      {pageHeader}

      {/* Blended sticky search — same page colour */}
      <div className="sticky top-14 z-20 mt-5 bg-[#efece4]">
        <div className="border-b border-[#e4dfd5]/60">
          <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-3 py-2.5 sm:px-5 lg:px-6">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[#e4dfd5] bg-white px-3 text-xs font-bold lg:hidden"
            >
              Filters
              {activeCategoryLabel ? (
                <span className="rounded-full bg-[#e0511f] px-1.5 py-0.5 text-[10px] text-white">1</span>
              ) : null}
            </button>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa097]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search roles…"
                className="h-10 w-full rounded-xl border border-[#e4dfd5] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#e0511f]"
              />
            </div>
            <p className="hidden shrink-0 text-xs font-semibold text-[#7c827a] sm:block">
              {filtered.length} roles
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] lg:px-6">
        {/* Fixed left filters */}
        <aside className="sticky top-[6.5rem] hidden h-[calc(100dvh-6.5rem)] w-[200px] shrink-0 self-start overflow-y-auto overscroll-contain border-r border-[#e4dfd5]/70 px-2.5 py-5 lg:block xl:w-[220px]">
          {filterBody}
        </aside>

        {/* Roles list */}
        <section className="min-w-0 flex-1 border-r-0 px-3 py-5 sm:px-4 lg:border-r lg:border-[#e4dfd5]/70 lg:px-4 xl:max-w-none">
          {activeCategoryLabel && (
            <div className="mb-3 flex items-center gap-2 lg:hidden">
              <span className="rounded-full bg-[#1b231e] px-3 py-1 text-[11px] font-bold text-white">{activeCategoryLabel}</span>
              <button type="button" onClick={() => setCategory("")} className="text-[11px] font-bold text-[#e0511f]">
                Clear
              </button>
            </div>
          )}
          <p className="mb-3 text-sm font-medium text-[#5f655c] sm:hidden">{filtered.length} roles</p>

          {pageRoles.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#ded7cb] bg-white px-4 py-12 text-center text-sm text-[#7c827a]">
              {query.trim() ? `No roles match “${query.trim()}”.` : "No roles in this category."}
            </p>
          ) : (
            <div className="space-y-2">
              {pageRoles.map((role) => {
                const active = selectedId === role.id
                const earned = badges.find((badge) => badge.roleKey === role.id)
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedId(role.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-[#e0511f]/40 bg-white shadow-sm ring-1 ring-[#e0511f]/15"
                        : "border-[#e4dfd5] bg-white hover:border-[#ded7cb]"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-[#e0511f] text-white" : "bg-[#f6f3ec] text-[#7c827a]"}`}>
                      {earned ? <Check className="h-4 w-4" /> : <ListChecks className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wide text-[#9aa097]">{role.categoryLabel}</span>
                      <span className="mt-0.5 block text-[14px] font-bold leading-snug">{role.title}</span>
                      <span className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#7c827a]">{role.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between text-xs font-bold">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-[#e4dfd5] bg-white px-3 py-2 disabled:opacity-40">Previous</button>
              <span className="text-[#7c827a]">{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-[#e4dfd5] bg-white px-3 py-2 disabled:opacity-40">Next</button>
            </div>
          )}

          {/* Mobile / tablet detail under list */}
          {selected && (
            <div className="mt-6 rounded-2xl border border-[#e4dfd5] bg-white p-4 xl:hidden">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: PRIMARY }}>{selected.categoryLabel}</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight">{selected.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5f655c]">{selected.description}</p>
              <div className="mt-4 space-y-4">
                <Step n={1} title="Level" subtitle="Seniority for this assessment.">
                  <div className="flex flex-wrap gap-1.5">
                    {levels.map((level) => (
                      <OptionTile key={level.id} active={seniority === level.id} onClick={() => setSeniority(level.id)}>
                        {level.label}
                      </OptionTile>
                    ))}
                  </div>
                </Step>
                {selected.toolOptions.length > 0 && (
                  <Step n={2} title="Tools" subtitle="Optional platforms for this role.">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.toolOptions.map((tool) => (
                        <OptionTile key={tool} active={selectedTools.includes(tool)} onClick={() => toggle(selectedTools, tool, setSelectedTools)}>
                          {tool}
                        </OptionTile>
                      ))}
                    </div>
                  </Step>
                )}
                {selected.focusOptions.length > 0 && (
                  <Step n={selected.toolOptions.length > 0 ? 3 : 2} title="Focus" subtitle="Optional emphasis areas.">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.focusOptions.map((focus) => (
                        <OptionTile key={focus} active={selectedFocus.includes(focus)} onClick={() => toggle(selectedFocus, focus, setSelectedFocus)}>
                          {focus}
                        </OptionTile>
                      ))}
                    </div>
                  </Step>
                )}
              </div>
              {error && <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
              <button
                type="button"
                disabled={busy}
                onClick={() => void startAssessment(selected)}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: PRIMARY }}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Start assessment
              </button>
            </div>
          )}
        </section>

        {/* Detangled sticky detail panel */}
        <aside className="sticky top-[6.5rem] hidden h-[calc(100dvh-6.5rem)] w-[300px] shrink-0 self-start overflow-y-auto overscroll-contain px-4 py-5 xl:block 2xl:w-[340px]">
          {selected ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: PRIMARY }}>{selected.categoryLabel}</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{selected.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5f655c]">{selected.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-[#e4dfd5] bg-white p-3.5">
                {(
                  [
                    { Icon: BarChart3, label: "Level", value: levels.find((level) => level.id === seniority)?.label ?? seniority },
                    { Icon: ListChecks, label: "Questions", value: String(selected.questionCount) },
                    { Icon: Wrench, label: "Tools", value: String(selectedTools.length) },
                    { Icon: Target, label: "Focus", value: String(selectedFocus.length) },
                  ] as const
                ).map(({ Icon, label, value }) => (
                  <div key={label} className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#7c827a]">
                      <Icon className="h-3 w-3 shrink-0" />
                      {label}
                    </p>
                    <p className="mt-0.5 truncate text-[13.5px] font-bold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-5">
                <Step n={1} title="Level" subtitle="Seniority for this assessment.">
                  <div className="flex flex-wrap gap-1.5">
                    {levels.map((level) => (
                      <OptionTile key={level.id} active={seniority === level.id} onClick={() => setSeniority(level.id)}>
                        {level.label}
                      </OptionTile>
                    ))}
                  </div>
                </Step>
                {selected.toolOptions.length > 0 && (
                  <Step n={2} title="Tools" subtitle="Optional platforms for this role.">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.toolOptions.map((tool) => (
                        <OptionTile key={tool} active={selectedTools.includes(tool)} onClick={() => toggle(selectedTools, tool, setSelectedTools)}>
                          {tool}
                        </OptionTile>
                      ))}
                    </div>
                  </Step>
                )}
                {selected.focusOptions.length > 0 && (
                  <Step n={selected.toolOptions.length > 0 ? 3 : 2} title="Focus" subtitle="Optional emphasis areas.">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.focusOptions.map((focus) => (
                        <OptionTile key={focus} active={selectedFocus.includes(focus)} onClick={() => toggle(selectedFocus, focus, setSelectedFocus)}>
                          {focus}
                        </OptionTile>
                      ))}
                    </div>
                  </Step>
                )}
              </div>

              {error && <p className="mt-4 text-sm font-semibold text-rose-700">{error}</p>}
              <button
                type="button"
                disabled={busy}
                onClick={() => void startAssessment(selected)}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: PRIMARY }}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Start assessment
              </button>
              <p className="mt-2 text-center text-[11px] text-[#9aa097]">Score 60%+ to earn a badge.</p>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-[#7c827a]">Select a role to configure.</div>
          )}
        </aside>
      </div>

      {mobileFiltersOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[80] lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/45"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div
                className="absolute inset-x-0 bottom-0 flex max-h-[min(85vh,640px)] flex-col rounded-t-2xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
                style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
                role="dialog"
                aria-modal="true"
                aria-label="Filter roles"
              >
                <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[#ded7cb]" />
                <div className="flex items-center justify-between border-b border-[#e4dfd5] px-4 py-3">
                  <h2 className="text-base font-bold">Filter roles</h2>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-lg px-2.5 py-1.5 text-sm font-bold text-[#7c827a]"
                  >
                    Done
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">{filterBody}</div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}


function Step({ n, title, subtitle, children }: { n: number; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1b231e] text-[10px] font-bold text-white">{n}</span>
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-[12px] text-[#7c827a]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function OptionTile({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition ${
        active ? "border-[#e0511f] bg-orange-50 text-[#1b231e]" : "border-[#ded7cb] bg-white text-[#5f655c] hover:border-[#cfc7b8]"
      }`}
    >
      {children}
    </button>
  )
}
