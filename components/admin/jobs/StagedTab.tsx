"use client"

import { useCallback, useEffect, useState } from "react"
import { Check as CheckIcon, ExternalLink, Pencil, Trash2, X } from "lucide-react"
import {
  Badge,
  Btn,
  Check,
  EMPTY_JOB_FORM,
  JobForm,
  Pager,
  Panel,
  adminApi,
  errorMessage,
  formatWhen,
  inputClass,
  useNotify,
  useSelection,
  type JobFormValues,
} from "./ui"

type StagedJob = {
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
  description: string | null
  status: string
  created_by: string | null
  created_at: string | null
}

type StagedResponse = {
  jobs: StagedJob[]
  total: number
  totalPages: number
  countries: Array<{ country: string; count: number }>
}

const PAGE_SIZE = 50

export function StagedTab({ onPublished }: { onPublished?: () => void }) {
  const notify = useNotify()
  const [status, setStatus] = useState("pending")
  const [country, setCountry] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<StagedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<JobFormValues>(EMPTY_JOB_FORM)
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
      if (status !== "all") params.set("status", status)
      if (country) params.set("country", country)
      if (q) params.set("q", q)
      setData(await adminApi<StagedResponse>(`/api/admin/staged?${params}`))
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setLoading(false)
    }
  }, [page, status, country, q, notify])

  useEffect(() => {
    void load()
  }, [load])

  const jobs = data?.jobs ?? []
  const pageIds = jobs.map((job) => job.id)
  const selectedIds = [...selection.selected]
  const total = data?.total ?? 0

  async function act(action: "approve" | "reject" | "delete", ids: number[]) {
    if (!ids.length) return
    if (action === "delete" && !window.confirm(`Delete ${ids.length} staged job${ids.length === 1 ? "" : "s"}?`)) return
    setBusy(true)
    try {
      const { affected } = await adminApi<{ affected: number }>("/api/admin/staged", { action, ids })
      notify(
        action === "approve"
          ? `Published ${affected} job${affected === 1 ? "" : "s"}${affected < ids.length ? ` (${ids.length - affected} already live or not pending)` : ""}.`
          : action === "reject"
            ? `Rejected ${affected}.`
            : `Deleted ${affected}.`,
      )
      selection.clear()
      await load()
      if (action === "approve") onPublished?.()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setBusy(false)
    }
  }

  async function bulkByFilter(bulk: "approve" | "reject" | "delete") {
    const scope = `${total.toLocaleString()} ${status === "all" ? "" : status} staged job${total === 1 ? "" : "s"}${country ? ` in ${country}` : ""}`
    const verb = bulk === "approve" ? "Publish" : bulk === "reject" ? "Reject" : "Permanently delete"
    if (!window.confirm(`${verb} all ${scope}? This covers every page, not just the one on screen.`)) return
    setBusy(true)
    let affected = 0
    try {
      for (let i = 0; i < 200; i++) {
        const result = await adminApi<{ affected: number; remaining: number }>("/api/admin/staged", {
          action: "bulk-by-filter",
          bulk,
          status: status === "all" ? null : status,
          country: country || null,
        })
        affected += result.affected
        setProgress(`${verb.replace("Permanently ", "")}: ${affected.toLocaleString()} done · ${result.remaining.toLocaleString()} left`)
        if (!result.remaining) break
      }
      notify(`${verb} complete: ${affected.toLocaleString()} jobs.`)
      selection.clear()
      setPage(1)
      await load()
      if (bulk === "approve") onPublished?.()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setProgress(null)
      setBusy(false)
    }
  }

  async function saveEdit() {
    if (editing == null) return
    setBusy(true)
    try {
      await adminApi("/api/admin/staged", { action: "update", id: editing, job: editForm })
      notify("Staged job updated.")
      setEditing(null)
      await load()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setBusy(false)
    }
  }

  const pendingView = status === "pending"

  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          Staged jobs {pendingView && total > 0 && <Badge tone="warning">{total.toLocaleString()} pending</Badge>}
        </span>
      }
      description="Fetched roles wait here for review. Approving publishes them to the live Jobs page; duplicates of live URLs are skipped."
      actions={
        <>
          {pendingView && total > 0 && (
            <Btn variant="success" disabled={busy} onClick={() => void bulkByFilter("approve")}>
              Publish all {country ? `in ${country}` : "pending"} ({total.toLocaleString()})
            </Btn>
          )}
          {pendingView && total > 0 && (
            <Btn disabled={busy} onClick={() => void bulkByFilter("reject")}>Reject all</Btn>
          )}
          {total > 0 && (
            <Btn variant="danger" disabled={busy} onClick={() => void bulkByFilter("delete")}>Delete all matching</Btn>
          )}
        </>
      }
    >
      {progress && <p className="mb-3 rounded-lg bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-200">{progress}</p>}
      <div className="grid gap-2 sm:grid-cols-[1.5fr_auto_auto]">
        <input className={inputClass} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search title or company" />
        <select className={inputClass} value={status} onChange={(e) => { setStatus(e.target.value); setCountry(""); setPage(1); selection.clear() }}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All statuses</option>
        </select>
        <select className={inputClass} value={country} onChange={(e) => { setCountry(e.target.value); setPage(1); selection.clear() }}>
          <option value="">All countries</option>
          {data?.countries.map((c) => <option key={c.country} value={c.country}>{c.country} ({c.count.toLocaleString()})</option>)}
        </select>
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky top-2 z-10 mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#e0511f]/40 bg-[#1a1410] px-3 py-2 shadow-xl">
          <span className="text-xs font-bold">{selectedIds.length} selected</span>
          {pendingView && (
            <>
              <Btn size="sm" variant="success" disabled={busy} onClick={() => void act("approve", selectedIds)}>Approve & publish</Btn>
              <Btn size="sm" disabled={busy} onClick={() => void act("reject", selectedIds)}>Reject</Btn>
            </>
          )}
          <Btn size="sm" variant="danger" disabled={busy} onClick={() => void act("delete", selectedIds)}>Delete</Btn>
          <Btn size="sm" variant="ghost" onClick={selection.clear}>Clear</Btn>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-white/[0.04] text-[10px] uppercase tracking-wide text-white/40">
            <tr>
              <th className="w-10 p-3"><Check checked={selection.allOf(pageIds)} onChange={() => selection.toggleAll(pageIds)} label="Select page" /></th>
              <th className="p-3">Job</th>
              <th className="p-3">Location</th>
              <th className="p-3">Source</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !jobs.length && <tr><td colSpan={6} className="p-6 text-center text-white/40">Loading…</td></tr>}
            {!loading && !jobs.length && (
              <tr><td colSpan={6} className="p-6 text-center text-white/40">
                {pendingView ? "Nothing waiting for review. Run the fetcher to stage new roles." : "No staged jobs match these filters."}
              </td></tr>
            )}
            {jobs.map((job) =>
              editing === job.id ? (
                <tr key={job.id} className="border-t border-white/10 bg-sky-500/5">
                  <td colSpan={6} className="p-4">
                    <p className="mb-3 text-sm font-bold">Editing staged job #{job.id}</p>
                    <JobForm values={editForm} onChange={setEditForm} countries={data?.countries.map((c) => c.country)} showLogo={false} />
                    <div className="mt-3 flex gap-2">
                      <Btn variant="primary" disabled={busy} onClick={() => void saveEdit()}>Save</Btn>
                      <Btn onClick={() => setEditing(null)}>Cancel</Btn>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={job.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="p-3 align-top"><Check checked={selection.selected.has(job.id)} onChange={() => selection.toggle(job.id)} /></td>
                  <td className="max-w-[24rem] p-3 align-top">
                    <p className="truncate font-semibold" title={job.title}>{job.title}</p>
                    <p className="truncate text-xs text-white/50">{job.company}</p>
                    {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="block truncate text-[11px] text-white/30 hover:text-white/60">{job.url}</a>}
                  </td>
                  <td className="p-3 align-top text-xs text-white/60">
                    <p className="max-w-[12rem] truncate">{job.location}</p>
                    <p className="text-white/40">{job.country}</p>
                  </td>
                  <td className="p-3 align-top text-xs text-white/50">
                    {job.created_by ?? "—"}
                    <p className="text-white/30">{formatWhen(job.created_at)}</p>
                  </td>
                  <td className="p-3 align-top">
                    <Badge tone={job.status === "pending" ? "warning" : job.status === "approved" ? "success" : "error"}>{job.status}</Badge>
                  </td>
                  <td className="p-3 align-top">
                    <div className="flex justify-end gap-1">
                      {job.status === "pending" && (
                        <>
                          <Btn size="sm" variant="success" title="Approve & publish" disabled={busy} onClick={() => void act("approve", [job.id])}><CheckIcon className="h-3.5 w-3.5" /></Btn>
                          <Btn size="sm" variant="ghost" title="Reject" disabled={busy} onClick={() => void act("reject", [job.id])}><X className="h-3.5 w-3.5" /></Btn>
                        </>
                      )}
                      <Btn
                        size="sm"
                        variant="ghost"
                        title="Edit"
                        onClick={() => {
                          setEditing(job.id)
                          setEditForm({
                            ...EMPTY_JOB_FORM,
                            title: job.title ?? "",
                            company: job.company ?? "",
                            location: job.location ?? "",
                            country: job.country ?? "",
                            category: job.category ?? "",
                            experienceLevel: job.experience_level ?? "",
                            jobType: job.job_type ?? "",
                            visaType: job.visa_type ?? "",
                            url: job.url ?? "",
                            skills: (job.skills ?? []).join(", "),
                            description: job.description ?? "",
                          })
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Btn>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noreferrer" title="Open" className="inline-flex h-7 items-center rounded-lg px-2 text-white/60 hover:bg-white/5 hover:text-white">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <Btn size="sm" variant="ghost" title="Delete" className="hover:text-rose-300" disabled={busy} onClick={() => void act("delete", [job.id])}><Trash2 className="h-3.5 w-3.5" /></Btn>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} totalPages={data?.totalPages ?? 1} total={total} label="staged jobs" onPage={(p) => { setPage(p); selection.clear() }} />
    </Panel>
  )
}
