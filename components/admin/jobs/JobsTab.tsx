"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { ExternalLink, Pencil, Plus, ShieldCheck, ShieldOff, Star, Trash2 } from "lucide-react"
import {
  Badge,
  Btn,
  Check,
  EMPTY_JOB_FORM,
  JobForm,
  Pager,
  Panel,
  SPONSOR_STATUS,
  SponsorBadge,
  adminApi,
  errorMessage,
  formToPayload,
  formatDay,
  inputClass,
  useNotify,
  useSelection,
  type JobFormValues,
} from "./ui"

type AdminJob = {
  id: number
  title: string
  company: string | null
  location: string | null
  country: string | null
  category: string | null
  experience_level: string | null
  job_type: string | null
  visa_type: string | null
  skills: string[] | null
  url: string | null
  logo_url: string | null
  posted_at: string | null
  expires_at: string | null
  description: string | null
  featured: boolean
  sponsor_status: string | null
  sponsor_register: string | null
  sponsor_match: string | null
  sponsor_checked_at: string | null
}

type Facets = { countries: string[]; visaTypes: string[]; categories: string[] }

type FeaturedView = "all" | "yes" | "no"

type ListResponse = {
  jobs: AdminJob[]
  total: number
  totalPages: number
  featuredCount: number
  counts: { all: number; featured: number; notFeatured: number }
  facets: Facets
}

const PAGE_SIZE = 50

function jobToForm(job: AdminJob): JobFormValues {
  return {
    title: job.title ?? "",
    company: job.company ?? "",
    location: job.location ?? "",
    country: job.country ?? "",
    category: job.category ?? "",
    experienceLevel: job.experience_level ?? "",
    jobType: job.job_type ?? "",
    visaType: job.visa_type ?? "",
    url: job.url ?? "",
    logoUrl: job.logo_url ?? "",
    expiresAt: job.expires_at ?? "",
    skills: (job.skills ?? []).join(", "),
    description: job.description ?? "",
  }
}

