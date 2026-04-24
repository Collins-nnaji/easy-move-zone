"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Phone,
} from "lucide-react"

type ShipmentStatus = "pending" | "pickup" | "in_transit" | "delivered" | "issue"

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; color: string; bg: string; icon: typeof Circle }> = {
  pending: { label: "Awaiting pickup", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Clock },
  pickup: { label: "Pickup scheduled", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Truck },
  in_transit: { label: "In transit", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: Truck },
  delivered: { label: "Delivered", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: CheckCircle2 },
  issue: { label: "Issue reported", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: AlertCircle },
}

const DEMO_SHIPMENTS = [
  {
    id: "SHP-0041",
    crop: "Maize (white) — 5 tonnes",
    origin: "Kaduna State, Nigeria",
    destination: "Mile 12 Market, Lagos",
    transporter: "Musa Logistics",
    transporter_phone: "+234 802 xxx xxxx",
    status: "in_transit" as ShipmentStatus,
    pickup_date: "Apr 20, 2026",
    eta: "Apr 22, 2026",
    value: "₦2,100,000",
    timeline: [
      { label: "Listing confirmed", done: true, date: "Apr 18" },
      { label: "Transporter assigned", done: true, date: "Apr 19" },
      { label: "Pickup from farm", done: true, date: "Apr 20" },
      { label: "In transit", done: true, date: "Apr 20" },
      { label: "Arrival at market", done: false, date: "ETA Apr 22" },
      { label: "Payment released", done: false, date: "On delivery" },
    ],
  },
  {
    id: "SHP-0038",
    crop: "Tomatoes — 80 crates",
    origin: "Benue State, Nigeria",
    destination: "Gwagwalada Market, Abuja",
    transporter: "Benue Fresh Movers",
    transporter_phone: "+234 803 xxx xxxx",
    status: "delivered" as ShipmentStatus,
    pickup_date: "Apr 16, 2026",
    eta: "Apr 17, 2026",
    value: "₦2,280,000",
    timeline: [
      { label: "Listing confirmed", done: true, date: "Apr 14" },
      { label: "Transporter assigned", done: true, date: "Apr 15" },
      { label: "Pickup from farm", done: true, date: "Apr 16" },
      { label: "In transit", done: true, date: "Apr 16" },
      { label: "Arrival at market", done: true, date: "Apr 17" },
      { label: "Payment released", done: true, date: "Apr 17" },
    ],
  },
  {
    id: "SHP-0044",
    crop: "Yam — 500 tubers",
    origin: "Benue State, Nigeria",
    destination: "Onitsha Main Market",
    transporter: "Pending assignment",
    transporter_phone: "",
    status: "pending" as ShipmentStatus,
    pickup_date: "Apr 25, 2026",
    eta: "Apr 27, 2026",
    value: "₦600,000",
    timeline: [
      { label: "Listing confirmed", done: true, date: "Apr 22" },
      { label: "Transporter assigned", done: false, date: "Pending" },
      { label: "Pickup from farm", done: false, date: "Apr 25" },
      { label: "In transit", done: false, date: "—" },
      { label: "Arrival at market", done: false, date: "ETA Apr 27" },
      { label: "Payment released", done: false, date: "On delivery" },
    ],
  },
]

const easeOut = [0.16, 1, 0.3, 1] as const

export function ShipmentsClient() {
  const [expanded, setExpanded] = useState<string | null>("SHP-0041")
  const [filter, setFilter] = useState<ShipmentStatus | "all">("all")

  const filtered = DEMO_SHIPMENTS.filter((s) => filter === "all" || s.status === filter)

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a2e0a] to-[#064e10] pt-12 pb-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-56 w-56 rounded-full bg-lime-500/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
            <Truck className="h-3.5 w-3.5" />
            Shipments
          </span>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Track your shipments</h1>
          <p className="mt-1 text-sm text-emerald-200/70">Farm-gate to market-gate visibility</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Status filter */}
        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-sm backdrop-blur">
          {[
            ["all", "All shipments"],
            ["pending", "Pending"],
            ["in_transit", "In transit"],
            ["delivered", "Delivered"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val as ShipmentStatus | "all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filter === val ? "bg-emerald-600 text-white shadow-sm" : "border border-slate-200 bg-white/80 text-slate-600 hover:border-emerald-400"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((shipment, i) => {
            const cfg = STATUS_CONFIG[shipment.status]
            const StatusIcon = cfg.icon
            const isExpanded = expanded === shipment.id

            return (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: easeOut }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {/* Header row */}
                <button
                  className="w-full px-5 py-4 text-left"
                  onClick={() => setExpanded(isExpanded ? null : shipment.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-lg border p-2 ${cfg.bg}`}>
                        <StatusIcon className={`h-4 w-4 ${cfg.color}`} strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{shipment.id}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm font-semibold text-slate-900">{shipment.crop}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {shipment.origin}
                          </span>
                          <span className="text-slate-300">→</span>
                          <span>{shipment.destination}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold text-slate-900">{shipment.value}</span>
                      <span className="text-[11px] text-slate-400">ETA {shipment.eta}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-5">
                    <div className="mt-4 grid gap-6 md:grid-cols-2">
                      {/* Timeline */}
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Timeline</p>
                        <div className="space-y-3">
                          {shipment.timeline.map((t, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="mt-0.5 shrink-0">
                                {t.done ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={2} />
                                ) : (
                                  <Circle className="h-4 w-4 text-slate-300" strokeWidth={2} />
                                )}
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${t.done ? "text-slate-800" : "text-slate-400"}`}>{t.label}</p>
                                <p className="text-[11px] text-slate-400">{t.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipment details */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Details</p>
                        <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Transporter</span>
                            <span className="font-semibold text-slate-800">{shipment.transporter}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Pickup date</span>
                            <span className="font-semibold text-slate-800">{shipment.pickup_date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Est. arrival</span>
                            <span className="font-semibold text-slate-800">{shipment.eta}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Cargo value</span>
                            <span className="font-bold text-slate-900">{shipment.value}</span>
                          </div>
                        </div>
                        {shipment.transporter_phone && (
                          <a
                            href={`tel:${shipment.transporter_phone}`}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-400"
                          >
                            <Phone className="h-4 w-4" />
                            Call transporter
                          </a>
                        )}
                        {shipment.status === "issue" && (
                          <button className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500">
                            Raise dispute
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-slate-300" strokeWidth={1.5} />
            <p className="text-slate-500">No shipments in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
