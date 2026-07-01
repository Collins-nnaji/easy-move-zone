"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react"
import { addChecklistItem, deleteChecklistItem, fetchChecklist, generateChecklist, updateChecklistStatus } from "@/lib/visa/client"
import type { ChecklistCategory, ChecklistStatus, VisaChecklistItem } from "@/lib/visa/types"

const CATEGORY_LABEL: Record<ChecklistCategory, string> = {
  documentation: "Documentation",
  application_form: "Application form",
  appointment: "Appointment",
  fee_payment: "Fee payment",
  biometrics: "Biometrics",
  interview: "Interview",
  follow_up: "Follow up",
}

export function ChecklistClient({ applicationId }: { applicationId: string }) {
  const [items, setItems] = useState<VisaChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<ChecklistCategory>("documentation")
  const [adding, setAdding] = useState(false)
  const [generating, setGenerating] = useState(false)

  function load() {
    setLoading(true)
    fetchChecklist(applicationId)
      .then(setItems)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId])

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || adding) return
    setAdding(true)
    try {
      const item = await addChecklistItem({ applicationId, title: title.trim(), category })
      setItems((prev) => [...prev, item])
      setTitle("")
    } finally {
      setAdding(false)
    }
  }

  async function onToggle(item: VisaChecklistItem) {
    const nextStatus: ChecklistStatus = item.status === "done" ? "todo" : "done"
    const updated = await updateChecklistStatus(item.id, nextStatus)
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
  }

  async function onDelete(id: string) {
    await deleteChecklistItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function onGenerate() {
    if (generating) return
    setGenerating(true)
    try {
      const generated = await generateChecklist(applicationId)
      setItems((prev) => [...prev, ...generated])
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-[#4a5047]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading checklist…
      </div>
    )
  }

  const doneCount = items.filter((i) => i.status === "done").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1b231e]">Document checklist</h1>
          <p className="text-sm text-[#4a5047]">{doneCount} of {items.length} done</p>
        </div>
        <button
          type="button"
          onClick={() => void onGenerate()}
          disabled={generating}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#e0511f] px-4 py-2 text-sm font-semibold text-[#e0511f] hover:bg-[#e0511f]/5 disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate with AI
        </button>
      </div>

      <form onSubmit={onAdd} className="flex flex-wrap gap-2 rounded-2xl border border-[#e4dfd5] bg-white p-4 shadow-sm">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Upload passport bio page"
          className="min-w-0 flex-1 rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ChecklistCategory)}
          className="rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
        >
          {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={adding}
          className="inline-flex items-center gap-1 rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c8451a] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#d8d2c6] p-8 text-center text-[#4a5047]">
          No checklist items yet. Add one above.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-[#e4dfd5] bg-white p-4 shadow-sm"
            >
              <input
                type="checkbox"
                checked={item.status === "done"}
                onChange={() => void onToggle(item)}
                className="h-5 w-5 shrink-0 accent-[#e0511f]"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium text-[#1b231e] ${item.status === "done" ? "line-through opacity-60" : ""}`}>
                  {item.title}
                </p>
                <p className="text-xs text-[#4a5047]">
                  {CATEGORY_LABEL[item.category]}
                  {item.isAiGenerated ? " · AI suggested" : ""}
                </p>
              </div>
              <button type="button" onClick={() => void onDelete(item.id)} className="shrink-0 text-[#4a5047] hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
