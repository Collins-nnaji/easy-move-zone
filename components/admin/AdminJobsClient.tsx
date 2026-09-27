"use client"

import { useCallback, useEffect, useState } from "react"
import { clsx } from "clsx"
import { BulkFetchTab } from "./jobs/BulkFetchTab"
import { DuplicatesTab } from "./jobs/DuplicatesTab"
import { FetcherTab, type SavedUrl } from "./jobs/FetcherTab"
import { HistoryTab } from "./jobs/HistoryTab"
import { JobsTab } from "./jobs/JobsTab"
import { SponsorCheckTab } from "./jobs/SponsorCheckTab"
import { SponsorsTab } from "./jobs/SponsorsTab"
import { StagedTab } from "./jobs/StagedTab"
import { UrlCheckTab } from "./jobs/UrlCheckTab"
import { NotifyProvider, adminApi } from "./jobs/ui"

const TABS = [
  { id: "jobs", label: "Jobs" },
  { id: "staged", label: "Staged" },
  { id: "fetcher", label: "Fetcher" },
  { id: "bulk", label: "Bulk fetch" },
  { id: "sponsors", label: "Sponsors" },
  { id: "sponsor-check", label: "Sponsor check" },
  { id: "urls", label: "URL check" },
  { id: "history", label: "History" },
  { id: "duplicates", label: "Duplicates" },
] as const

type TabId = (typeof TABS)[number]["id"]

export function AdminJobsClient() {
  return (
    <NotifyProvider>
      <AdminJobs />
    </NotifyProvider>
  )
}

function AdminJobs() {
  const [tab, setTab] = useState<TabId>("jobs")
  const [visited, setVisited] = useState<Set<TabId>>(new Set(["jobs"]))
  const [savedUrls, setSavedUrls] = useState<SavedUrl[]>([])
  const [pending, setPending] = useState(0)
  const [jobsKey, setJobsKey] = useState(0)
  const [stagedKey, setStagedKey] = useState(0)
  const [historyKey, setHistoryKey] = useState(0)

  const open = useCallback((next: TabId) => {
    setTab(next)
    setVisited((prev) => (prev.has(next) ? prev : new Set(prev).add(next)))
    window.history.replaceState(null, "", `#${next}`)
  }, [])

  useEffect(() => {
    const fromHash = window.location.hash.slice(1) as TabId
    if (TABS.some((t) => t.id === fromHash)) queueMicrotask(() => open(fromHash))
  }, [open])

  const loadUrls = useCallback(
    () =>
      adminApi<{ urls: SavedUrl[] }>("/api/admin/career-jobs?view=urls")
        .then((data) => setSavedUrls(data.urls))
        .catch(() => {}),
    [],
  )

  const loadPending = useCallback(
    () =>
      adminApi<{ total: number }>("/api/admin/staged?status=pending&limit=1")
        .then((data) => setPending(data.total))
        .catch(() => {}),
    [],
  )

  useEffect(() => {
    void Promise.all([loadUrls(), loadPending()])
  }, [loadUrls, loadPending])

  const onStaged = useCallback(() => {
    void loadPending()
    setStagedKey((k) => k + 1)
    setHistoryKey((k) => k + 1)
  }, [loadPending])

  const onPublished = useCallback(() => {
    void loadPending()
    setJobsKey((k) => k + 1)
  }, [loadPending])

  const onJobsDeleted = useCallback(() => setJobsKey((k) => k + 1), [])

  const counts: Partial<Record<TabId, number>> = { staged: pending, fetcher: savedUrls.length }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold">Jobs admin</h1>
      <p className="mt-1 text-sm text-white/50">
        Manage live jobs, review fetched roles, run the fetchers and keep the board clean.
      </p>

      <nav className="mt-5 flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => open(item.id)}
            className={clsx(
              "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition",
              tab === item.id ? "bg-white text-[#0f172a]" : "bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            {item.label}
            {counts[item.id] ? (
              <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px]", item.id === "staged" ? "bg-amber-400 text-black" : tab === item.id ? "bg-black/10" : "bg-white/10")}>
                {counts[item.id]!.toLocaleString()}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="mt-5">
        {visited.has("jobs") && <div hidden={tab !== "jobs"}><JobsTab key={jobsKey} /></div>}
        {visited.has("staged") && <div hidden={tab !== "staged"}><StagedTab key={stagedKey} onPublished={onPublished} /></div>}
        {visited.has("fetcher") && (
          <div hidden={tab !== "fetcher"}><FetcherTab urls={savedUrls} reload={loadUrls} onStaged={onStaged} /></div>
        )}
        {visited.has("bulk") && (
          <div hidden={tab !== "bulk"}><BulkFetchTab urls={savedUrls} reload={loadUrls} onStaged={onStaged} /></div>
        )}
        {visited.has("sponsors") && (
          <div hidden={tab !== "sponsors"}><SponsorsTab onUrlsChanged={loadUrls} onStaged={onStaged} /></div>
        )}
        {visited.has("sponsor-check") && (
          <div hidden={tab !== "sponsor-check"}><SponsorCheckTab onJobsChanged={onJobsDeleted} /></div>
        )}
        {visited.has("urls") && <div hidden={tab !== "urls"}><UrlCheckTab onDeleted={onJobsDeleted} /></div>}
        {visited.has("history") && <div hidden={tab !== "history"}><HistoryTab refreshKey={historyKey} /></div>}
        {visited.has("duplicates") && <div hidden={tab !== "duplicates"}><DuplicatesTab onDeleted={onJobsDeleted} /></div>}
      </div>
    </div>
  )
}
