"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, Loader2, Play, Save, Square } from "lucide-react"
import { Btn, Check, Pager, Panel, RunStatus, adminApi, errorMessage, inputClass, useFetchRunner, useNotify, useSelection, type FetchTarget } from "./ui"

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
  last_fetch_error: string | null
  last_fetched_at: string | null
}

type SponsorResponse = { sponsors: SponsorRow[]; total: number; totalPages: number }

const PAGE_SIZE = 50

export function SponsorsTab({ onUrlsChanged, onStaged }: { onUrlsChanged: () => Promise<void>; onStaged: () => void }) {
  const notify = useNotify()
  const runner = useFetchRunner("sponsor")
  const selection = useSelection<number>()
  const [searchInput, setSearchInput] = useState("")
  const [q, setQ] = useState("")
  const [hasUrl, setHasUrl] = useState<"any" | "yes" | "no">("any")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<SponsorResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [savingId, setSavingId] = useState<number | null>(null)

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
      const params = new URLSearchParams({ view: "sponsors", hasUrl, page: String(page), limit: String(PAGE_SIZE) })
      if (q) params.set("q", q)
      const result = await adminApi<SponsorResponse>(`/api/admin/career-jobs?${params}`)
      setData(result)
      setDrafts(Object.fromEntries(result.sponsors.map((row) => [row.id, row.career_url ?? ""])))
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setLoading(false)
    }
  }, [hasUrl, page, q, notify])

  useEffect(() => {
    void load()
  }, [load])

  const sponsors = useMemo(() => data?.sponsors ?? [], [data])
  const pageIds = sponsors.map((s) => s.id)
  const draftFor = (row: SponsorRow) => (drafts[row.id] ?? "").trim()
  const selectedRows = sponsors.filter((row) => selection.selected.has(row.id))
  const fetchable = selectedRows.filter((row) => draftFor(row) || row.career_url)

  async function saveUrl(row: SponsorRow) {
    const url = draftFor(row)
    if (!url) {
      notify("Enter a careers URL first.", "error")
      return
    }
    setSavingId(row.id)
    try {
      await adminApi("/api/admin/career-jobs", { action: "upsert-sponsor-url", company: row.name, url, label: row.name })
      notify(`Saved careers URL for ${row.name}.`)
      await Promise.all([load(), onUrlsChanged()])
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setSavingId(null)
    }
  }

  const prepare = useCallback(
    async (target: FetchTarget): Promise<FetchTarget> => {
      const row = sponsors.find((s) => `sp-${s.id}` === target.key)
      if (row && row.saved_url_id && row.career_url === target.url) return { ...target, savedUrlId: row.saved_url_id }
      const { saved } = await adminApi<{ saved: { id: number; url: string } }>("/api/admin/career-jobs", {
        action: "upsert-sponsor-url",
        company: target.name,
        url: target.url,
        label: target.name,
      })
      return { ...target, url: saved.url, savedUrlId: saved.id }
    },
    [sponsors],
  )

  async function fetchRows(rows: SponsorRow[]) {
    const targets = rows
      .map((row) => ({ key: `sp-${row.id}`, name: row.name, url: draftFor(row) || row.career_url || "" }))
      .filter((t) => t.url)
    if (!targets.length) {
      notify("None of the selected sponsors has a careers URL yet.", "error")
      return
    }
    const result = await runner.run(targets, prepare)
    await Promise.all([load(), onUrlsChanged()])
    if (result.staged > 0) onStaged()
    notify(
      result.cancelled
        ? `Stopped. ${result.succeeded} succeeded, ${result.failed} failed so far.`
        : `Sponsor fetch finished: ${result.succeeded} succeeded, ${result.failed} failed, ${result.staged} jobs staged.`,
      result.failed && !result.succeeded ? "error" : "success",
    )
  }

  const withUrlOnPage = sponsors.filter((row) => draftFor(row) || row.career_url).map((row) => row.id)

  return (
    <Panel
      title={`Sponsor register companies (${(data?.total ?? 0).toLocaleString()})`}
      description="The UK licensed sponsor register. Saving a careers URL also shows it on the public sponsors page. Fetch one, or select many and bulk fetch; results go to History."
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
      <div className="flex flex-wrap gap-2">
        <input className={`${inputClass} min-w-[14rem] flex-1`} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search company or city" />
        <select className={inputClass} value={hasUrl} onChange={(e) => { setHasUrl(e.target.value as "any" | "yes" | "no"); setPage(1); selection.clear() }}>
          <option value="any">All sponsors</option>
          <option value="yes">Has careers URL</option>
          <option value="no">Missing careers URL</option>
        </select>
        <Btn disabled={runner.running || !withUrlOnPage.length} onClick={() => selection.toggleAll(withUrlOnPage)}>
          {selection.allOf(withUrlOnPage) ? "Deselect page" : `Select page with URL (${withUrlOnPage.length})`}
        </Btn>
        <Btn variant="primary" disabled={runner.running || !fetchable.length} onClick={() => void fetchRows(fetchable)}>
          <Play className="h-3.5 w-3.5" /> Fetch selected ({fetchable.length})
        </Btn>
      </div>
      {selectedRows.length > fetchable.length && (
        <p className="mt-2 text-[11px] text-amber-300/80">{selectedRows.length - fetchable.length} selected sponsor(s) have no careers URL and will be skipped.</p>
      )}

      <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-white/[0.04] text-[10px] uppercase tracking-wide text-white/40">
            <tr>
              <th className="w-10 p-3"><Check checked={selection.allOf(pageIds)} disabled={runner.running} onChange={() => selection.toggleAll(pageIds)} label="Select page" /></th>
              <th className="p-3">Sponsor</th>
              <th className="p-3">Careers URL</th>
              <th className="w-52 p-3">Last fetch</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !sponsors.length && <tr><td colSpan={5} className="p-6 text-center text-white/40">Loading sponsors…</td></tr>}
            {!loading && !sponsors.length && <tr><td colSpan={5} className="p-6 text-center text-white/40">No sponsors match.</td></tr>}
            {sponsors.map((row) => {
              const draft = drafts[row.id] ?? ""
              const changed = draft.trim() !== (row.career_url ?? "")
              return (
                <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="p-3 align-top"><Check checked={selection.selected.has(row.id)} disabled={runner.running} onChange={() => selection.toggle(row.id)} /></td>
                  <td className="max-w-[18rem] p-3 align-top">
                    <p className="font-semibold">{row.name}</p>
                    <p className="text-[11px] text-white/40">
                      {[row.city, row.county].filter(Boolean).join(", ") || "Location unknown"}
                      {row.route ? ` · ${row.route}` : ""}
                    </p>
                  </td>
                  <td className="p-3 align-top">
                    <input
                      className={`${inputClass} w-full min-w-[16rem]`}
                      value={draft}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [row.id]: e.target.value }))}
                      placeholder="https://company.com/careers"
                    />
                  </td>
                  <td className="p-3 align-top">
                    <RunStatus
                      status={runner.statuses[`sp-${row.id}`]}
                      persisted={{ status: row.last_fetch_status, error: row.last_fetch_error, at: row.last_fetched_at }}
                    />
                  </td>
                  <td className="p-3 align-top">
                    <div className="flex justify-end gap-1">
                      <Btn size="sm" disabled={!changed || savingId === row.id || runner.running} onClick={() => void saveUrl(row)}>
                        <Save className="h-3 w-3" /> Save
                      </Btn>
                      <Btn size="sm" variant="light" disabled={runner.running || !(draft.trim() || row.career_url)} onClick={() => void fetchRows([row])}>
                        <Download className="h-3 w-3" /> Fetch
                      </Btn>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Pager page={page} totalPages={data?.totalPages ?? 1} total={data?.total} label="sponsors" onPage={(p) => { setPage(p); selection.clear() }} />
    </Panel>
  )
}
