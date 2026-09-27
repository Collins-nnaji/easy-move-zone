"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { BadgeCheck, BriefcaseBusiness, ChevronDown, CreditCard, ExternalLink, Layers, LockKeyhole, MapPin, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react"
import { CompanyLogo } from "@/components/career/CompanyLogo"

type BoardJob = {
  id: string
  title: string
  company: string | null
  city: string
  country: string
  flag: string
  sponsorship: string
  url: string | null
  category: string | null
  experienceLevel: string | null
  jobType: string | null
  logoUrl: string | null
  skills: string[]
  featured: boolean
  postedAt: string | null
}

type FacetCounts = {
  countries: Record<string, number>
  experienceLevels: Record<string, number>
  jobTypes: Record<string, number>
  categories: Record<string, number>
}

type Filters = {
  location: string[]
  experienceLevel: string[]
  jobType: string[]
  category: string[]
}

const PAGE_SIZE = 30
const PRIMARY = "#2f5d50"
const INK = "#1b231e"
const TWIN_KEY = "emz.career.twin.skills.v1"
const SAMPLE_SKILLS = ["Excel", "Communication", "Reporting"] as const

type FitCheckResult = {
  jobId: string
  title: string
  company: string | null
  mustHave: string[]
  niceToHave: string[]
  overlapPct: number
  missing: string[]
  evidence: Array<{ skill: string; present: boolean }>
  sponsorship: { employerSignal: string; vacancyStatement: string }
  strongestSellingPoint: string
  applyAdvice: "prepare" | "skip"
  applyReasons: string[]
}

type SubscriptionState = {
  active: boolean
  status: string
  customerId: string | null
  paymentLink?: string
}

const EMPTY_FILTERS: Filters = {
  location: [],
  experienceLevel: [],
  jobType: [],
  category: [],
}

function pageWindow(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1, current - 2, current + 2])
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
  const out: Array<number | "ellipsis"> = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) out.push("ellipsis")
    out.push(sorted[i]!)
  }
  return out
}

function postedLabel(value: string | null): string | null {
  if (!value) return null
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return null
  const days = Math.floor((Date.now() - time) / 86_400_000)
  if (days <= 0) return "Posted today"
  if (days === 1) return "Posted yesterday"
  if (days < 30) return `Posted ${days}d ago`
  const months = Math.floor(days / 30)
  return months < 12 ? `Posted ${months}mo ago` : "Posted over a year ago"
}

function FitCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden>
      <path d="M4.5 16.5a8 8 0 1115 0" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" />
      <path d="M7.2 16.5a5.2 5.2 0 019.6 0" stroke={PRIMARY} strokeWidth="1.6" strokeLinecap="round" opacity=".35" />
      <path d="M12 16.5l3.6-5.4" stroke="#e0511f" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.9" fill={INK} />
    </svg>
  )
}

function TailorCvIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden>
      <path d="M6 3.5h7.5L18 8v5" stroke="#b5532c" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13.5 3.5V8H18" stroke="#b5532c" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 3.5a1.5 1.5 0 00-1.5 1.5v14A1.5 1.5 0 006 20.5h5" stroke="#b5532c" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 10h6M7.5 13.5h4" stroke="#b5532c" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13.5 20.5l.6-2.6 5.2-5.2a1.4 1.4 0 012 2l-5.2 5.2z" fill="#e0511f" />
    </svg>
  )
}

function FilterSection({
  label,
  items,
  counts,
  selected,
  onToggle,
  open,
  onOpen,
}: {
  label: string
  items: string[]
  counts: Record<string, number>
  selected: string[]
  onToggle: (value: string) => void
  open: boolean
  onOpen: () => void
}) {
  return (
    <section>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between gap-2 py-1 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5047]">
          {label}
          {selected.length > 0 && (
            <span className="rounded-full bg-[#fbeae0] px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal text-[#7a3b24]">
              {selected.length}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9aa094] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-1 max-h-56 space-y-0.5 overflow-y-auto overscroll-contain pr-1">
          {items.length === 0 ? (
            <p className="px-1 py-2 text-xs text-[#7c827a]">No options yet.</p>
          ) : (
            items.map((item) => {
              const checked = selected.includes(item)
              return (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-[#f6f3ec]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(item)}
                    className="h-3.5 w-3.5 accent-[#e0511f]"
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#1b231e]">{item}</span>
                  <span className="shrink-0 text-xs text-[#9aa094]">{(counts[item] ?? 0).toLocaleString()}</span>
                </label>
              )
            })
          )}
        </div>
      )}
    </section>
  )
}

