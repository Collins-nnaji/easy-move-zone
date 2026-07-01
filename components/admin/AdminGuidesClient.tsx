"use client"

import { useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { fetchGuides } from "@/lib/relocate/client"
import type { RelocationCountryGuide } from "@/lib/relocate/types"

function lines(value: string[]) {
  return value.join("\n")
}

function parseLines(text: string) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean)
}

export function AdminGuidesClient() {
  const [guides, setGuides] = useState<RelocationCountryGuide[]>([])
  const [activeId, setActiveId] = useState("")
  const [draft, setDraft] = useState<RelocationCountryGuide | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    fetchGuides()
      .then((rows) => {
        setGuides(rows)
        if (rows[0]) {
          setActiveId(rows[0].id)
          setDraft(rows[0])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  function selectGuide(id: string) {
    const g = guides.find((row) => row.id === id)
    if (!g) return
    setActiveId(id)
    setDraft({ ...g })
    setStatus("")
  }

  async function save() {
    if (!draft || saving) return
    setSaving(true)
    setStatus("")
    try {
      const res = await fetch(`/api/admin/guides/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guide: {
            visaSummary: draft.visaSummary,
            healthcareTip: draft.healthcareTip,
            bankingTip: draft.bankingTip,
            schoolingTip: draft.schoolingTip,
            simTip: draft.simTip,
            neighborhoodsTip: draft.neighborhoodsTip,
            communityTip: draft.communityTip,
            transportTip: draft.transportTip,
            estimatedSetupDays: draft.estimatedSetupDays,
            requiredDocuments: draft.requiredDocuments,
            preMoveSteps: draft.preMoveSteps,
            firstWeekSteps: draft.firstWeekSteps,
          },
        }),
      })
      if (!res.ok) throw new Error("save failed")
      const data = (await res.json()) as { guide: RelocationCountryGuide }
      setGuides((prev) => prev.map((g) => (g.id === data.guide.id ? data.guide : g)))
      setDraft(data.guide)
      setStatus("Saved.")
    } catch {
      setStatus("Unable to save guide.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading guides…
      </div>
    )
  }

  return (
    <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
        <p className="text-xs font-bold uppercase tracking-wide text-white/40">Countries</p>
        <div className="mt-3 space-y-1">
          {guides.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => selectGuide(g.id)}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${
                activeId === g.id ? "bg-white text-[#0f172a] font-semibold" : "text-white/70 hover:bg-white/10"
              }`}
            >
              {g.country}
              {g.citySlug ? <span className="ml-1 text-[10px] opacity-60">({g.citySlug})</span> : null}
            </button>
          ))}
        </div>
      </aside>

      {draft ? (
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold">Edit {draft.country}</h1>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
          {status ? <p className="text-sm text-emerald-400">{status}</p> : null}

          <label className="block text-sm">
            <span className="text-white/50">Visa summary</span>
            <textarea value={draft.visaSummary} onChange={(e) => setDraft({ ...draft, visaSummary: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            {[
              ["Healthcare", "healthcareTip"],
              ["Banking", "bankingTip"],
              ["Schooling", "schoolingTip"],
              ["SIM & data", "simTip"],
              ["Neighbourhoods", "neighborhoodsTip"],
              ["Transport", "transportTip"],
              ["Community", "communityTip"],
            ].map(([label, key]) => (
              <label key={key} className="block text-sm">
                <span className="text-white/50">{label}</span>
                <textarea
                  value={draft[key as keyof RelocationCountryGuide] as string}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>
            ))}
          </div>

          <label className="block text-sm">
            <span className="text-white/50">Required documents (one per line)</span>
            <textarea value={lines(draft.requiredDocuments)} onChange={(e) => setDraft({ ...draft, requiredDocuments: parseLines(e.target.value) })} rows={4} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white font-mono text-xs" />
          </label>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm">
              <span className="text-white/50">Pre-move steps</span>
              <textarea value={lines(draft.preMoveSteps)} onChange={(e) => setDraft({ ...draft, preMoveSteps: parseLines(e.target.value) })} rows={5} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white font-mono text-xs" />
            </label>
            <label className="block text-sm">
              <span className="text-white/50">First-week steps</span>
              <textarea value={lines(draft.firstWeekSteps)} onChange={(e) => setDraft({ ...draft, firstWeekSteps: parseLines(e.target.value) })} rows={5} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white font-mono text-xs" />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  )
}
