"use client"

import { useState } from "react"
import { Loader2, Search, Trash2 } from "lucide-react"
import { Btn, Panel, adminApi, errorMessage, inputClass, useNotify } from "./ui"

type Group = { key: string; count: number; ids: number[]; title: string; company: string | null }
type ScanResult = { groups: number; removable: number; sample: Group[] }

export function DuplicatesTab({ onDeleted }: { onDeleted?: () => void }) {
  const notify = useNotify()
  const [match, setMatch] = useState("title-company-location")
  const [keep, setKeep] = useState("newest")
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [busy, setBusy] = useState<"scan" | "delete" | null>(null)

  async function runScan() {
    setBusy("scan")
    try {
      setScan(await adminApi<ScanResult>(`/api/admin/jobs?view=duplicates&match=${match}&keep=${keep}`))
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setBusy(null)
    }
  }

  async function removeAll() {
    if (!scan?.removable || !window.confirm(`Delete ${scan.removable.toLocaleString()} duplicate jobs, keeping the ${keep} copy in each group?`)) return
    setBusy("delete")
    try {
      const { deleted } = await adminApi<{ deleted: number }>("/api/admin/jobs", { action: "delete-duplicates", match, keep })
      notify(`Deleted ${deleted.toLocaleString()} duplicate jobs.`)
      setScan(null)
      onDeleted?.()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setBusy(null)
    }
  }

  return (
    <Panel title="Duplicate jobs" description="Find live jobs posted more than once and remove the extra copies.">
      <div className="flex flex-wrap items-center gap-2">
        <select className={inputClass} value={match} onChange={(e) => { setMatch(e.target.value); setScan(null) }}>
          <option value="title-company-location">Match: title + company + location</option>
          <option value="title-company">Match: title + company</option>
          <option value="url">Match: URL</option>
        </select>
        <select className={inputClass} value={keep} onChange={(e) => { setKeep(e.target.value); setScan(null) }}>
          <option value="newest">Keep newest</option>
          <option value="oldest">Keep oldest</option>
        </select>
        <Btn variant="primary" disabled={busy !== null} onClick={() => void runScan()}>
          {busy === "scan" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />} Scan
        </Btn>
        {scan && scan.removable > 0 && (
          <Btn variant="danger" disabled={busy !== null} onClick={() => void removeAll()}>
            {busy === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete {scan.removable.toLocaleString()} duplicates
          </Btn>
        )}
      </div>

      {scan && (
        <div className="mt-4">
          <p className="text-xs text-white/50">
            {scan.groups
              ? `${scan.groups.toLocaleString()} duplicate groups · ${scan.removable.toLocaleString()} extra copies${scan.groups > scan.sample.length ? ` · showing first ${scan.sample.length}` : ""}`
              : "No duplicates found."}
          </p>
          {scan.sample.length > 0 && (
            <div className="mt-3 max-h-[480px] overflow-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-[#121826] text-[10px] uppercase tracking-wide text-white/40">
                  <tr>
                    <th className="p-3">Job</th>
                    <th className="p-3">Copies</th>
                    <th className="p-3">Keeps</th>
                    <th className="p-3">Removes</th>
                  </tr>
                </thead>
                <tbody>
                  {scan.sample.map((group) => (
                    <tr key={group.key} className="border-t border-white/5">
                      <td className="max-w-[24rem] p-3">
                        <p className="truncate text-xs font-semibold">{group.title}</p>
                        <p className="truncate text-[11px] text-white/40">{group.company}</p>
                      </td>
                      <td className="p-3 text-xs">{group.count}</td>
                      <td className="p-3 font-mono text-[11px] text-emerald-300">#{group.ids[0]}</td>
                      <td className="p-3 font-mono text-[11px] text-rose-300">{group.ids.slice(1).map((id) => `#${id}`).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
