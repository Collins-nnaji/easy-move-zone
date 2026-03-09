"use client"

import { FormEvent, useState } from "react"
import type { CityMarket } from "@/lib/property/types"

export function CustomReportForm({ markets }: { markets: CityMarket[] }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    targetMarket: markets[0]?.name ?? "",
    sector: "Residential",
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
        <input required placeholder="Name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-sm" />
        <input required placeholder="Company" value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-sm" />
      </div>
      <input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} className="w-full rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-sm" />
      <div className="grid gap-3 md:grid-cols-2">
        <select value={form.targetMarket} onChange={(event) => setForm((prev) => ({ ...prev, targetMarket: event.target.value }))} className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-sm">
          {markets.map((market) => <option key={market.id}>{market.name}</option>)}
        </select>
        <input value={form.sector} onChange={(event) => setForm((prev) => ({ ...prev, sector: event.target.value }))} placeholder="Property focus (residential/commercial)" className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-sm" />
      </div>
      <textarea required value={form.questions} onChange={(event) => setForm((prev) => ({ ...prev, questions: event.target.value }))} placeholder="What exact move questions do you need answered (areas, schools, security, commute, budget)?" className="min-h-28 w-full rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-sm" />
      <div className="grid gap-3 md:grid-cols-2">
        <input value={form.timeline} onChange={(event) => setForm((prev) => ({ ...prev, timeline: event.target.value }))} placeholder="Timeline" className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-sm" />
        <input value={form.budgetRange} onChange={(event) => setForm((prev) => ({ ...prev, budgetRange: event.target.value }))} placeholder="Budget range" className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-sm" />
      </div>
      <button type="submit" disabled={loading} className="emz-pill-cta rounded-full px-5 py-2.5 text-sm font-semibold">
        {loading ? "Submitting..." : "Request Custom Move Brief"}
      </button>
      {message ? <p className="text-sm text-[#64748b]">{message}</p> : null}
    </form>
  )
}
