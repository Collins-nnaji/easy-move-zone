"use client"

import { useCallback, useEffect, useState } from "react"

type AdminJob = {
  id: string
  title: string
  company: string | null
  city: string
  country: string
  flag: string
  sponsorship: string
  category: string | null
  featured: boolean
  description: string | null
  url: string | null
}

type Facets = { countries: string[]; visaTypes: string[]; categories: string[] }
type Tab = "jobs" | "sponsors" | "fetcher" | "staged" | "urls"

type SavedUrl = {
  id: number
  label: string
  url: string
  company: string | null
  last_fetch_status: string | null
  last_fetch_error: string | null
  last_fetched_at: string | null
}

type StagedJob = {
  id: number
  title: string
  company: string
  location: string
  country: string
  url: string
  visa_type: string
}

type SponsorRow = {
  id: number
  name: string
  city: string | null
  county: string | null
  type_and_rating: string | null
  route: string | null
  career_url: string | null
  saved_url_id: number | null
  last_fetch_status: string | null
  last_fetched_at: string | null
}

export function AdminJobsClient() {
  const [tab, setTab] = useState<Tab>("jobs")
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [facets, setFacets] = useState<Facets>({ countries: [], visaTypes: [], categories: [] })
  const [featuredCount, setFeaturedCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [country, setCountry] = useState("")
  const [visaType, setVisaType] = useState("")
  const [category, setCategory] = useState("")
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [savedUrls, setSavedUrls] = useState<SavedUrl[]>([])
  const [staged, setStaged] = useState<StagedJob[]>([])
  const [careerUrl, setCareerUrl] = useState("")
  const [careerCompany, setCareerCompany] = useState("")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [urlReport, setUrlReport] = useState<{
    checked: number
    valid: number
    invalid: Array<{ id: number; title: string; company: string; url: string; status: string }>
  } | null>(null)
  const [checkPage, setCheckPage] = useState(1)

  const [sponsors, setSponsors] = useState<SponsorRow[]>([])
  const [sponsorTotal, setSponsorTotal] = useState(0)
  const [sponsorPage, setSponsorPage] = useState(1)
  const [sponsorPages, setSponsorPages] = useState(1)
  const [sponsorQ, setSponsorQ] = useState("")
  const [sponsorHasUrl, setSponsorHasUrl] = useState<"any" | "yes" | "no">("any")
  const [sponsorLoading, setSponsorLoading] = useState(false)
  const [draftUrls, setDraftUrls] = useState<Record<number, string>>({})

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      if (country) params.set("country", country)
      if (visaType) params.set("visaType", visaType)
      if (category) params.set("category", category)
      if (featuredOnly) params.set("featured", "1")
      params.set("limit", "40")
      params.set("page", String(page))
      const res = await fetch(`/api/admin/mobility-jobs?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load jobs")
      setJobs(data.jobs ?? [])
      setFacets(data.facets ?? { countries: [], visaTypes: [], categories: [] })
      setFeaturedCount(data.featuredCount ?? 0)
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
      setSelected(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs")
    } finally {
      setLoading(false)
    }
  }, [q, country, visaType, category, featuredOnly, page])

  const loadFetcher = useCallback(async () => {
    const [urlsRes, stagedRes] = await Promise.all([
      fetch("/api/admin/career-jobs?view=urls"),
      fetch("/api/admin/career-jobs?view=staged"),
    ])
    const urlsData = await urlsRes.json()
    const stagedData = await stagedRes.json()
    if (urlsRes.ok) setSavedUrls(urlsData.urls ?? [])
    if (stagedRes.ok) setStaged(stagedData.jobs ?? [])
  }, [])

  const loadSponsors = useCallback(async () => {
    setSponsorLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("view", "sponsors")
      if (sponsorQ.trim()) params.set("q", sponsorQ.trim())
      params.set("hasUrl", sponsorHasUrl)
      params.set("page", String(sponsorPage))
      params.set("limit", "40")
      const res = await fetch(`/api/admin/career-jobs?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load sponsors")
      const rows = (data.sponsors ?? []) as SponsorRow[]
      setSponsors(rows)
      setSponsorTotal(data.total ?? 0)
      setSponsorPages(data.totalPages ?? 1)
      setDraftUrls(Object.fromEntries(rows.map((row) => [row.id, row.career_url ?? ""])))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sponsors")
    } finally {
      setSponsorLoading(false)
    }
  }, [sponsorQ, sponsorHasUrl, sponsorPage])

  useEffect(() => {
    void loadJobs()
    void loadFetcher()
  }, [loadJobs, loadFetcher])

  useEffect(() => {
    if (tab === "sponsors") void loadSponsors()
  }, [tab, loadSponsors])

  async function toggle(job: AdminJob) {
    setSavingId(job.id)
    try {
      const res = await fetch("/api/admin/mobility-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalJobId: job.id, featured: !job.featured }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Could not update")
      }
      setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, featured: !item.featured } : item)))
      setFeaturedCount((count) => count + (job.featured ? -1 : 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update")
    } finally {
      setSavingId(null)
    }
  }

  async function pushSelected(featured: boolean) {
    const ids = [...selected]
    if (ids.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/mobility-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalJobIds: ids, featured }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not update")
      setNotice(`${featured ? "Pushed" : "Removed"} ${data.updated} job${data.updated === 1 ? "" : "s"}.`)
      await loadJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update")
    } finally {
      setBusy(false)
    }
  }

  async function post(body: Record<string, unknown>) {
    setBusy(true)
    setNotice(null)
    setError(null)
    try {
      const res = await fetch("/api/admin/career-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Request failed")
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed")
      return null
    } finally {
      setBusy(false)
    }
  }

  async function addUrl(event: React.FormEvent) {
    event.preventDefault()
    const saved = await post({ action: "save-url", url: careerUrl, company: careerCompany, label: careerCompany || careerUrl })
    if (!saved) return
    setCareerUrl("")
    setCareerCompany("")
    setNotice("Careers URL saved.")
    await loadFetcher()
  }

  async function saveSponsorUrl(sponsor: SponsorRow) {
    const url = (draftUrls[sponsor.id] ?? "").trim()
    if (!url) {
      setError("Enter a careers URL first.")
      return
    }
    const data = await post({
      action: "upsert-sponsor-url",
      company: sponsor.name,
      url,
      label: sponsor.name,
    })
    if (!data) return
    setNotice(`Saved careers URL for ${sponsor.name}.`)
    await loadSponsors()
    await loadFetcher()
  }

  async function fetchSponsor(sponsor: SponsorRow) {
    let url = (draftUrls[sponsor.id] ?? "").trim() || sponsor.career_url || ""
    if (!url) {
      setError("Add a careers URL before fetching.")
      return
    }
    let savedUrlId = sponsor.saved_url_id
    if (!sponsor.career_url || sponsor.career_url !== url || !savedUrlId) {
      const saved = await post({
        action: "upsert-sponsor-url",
        company: sponsor.name,
        url,
        label: sponsor.name,
      })
      if (!saved) return
      url = String(saved.saved?.url ?? url)
      savedUrlId = Number(saved.saved?.id ?? savedUrlId)
    }
    const data = await post({
      action: "fetch-url",
      id: savedUrlId ?? undefined,
      url,
      company: sponsor.name,
    })
    if (!data) return
    setNotice(`Staged ${data.staged} roles from ${sponsor.name}.`)
    await loadSponsors()
    await loadFetcher()
  }

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-8">
      <h1 className="text-2xl font-bold">Jobs</h1>
      <p className="mt-1 text-sm text-white/50">
        Push listings to the public board, manage sponsor career URLs, fetch roles, and review staged imports.{" "}
        {featuredCount} currently featured.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ["jobs", "Jobs"],
            ["sponsors", "Sponsors"],
            ["fetcher", "Fetcher"],
            ["staged", "Staged"],
            ["urls", "URL check"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-3 py-2 text-xs font-bold ${tab === id ? "bg-white text-[#0f172a]" : "bg-white/10 text-white/70"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm font-semibold text-rose-300">{error}</p>}
      {notice && <p className="mt-4 text-sm font-semibold text-emerald-300">{notice}</p>}

      {tab === "jobs" && (
        <>
          <form
            className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-5"
            onSubmit={(event) => {
              event.preventDefault()
              setPage(1)
              void loadJobs()
            }}
          >
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search title or company"
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
            />
            <select
              value={country}
              onChange={(event) => {
                setCountry(event.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            >
              <option value="">All countries</option>
              {facets.countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={visaType}
              onChange={(event) => {
                setVisaType(event.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            >
              <option value="">All visa types</option>
              {facets.visaTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {facets.categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(event) => {
                    setFeaturedOnly(event.target.checked)
                    setPage(1)
                  }}
                />
                Featured only
              </label>
              <button type="submit" className="rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-bold">
                Filter
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || selected.size === 0}
              onClick={() => void pushSelected(true)}
              className="rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-200 disabled:opacity-40"
            >
              Push selected ({selected.size})
            </button>
            <button
              type="button"
              disabled={busy || selected.size === 0}
              onClick={() => void pushSelected(false)}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold disabled:opacity-40"
            >
              Unfeature selected
            </button>
            <button
              type="button"
              disabled={jobs.length === 0}
              onClick={() => setSelected(new Set(jobs.map((job) => job.id)))}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold disabled:opacity-40"
            >
              Select page
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={() => setSelected(new Set())}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold disabled:opacity-40"
            >
              Clear selection
            </button>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-white/50">Loading jobs…</p>
          ) : (
            <>
              <p className="mt-4 text-xs text-white/40">
                Page {page} of {totalPages} · {jobs.length} shown · {total.toLocaleString()} match filters
              </p>
              <div className="mt-4 space-y-3">
                {jobs.map((job) => (
                  <article key={job.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selected.has(job.id)}
                          onChange={() => {
                            setSelected((current) => {
                              const next = new Set(current)
                              if (next.has(job.id)) next.delete(job.id)
                              else next.add(job.id)
                              return next
                            })
                          }}
                          className="mt-1"
                        />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-white/40">
                            {job.flag} {job.country} · {job.city}
                          </p>
                          <h2 className="mt-1 text-lg font-bold">{job.title}</h2>
                          <p className="text-sm text-white/60">{job.company ?? "Unknown company"}</p>
                          <p className="mt-1 text-sm font-semibold text-[#f3aa79]">{job.sponsorship}</p>
                          {job.url && (
                            <a href={job.url} target="_blank" rel="noreferrer" className="mt-1 block max-w-xl truncate text-xs text-white/40">
                              {job.url}
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={savingId === job.id}
                        onClick={() => void toggle(job)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50 ${
                          job.featured ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white hover:bg-white/15"
                        }`}
                      >
                        {job.featured ? "Showing on Jobs" : "Push to Jobs"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-white/50">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === "sponsors" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-white/50">
            All UK sponsorship-register companies ({sponsorTotal.toLocaleString()} unique names). Add a careers URL, then
            fetch roles into Staged.
          </p>
          <form
            className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[1fr_auto_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              setSponsorPage(1)
              void loadSponsors()
            }}
          >
            <input
              value={sponsorQ}
              onChange={(event) => setSponsorQ(event.target.value)}
              placeholder="Search company or city"
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            />
            <select
              value={sponsorHasUrl}
              onChange={(event) => {
                setSponsorHasUrl(event.target.value as "any" | "yes" | "no")
                setSponsorPage(1)
              }}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            >
              <option value="any">All URLs</option>
              <option value="yes">Has careers URL</option>
              <option value="no">Missing careers URL</option>
            </select>
            <button type="submit" className="rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-bold">
              Search
            </button>
          </form>

          {sponsorLoading ? (
            <p className="text-sm text-white/50">Loading sponsors…</p>
          ) : (
            <>
              <p className="text-xs text-white/40">
                Page {sponsorPage} of {sponsorPages}
              </p>
              <div className="space-y-3">
                {sponsors.map((sponsor) => (
                  <article key={sponsor.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h2 className="font-bold">{sponsor.name}</h2>
                        <p className="mt-1 text-sm text-white/60">
                          {[sponsor.city, sponsor.county].filter(Boolean).join(", ") || "Location unknown"}
                          {sponsor.route ? ` · ${sponsor.route}` : ""}
                        </p>
                        {sponsor.type_and_rating && (
                          <p className="mt-0.5 text-xs text-white/40">{sponsor.type_and_rating}</p>
                        )}
                        {sponsor.last_fetch_status && (
                          <p className="mt-1 text-xs text-white/40">
                            Last fetch: {sponsor.last_fetch_status}
                            {sponsor.last_fetched_at
                              ? ` · ${new Date(sponsor.last_fetched_at).toLocaleDateString()}`
                              : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-2 lg:max-w-xl">
                        <input
                          value={draftUrls[sponsor.id] ?? ""}
                          onChange={(event) =>
                            setDraftUrls((current) => ({ ...current, [sponsor.id]: event.target.value }))
                          }
                          placeholder="https://company.com/careers"
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void saveSponsorUrl(sponsor)}
                            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold disabled:opacity-50"
                          >
                            Save URL
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void fetchSponsor(sponsor)}
                            className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#0f172a] disabled:opacity-50"
                          >
                            Fetch jobs
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {sponsorPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    disabled={sponsorPage <= 1}
                    onClick={() => setSponsorPage((current) => Math.max(1, current - 1))}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-white/50">
                    {sponsorPage} / {sponsorPages}
                  </span>
                  <button
                    type="button"
                    disabled={sponsorPage >= sponsorPages}
                    onClick={() => setSponsorPage((current) => Math.min(sponsorPages, current + 1))}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "fetcher" && (
        <div className="mt-6 space-y-4">
          <form
            onSubmit={(event) => void addUrl(event)}
            className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input
              value={careerCompany}
              onChange={(event) => setCareerCompany(event.target.value)}
              placeholder="Company"
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            />
            <input
              value={careerUrl}
              onChange={(event) => setCareerUrl(event.target.value)}
              placeholder="https://company.com/careers"
              required
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            />
            <button disabled={busy} className="rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-bold disabled:opacity-50">
              Save URL
            </button>
          </form>
          <p className="text-sm text-white/50">
            Saved careers pages power the sponsor checker when company names match. Fetch pulls roles into Staged.
          </p>
          <div className="space-y-3">
            {savedUrls.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-bold">{item.company || item.label}</h2>
                    <a href={item.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-[#f3aa79]">
                      {item.url}
                    </a>
                    <p className="mt-1 text-xs text-white/40">
                      {item.last_fetch_status ? `Last fetch: ${item.last_fetch_status}` : "Not fetched yet"}
                      {item.last_fetch_error ? ` — ${item.last_fetch_error}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void post({ action: "fetch-url", id: item.id, url: item.url, company: item.company }).then(
                          async (data) => {
                            if (!data) return
                            setNotice(`Staged ${data.staged} roles.`)
                            await loadFetcher()
                          },
                        )
                      }
                      className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#0f172a] disabled:opacity-50"
                    >
                      Fetch jobs
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void post({ action: "delete-url", id: item.id }).then(async (data) => {
                          if (data) await loadFetcher()
                        })
                      }
                      className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === "staged" && (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-white/50">
            {staged.length} waiting for review. Approving publishes them into the jobs database used by the public board
            and sponsor checker.
          </p>
          {staged.map((job) => (
            <article key={job.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{job.title}</h2>
                  <p className="text-sm text-white/60">
                    {job.company} · {job.location} · {job.country}
                  </p>
                  <a href={job.url} target="_blank" rel="noreferrer" className="mt-1 block max-w-xl truncate text-xs text-white/40">
                    {job.url}
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void post({ action: "approve", ids: [job.id] }).then(async (data) => {
                        if (!data) return
                        setNotice(`Published ${data.published}.`)
                        await loadFetcher()
                        await loadJobs()
                      })
                    }
                    className="rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-200 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void post({ action: "reject", ids: [job.id] }).then(async (data) => {
                        if (data) await loadFetcher()
                      })
                    }
                    className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "urls" && (
        <div className="mt-6">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void post({ action: "validate-urls", page: checkPage, limit: 15 }).then((data) => {
                if (!data) return
                setUrlReport(data)
                setCheckPage((current) => current + 1)
                setNotice(`Checked ${data.checked}. ${data.valid} still open.`)
              })
            }
            className="rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-bold disabled:opacity-50"
          >
            {busy ? "Checking…" : `Check next 15 URLs (page ${checkPage})`}
          </button>
          {urlReport && (
            <div className="mt-4 space-y-2">
              {urlReport.invalid.length === 0 && <p className="text-sm text-emerald-300">Every URL in this batch responded.</p>}
              {urlReport.invalid.map((job) => (
                <article key={job.id} className="rounded-2xl border border-white/10 p-3 text-sm">
                  <p className="font-bold">{job.title}</p>
                  <p className="text-white/50">
                    {job.company} · {job.status}
                  </p>
                  <p className="truncate text-xs text-white/40">{job.url}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
