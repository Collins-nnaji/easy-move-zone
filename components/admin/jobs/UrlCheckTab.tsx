"use client"

import { useState } from "react"
import { ExternalLink, Loader2, ShieldCheck, ShieldX, Trash2 } from "lucide-react"
import { Badge, Btn, Check, Panel, adminApi, errorMessage, inputClass, useNotify, useSelection } from "./ui"

type Result = {
  id: number
  title: string
  company: string | null
  url: string
  status: string
  isValid: boolean
  contentAvailable: boolean
  error: string | null
}

type QueueResponse = { jobs: Array<{ id: number }>; skipped: number; remaining: number; total: number }

const BATCH = 50
const CHUNK = 10
const PARALLEL = 5

function statusBadge(result: Result) {
  if (result.status === "no-url") return <Badge>No URL</Badge>
  if (result.status === "timeout") return <Badge tone="error">Timeout</Badge>
  if (result.status === "error") return <Badge tone="error">Error</Badge>
  if (result.isValid) return <Badge tone="success">{result.status}</Badge>
  if (!result.contentAvailable && result.status.startsWith("2")) return <Badge tone="warning">Content gone</Badge>
  return <Badge tone="error">{result.status}</Badge>
}

export function UrlCheckTab({ onDeleted }: { onDeleted?: () => void }) {
  const notify = useNotify()
  const [results, setResults] = useState<Result[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [meta, setMeta] = useState<{ skipped: number; remaining: number; total: number; force: boolean } | null>(null)
  const [forcePage, setForcePage] = useState(1)
  const [deleting, setDeleting] = useState(false)
  const invalidSel = useSelection<number>()
  const validSel = useSelection<number>()

  async function run(force: boolean, nextPage = 1) {
    setRunning(true)
    setResults([])
    invalidSel.clear()
    validSel.clear()
    try {
      const queue = await adminApi<QueueResponse>("/api/admin/career-jobs", { action: "url-check-queue", limit: BATCH, force, page: nextPage })
      setMeta({ skipped: queue.skipped, remaining: queue.remaining, total: queue.total, force })
      setForcePage(nextPage)
      const ids = queue.jobs.map((job) => job.id)
      if (!ids.length) {
        notify(force ? "No more jobs to recheck." : "Every job was checked in the last 7 days. Use Force recheck to go again.", "info")
        return
      }
      setProgress({ done: 0, total: ids.length })
      const chunks: number[][] = []
      for (let i = 0; i < ids.length; i += CHUNK) chunks.push(ids.slice(i, i + CHUNK))
      const collected: Result[] = []
      const worker = async () => {
        while (chunks.length) {
          const chunk = chunks.shift()
          if (!chunk) return
          try {
            const { results: batch } = await adminApi<{ results: Result[] }>("/api/admin/career-jobs", { action: "check-urls", ids: chunk })
            collected.push(...batch)
            setResults([...collected])
          } catch (error) {
            notify(errorMessage(error), "error")
          }
          setProgress((prev) => ({ ...prev, done: Math.min(prev.done + chunk.length, prev.total) }))
        }
      }
      await Promise.all(Array.from({ length: PARALLEL }, worker))
      const invalid = collected.filter((r) => !r.isValid).length
      notify(`Checked ${collected.length} URLs: ${collected.length - invalid} valid, ${invalid} invalid.`, invalid ? "info" : "success")
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setRunning(false)
    }
  }

  async function deleteJobs(ids: number[], label: string) {
    if (!ids.length || !window.confirm(`Permanently delete ${ids.length} job${ids.length === 1 ? "" : "s"} with ${label} URLs?`)) return
    setDeleting(true)
    try {
      const { deleted } = await adminApi<{ deleted: number }>("/api/admin/jobs", { action: "delete", ids })
      notify(`Deleted ${deleted} job${deleted === 1 ? "" : "s"}.`)
      setResults((prev) => prev.filter((r) => !ids.includes(r.id)))
      invalidSel.clear()
      validSel.clear()
      onDeleted?.()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setDeleting(false)
    }
  }

  async function deleteOld(months: number) {
    if (!window.confirm(`Permanently delete every job posted more than ${months} months ago?`)) return
    setDeleting(true)
    try {
      const { deleted } = await adminApi<{ deleted: number }>("/api/admin/jobs", { action: "delete-old", months })
      notify(`Deleted ${deleted} jobs older than ${months} months.`)
      onDeleted?.()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setDeleting(false)
    }
  }

  const valid = results.filter((r) => r.isValid)
  const invalid = results.filter((r) => !r.isValid)
  const summary = {
    gone: invalid.filter((r) => !r.contentAvailable && r.status.startsWith("2")).length,
    notFound: invalid.filter((r) => r.status === "404" || r.status === "410").length,
    errors: invalid.filter((r) => r.status === "error" || r.status === "timeout").length,
    noUrl: invalid.filter((r) => r.status === "no-url").length,
  }

  const column = (
    title: string,
    rows: Result[],
    sel: ReturnType<typeof useSelection<number>>,
    tone: "valid" | "invalid",
  ) => {
    const ids = rows.map((r) => r.id)
    return (
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className={`flex items-center gap-1.5 text-sm font-bold ${tone === "valid" ? "text-emerald-300" : "text-rose-300"}`}>
            {tone === "valid" ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />} {title} ({rows.length})
          </h3>
          {rows.length > 0 && (
            <div className="flex gap-1">
              <Btn size="sm" onClick={() => sel.setSelected(new Set(ids))}>Select all</Btn>
              <Btn size="sm" variant="ghost" onClick={sel.clear}>Clear</Btn>
              <Btn size="sm" variant="danger" disabled={!sel.selected.size || deleting} onClick={() => void deleteJobs([...sel.selected], tone)}>
                <Trash2 className="h-3 w-3" /> Delete ({sel.selected.size})
              </Btn>
            </div>
          )}
        </div>
        <div className="h-[420px] space-y-1.5 overflow-y-auto rounded-xl border border-white/10 p-2">
          {!rows.length && <p className="p-4 text-center text-xs text-white/30">None</p>}
          {rows.map((r) => (
            <div key={r.id} className={`flex items-start gap-2 rounded-lg border-l-2 bg-white/[0.03] p-2 ${tone === "valid" ? "border-emerald-400/60" : "border-rose-400/60"}`}>
              <Check checked={sel.selected.has(r.id)} onChange={() => sel.toggle(r.id)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{r.title}</p>
                <p className="truncate text-[11px] text-white/50">{r.company}</p>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer" className="block truncate text-[11px] text-white/30 hover:text-white/60">{r.url}</a>
                ) : (
                  <p className="text-[11px] text-white/30">No URL</p>
                )}
                {r.error && <p className="truncate font-mono text-[10px] text-rose-300/80">{r.error}</p>}
              </div>
              <div className="flex items-center gap-1">
                {statusBadge(r)}
                {r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer" className="rounded p-1 text-white/40 hover:text-white" title="Open">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Panel
        title="URL validation"
        description="Checks job links for dead pages and roles that are no longer open. Smart check skips jobs verified in the last 7 days; Force recheck ignores that."
        actions={
          <select className={inputClass} value="" disabled={deleting} onChange={(e) => e.target.value && void deleteOld(Number(e.target.value))} aria-label="Bulk delete old jobs">
            <option value="">Bulk delete old jobs…</option>
            <option value="2">Older than 2 months</option>
            <option value="3">Older than 3 months</option>
          </select>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="primary" disabled={running} onClick={() => void run(false)}>
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            {running ? `Checking ${progress.done}/${progress.total}…` : `Smart check (${BATCH})`}
          </Btn>
          <Btn disabled={running} onClick={() => void run(true, 1)}>Force recheck ({BATCH})</Btn>
          {meta && !running && meta.remaining > 0 && (
            <Btn disabled={running} onClick={() => void run(meta.force, meta.force ? forcePage + 1 : 1)}>
              Check next {BATCH}
            </Btn>
          )}
        </div>

        {meta && (
          <p className="mt-3 text-xs text-white/50">
            {results.length} checked · {valid.length} valid · {invalid.length} invalid
            {summary.gone ? ` · ${summary.gone} content gone` : ""}
            {summary.notFound ? ` · ${summary.notFound} not found` : ""}
            {summary.errors ? ` · ${summary.errors} errors/timeouts` : ""}
            {summary.noUrl ? ` · ${summary.noUrl} no URL` : ""}
            {!meta.force && meta.skipped ? ` · ${meta.skipped.toLocaleString()} recently validated (skipped)` : ""}
            {` · ${meta.remaining.toLocaleString()} left to check of ${meta.total.toLocaleString()}`}
          </p>
        )}
      </Panel>

      {(results.length > 0 || running) && (
        <Panel>
          <div className="grid gap-5 lg:grid-cols-2">
            {column("Invalid URLs", invalid, invalidSel, "invalid")}
            {column("Valid URLs", valid, validSel, "valid")}
          </div>
        </Panel>
      )}
    </div>
  )
}