export function JobsTab() {
  const notify = useNotify()
  const [data, setData] = useState<ListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [q, setQ] = useState("")
  const [country, setCountry] = useState("")
  const [visaType, setVisaType] = useState("")
  const [category, setCategory] = useState("")
  const [featuredView, setFeaturedView] = useState<FeaturedView>("all")
  const [sponsor, setSponsor] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<JobFormValues>(EMPTY_JOB_FORM)
  const [adding, setAdding] = useState(false)
  const [addForm, setAddForm] = useState<JobFormValues>(EMPTY_JOB_FORM)
  const selection = useSelection<number>()

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
      if (q) params.set("q", q)
      if (country) params.set("country", country)
      if (visaType) params.set("visaType", visaType)
      if (category) params.set("category", category)
      if (featuredView !== "all") params.set("featured", featuredView)
      if (sponsor) params.set("sponsor", sponsor)
      setData(await adminApi<ListResponse>(`/api/admin/jobs?${params}`))
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setLoading(false)
    }
  }, [page, q, country, visaType, category, featuredView, sponsor, notify])

  useEffect(() => {
    void load()
  }, [load])

  const jobs = data?.jobs ?? []
  const pageIds = jobs.map((job) => job.id)
  const selectedIds = [...selection.selected]
  const selectedJobs = jobs.filter((job) => selection.selected.has(job.id))
  const toFeature = selectedJobs.filter((job) => !job.featured).map((job) => job.id)
  const toUnfeature = selectedJobs.filter((job) => job.featured).map((job) => job.id)
  const counts = data?.counts

  async function act(body: Record<string, unknown>, success: (result: Record<string, number>) => string, path = "/api/admin/jobs") {
    setBusy(true)
    try {
      const result = await adminApi<Record<string, number>>(path, body)
      notify(success(result))
      selection.clear()
      await load()
      return true
    } catch (error) {
      notify(errorMessage(error), "error")
      return false
    } finally {
      setBusy(false)
    }
  }

  async function checkSponsors(ids: number[]) {
    if (!ids.length) return
    setBusy(true)
    try {
      const { results } = await adminApi<{ results: Array<{ status: string; tagApplied: string | null; matchedName: string | null }> }>(
        "/api/admin/sponsor-check",
        { action: "check", ids },
      )
      const on = results.filter((r) => r.status === "licensed").length
      const likely = results.filter((r) => r.status === "likely").length
      const notListed = results.filter((r) => r.status === "not_listed").length
      const noRegister = results.filter((r) => r.status === "no_register").length
      const tagged = results.filter((r) => r.tagApplied).length
      notify(
        ids.length === 1 && results[0]
          ? `${SPONSOR_STATUS[results[0].status]?.label ?? results[0].status}${results[0].matchedName ? `: ${results[0].matchedName}` : ""}${results[0].tagApplied ? ` · tagged ${results[0].tagApplied}` : ""}`
          : `Checked ${results.length}: ${on} on register, ${likely} likely, ${notListed} not listed, ${noRegister} no register${tagged ? `, ${tagged} tagged` : ""}.`,
        notListed && !on && !likely ? "info" : "success",
      )
      selection.clear()
      await load()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setBusy(false)
    }
  }

  function clearVisaTags(ids: number[]) {
    if (!ids.length || !window.confirm(`Set the visa tag of ${ids.length} job${ids.length === 1 ? "" : "s"} back to "Other"?`)) return
    void act({ action: "clear-tags", ids }, (r) => `Cleared ${r.cleared} visa tag${r.cleared === 1 ? "" : "s"}.`, "/api/admin/sponsor-check")
  }

  function deleteJobs(ids: number[], label: string) {
    if (!ids.length || !window.confirm(`Permanently delete ${label}? This cannot be undone.`)) return
    void act({ action: "delete", ids }, (r) => `Deleted ${r.deleted} job${r.deleted === 1 ? "" : "s"}.`)
  }

  function deleteOld(months: number) {
    if (!window.confirm(`Permanently delete every job posted more than ${months} months ago?`)) return
    void act({ action: "delete-old", months }, (r) => `Deleted ${r.deleted} jobs older than ${months} months.`)
  }

  async function saveEdit() {
    if (editingId == null) return
    const ok = await act({ action: "update", id: editingId, job: formToPayload(editForm) }, () => "Job updated.")
    if (ok) setEditingId(null)
  }

  async function saveNew() {
    if (!addForm.title.trim() || !addForm.company.trim()) {
      notify("Title and company are required.", "error")
      return
    }
    const ok = await act({ action: "create", job: formToPayload(addForm) }, (r) => `Job #${r.id} added.`)
    if (ok) {
      setAdding(false)
      setAddForm(EMPTY_JOB_FORM)
    }
  }

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <Panel
        title={`Live jobs (${(data?.total ?? 0).toLocaleString()})`}
        description={`Every job here is live on the public Jobs page. Featured jobs (${data?.featuredCount ?? 0}) are pinned to the top.`}
        actions={
          <>
            <select
              className={inputClass}
              value=""
              disabled={busy}
              onChange={(event) => event.target.value && deleteOld(Number(event.target.value))}
              aria-label="Delete old jobs"
            >
              <option value="">Delete old jobs…</option>
              <option value="2">Older than 2 months</option>
              <option value="3">Older than 3 months</option>
              <option value="6">Older than 6 months</option>
            </select>
            <Btn variant="primary" onClick={() => setAdding((v) => !v)}>
              <Plus className="h-3.5 w-3.5" /> {adding ? "Close" : "Add job"}
            </Btn>
          </>
        }
      >
        {adding && (
          <div className="mb-5 rounded-xl border border-[#e0511f]/30 bg-[#e0511f]/5 p-4">
            <p className="mb-3 text-sm font-bold">New job</p>
            <JobForm values={addForm} onChange={setAddForm} countries={data?.facets.countries} />
            <div className="mt-3 flex gap-2">
              <Btn variant="primary" disabled={busy} onClick={() => void saveNew()}>Publish job</Btn>
              <Btn onClick={() => setAdding(false)}>Cancel</Btn>
            </div>
          </div>
        )}

        <div className="mb-3 inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {([
            { id: "all", label: "All jobs", count: counts?.all, tone: "bg-white text-[#0b0f17]" },
            { id: "yes", label: "Featured", count: counts?.featured, tone: "bg-amber-400 text-[#1a1206]" },
            { id: "no", label: "Not featured", count: counts?.notFeatured, tone: "bg-white/80 text-[#0b0f17]" },
          ] as const).map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => { resetPage(setFeaturedView)(seg.id); selection.clear() }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                featuredView === seg.id ? seg.tone : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {seg.id === "yes" && <Star className={`h-3.5 w-3.5 ${featuredView === "yes" ? "fill-current" : "text-amber-300"}`} />}
              {seg.label}
              {seg.count != null && <span className="opacity-60">{seg.count.toLocaleString()}</span>}
            </button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <input className={inputClass} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search title, company, location or #id" />
          <select className={inputClass} value={country} onChange={(e) => resetPage(setCountry)(e.target.value)}>
            <option value="">All countries</option>
            {data?.facets.countries.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={inputClass} value={visaType} onChange={(e) => resetPage(setVisaType)(e.target.value)}>
            <option value="">All visa types</option>
            {data?.facets.visaTypes.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={inputClass} value={category} onChange={(e) => resetPage(setCategory)(e.target.value)}>
            <option value="">All categories</option>
            {data?.facets.categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={inputClass} value={sponsor} onChange={(e) => { resetPage(setSponsor)(e.target.value); selection.clear() }} aria-label="Sponsor check">
            <option value="">Sponsor: any</option>
            <option value="licensed">On register</option>
            <option value="likely">Likely match</option>
            <option value="not_listed">Not on register</option>
            <option value="tag_unverified">Tagged but not on register</option>
            <option value="no_register">No register for country</option>
            <option value="unchecked">Not checked</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="sticky top-2 z-10 mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#e0511f]/40 bg-[#1a1410] px-3 py-2 shadow-xl">
            <span className="text-xs font-bold">{selectedIds.length} selected</span>
            <Btn size="sm" variant="danger" disabled={busy} onClick={() => deleteJobs(selectedIds, `${selectedIds.length} selected jobs`)}>
              <Trash2 className="h-3 w-3" /> Delete selected
            </Btn>
            <Btn size="sm" variant="light" disabled={busy} onClick={() => void checkSponsors(selectedIds)}>
              <ShieldCheck className="h-3 w-3" /> Check sponsor ({selectedIds.length})
            </Btn>
            <Btn size="sm" disabled={busy} onClick={() => clearVisaTags(selectedIds)}>
              <ShieldOff className="h-3 w-3" /> Clear visa tag
            </Btn>
            {toFeature.length > 0 && (
              <Btn size="sm" variant="success" disabled={busy} onClick={() => void act({ action: "feature", ids: toFeature, featured: true }, (r) => `Featured ${r.updated}.`)}>
                <Star className="h-3 w-3" /> Feature ({toFeature.length})
              </Btn>
            )}
            {toUnfeature.length > 0 && (
              <Btn size="sm" disabled={busy} onClick={() => void act({ action: "feature", ids: toUnfeature, featured: false }, (r) => `Unfeatured ${r.updated}.`)}>
                Unfeature ({toUnfeature.length})
              </Btn>
            )}
            <Btn size="sm" variant="ghost" onClick={selection.clear}>Clear</Btn>
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/[0.04] text-[10px] uppercase tracking-wide text-white/40">
              <tr>
                <th className="w-10 p-3">
                  <Check checked={selection.allOf(pageIds)} onChange={() => selection.toggleAll(pageIds)} label="Select page" />
                </th>
                <th className="p-3">Job</th>
                <th className="p-3">Location</th>
                <th className="p-3">Visa / sponsor check</th>
                <th className="p-3">Posted</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !jobs.length && (
                <tr><td colSpan={6} className="p-6 text-center text-white/40">Loading jobs…</td></tr>
              )}
              {!loading && !jobs.length && (
                <tr><td colSpan={6} className="p-6 text-center text-white/40">No jobs match these filters.</td></tr>
              )}
              {jobs.map((job, index) => {
                const sectionStart = featuredView === "all" && (index === 0 || jobs[index - 1].featured !== job.featured)
                const divider = sectionStart ? (
                  <tr className={job.featured ? "bg-amber-400/10" : "bg-white/[0.04]"}>
                    <td colSpan={6} className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${job.featured ? "text-amber-200" : "text-white/50"}`}>
                      {job.featured ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 fill-current" /> Featured · pinned to the top of the public Jobs page ({counts?.featured ?? 0})
                        </span>
                      ) : (
                        `Not featured · normal order by date (${(counts?.notFeatured ?? 0).toLocaleString()})`
                      )}
                    </td>
                  </tr>
                ) : null
                const row = editingId === job.id ? (
                  <tr className="border-t border-white/10 bg-sky-500/5">
                    <td colSpan={6} className="p-4">
                      <p className="mb-3 text-sm font-bold">Editing job #{job.id}</p>
                      <JobForm values={editForm} onChange={setEditForm} countries={data?.facets.countries} />
                      <div className="mt-3 flex gap-2">
                        <Btn variant="primary" disabled={busy} onClick={() => void saveEdit()}>Save changes</Btn>
                        <Btn onClick={() => setEditingId(null)}>Cancel</Btn>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr
                    className={`border-t border-white/5 ${
                      selection.selected.has(job.id)
                        ? "bg-[#e0511f]/10"
                        : job.featured
                          ? "bg-amber-400/[0.06] hover:bg-amber-400/10"
                          : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className={`p-3 align-top ${job.featured ? "border-l-[3px] border-l-amber-400" : "border-l-[3px] border-l-transparent"}`}>
                      <Check checked={selection.selected.has(job.id)} onChange={() => selection.toggle(job.id)} />
                    </td>
                    <td className="max-w-[22rem] p-3 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-white/30">#{job.id}</span>
                        {job.featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#1a1206]">
                            <Star className="h-2.5 w-2.5 fill-current" /> Featured
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/25">Not featured</span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate font-semibold" title={job.title}>{job.title}</p>
                      <p className="truncate text-xs text-white/50">{job.company ?? "Unknown company"}</p>
                    </td>
                    <td className="p-3 align-top text-xs text-white/60">
                      <p className="max-w-[12rem] truncate">{job.location}</p>
                      <p className="text-white/40">{job.country}</p>
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex flex-col items-start gap-1">
                        {job.visa_type && job.visa_type !== "Other" ? (
                          <Badge tone="success">{job.visa_type}</Badge>
                        ) : (
                          <span className="text-[10px] font-semibold text-white/30">Visa: {job.visa_type || "none"}</span>
                        )}
                        <SponsorBadge status={job.sponsor_status} match={job.sponsor_match} register={job.sponsor_register} />
                        {job.sponsor_match && job.sponsor_status !== "not_listed" && (
                          <span className="max-w-[12rem] truncate text-[10px] text-white/40" title={job.sponsor_match}>{job.sponsor_match}</span>
                        )}
                        {job.category && <Badge>{job.category}</Badge>}
                      </div>
                    </td>
                    <td className="p-3 align-top text-xs text-white/50">
                      {formatDay(job.posted_at)}
                      {job.expires_at && <p className="text-amber-300/80">Exp: {job.expires_at}</p>}
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex justify-end gap-1">
                        <Btn size="sm" variant="ghost" title="Check this company against the sponsor register" disabled={busy} onClick={() => void checkSponsors([job.id])}>
                          <ShieldCheck className="h-3.5 w-3.5" /> Check
                        </Btn>
                        <Btn size="sm" variant="ghost" title="Edit" onClick={() => { setEditingId(job.id); setEditForm(jobToForm(job)) }}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Btn>
                        <button
                          type="button"
                          title={job.featured ? "Remove from featured" : "Pin to the top of the public Jobs page"}
                          disabled={busy}
                          onClick={() => void act({ action: "feature", ids: [job.id], featured: !job.featured }, () => (job.featured ? "Unfeatured." : "Featured."))}
                          className={`inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-bold transition disabled:opacity-50 ${
                            job.featured
                              ? "bg-amber-400 text-[#1a1206] hover:bg-amber-300"
                              : "border border-amber-400/40 text-amber-200 hover:bg-amber-400/10"
                          }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${job.featured ? "fill-current" : ""}`} />
                          {job.featured ? "Unfeature" : "Feature"}
                        </button>
                        {job.url && (
                          <a href={job.url} target="_blank" rel="noreferrer" title="Open job" className="inline-flex h-7 items-center rounded-lg px-2 text-white/60 hover:bg-white/5 hover:text-white">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <Btn size="sm" variant="ghost" title="Delete" className="hover:text-rose-300" disabled={busy} onClick={() => deleteJobs([job.id], `"${job.title}"`)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Btn>
                      </div>
                    </td>
                  </tr>
                )
                return (
                  <Fragment key={job.id}>
                    {divider}
                    {row}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pager page={page} totalPages={data?.totalPages ?? 1} total={data?.total} label="jobs" onPage={(p) => { setPage(p); selection.clear() }} />
      </Panel>
    </div>
  )
}
