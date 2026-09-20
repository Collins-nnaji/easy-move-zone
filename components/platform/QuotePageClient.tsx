"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import {
  CARGO_CLASS_OPTIONS,
  COUNTRY_OPTIONS,
  FREIGHT_MODE_OPTIONS,
  INCOTERMS,
  SHIPMENT_DIRECTIONS,
} from "@/lib/logistics/catalog"
import { LandingNav } from "./LandingNav"
import { LandingFooter } from "./LandingFooter"

const PRIMARY = "#e0511f"
const INK = "#1b231e"
const easeOut = [0.16, 1, 0.3, 1] as const

const fieldClass =
  "w-full rounded-xl border border-[#e4dfd5] bg-white px-4 py-3 text-sm text-[#1b231e] outline-none transition focus:border-[#e0511f]/50 focus:ring-2 focus:ring-[#e0511f]/15"

export function QuotePageClient() {
  const reduceMotion = useReducedMotion()
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    direction: "export",
    originCountry: "Nigeria",
    destinationCountry: "United Kingdom",
    mode: "sea",
    cargoClass: "general",
    weightKg: "",
    volumeCbm: "",
    incoterm: "FOB",
    cargoDescription: "",
    notes: "",
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setStatus("sending")
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as { error?: string; ok?: boolean }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.")
        setStatus("error")
        return
      }
      setStatus("success")
    } catch {
      setError("Network error. Try again or email us.")
      setStatus("error")
    }
  }

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: easeOut },
        }

  return (
    <>
      <LandingNav />
      <div style={{ background: "#efece4", color: INK }}>
        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <motion.p {...fadeUp()} className="text-sm font-extrabold" style={{ color: PRIMARY }}>
            EasyMoveZone
          </motion.p>
          <motion.h1 {...fadeUp(0.04)} className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Get a freight quote
          </motion.h1>
          <motion.p {...fadeUp(0.08)} className="mt-3 text-lg text-[#5f655c]">
            Export from Nigeria or import into Nigeria. We respond with rates, transit, and a docs checklist.
          </motion.p>

          {status === "success" ? (
            <motion.div
              {...fadeUp(0.1)}
              className="mt-10 rounded-2xl border border-[#e4dfd5] bg-white p-8 text-center"
            >
              <CheckCircle2 className="mx-auto h-10 w-10" style={{ color: PRIMARY }} />
              <h2 className="mt-4 text-xl font-extrabold">Quote request received</h2>
              <p className="mt-2 text-sm text-[#5f655c]">
                Our team will reply by email shortly. You can also track existing shipments anytime.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
                  style={{ background: PRIMARY }}
                >
                  Track a shipment
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8d2c6] bg-white px-5 py-3 text-sm font-semibold text-[#4a5047]"
                >
                  Back home
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form {...fadeUp(0.1)} onSubmit={onSubmit} className="mt-10 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Name</span>
                  <input required className={fieldClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Email</span>
                  <input required type="email" className={fieldClass} value={form.email} onChange={(e) => set("email", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Phone</span>
                  <input className={fieldClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Company</span>
                  <input className={fieldClass} value={form.company} onChange={(e) => set("company", e.target.value)} />
                </label>
              </div>

              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Direction</span>
                <div className="flex flex-wrap gap-2">
                  {SHIPMENT_DIRECTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => set("direction", d)}
                      className="rounded-full px-4 py-2 text-sm font-bold capitalize transition"
                      style={
                        form.direction === d
                          ? { background: PRIMARY, color: "#fff" }
                          : { background: "#fff", color: "#4a5047", border: "1px solid #d8d2c6" }
                      }
                    >
                      {d} {d === "export" ? "(NG → world)" : "(world → NG)"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Origin country</span>
                  <select className={fieldClass} value={form.originCountry} onChange={(e) => set("originCountry", e.target.value)}>
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Destination country</span>
                  <select className={fieldClass} value={form.destinationCountry} onChange={(e) => set("destinationCountry", e.target.value)}>
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Mode</span>
                  <select className={fieldClass} value={form.mode} onChange={(e) => set("mode", e.target.value)}>
                    {FREIGHT_MODE_OPTIONS.map((m) => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Cargo class</span>
                  <select className={fieldClass} value={form.cargoClass} onChange={(e) => set("cargoClass", e.target.value)}>
                    {CARGO_CLASS_OPTIONS.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Weight (kg)</span>
                  <input className={fieldClass} inputMode="decimal" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Volume (CBM)</span>
                  <input className={fieldClass} inputMode="decimal" value={form.volumeCbm} onChange={(e) => set("volumeCbm", e.target.value)} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Incoterm (optional)</span>
                  <select className={fieldClass} value={form.incoterm} onChange={(e) => set("incoterm", e.target.value)}>
                    {INCOTERMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Cargo description</span>
                <textarea
                  required
                  rows={3}
                  className={fieldClass}
                  value={form.cargoDescription}
                  onChange={(e) => set("cargoDescription", e.target.value)}
                  placeholder="What are you shipping? HS code if known."
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6e746b]">Notes</span>
                <textarea
                  rows={2}
                  className={fieldClass}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Preferred sailing week, special handling, etc."
                />
              </label>

              {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
                style={{ background: PRIMARY }}
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Submit quote request
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </section>
      </div>
      <LandingFooter />
    </>
  )
}
