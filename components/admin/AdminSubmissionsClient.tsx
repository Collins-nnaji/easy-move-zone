"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  RefreshCw, CheckCircle2, XCircle, Clock, Eye, Loader2,
  Home, Building2, TreePine, Store, Layers, ShieldCheck,
  KeyRound, HardHat, Banknote, MapPin, BedDouble, Bath,
  Ruler, Phone, Mail, User, ChevronLeft, ChevronRight,
  LayoutList, BadgeCheck, AlertCircle,
} from "lucide-react"
import { clsx } from "clsx"

type SubmissionStatus = "pending" | "approved" | "rejected"

interface Submission {
  id: string
  title: string
  listing_type: string
  property_type: string
  city: string
  state: string | null
  price_ngn: number | null
  bedrooms: number | null
  bathrooms: number | null
  land_size_sqm: number | null
  building_size_sqm: number | null
  images: unknown
  description: string | null
  submission_status: SubmissionStatus
  submitted_by: string | null
  submitted_at: string
  reviewer_notes: string | null
  seller_name: string | null
  seller_phone: string | null
  seller_email: string | null
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: "Pending review", color: "bg-amber-100 text-amber-800",   icon: Clock        },
  approved: { label: "Approved",       color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  rejected: { label: "Rejected",       color: "bg-red-100 text-red-700",       icon: XCircle      },
}

const LISTING_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  "outright-purchase":  { label: "Outright Purchase",    color: "text-orange-700 bg-orange-100",    icon: ShieldCheck },
  "rent-to-own":        { label: "Rent to Own",           color: "text-purple-700 bg-purple-100", icon: KeyRound    },
  "build":              { label: "Land for Build",        color: "text-amber-700 bg-amber-100",  icon: HardHat     },
  "mortgage-eligible":  { label: "Mortgage-Eligible",    color: "text-emerald-700 bg-emerald-100", icon: Banknote  },
}

const PROP_ICON: Record<string, React.ElementType> = {
  land: TreePine, house: Home, apartment: Building2, commercial: Store, "mixed-use": Layers,
}

function fmtNgn(n: number | null) {
  if (!n) return "—"
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  return `₦${n.toLocaleString()}`
}

function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) }
  catch { return s }
}

function getImages(s: Submission): string[] {
  if (!s.images) return []
  if (Array.isArray(s.images)) return (s.images as unknown[]).filter((u): u is string => typeof u === "string")
  if (typeof s.images === "string") { try { return JSON.parse(s.images) } catch { return [] } }
  return []
}

