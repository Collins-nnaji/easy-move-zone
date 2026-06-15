"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Search, CheckCircle2, Clock, XCircle,
  MoreHorizontal, Star, MapPin,
} from "lucide-react"
import { clsx } from "clsx"

interface VendorRow {
  id: string
  business_name: string
  service_type: string
  city: string | null
  status: "live" | "pending" | "rejected"
  rating: number | null
  enquiries: number
  submitted_at: string
  contact_email: string | null
}

const STATUS_CONFIG = {
  live:     { label: "Live",     className: "bg-emerald-900/40 text-emerald-300", icon: CheckCircle2 },
  pending:  { label: "Pending",  className: "bg-amber-900/40 text-amber-300",     icon: Clock        },
  rejected: { label: "Rejected", className: "bg-red-900/40 text-red-300",         icon: XCircle      },
}

function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) }
  catch { return s }
}

export function AdminVendorsClient() {
  const [vendors, setVendors] = useState<VendorRow[]>([])
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoadState("loading")
    try {
      const res = await fetch("/api/admin/vendors")
      if (!res.ok) throw new Error("bad")
      const data = (await res.json()) as { vendors: VendorRow[] }
      setVendors(
        data.vendors.map((v) => ({
          ...v,
          rating: v.rating != null ? Number(v.rating) : null,
          enquiries: Number(v.enquiries ?? 0),
        })),
      )
      setLoadState("ok")
    } catch {
      setLoadState("error")
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function review(id: string, action: "approve" | "reject") {
    setBusyId(id)
    const nextStatus = action === "approve" ? "live" : "rejected"
    // optimistic
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: nextStatus } : v)))
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      })
      if (!res.ok) throw new Error("bad")
    } catch {
      void load() // revert to server truth on failure
    } finally {
      setBusyId(null)
    }
  }

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase()
    const matchSearch = !q || v.business_name.toLowerCase().includes(q) || (v.city ?? "").toLowerCase().includes(q)
    const matchStatus = statusFilter === "all" || v.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all:      vendors.length,
    live:     vendors.filter((v) => v.status === "live").length,
    pending:  vendors.filter((v) => v.status === "pending").length,
    rejected: vendors.filter((v) => v.status === "rejected").length,
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">Move Vendors</h1>
          <p className="text-sm text-white/50 mt-0.5">Manage service providers on the marketplace</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-amber-900/40 px-3 py-1.5 text-xs font-bold text-amber-300">
            {counts.pending} pending review
          </span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {(["all", "live", "pending", "rejected"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={clsx("rounded-2xl border p-4 text-left transition-all",
              statusFilter === s ? "border-white/30 bg-white/10" : "border-white/10 hover:border-white/20"
            )}>
            <div className="text-2xl font-bold text-white">{counts[s]}</div>
            <div className="text-xs text-white/40 capitalize mt-0.5">{s === "all" ? "Total" : s}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors…"
          className="w-full rounded-xl bg-white/10 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Business</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden sm:table-cell">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Location</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Rating</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden sm:table-cell">Submitted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loadState === "loading" && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-white/40">Loading vendors…</td></tr>
            )}
            {loadState === "error" && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-red-300">Couldn’t load vendors. <button onClick={() => void load()} className="underline">Retry</button></td></tr>
            )}
            {loadState === "ok" && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-white/40">No vendors match.</td></tr>
            )}
            {loadState === "ok" && filtered.map((v) => {
              const cfg = STATUS_CONFIG[v.status]
              const StatusIcon = cfg.icon
              return (
                <tr key={v.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{v.business_name}</div>
                    <div className="text-xs text-white/40 mt-0.5">{v.contact_email}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="capitalize text-xs text-white/60">{v.service_type}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="flex items-center gap-1 text-xs text-white/50">
                      <MapPin className="h-3 w-3" />{v.city}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx("flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold w-fit", cfg.className)}>
                      <StatusIcon className="h-2.5 w-2.5" />{cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {v.rating ? (
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <Star className="h-3 w-3" />{v.rating}
                      </span>
                    ) : <span className="text-white/20 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40 hidden sm:table-cell">{fmtDate(v.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {v.status === "pending" && (
                        <>
                          <button onClick={() => review(v.id, "approve")} disabled={busyId === v.id}
                            className="rounded-lg bg-emerald-900/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-all disabled:opacity-50">
                            Approve
                          </button>
                          <button onClick={() => review(v.id, "reject")} disabled={busyId === v.id}
                            className="rounded-lg bg-red-900/40 px-2.5 py-1 text-xs font-semibold text-red-300 hover:bg-red-900/60 transition-all disabled:opacity-50">
                            Reject
                          </button>
                        </>
                      )}
                      <button className="rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