export function JobsClient({ initialJobId = "" }: { initialJobId?: string }) {
  const [jobs, setJobs] = useState<BoardJob[]>([])
  const [facets, setFacets] = useState<FacetCounts>({
    countries: {},
    experienceLevels: {},
    jobTypes: {},
    categories: {},
  })
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [draftQuery, setDraftQuery] = useState("")
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [openSection, setOpenSection] = useState<keyof Filters | "location">("location")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fitJobId, setFitJobId] = useState<string | null>(null)
  const [fit, setFit] = useState<FitCheckResult | null>(null)
  const [fitBusy, setFitBusy] = useState(false)
  const [userSkills, setUserSkills] = useState<string[]>([])
  const [selectedJobId, setSelectedJobId] = useState(initialJobId)
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null)
  const [billingBusy, setBillingBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    try {
      const raw = window.localStorage.getItem(TWIN_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { extractedSkills?: string[] }
        if (parsed.extractedSkills?.length && mounted) setUserSkills(parsed.extractedSkills)
      }
    } catch {
      /* ignore */
    }
    void fetch("/api/profile", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const skills = data?.career?.skills
        if (!mounted || !Array.isArray(skills) || !skills.length) return
        setUserSkills(skills.map(String))
        try {
          window.localStorage.setItem(TWIN_KEY, JSON.stringify({ extractedSkills: skills }))
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* guest or offline */
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const returningFromCheckout = new URLSearchParams(window.location.search).get("subscription") === "success"
    const loadSubscription = async () => {
      for (let attempt = 0; attempt < (returningFromCheckout ? 5 : 1); attempt += 1) {
        const data = await fetch("/api/subscription/status", { cache: "no-store" }).then((res) => (res.ok ? res.json() : null)).catch(() => null)
        if (!active) return
        if (data) setSubscription(data)
        if (data?.active || !returningFromCheckout) return
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    }
    void loadSubscription()
    return () => { active = false }
  }, [])

  async function openBilling(action: "checkout" | "portal") {
    setBillingBusy(true)
    try {
      const res = await fetch(`/api/subscription/${action}`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not open Stripe")
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open Stripe")
    } finally {
      setBillingBusy(false)
    }
  }

  async function openFitCheck(jobId: string) {
    setFitJobId(jobId)
    if (!subscription?.active) {
      setFit(null)
      return
    }
    setFitBusy(true)
    setFit(null)
    try {
      const res = await fetch("/api/career-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fit-check",
          jobId,
          userSkills: userSkills.length ? userSkills : [...SAMPLE_SKILLS],
        }),
      })
      const data = await res.json()
      if (res.ok) setFit(data.result)
    } finally {
      setFitBusy(false)
    }
  }

  function openTailorCv(jobId: string) {
    if (subscription?.active) {
      window.location.href = `/application-pack?jobId=${encodeURIComponent(jobId)}`
      return
    }
    setFit(null)
    setFitJobId(jobId)
  }

  const usingSampleSkills = userSkills.length === 0

  const hasActiveFilters =
    Boolean(query.trim()) ||
    filters.location.length + filters.experienceLevel.length + filters.jobType.length + filters.category.length > 0

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(PAGE_SIZE))
      if (selectedJobId) params.set("id", selectedJobId)
      if (query.trim()) params.set("q", query.trim())
      for (const value of filters.location) params.append("country", value)
      for (const value of filters.experienceLevel) params.append("experienceLevel", value)
      for (const value of filters.jobType) params.append("jobType", value)
      for (const value of filters.category) params.append("category", value)

      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not load jobs")
      setJobs(data.jobs ?? [])
      setFacets(data.facets ?? { countries: {}, experienceLevels: {}, jobTypes: {}, categories: {} })
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load jobs")
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [filters, page, query, selectedJobId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(draftQuery)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [draftQuery])

  const sorted = useMemo(
    () => ({
      countries: Object.entries(facets.countries)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key),
      experienceLevels: Object.entries(facets.experienceLevels)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key),
      jobTypes: Object.entries(facets.jobTypes)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key),
      categories: Object.entries(facets.categories)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key),
    }),
    [facets],
  )

  function toggle(key: keyof Filters, value: string) {
    setSelectedJobId("")
    setFilters((current) => {
      const list = current[key]
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
      return { ...current, [key]: next }
    })
    setPage(1)
  }

  function clearAll() {
    setFilters(EMPTY_FILTERS)
    setDraftQuery("")
    setQuery("")
    setPage(1)
    setSelectedJobId("")
  }

  const rangeStart = jobs.length ? (page - 1) * PAGE_SIZE + 1 : 0
  const rangeEnd = jobs.length ? Math.min((page - 1) * PAGE_SIZE + jobs.length, total) : 0

  const filterPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold" style={{ color: INK }}>
          Filter jobs
        </h2>
        {hasActiveFilters && (
          <button type="button" onClick={clearAll} className="text-xs font-bold" style={{ color: PRIMARY }}>
            Clear all
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <FilterSection
          label="Country"
          items={sorted.countries}
          counts={facets.countries}
          selected={filters.location}
          onToggle={(value) => toggle("location", value)}
          open={openSection === "location"}
          onOpen={() => setOpenSection("location")}
        />
        <FilterSection
          label="Experience level"
          items={sorted.experienceLevels}
          counts={facets.experienceLevels}
          selected={filters.experienceLevel}
          onToggle={(value) => toggle("experienceLevel", value)}
          open={openSection === "experienceLevel"}
          onOpen={() => setOpenSection("experienceLevel")}
        />
        <FilterSection
          label="Job type"
          items={sorted.jobTypes}
          counts={facets.jobTypes}
          selected={filters.jobType}
          onToggle={(value) => toggle("jobType", value)}
          open={openSection === "jobType"}
          onOpen={() => setOpenSection("jobType")}
        />
        <FilterSection
          label="Industry"
          items={sorted.categories}
          counts={facets.categories}
          selected={filters.category}
          onToggle={(value) => toggle("category", value)}
          open={openSection === "category"}
          onOpen={() => setOpenSection("category")}
        />
      </div>
    </div>
  )

  return (
    <div className="bg-[#efece4]" style={{ color: INK }}>
      <div className="mx-auto w-full max-w-[1600px] px-3 pt-5 sm:px-5 lg:px-6">
        <p className="text-sm font-extrabold tracking-tight" style={{ color: PRIMARY }}>
          Jobs
        </p>
            <h1 className="page-title mt-1 max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl">
              Jobs you can relocate for
            </h1>
        <p className="mt-1 max-w-xl text-sm text-[#5f655c]">
          Sponsored roles with Fit Check — must-haves, overlap, and when to skip.
        </p>
        <div className={`mt-4 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${subscription?.active ? "border-emerald-200 bg-emerald-50" : "border-[#ead4c4] bg-[#fff8f2]"}`}>
          <div className="flex items-start gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${subscription?.active ? "bg-emerald-100 text-emerald-700" : "bg-[#fbe6da] text-[#e0511f]"}`}>
              {subscription?.active ? <BadgeCheck className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
            </span>
            <div><p className="text-sm font-extrabold">{subscription?.active ? "Jobs membership active" : "Unlock Fit Check and application packs"}</p><p className="mt-0.5 text-xs leading-relaxed text-[#626861]">{subscription?.active ? "Create a tailored CV and application pack from any role." : "Browse every role for free. Subscribe when you want tailored analysis and application documents."}</p></div>
          </div>
          <button type="button" disabled={billingBusy || !subscription} onClick={() => void openBilling(subscription?.active ? "portal" : "checkout")} className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-extrabold disabled:opacity-50 ${subscription?.active ? "border border-emerald-300 bg-white text-emerald-800" : "bg-[#e0511f] text-white"}`}>
            <CreditCard className="h-3.5 w-3.5" />{billingBusy ? "Opening Stripe…" : subscription?.active ? "Manage subscription" : "Subscribe"}
          </button>
        </div>
      </div>

      {/* Thin blended search — same page colour, hairline only */}
      <div className="sticky top-14 z-20 mt-4 bg-[#efece4]">
        <div className="border-b border-[#e4dfd5]/60">
          <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-3 py-2.5 sm:px-5 lg:px-6">
            <form
              className="relative min-w-0 flex-1"
              onSubmit={(event) => {
                event.preventDefault()
                setSelectedJobId("")
                setQuery(draftQuery)
                setPage(1)
              }}
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa094]" />
              <input
                value={draftQuery}
                onChange={(event) => { setDraftQuery(event.target.value); setSelectedJobId("") }}
                placeholder="Search jobs, companies, locations…"
                className="h-10 w-full rounded-xl border border-[#e4dfd5] bg-white pl-10 pr-10 text-sm outline-none focus:border-[#e0511f]"
              />
              {draftQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJobId("")
                    setDraftQuery("")
                    setQuery("")
                    setPage(1)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#9aa094] hover:bg-black/[0.04]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm font-bold lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters ? (
                <span className="rounded-full bg-[#e0511f] px-1.5 text-[10px] text-white">
                  {filters.location.length +
                    filters.experienceLevel.length +
                    filters.jobType.length +
                    filters.category.length +
                    (query ? 1 : 0)}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] lg:px-6">
        <aside className="sticky top-[6.5rem] hidden h-[calc(100dvh-6.5rem)] w-[220px] shrink-0 self-start overflow-y-auto overscroll-contain border-r border-[#e4dfd5]/70 px-3 py-5 lg:block xl:w-[240px]">
          {filterPanel}
        </aside>

        <div className="min-w-0 flex-1 px-3 py-5 sm:px-4 lg:px-5">
          {error && (
            <p className="mb-4 rounded-2xl bg-[#fbeae0] px-4 py-3 text-sm font-semibold text-[#7a3b24]">{error}</p>
          )}

          <p className="mb-3 text-sm font-medium text-[#5f655c]">
            {loading && jobs.length === 0
              ? "Loading roles…"
              : total > 0
                ? `Showing ${rangeStart.toLocaleString()} to ${rangeEnd.toLocaleString()} of ${total.toLocaleString()} roles`
                : "No roles to show"}
          </p>

          {loading && jobs.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-2xl bg-white/70" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-[#e4dfd5] bg-white px-6 py-12 text-center">
              <p className="text-lg font-bold">No matching roles</p>
              <p className="mt-2 text-sm text-[#5f655c]">Try clearing filters or searching a different title.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-4 rounded-xl px-4 py-2 text-sm font-bold text-white"
                  style={{ background: PRIMARY }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 pb-6">
              {jobs.map((job) => {
                const posted = postedLabel(job.postedAt)
                const locked = !subscription?.active
                return (
                <article
                  key={job.id}
                  className="group rounded-2xl border border-[#e4dfd5] bg-white p-5 shadow-[0_1px_2px_rgba(27,35,30,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#d6cfc2] hover:shadow-[0_18px_40px_rgba(27,35,30,0.08)] sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <CompanyLogo
                      company={job.company ?? job.title}
                      logoUrl={job.logoUrl}
                      careerUrl={job.url}
                      className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#efece4] bg-white shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold" style={{ color: PRIMARY }}>
                            {job.company ?? "Company"}
                          </p>
                          <h2 className="mt-0.5 text-lg font-extrabold leading-snug tracking-tight transition-colors group-hover:text-[#2f5d50] sm:text-xl">{job.title}</h2>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          {job.featured && (
                            <span className="rounded-full bg-[#fbeae0] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#7a3b24]">
                              Featured
                            </span>
                          )}
                          {posted && <span className="whitespace-nowrap text-xs font-medium text-[#8a9086]">{posted}</span>}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f3ec] px-3 py-1.5 font-semibold text-[#3f463f]">
                          <MapPin className="h-3.5 w-3.5 text-[#8a9086]" />
                          {job.flag} {job.city}
                          {job.country && job.country !== job.city ? `, ${job.country}` : ""}
                        </span>
                        {job.jobType && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f3ec] px-3 py-1.5 font-semibold text-[#3f463f]">
                            <BriefcaseBusiness className="h-3.5 w-3.5 text-[#8a9086]" />
                            {job.jobType}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f3ec] px-3 py-1.5 font-semibold text-[#3f463f]">
                            <Layers className="h-3.5 w-3.5 text-[#8a9086]" />
                            {job.experienceLevel}
                          </span>
                        )}
                        {job.sponsorship && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f1ed] px-3 py-1.5 font-bold text-[#285045]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {job.sponsorship}
                          </span>
                        )}
                      </div>
                      {job.skills.length > 0 && (
                        <p className="mt-3 hidden truncate text-[13px] text-[#6b716a] sm:block">
                          <span className="font-semibold text-[#4a5047]">Skills:</span> {job.skills.slice(0, 5).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#efe9dd] pt-4 sm:flex sm:items-center sm:justify-between">
                    <div className="col-span-2 grid grid-cols-2 gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={() => void openFitCheck(job.id)}
                        aria-expanded={fitJobId === job.id}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition sm:px-4 ${
                          fitJobId === job.id ? "border-[#2f5d50] bg-[#eef4f1] text-[#1f4a3e]" : "border-[#e4dfd5] bg-white hover:border-[#2f5d50] hover:bg-[#f4f8f6]"
                        }`}
                      >
                        <FitCheckIcon />
                        Fit Check
                        {locked && <LockKeyhole className="hidden h-3 w-3 text-[#9aa094] sm:block" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => openTailorCv(job.id)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#f1d6c6] bg-[#fff5ef] px-3 text-sm font-bold text-[#7a3b24] transition hover:border-[#e0511f] hover:bg-[#ffede2] sm:px-4"
                      >
                        <TailorCvIcon />
                        Tailor CV
                        {locked && <LockKeyhole className="hidden h-3 w-3 text-[#c79a82] sm:block" />}
                      </button>
                    </div>
                    {job.url ? (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(47,93,80,0.22)] transition hover:brightness-110 sm:px-5"
                        style={{ background: PRIMARY }}
                      >
                        Apply
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : <span />}
                  </div>
                  {fitJobId === job.id && (
                    <div className="mt-4 rounded-xl border border-[#e4dfd5] bg-[#f6f3ec]/80 p-4 text-sm">
                      {!subscription?.active && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div><p className="font-extrabold">This is a member feature</p><p className="mt-1 text-xs text-[#626861]">Subscribe to run Fit Check and tailor your CV and application pack for this role.</p></div>
                          <button type="button" disabled={billingBusy} onClick={() => void openBilling("checkout")} className="rounded-lg bg-[#e0511f] px-4 py-2 text-xs font-bold text-white">Subscribe with Stripe</button>
                        </div>
                      )}
                      {fitBusy && <p className="text-[#7c827a]">Building Fit Check…</p>}
                      {fit && !fitBusy && subscription?.active && (
                        <div className="space-y-2">
                          {usingSampleSkills && (
                            <p className="rounded-lg bg-white/80 px-2.5 py-1.5 text-[11px] font-medium text-[#7a3b24]">
                              Using sample skills (Excel, Communication, Reporting) — not your profile. Add skills on{" "}
                              <a href="/profile" className="font-bold underline underline-offset-2">
                                Profile
                              </a>{" "}
                              or run{" "}
                              <a href="/workspace" className="font-bold underline underline-offset-2">
                                My Workspace
                              </a>
                              .
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-extrabold">{fit.overlapPct}% overlap</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                fit.applyAdvice === "skip"
                                  ? "bg-rose-100 text-rose-900"
                                  : "bg-emerald-100 text-emerald-900"
                              }`}
                            >
                              {fit.applyAdvice === "skip" ? "Don't waste this application" : "Strong opportunity"}
                            </span>
                          </div>
                          <p className="text-xs text-[#5f655c]">{fit.applyReasons.join(" · ")}</p>
                          <p className="text-xs"><strong>Must-have:</strong> {fit.mustHave.join(", ") || "—"}</p>
                          <p className="text-xs"><strong>Missing:</strong> {fit.missing.join(", ") || "None detected"}</p>
                          <p className="text-xs"><strong>Sponsorship:</strong> {fit.sponsorship.vacancyStatement} ({fit.sponsorship.employerSignal})</p>
                          <p className="text-xs"><strong>Sell:</strong> {fit.strongestSellingPoint}</p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 pb-10">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg border border-[#e4dfd5] bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              {pageWindow(page, totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`e-${index}`} className="px-2 text-[#9aa094]">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`min-w-9 rounded-lg px-3 py-2 text-sm font-semibold ${
                      item === page ? "text-white" : "border border-[#e4dfd5] bg-white"
                    }`}
                    style={item === page ? { background: PRIMARY } : undefined}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="rounded-lg border border-[#e4dfd5] bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Filters</h2>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="rounded-full p-1 hover:bg-[#f6f3ec]">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: PRIMARY }}
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