export function AdminSubmissionsClient() {
  const [tab, setTab] = useState<SubmissionStatus>("pending")
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Submission | null>(null)
  const [notes, setNotes] = useState("")
  const [actioning, setActioning] = useState<string | null>(null)

  const load = useCallback(async (status: SubmissionStatus) => {
    setLoading(true)
    setSelected(null)
    try {
      const res = await fetch(`/api/admin/submissions?status=${status}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.submissions ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(tab) }, [tab, load])

  async function action(id: string, act: "approve" | "reject") {
    setActioning(id)
    try {
      await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: act, reviewer_notes: notes || null }),
      })
      await load(tab)
      setNotes("")
      setSelected(null)
    } finally {
      setActioning(null)
    }
  }

  const listingCfg = (lt: string) => LISTING_TYPE_CONFIG[lt] ?? { label: lt, color: "text-slate-600 bg-slate-100", icon: Home }
  const PropIcon = (pt: string) => PROP_ICON[pt] ?? Home

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin/listings" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">← Admin</Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-bold text-slate-900">Property Submissions</h1>
          </div>
          <button onClick={() => load(tab)} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={clsx("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Status tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-slate-200 p-1 w-fit">
          {(["pending", "approved", "rejected"] as SubmissionStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s]
            const Icon = cfg.icon
            return (
              <button key={s} onClick={() => setTab(s)}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all capitalize",
                  tab === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}>
                <Icon className="h-3.5 w-3.5" />
                {cfg.label}
              </button>
            )
          })}
        </div>

        <div className={clsx("grid gap-6", selected ? "lg:grid-cols-[1fr_420px]" : "grid-cols-1")}>
          {/* List */}
          <div className="space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
                <LayoutList className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No {tab} submissions</p>
              </div>
            )}

            {!loading && items.map(item => {
              const lcfg = listingCfg(item.listing_type)
              const LIcon = lcfg.icon
              const PIcon = PropIcon(item.property_type)
              const imgs = getImages(item)
              const isSelected = selected?.id === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => { setSelected(isSelected ? null : item); setNotes("") }}
                  className={clsx(
                    "w-full text-left rounded-2xl border-2 bg-white p-5 transition-all hover:shadow-md",
                    isSelected ? "border-[#e0511f] shadow-md" : "border-slate-200"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Cover image or placeholder */}
                    <div className="shrink-0 h-16 w-20 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                      {imgs[0]
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={imgs[0]} alt="" className="h-full w-full object-cover" />
                        : <PIcon className="h-6 w-6 text-slate-300" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug">{item.title}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={clsx("flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold", lcfg.color)}>
                            <LIcon className="h-3 w-3" />{lcfg.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[item.city, item.state].filter(Boolean).join(", ")}</span>
                        <span className="capitalize flex items-center gap-1"><PIcon className="h-3 w-3" />{item.property_type}</span>
                        {item.bedrooms && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{item.bedrooms} bed</span>}
                        {item.price_ngn && <span className="font-semibold text-slate-800">{fmtNgn(item.price_ngn)}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">{fmtDate(item.submitted_at)}</span>
                        {item.seller_name && <span className="text-[11px] text-slate-500 flex items-center gap-1"><User className="h-3 w-3" />{item.seller_name}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Quick action row for pending */}
                  {tab === "pending" && !isSelected && (
                    <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100">
                      <button
                        onClick={e => { e.stopPropagation(); action(item.id, "approve") }}
                        disabled={actioning === item.id}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                      >
                        {actioning === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(item); setNotes("") }}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> Review & decide
                      </button>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="rounded-2xl border-2 border-[#e0511f]/30 bg-white overflow-hidden sticky top-[73px] self-start max-h-[calc(100vh-100px)] overflow-y-auto">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Submission details</h3>
                <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Images */}
                {getImages(selected).length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {getImages(selected).slice(0, 6).map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {i === 0 && <span className="absolute left-1 top-1 rounded text-[9px] font-bold bg-[#e0511f] text-white px-1.5 py-0.5">Cover</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Core info */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Property</div>
                  <h4 className="font-bold text-slate-900 mb-2">{selected.title}</h4>
                  {selected.description && <p className="text-xs text-slate-500 leading-relaxed">{selected.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ["Listing type", listingCfg(selected.listing_type).label],
                    ["Property type", selected.property_type],
                    ["City", [selected.city, selected.state].filter(Boolean).join(", ")],
                    ["Price", fmtNgn(selected.price_ngn)],
                    ["Bedrooms", selected.bedrooms ? String(selected.bedrooms) : "—"],
                    ["Bathrooms", selected.bathrooms ? String(selected.bathrooms) : "—"],
                    ["Land size", selected.land_size_sqm ? `${selected.land_size_sqm} sqm` : "—"],
                    ["Build size", selected.building_size_sqm ? `${selected.building_size_sqm} sqm` : "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-medium">{k}</span>
                      <span className="font-semibold text-slate-800 capitalize">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Seller contact */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Seller contact</div>
                  <div className="space-y-2 text-xs">
                    {selected.seller_name && <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-slate-400" /><span className="font-semibold text-slate-800">{selected.seller_name}</span></div>}
                    {selected.seller_phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /><a href={`tel:${selected.seller_phone}`} className="text-[#e0511f] font-semibold hover:underline">{selected.seller_phone}</a></div>}
                    {selected.seller_email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /><a href={`mailto:${selected.seller_email}`} className="text-[#e0511f] font-semibold hover:underline">{selected.seller_email}</a></div>}
                  </div>
                </div>

                {/* Reviewer notes */}
                {tab === "pending" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reviewer notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Add internal notes or a rejection reason..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#e0511f]/40 focus:outline-none focus:ring-2 focus:ring-[#e0511f]/10 resize-none transition"
                    />
                  </div>
                )}

                {/* Existing notes if reviewed */}
                {tab !== "pending" && selected.reviewer_notes && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1.5">Reviewer notes</div>
                    <p className="text-xs text-amber-800">{selected.reviewer_notes}</p>
                  </div>
                )}

                {/* Action buttons */}
                {tab === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => action(selected.id, "approve")}
                      disabled={actioning === selected.id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {actioning === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve & publish
                    </button>
                    <button
                      onClick={() => action(selected.id, "reject")}
                      disabled={actioning === selected.id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      {actioning === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
