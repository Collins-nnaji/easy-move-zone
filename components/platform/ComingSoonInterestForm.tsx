"use client"

import { FormEvent, useState } from "react"
import type { CityMarket } from "@/lib/property/types"

export function ComingSoonInterestForm({ markets }: { markets: CityMarket[] }) {
  const [market, setMarket] = useState(markets[0]?.name ?? "")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage(null)
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, listType: `market-interest:${market}` }),
      })
      if (!response.ok) throw new Error("failed")
      setEmail("")
      setMessage(`Saved. We will notify you when ${market} goes live.`)
    } catch {
      setMessage("Could not register interest. Please try again.")
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
      <select value={market} onChange={(event) => setMarket(event.target.value)} className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm">
        {markets.map((item) => (
          <option key={item.id}>{item.name}</option>
        ))}
      </select>
      <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm" />
      <button type="submit" className="emz-pill-cta rounded-xl px-4 py-2 text-sm font-semibold">
        Register interest
      </button>
      {message ? <p className="text-sm text-[#64748b] md:col-span-3">{message}</p> : null}
    </form>
  )
}
