"use client"

import { FormEvent, useState } from "react"
import type { Market } from "@/lib/platform/types"

export function CustomReportForm({ markets }: { markets: Market[] }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    targetMarket: markets[0]?.name ?? "",
    sector: "Technology",
    questions: "",
    timeline: "Within 3 months",
    budgetRange: "$5K-$15K",
  })

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch("/api/custom-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error("failed")
      setMessage("Request submitted. Our intelligence team will contact you shortly.")
    } catch {
      setMessage("Could not submit right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <input required placeholder="Name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="rounded-xl border border-black/15 bg-white px-4 py-3 text-sm" />
        <input required placeholder="Company" value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} className="rounded-xl border border-black/15 bg-white px-4 py-3 text-sm" />
      </div>
      <input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm" />
      <div className="grid gap-3 md:grid-cols-2">
        <select value={form.targetMarket} onChange={(event) => setForm((prev) => ({ ...prev, targetMarket: event.target.value }))} className="rounded-xl border border-black/15 bg-white px-4 py-3 text-sm">
          {markets.map((market) => <option key={market.id}>{market.name}</option>)}
        </select>
        <input value={form.sector} onChange={(event) => setForm((prev) => ({ ...prev, sector: event.target.value }))} placeholder="Sector" className="rounded-xl border border-black/15 bg-white px-4 py-3 text-sm" />
      </div>
      <textarea required value={form.questions} onChange={(event) => setForm((prev) => ({ ...prev, questions: event.target.value }))} placeholder="What specific questions do you need answered?" className="min-h-28 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm" />
      <div className="grid gap-3 md:grid-cols-2">
        <input value={form.timeline} onChange={(event) => setForm((prev) => ({ ...prev, timeline: event.target.value }))} placeholder="Timeline" className="rounded-xl border border-black/15 bg-white px-4 py-3 text-sm" />
        <input value={form.budgetRange} onChange={(event) => setForm((prev) => ({ ...prev, budgetRange: event.target.value }))} placeholder="Budget range" className="rounded-xl border border-black/15 bg-white px-4 py-3 text-sm" />
      </div>
      <button type="submit" disabled={loading} className="rounded-full bg-[#0d0d0d] px-5 py-2.5 text-sm font-medium text-[#f5f0e8]">
        {loading ? "Submitting..." : "Commission Custom Report"}
      </button>
      {message ? <p className="text-sm text-[#6b6560]">{message}</p> : null}
    </form>
  )
}
