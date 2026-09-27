"use client"

import { useMemo, useState } from "react"
import { Download, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react"
import { Btn, Check, Panel, RunStatus, adminApi, errorMessage, inputClass, useNotify, useSelection } from "./ui"

export type SavedUrl = {
  id: number
  label: string
  url: string
  company: string | null
  category: string | null
  created_at: string | null
  last_fetched_at: string | null
  last_fetch_status: string | null
  last_fetch_error: string | null
  last_failed_at: string | null
}

type Filter = "all" | "failed" | "success" | "never"

export function FetcherTab({ urls, reload, onStaged }: { urls: SavedUrl[]; reload: () => Promise<void>; onStaged: () => void }) {
  const notify = useNotify()
  const [company, setCompany] = useState("")
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [busy, setBusy] = useState(false)
  const [fetchingId, setFetchingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [edit, setEdit] = useState({ label: "", url: "", company: "", category: "" })
  const selection = useSelection<number>()

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return urls.filter((item) => {
      if (needle && !`${item.company ?? ""} ${item.label} ${item.url}`.toLowerCase().includes(needle)) return false
      if (filter === "failed") return item.last_fetch_status === "failed"
      if (filter === "success") return item.last_fetch_status === "success"
      if (filter === "never") return !item.last_fetch_status
      return true
    })
  }, [urls, search, filter])

  const counts = useMemo(
    () => ({
      failed: urls.filter((u) => u.last_fetch_status === "failed").length,
      success: urls.filter((u) => u.last_fetch_status === "success").length,
      never: urls.filter((u) => !u.last_fetch_status).length,
    }),
    [urls],
  )

  const visibleIds = visible.map((item) => item.id)
  const selectedIds = [...selection.selected]

  async function addUrl(event: React.FormEvent) {
    event.preventDefault()
    if (!url.trim()) return
    setBusy(true)
    try {
      await adminApi("/api/admin/career-jobs", { action: "save-url", url, company, category, label: company || url })
      notify(`Saved careers URL${company ? ` for ${company}` : ""}.`)
      setUrl("")
      setCompany("")
      setCategory("")
      await reload()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setBusy(false)
    }
  }

  async function fetchOne(item: SavedUrl) {
    setFetchingId(item.id)
    try {
      const result = await adminApi<{ staged: number; found: number; duplicates: number; method: string }>("/api/admin/career-jobs", {
        action: "fetch-url",
        id: item.id,
        url: item.url,
        company: item.company,
        source: "single",
      })
      notify(
        `${item.company || item.label}: ${result.found} found, ${result.staged} staged${result.duplicates ? `, ${result.duplicates} duplicates skipped` : ""} (via ${result.method}).`,
        result.staged > 0 ? "success" : "info",
      )
      onStaged()
    } catch (error) {
      notify(`${item.company || item.label}: ${errorMessage(error)}`, "error")
    } finally {
      setFetchingId(null)
      await reload()
    }
  }

  async function remove(ids: number[]) {
    if (!ids.length || !window.confirm(`Delete ${ids.length} saved URL${ids.length === 1 ? "" : "s"}?`)) return
    setBusy(true)
    try {
      const { deleted } = await adminApi<{ deleted: number }>("/api/admin/career-jobs", { action: "delete-urls", ids })
      notify(`Deleted ${deleted} URL${deleted === 1 ? "" : "s"}.`)
      selection.clear()
      await reload()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setBusy(false)
    }
  }

  async function saveEdit() {
    if (editingId == null) return
    setBusy(true)
    try {
      await adminApi("/api/admin/career-jobs", { action: "update-url", id: editingId, ...edit })
      notify("URL updated.")
      setEditingId(null)
      await reload()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <Panel title="Add a careers page" description="Paste a company careers page or ATS board (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Recruitee). Fetched roles go to Staged for review.">
        <form onSubmit={(e) => void addUrl(e)} className="grid gap-2 sm:grid-cols-[1fr_1.6fr_0.8fr_auto]">
          <input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
          <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://company.com/careers" required />
          <input className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" />
          <Btn variant="primary" type="submit" disabled={busy}>Save URL</Btn>
        </form>
      </Panel>

      <Panel
        title={`Saved careers URLs (${urls.length})`}
        description={`${counts.success} fetched OK · ${counts.failed} failed last run · ${counts.never} never fetched`}
      >
        <div className="flex flex-wrap gap-2">
          <input className={`${inputClass} min-w-[14rem] flex-1`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company or URL" />
          {(["all", "failed", "success", "never"] as const).map((key) => (
            <Btn key={key} variant={filter === key ? "light" : "secondary"} onClick={() => setFilter(key)}>
              {key === "all" ? `All (${urls.length})` : key === "failed" ? `Failed (${counts.failed})` : key === "success" ? `OK (${counts.success})` : `Never (${counts.never})`}
            </Btn>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#e0511f]/40 bg-[#1a1410] px-3 py-2">
            <span className="text-xs font-bold">{selectedIds.length} selected</span>
            <Btn size="sm" variant="danger" disabled={busy} onClick={() => void remove(selectedIds)}><Trash2 className="h-3 w-3" /> Delete selected</Btn>
            <span className="text-[11px] text-white/40">Use the Bulk fetch tab to fetch many at once.</span>
            <Btn size="sm" variant="ghost" onClick={selection.clear}>Clear</Btn>
          </div>
        )}

        <div className="mt-3 max-h-[640px] overflow-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="sticky top-0 z-[1] bg-[#121826] text-[10px] uppercase tracking-wide text-white/40">
              <tr>
                <th className="w-10 p-3"><Check checked={selection.allOf(visibleIds)} onChange={() => selection.toggleAll(visibleIds)} label="Select all" /></th>
                <th className="p-3">Company</th>
                <th className="p-3">URL</th>
                <th className="p-3">Last run</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!visible.length && <tr><td colSpan={5} className="p-6 text-center text-white/40">No saved URLs match.</td></tr>}
              {visible.map((item) =>
                editingId === item.id ? (
                  <tr key={item.id} className="border-t border-white/10 bg-sky-500/5">
                    <td />
                    <td colSpan={4} className="p-3">
                      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1.6fr_0.8fr_auto_auto]">
                        <input className={inputClass} value={edit.company} onChange={(e) => setEdit({ ...edit, company: e.target.value })} placeholder="Company" />
                        <input className={inputClass} value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} placeholder="Label" />
                        <input className={inputClass} value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} placeholder="URL" />
                        <input className={inputClass} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} placeholder="Category" />
                        <Btn variant="primary" disabled={busy} onClick={() => void saveEdit()}>Save</Btn>
                        <Btn onClick={() => setEditingId(null)}>Cancel</Btn>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                    <td className="p-3 align-top"><Check checked={selection.selected.has(item.id)} onChange={() => selection.toggle(item.id)} /></td>
                    <td className="p-3 align-top">
                      <p className="font-semibold">{item.company || item.label}</p>
                      {item.category && <p className="text-[11px] text-white/40">{item.category}</p>}
                    </td>
                    <td className="max-w-[20rem] p-3 align-top">
                      <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate text-xs text-[#f3aa79] hover:underline">
                        <span className="truncate">{item.url}</span> <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                    <td className="p-3 align-top">
                      <RunStatus
                        status={fetchingId === item.id ? { state: "running" } : undefined}
                        persisted={{
                          status: item.last_fetch_status,
                          error: item.last_fetch_error,
                          at: item.last_fetch_status === "failed" ? item.last_failed_at ?? item.last_fetched_at : item.last_fetched_at,
                        }}
                      />
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex justify-end gap-1">
                        <Btn size="sm" variant="light" disabled={fetchingId !== null} onClick={() => void fetchOne(item)}>
                          {fetchingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} Fetch
                        </Btn>
                        <Btn
                          size="sm"
                          variant="ghost"
                          title="Edit"
                          onClick={() => {
                            setEditingId(item.id)
                            setEdit({ label: item.label ?? "", url: item.url, company: item.company ?? "", category: item.category ?? "" })
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Btn>
                        <Btn size="sm" variant="ghost" title="Delete" className="hover:text-rose-300" disabled={busy} onClick={() => void remove([item.id])}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
