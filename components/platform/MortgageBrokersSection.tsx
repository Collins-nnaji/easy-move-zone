"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, Loader2, Send, UserPlus } from "lucide-react"
import type { MortgageBroker } from "@/lib/mortgage/brokers"

export function MortgageBrokersSection() {
  const [brokers, setBrokers] = useState<MortgageBroker[]>([])
  const [loading, setLoading] = useState(true)
  const [onboardOpen, setOnboardOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [form, setForm] = useState({ company: "", contactName: "", email: "", phone: "", countries: "", message: "" })

  useEffect(() => {
    fetch("/api/mortgage/brokers")
      .then((r) => r.json())
      .then((data: { brokers?: MortgageBroker[] }) => setBrokers(data.brokers ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function handleOnboardSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch("/api/mortgage/brokers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          countries: form.countries ? form.countries.split(",").map((c) => c.trim()).filter(Boolean) : [],
          message: form.message,
        }),
      })
      const data = (await res.json()) as { success?: boolean; message?: string; error?: string }
      if (data.success) {
        setMessage({ type: "success", text: data.message ?? "Request submitted." })
        setForm({ company: "", contactName: "", email: "", phone: "", countries: "", message: "" })
        setOnboardOpen(false)
      } else {
        setMessage({ type: "error", text: data.error ?? "Something went wrong." })
      }
    } catch {
      setMessage({ type: "error", text: "Could not submit. Try again." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="border-t border-[#e8edf6] bg-gradient-to-b from-[#0b1f4a] to-[#0f2f6e] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#93c5fd]">Partner brokers</p>
            <h2 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold text-white">
              Mortgage brokers you can trust
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Our AI matches you to lenders; these verified brokers can also help you compare products and apply.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOnboardOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <UserPlus className="h-4 w-4" /> Become a partner broker
          </button>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 py-10">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span className="text-sm text-white/80">Loading brokers…</span>
          </div>
        ) : brokers.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brokers.map((b) => (
              <div
                key={b.id}
                className="flex flex-col rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{b.name}</p>
                      {b.verified && (
                        <span className="rounded-full bg-green-400/30 px-1.5 py-0.5 text-[10px] font-bold text-green-200">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/70">{b.company} · {b.countries.join(", ")}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {b.specialisms.slice(0, 3).map((s) => (
                        <span key={s} className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] text-white/80">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {b.email && (
                        <a href={`mailto:${b.email}`} className="text-xs font-medium text-[#93c5fd] hover:underline">
                          Email
                        </a>
                      )}
                      {b.phone && (
                        <a href={`tel:${b.phone}`} className="text-xs font-medium text-[#93c5fd] hover:underline">
                          Phone
                        </a>
                      )}
                      {b.website && (
                        <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#93c5fd] hover:underline">
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-white/20 bg-white/5 p-6 text-center text-sm text-white/80">
            No partner brokers listed yet. <button type="button" onClick={() => setOnboardOpen(true)} className="font-semibold text-[#93c5fd] hover:underline">Become the first.</button>
          </div>
        )}

        {message && (
          <div className={`mt-4 rounded-xl px-4 py-2 text-sm ${message.type === "success" ? "bg-green-400/20 text-green-200" : "bg-red-400/20 text-red-200"}`}>
            {message.text}
          </div>
        )}

        {onboardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !submitting && setOnboardOpen(false)}>
            <div className="w-full max-w-md rounded-2xl border border-[#dbe4f0] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-[var(--font-playfair)] text-lg font-bold text-[#0f172a]">Become a partner broker</h3>
              <p className="mt-1 text-sm text-[#64748b]">Submit your details. Our team will get in touch to onboard you.</p>
              <form onSubmit={handleOnboardSubmit} className="mt-4 space-y-3">
                <input value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} placeholder="Your name" className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" required />
                <input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="Company / brokerage name" className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" />
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email *" className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" required />
                <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" />
                <input value={form.countries} onChange={(e) => setForm((p) => ({ ...p, countries: e.target.value }))} placeholder="Countries (e.g. Nigeria, Kenya)" className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" />
                <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Short message (optional)" rows={2} className="w-full rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="emz-pill-cta flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold disabled:opacity-50">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                  <button type="button" onClick={() => setOnboardOpen(false)} disabled={submitting} className="rounded-full border border-[#dbe4f0] px-4 py-2.5 text-sm font-semibold text-[#475569] hover:bg-[#f8fbff]">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
