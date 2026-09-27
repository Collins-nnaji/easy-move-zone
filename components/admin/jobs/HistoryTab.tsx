"use client"

import { useCallback, useEffect, useState } from "react"
import { ExternalLink, RefreshCw } from "lucide-react"
import { Badge, Btn, Pager, Panel, adminApi, errorMessage, formatWhen, inputClass, useNotify } from "./ui"

type HistoryRow = {
  id: number
  company: string | null
  url: string
  source: string
  status: "success" | "failed"
  found: number
  staged: number
  duplicates: number
  method: string | null
  error: string | null
  duration_ms: number | null
  created_by: string | null
  created_at: string
}

type HistoryResponse = {
  rows: HistoryRow[]
  total: number
  totalPages: number
  summary: { runs: number; succeeded: number; failed: number; staged: number; last_24h: number } | null
}

const SOURCE_LABEL: Record<string, string> = { single: "Fetcher", bulk: "Bulk fetch", sponsor: "Sponsors" }

export function HistoryTab({ refreshKey }: { refreshKey: number }) {
  const notify = useNotify()
  const [status, setStatus] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)

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
      const params = new URLSearchParams({ view: "history", status, page: String(page), limit: "50" })
      if (q) params.set("q", q)
      setData(await adminApi<HistoryResponse>(`/api/admin/career-jobs?${params}`))
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setLoading(false)
    }
  }, [status, page, q, notify])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  async function clearAll() {
    if (!window.confirm("Clear the whole fetch history? Saved URLs keep their last-run status.")) return
    try {
      await adminApi("/api/admin/career-jobs", { action: "clear-history" })
      notify("History cleared.")
      await load()
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const summary = data?.summary
  const rows = data?.rows ?? []

  return (
    <Panel
      title="Fetch history"
      description="Every fetch run from the Fetcher, Bulk fetch and Sponsors tabs: what was fetched, what failed, and when."
      actions={
        <>
          <Btn onClick={() => void load()}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Btn>
          <Btn variant="danger" onClick={() => void clearAll()}>Clear history</Btn>
        </>
      }
    >
      {summary && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ["Runs", summary.runs],
            ["Succeeded", summary.succeeded],
            ["Failed", summary.failed],
            ["Jobs staged", summary.staged],
            ["Last 24h", summary.last_24h],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="text-lg font-bold">{Number(value).toLocaleString()}</p>
              <p className="text-[11px] text-white/40">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input className={`${inputClass} min-w-[14rem] flex-1`} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search company or URL" />
        {(["all", "success", "failed"] as const).map((key) => (
          <Btn key={key} variant={status === key ? "light" : "secondary"} onClick={() => { setStatus(key); setPage(1) }}>
            {key === "all" ? "All" : key === "success" ? "Succeeded" : "Failed"}
          </Btn>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-white/[0.04] text-[10px] uppercase tracking-wide text-white/40">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Company</th>
              <th className="p-3">Source</th>
              <th className="p-3">Result</th>
              <th className="p-3">Method</th>
              <th className="p-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading && !rows.length && <tr><td colSpan={6} className="p-6 text-center text-white/40">Loading…</td></tr>}
            {!loading && !rows.length && <tr><td colSpan={6} className="p-6 text-center text-white/40">No fetch runs recorded yet.</td></tr>}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="whitespace-nowrap p-3 align-top text-xs text-white/60">
                  {formatWhen(row.created_at)}
                  {row.created_by && <p className="text-[10px] text-white/30">{row.created_by}</p>}
                </td>
                <td className="max-w-[18rem] p-3 align-top">
                  <p className="truncate text-xs font-semibold">{row.company || "—"}</p>
                  <a href={row.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate text-[11px] text-white/30 hover:text-white/60">
                    <span className="truncate">{row.url}</span> <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                  </a>
                </td>
                <td className="p-3 align-top"><Badge>{SOURCE_LABEL[row.source] ?? row.source}</Badge></td>
                <td className="max-w-[20rem] p-3 align-top">
                  {row.status === "success" ? (
                    <Badge tone={row.staged > 0 ? "success" : "warning"}>
                      {row.staged} staged · {row.found} found{row.duplicates ? ` · ${row.duplicates} dupes` : ""}
                    </Badge>
                  ) : (
                    <>
                      <Badge tone="error">Failed</Badge>
                      <p className="mt-0.5 truncate text-[11px] text-rose-300/80" title={row.error ?? undefined}>{row.error}</p>
                    </>
                  )}
                </td>
                <td className="p-3 align-top text-xs text-white/50">{row.method && row.method !== "none" ? row.method : "—"}</td>
                <td className="p-3 text-right align-top text-xs text-white/40">{row.duration_ms != null ? `${(row.duration_ms / 1000).toFixed(1)}s` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} totalPages={data?.totalPages ?? 1} total={data?.total} label="runs" onPage={setPage} />
    </Panel>
  )
}
