"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2, Save, ShieldCheck, Trash2 } from "lucide-react"
import type { VisaRequirementTemplate } from "@/lib/visa/types"

async function fetchTemplates(): Promise<VisaRequirementTemplate[]> {
  const res = await fetch("/api/admin/visa-templates", { cache: "no-store" })
  if (!res.ok) return []
  return ((await res.json()) as { templates: VisaRequirementTemplate[] }).templates
}

export function AdminVisaTemplatesClient() {
  const [templates, setTemplates] = useState<VisaRequirementTemplate[]>([])
  const [activeId, setActiveId] = useState("")
  const [draft, setDraft] = useState<VisaRequirementTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    fetchTemplates()
      .then((rows) => {
        setTemplates(rows)
        if (rows[0]) {
          setActiveId(rows[0].id)
          setDraft(rows[0])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  function selectTemplate(id: string) {
    const t = templates.find((row) => row.id === id)
    if (!t) return
    setActiveId(id)
    setDraft({ ...t })
    setStatus("")
  }

  async function save() {
    if (!draft || saving) return
    setSaving(true)
    setStatus("")
    try {
      const res = await fetch(`/api/admin/visa-templates/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visaTypeLabel: draft.visaTypeLabel,
          summary: draft.summary,
          requiredDocuments: draft.requiredDocuments,
          checklistTemplate: draft.checklistTemplate,
          processingTimeEstimate: draft.processingTimeEstimate,
          feeEstimate: draft.feeEstimate,
          validityNotes: draft.validityNotes,
        }),
      })
      if (!res.ok) throw new Error("save failed")
      const data = (await res.json()) as { template: VisaRequirementTemplate }
      setTemplates((prev) => prev.map((t) => (t.id === data.template.id ? data.template : t)))
      setDraft(data.template)
      setStatus("Saved and marked verified.")
    } catch {
      setStatus("Unable to save template.")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this template?")) return
    const res = await fetch(`/api/admin/visa-templates/${id}`, { method: "DELETE" })
    if (!res.ok) return
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    if (activeId === id) {
      setDraft(null)
      setActiveId("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading templates…
      </div>
    )
  }

  return (
    <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
        <p className="text-xs font-bold uppercase tracking-wide text-white/40">Templates</p>
        <div className="mt-3 space-y-1">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTemplate(t.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm ${
                activeId === t.id ? "bg-white text-[#0f172a] font-semibold" : "text-white/70 hover:bg-white/10"
              }`}
            >
              <span>
                {t.nationality} → {t.destinationCountry} ({t.visaType})
              </span>
              {t.source === "ai_generated" ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" /> : null}
            </button>
          ))}
        </div>
      </aside>

      {draft ? (
        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">
                {draft.nationality} → {draft.destinationCountry} — {draft.visaType}
              </h1>
              {draft.source === "ai_generated" ? (
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> AI-generated — review and save to mark verified
                </p>
              ) : (
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> {draft.source === "admin_edited" ? "Admin-verified" : "Curated"}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save & verify
              </button>
              <button
                type="button"
                onClick={() => void remove(draft.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {status ? <p className="text-sm text-emerald-400">{status}</p> : null}

          <label className="block text-sm">
            <span className="text-white/50">Visa type label</span>
            <input
              value={draft.visaTypeLabel}
              onChange={(e) => setDraft({ ...draft, visaTypeLabel: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/50">Summary</span>
            <textarea
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-white/50">Processing time estimate</span>
              <input
                value={draft.processingTimeEstimate}
                onChange={(e) => setDraft({ ...draft, processingTimeEstimate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </label>
            <label className="block text-sm">
              <span className="text-white/50">Fee estimate</span>
              <input
                value={draft.feeEstimate}
                onChange={(e) => setDraft({ ...draft, feeEstimate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-white/50">Validity notes</span>
            <textarea
              value={draft.validityNotes}
              onChange={(e) => setDraft({ ...draft, validityNotes: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/50">Required documents (JSON array)</span>
            <textarea
              value={JSON.stringify(draft.requiredDocuments, null, 2)}
              onChange={(e) => {
                try {
                  setDraft({ ...draft, requiredDocuments: JSON.parse(e.target.value) })
                } catch {
                  /* ignore invalid JSON while typing */
                }
              }}
              rows={8}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white"
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/50">Checklist template (JSON array)</span>
            <textarea
              value={JSON.stringify(draft.checklistTemplate, null, 2)}
              onChange={(e) => {
                try {
                  setDraft({ ...draft, checklistTemplate: JSON.parse(e.target.value) })
                } catch {
                  /* ignore invalid JSON while typing */
                }
              }}
              rows={8}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white"
            />
          </label>
        </div>
      ) : (
        <p className="p-8 text-white/50">No templates yet — they appear here once curated or generated by AI lookups.</p>
      )}
    </div>
  )
}
