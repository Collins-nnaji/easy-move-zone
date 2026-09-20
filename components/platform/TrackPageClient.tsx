"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Loader2, Search } from "lucide-react"
import { carTitle, getCarByTrackingRef, SHIPPING_LABELS } from "@/lib/cars/catalog"
import { LandingNav } from "./LandingNav"
import { LandingFooter } from "./LandingFooter"

const PRIMARY = "#e0511f"
const INK = "#1b231e"
const easeOut = [0.16, 1, 0.3, 1] as const

type TrackEvent = {
  status: string
  label: string
  location: string | null
  at: string
}

type TrackResult = {
  reference: string
  direction: string
  mode: string
  origin: string
  destination: string
  cargoSummary: string | null
  currentStatus: string
  events: TrackEvent[]
}

export function TrackPageClient() {
  const searchParams = useSearchParams()
  const reduceMotion = useReducedMotion()
  const [ref, setRef] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "missing" | "error">("idle")
  const [result, setResult] = useState<TrackResult | null>(null)
  const [error, setError] = useState("")

  async function lookup(cleaned: string) {
    if (!cleaned) return
    setError("")
    setStatus("loading")
    setResult(null)
    const car = getCarByTrackingRef(cleaned)
    if (car) {
      setResult({
        reference: cleaned,
        direction: "import",
        mode: car.incoterm ?? "CFR",
        origin: `${car.originPort ?? car.originCountry}`,
        destination: car.destinationPort ?? "Destination port",
        cargoSummary: `${carTitle(car)} · ${SHIPPING_LABELS[car.shippingStatus]}${car.eta ? ` · ETA ${car.eta}` : ""}`,
        currentStatus: car.shippingStatus,
        events: [
          { status: "booked", label: "Vehicle booked for export", location: car.originCountry, at: new Date().toISOString() },
          { status: car.shippingStatus, label: SHIPPING_LABELS[car.shippingStatus], location: car.originPort ?? car.originCountry, at: new Date().toISOString() },
        ],
      })
      setStatus("found")
      return
    }
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(cleaned)}`)
      if (res.status === 404) {
        setStatus("missing")
        return
      }
      if (!res.ok) {
        setError("Could not look up that reference.")
        setStatus("error")
        return
      }
      const data = (await res.json()) as TrackResult
      setResult(data)
      setStatus("found")
    } catch {
      setError("Network error. Try again.")
      setStatus("error")
    }
  }

  useEffect(() => {
    const q = searchParams.get("ref")?.trim().toUpperCase()
    if (q) {
      setRef(q)
      void lookup(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await lookup(ref.trim().toUpperCase())
  }

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: easeOut },
        }

  return (
    <>
      <LandingNav />
      <div style={{ background: "#efece4", color: INK }}>
        <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <motion.p {...fadeUp()} className="text-sm font-extrabold" style={{ color: PRIMARY }}>
            EasyMoveZone
          </motion.p>
          <motion.h1 {...fadeUp(0.04)} className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Track a car or shipment
          </motion.h1>
          <motion.p {...fadeUp(0.08)} className="mt-3 text-lg text-[#5f655c]">
            Enter your EasyMoveZone reference to see the latest status of an imported car or freight booking.
          </motion.p>

          <motion.form {...fadeUp(0.1)} onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g. EMZ-CAR-88421"
              className="w-full flex-1 rounded-xl border border-[#e4dfd5] bg-white px-4 py-3.5 text-sm font-semibold uppercase tracking-wide outline-none focus:border-[#e0511f]/50 focus:ring-2 focus:ring-[#e0511f]/15"
              aria-label="Shipment reference"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: PRIMARY }}
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track
            </button>
          </motion.form>

          {status === "missing" && (
            <p className="mt-6 text-sm font-semibold text-[#5f655c]">
              No shipment found for that reference. Check the code on your booking confirmation.
            </p>
          )}
          {error && <p className="mt-6 text-sm font-semibold text-red-700">{error}</p>}

          {status === "found" && result && (
            <motion.div {...fadeUp(0.05)} className="mt-10 border-t border-[#e4dfd5] pt-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">{result.reference}</h2>
                <span className="text-sm font-bold capitalize" style={{ color: PRIMARY }}>
                  {result.currentStatus.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#5f655c]">
                {result.origin} → {result.destination} · {result.mode} · {result.direction}
              </p>
              {result.cargoSummary && (
                <p className="mt-1 text-sm text-[#7c827a]">{result.cargoSummary}</p>
              )}

              <ol className="mt-8 space-y-0">
                {result.events.map((ev, i) => (
                  <li key={`${ev.at}-${i}`} className="relative flex gap-4 border-l-2 border-[#e4dfd5] pb-6 pl-5 last:pb-0">
                    <span
                      className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full"
                      style={{ background: i === 0 ? PRIMARY : "#c4bfb4" }}
                    />
                    <div>
                      <div className="text-sm font-bold">{ev.label}</div>
                      <div className="mt-0.5 text-xs text-[#7c827a]">
                        {ev.location ? `${ev.location} · ` : ""}
                        {new Date(ev.at).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          <p className="mt-10 text-xs text-[#8a8f86]">
            Demo car imports: EMZ-CAR-88421, EMZ-CAR-90112, EMZ-CAR-77209
          </p>
        </section>
      </div>
      <LandingFooter />
    </>
  )
}
