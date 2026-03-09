"use client"

import { FormEvent, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { CityMarket } from "@/lib/property/types"

export function ContactInquiryForm({ markets }: { markets: CityMarket[] }) {
  const searchParams = useSearchParams()
  const initialDirection = searchParams.get("direction") ?? ""
  const initialMarket = searchParams.get("market") ?? ""
  const initialRecommended = searchParams.get("recommendedService") ?? ""

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    direction: initialDirection || "Domestic move within Nigeria",
    targetMarket: initialMarket || "Not sure yet",
    businessSector: "Residential",
    timeline: "Within 3 months",
    budgetRange: "$5K-$15K",
    message: "",
    source: "Website",
    recommendedService: initialRecommended,
  })
  const [loading, setLoading] = useState(false)
  const [responseMessage, setResponseMessage] = useState<string | null>(null)

  const marketOptions = useMemo(() => markets.map((market) => market.name), [markets])

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setResponseMessage(null)
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error("submission failed")
      setResponseMessage("Thanks. Your inquiry is in and our team will respond within 24 hours.")
      setForm((prev) => ({ ...prev, firstName: "", lastName: "", company: "", email: "", phone: "", website: "", message: "" }))
    } catch {
      setResponseMessage("We could not submit right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2.5">
      <div className="grid gap-3 md:grid-cols-2">
        <input required value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} placeholder="First name" className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base" />
        <input required value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} placeholder="Last name" className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base" />
      </div>
      <input required value={form.company} onChange={(event) => updateField("company", event.target.value)} placeholder="Company name" className="w-full rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base" />
      <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="Email address" className="w-full rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base" />
      <div className="grid gap-3 md:grid-cols-2">
        <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Phone number (optional)" className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base" />
        <input value={form.website} onChange={(event) => updateField("website", event.target.value)} placeholder="Website (optional)" className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <select value={form.direction} onChange={(event) => updateField("direction", event.target.value)} className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base">
          <option>Domestic move within Nigeria</option>
          <option>Diaspora move into Nigeria</option>
          <option>Pan-African move</option>
          <option>Commercial property search</option>
          <option>General inquiry</option>
        </select>
        <select value={form.targetMarket} onChange={(event) => updateField("targetMarket", event.target.value)} className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base">
          <option>Not sure yet</option>
          {marketOptions.map((market) => <option key={market}>{market}</option>)}
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <select value={form.businessSector} onChange={(event) => updateField("businessSector", event.target.value)} className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base">
          <option>Residential</option>
          <option>Commercial</option>
          <option>Mixed-use</option>
          <option>Short-let</option>
          <option>Corporate housing</option>
        </select>
        <select value={form.timeline} onChange={(event) => updateField("timeline", event.target.value)} className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base">
          <option>Ready now</option>
          <option>Within 3 months</option>
          <option>Within 6 months</option>
          <option>Exploring options</option>
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <select value={form.budgetRange} onChange={(event) => updateField("budgetRange", event.target.value)} className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base">
          <option>Under $5K</option>
          <option>$5K-$15K</option>
          <option>$15K-$50K</option>
          <option>$50K+</option>
          <option>Let&apos;s discuss</option>
        </select>
        <select value={form.source} onChange={(event) => updateField("source", event.target.value)} className="rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base">
          <option>Website</option>
          <option>Referral</option>
          <option>LinkedIn</option>
          <option>Newsletter</option>
          <option>Event</option>
        </select>
      </div>
      {form.recommendedService ? (
        <input value={form.recommendedService} onChange={(event) => updateField("recommendedService", event.target.value)} className="w-full rounded-xl border border-[#c8d8f0] bg-[#f1f5f9] px-4 py-3 text-base" />
      ) : null}
      <textarea
        required
        minLength={60}
        value={form.message}
        onChange={(event) => updateField("message", event.target.value)}
        placeholder="Tell us about your move (target city, budget, timeline, property type). 100+ characters recommended."
        className="min-h-28 w-full rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-base"
      />
      <button type="submit" disabled={loading} className="emz-pill-cta w-full rounded-full px-4 py-3 text-base font-semibold disabled:opacity-60">
        {loading ? "Submitting..." : "Send & Request Strategy Call"}
      </button>
      {responseMessage ? <p className="text-sm text-[#64748b]">{responseMessage}</p> : null}
    </form>
  )
}
