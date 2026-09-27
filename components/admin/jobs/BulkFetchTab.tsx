"use client"

import { useMemo, useState } from "react"
import { ExternalLink, Loader2, Play, RefreshCw, Square } from "lucide-react"
import type { SavedUrl } from "./FetcherTab"
import { Btn, Check, FETCH_CONCURRENCY, Panel, RunStatus, inputClass, useFetchRunner, useNotify, useSelection, type FetchTarget } from "./ui"

const BATCH_SIZE = 50

export function BulkFetchTab({ urls, reload, onStaged }: { urls: SavedUrl[]; reload: () => Promise<void>; onStaged: () => void }) {
  const notify = useNotify()
  const runner = useFetchRunner("bulk")
  const selection = useSelection<string>()
  const [batch, setBatch] = useState(1)
  const [onlyFailed, setOnlyFailed] = useState(false)

  const targets = useMemo(
    () =>
      urls.map((item) => ({
        key: `url-${item.id}`,
        name: item.company || item.label,
        url: item.url,
        savedUrlId: item.id,
        persisted: {
          status: item.last_fetch_status,
          error: item.last_fetch_error,
          at: item.last_fetch_status === "failed" ? item.last_failed_at ?? item.last_fetched_at : item.last_fetched_at,
        },
      })),
    [urls],
  )

  const totalBatches = Math.max(1, Math.ceil(targets.length / BATCH_SIZE))
  const current = Math.min(batch, totalBatches)
  const inBatch = batch === 0 ? targets : targets.slice((current - 1) * BATCH_SIZE, current * BATCH_SIZE)
  const visible = onlyFailed
    ? inBatch.filter((t) => runner.statuses[t.key]?.state === "failed" || (!runner.statuses[t.key] && t.persisted.status === "failed"))
    : inBatch
  const visibleKeys = visible.map((t) => t.key)

  const liveSuccess = Object.values(runner.statuses).filter((s) => s.state === "success")
  const liveFailed = Object.values(runner.statuses).filter((s) => s.state === "failed").length
  const liveStaged = liveSuccess.reduce((sum, s) => sum + (s.state === "success" ? s.staged : 0), 0)
  const failedTargets = targets.filter(
    (t) => runner.statuses[t.key]?.state === "failed" || (!runner.statuses[t.key] && t.persisted.status === "failed"),
  )

  async function start(list: FetchTarget[]) {
    if (!list.length) {
      notify("Select at least one company first.", "error")
      return
    }
    const result = await runner.run(list)
    await reload()
    if (result.staged > 0) onStaged()
    notify(
      result.cancelled
        ? `Stopped. ${result.succeeded} succeeded, ${result.failed} failed so far.`
        : `Bulk fetch finished: ${result.succeeded} succeeded, ${result.failed} failed, ${result.staged} jobs staged.`,
      result.failed && !result.succeeded ? "error" : "success",
    )
  }

  return (
    <Panel
      title="Bulk job fetcher"
      description={`Select companies, fetch all their roles in one run (${FETCH_CONCURRENCY} at a time), then review them in Staged. Pass/fail and timestamps are saved per URL and in History.`}
      actions={
        runner.running ? (
          <>
            <span className="text-xs font-bold text-sky-200">
              <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />
              {runner.progress.done} / {runner.progress.total} done
            </span>
            <Btn variant="danger" onClick={runner.cancel}><Square className="h-3 w-3" /> Stop</Btn>
          </>
        ) : null
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <select className={inputClass} value={batch === 0 ? 0 : current} disabled={runner.running} onChange={(e) => setBatch(Number(e.target.value))}>
          {Array.from({ length: totalBatches }, (_, i) => i + 1).map((b) => (
            <option key={b} value={b}>
              {targets.length
                ? `Batch ${b} (${(b - 1) * BATCH_SIZE + 1}–${Math.min(b * BATCH_SIZE, targets.length)})${b === 1 ? " · oldest" : ""}`
                : "Batch 1 (empty)"}
            </option>
          ))}
          <option value={0}>All batches ({targets.length})</option>
        </select>
        <Btn disabled={runner.running || !visible.length} onClick={() => selection.toggleAll(visibleKeys)}>
          {selection.allOf(visibleKeys) ? "Deselect batch" : "Select batch"}
        </Btn>
        <label className="flex items-center gap-2 px-1 text-xs font-semibold text-white/70">
          <Check checked={onlyFailed} onChange={() => setOnlyFailed((v) => !v)} label="Show failed only" /> Failed only
        </label>
        <div className="ml-auto flex flex-wrap gap-2">
          {failedTargets.length > 0 && !runner.running && (
            <Btn variant="secondary" className="text-amber-200" onClick={() => void start(failedTargets)}>
              <RefreshCw className="h-3.5 w-3.5" /> Retry {failedTargets.length} failed
            </Btn>
          )}
          {Object.keys(runner.statuses).length > 0 && !runner.running && <Btn variant="ghost" onClick={runner.reset}>Clear results</Btn>}
          <Btn
            variant="primary"
            disabled={runner.running || selection.selected.size === 0}
            onClick={() => void start(targets.filter((t) => selection.selected.has(t.key)))}
          >
            <Play className="h-3.5 w-3.5" /> Run bulk fetch ({selection.selected.size})
          </Btn>
        </div>
      </div>

      {(liveSuccess.length > 0 || liveFailed > 0) && (
        <div className="mt-3 flex flex-wrap gap-4 rounded-xl bg-white/[0.04] px-4 py-2.5 text-xs font-semibold">
          <span className="text-emerald-300">{liveSuccess.length} succeeded</span>
          <span className="text-rose-300">{liveFailed} failed</span>
          <span className="text-white/60">{liveStaged} jobs staged this run</span>
        </div>
      )}

      <div className="mt-3 max-h-[560px] overflow-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="sticky top-0 z-[1] bg-[#121826] text-[10px] uppercase tracking-wide text-white/40">
            <tr>
              <th className="w-10 p-3"><Check checked={selection.allOf(visibleKeys)} disabled={runner.running} onChange={() => selection.toggleAll(visibleKeys)} label="Select batch" /></th>
              <th className="p-3">Company</th>
              <th className="p-3">URL</th>
              <th className="w-56 p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {!visible.length && (
              <tr><td colSpan={4} className="p-6 text-center text-white/40">
                {targets.length ? "Nothing to show in this batch." : "No saved careers URLs yet. Add some in the Fetcher tab or the Sponsors tab."}
              </td></tr>
            )}
            {visible.map((target) => (
              <tr key={target.key} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="p-3 align-top"><Check checked={selection.selected.has(target.key)} disabled={runner.running} onChange={() => selection.toggle(target.key)} /></td>
                <td className="p-3 align-top text-xs font-semibold">{target.name}</td>
                <td className="max-w-[22rem] p-3 align-top">
                  <a href={target.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate text-xs text-[#f3aa79] hover:underline">
                    <span className="truncate">{target.url}</span> <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </td>
                <td className="p-3 align-top"><RunStatus status={runner.statuses[target.key]} persisted={target.persisted} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
