"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Plus,
  RefreshCw,
  ImagePlus,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Star,
  Trash2,
  Pencil,
  X,
  Eye,
  EyeOff,
  LayoutList,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Home,
  Building2,
  TreePine,
  Store,
  Layers,
} from "lucide-react"
import { clsx } from "clsx"

type PropertyRow = {
  id: string
  title: string
  city: string
  state: string
  property_type: string
  price_ngn: number | null
  verification_status: string
  is_published: boolean
  is_featured: boolean
  created_at: string
  images: unknown
  description?: string | null
  neighborhood?: string | null
  address?: string | null
  land_size_sqm?: number | null
  building_size_sqm?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  ai_valuation_ngn?: number | null
  view_count?: number | null
  enquiry_count?: number | null
}

const PROPERTY_TYPES = ["land", "house", "apartment", "commercial", "mixed-use"] as const

const typeIcon: Record<string, React.ReactNode> = {
  land: <TreePine className="h-3.5 w-3.5" />,
  house: <Home className="h-3.5 w-3.5" />,
  apartment: <Building2 className="h-3.5 w-3.5" />,
  commercial: <Store className="h-3.5 w-3.5" />,
  "mixed-use": <Layers className="h-3.5 w-3.5" />,
}

const statusColor: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  unverified: "bg-slate-100 text-slate-600",
  flagged: "bg-red-100 text-red-800",
  rejected: "bg-red-200 text-red-900",
}

function formatNgn(n: number | null | undefined) {
  if (n == null) return "—"
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  return `₦${n.toLocaleString()}`
}

function getImages(row: PropertyRow): string[] {
  if (!row.images) return []
  if (Array.isArray(row.images)) return row.images.filter((u): u is string => typeof u === "string")
  if (typeof row.images === "string") {
    try { return JSON.parse(row.images) } catch { return [] }
  }
  return []
}

const emptyForm = {
  title: "", description: "", property_type: "land" as (typeof PROPERTY_TYPES)[number],
  city: "", state: "", neighborhood: "", address: "",
  price_ngn: "", land_size_sqm: "", building_size_sqm: "",
  bedrooms: "", bathrooms: "", ai_valuation_ngn: "", is_featured: false,
}

// ── Image mini-carousel inside each listing row ──────────────────────────────
function ImageCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)
  if (!images.length)
    return (
      <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
        <ImagePlus className="h-5 w-5" />
      </div>
    )
  return (
    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 group">
      <Image
        src={images[idx]}
        alt=""
        fill
        className="object-cover transition duration-300 group-hover:scale-105"
        sizes="80px"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); setIdx((i) => (i - 1 + images.length) % images.length) }}
            className="absolute left-0.5 top-1/2 -translate-y-1/2 rounded bg-black/50 p-0.5 text-white opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setIdx((i) => (i + 1) % images.length) }}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 rounded bg-black/50 p-0.5 text-white opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
          <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white/80">
            {idx + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  )
}

// ── Inline edit modal ────────────────────────────────────────────────────────
function EditModal({ listing, onClose, onSaved }: { listing: PropertyRow; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description ?? "",
    property_type: listing.property_type as (typeof PROPERTY_TYPES)[number],
    city: listing.city,
    state: listing.state,
    neighborhood: listing.neighborhood ?? "",
    address: listing.address ?? "",
    price_ngn: listing.price_ngn != null ? String(listing.price_ngn) : "",
    land_size_sqm: listing.land_size_sqm != null ? String(listing.land_size_sqm) : "",
    building_size_sqm: listing.building_size_sqm != null ? String(listing.building_size_sqm) : "",
    bedrooms: listing.bedrooms != null ? String(listing.bedrooms) : "",
    bathrooms: listing.bathrooms != null ? String(listing.bathrooms) : "",
    ai_valuation_ngn: listing.ai_valuation_ngn != null ? String(listing.ai_valuation_ngn) : "",
    is_featured: listing.is_featured,
    verification_status: listing.verification_status,
    is_published: listing.is_published,
  })
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/properties/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          property_type: form.property_type,
          city: form.city.trim(),
          state: form.state.trim(),
          neighborhood: form.neighborhood.trim() || null,
          address: form.address.trim() || null,
          price_ngn: form.price_ngn.trim() ? Number(form.price_ngn.replace(/,/g, "")) : null,
          land_size_sqm: form.land_size_sqm.trim() ? Number(form.land_size_sqm) : null,
          building_size_sqm: form.building_size_sqm.trim() ? Number(form.building_size_sqm) : null,
          bedrooms: form.bedrooms.trim() ? Number(form.bedrooms) : null,
          bathrooms: form.bathrooms.trim() ? Number(form.bathrooms) : null,
          ai_valuation_ngn: form.ai_valuation_ngn.trim() ? Number(form.ai_valuation_ngn.replace(/,/g, "")) : null,
          is_featured: form.is_featured,
          verification_status: form.verification_status,
          is_published: form.is_published,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Update failed") }

      // upload new images if any
      for (const file of files) {
        const fd = new FormData()
        fd.set("file", file); fd.set("propertyId", listing.id); fd.set("fileType", "image")
        const up = await fetch("/api/upload-property", { method: "POST", body: fd })
        if (!up.ok) { const d = await up.json(); throw new Error(d.error || "Upload failed") }
        // images are appended server-side via upload-property
      }

      setMsg("Saved.")
      onSaved()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error")
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-slate-400 focus:border-[#0033A1]/50 focus:outline-none focus:ring-2 focus:ring-[#0033A1]/10"
  const labelCls = "text-[10px] font-bold uppercase tracking-wider text-slate-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-[#0f172a]">Edit listing</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSave(e)} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Title</label>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type</label>
              <select value={form.property_type} onChange={(e) => setForm((f) => ({ ...f, property_type: e.target.value as typeof form.property_type }))} className={inputCls}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Price (₦)</label>
              <input value={form.price_ngn} onChange={(e) => setForm((f) => ({ ...f, price_ngn: e.target.value }))} className={inputCls} placeholder="85000000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>City</label>
              <input required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input required value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Neighbourhood</label>
              <input value={form.neighborhood} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Land sqm</label>
              <input type="number" value={form.land_size_sqm} onChange={(e) => setForm((f) => ({ ...f, land_size_sqm: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Built sqm</label>
              <input type="number" value={form.building_size_sqm} onChange={(e) => setForm((f) => ({ ...f, building_size_sqm: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Beds</label>
              <input type="number" value={form.bedrooms} onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Baths</label>
              <input type="number" value={form.bathrooms} onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>AI valuation (₦)</label>
              <input value={form.ai_valuation_ngn} onChange={(e) => setForm((f) => ({ ...f, ai_valuation_ngn: e.target.value }))} className={inputCls} placeholder="optional" />
            </div>
            <div>
              <label className={labelCls}>Verification</label>
              <select value={form.verification_status} onChange={(e) => setForm((f) => ({ ...f, verification_status: e.target.value }))} className={inputCls}>
                {["verified", "pending", "unverified", "flagged", "rejected"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="rounded border-slate-300 text-[#0033A1]" />
              Feature on homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} className="rounded border-slate-300 text-[#0033A1]" />
              Published
            </label>
          </div>
          <div>
            <label className={`flex items-center gap-1.5 ${labelCls}`}>
              <UploadCloud className="h-3.5 w-3.5" /> Add more images (Azure)
            </label>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="mt-2 w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0033A1] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
            {files.length > 0 && <p className="mt-1 text-xs text-slate-400">{files.length} file{files.length > 1 ? "s" : ""} selected</p>}
          </div>

          {msg && (
            <p className={clsx("rounded-lg px-3 py-2 text-sm", msg === "Saved." ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800")}>{msg}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0033A1] px-5 py-2 text-sm font-bold text-white shadow hover:bg-[#002880] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export function AdminListingsClient() {
  const [listings, setListings] = useState<PropertyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [tab, setTab] = useState<"listings" | "new">("listings")
  const [editTarget, setEditTarget] = useState<PropertyRow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/admin/properties?limit=500")
      if (res.status === 403) { setError("No admin access."); return }
      if (!res.ok) throw new Error()
      const data = (await res.json()) as { properties: PropertyRow[] }
      setListings(data.properties ?? [])
    } catch { setError("Could not load listings.") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage(null)
    try {
      const priceNgn = form.price_ngn.trim() ? Number(form.price_ngn.replace(/,/g, "")) : null
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          property_type: form.property_type,
          city: form.city.trim(), state: form.state.trim(), country: "Nigeria",
          neighborhood: form.neighborhood.trim() || null,
          address: form.address.trim() || null,
          price_ngn: priceNgn != null && Number.isFinite(priceNgn) ? priceNgn : null,
          land_size_sqm: form.land_size_sqm.trim() ? Number(form.land_size_sqm) : null,
          building_size_sqm: form.building_size_sqm.trim() ? Number(form.building_size_sqm) : null,
          bedrooms: form.bedrooms.trim() ? Number(form.bedrooms) : null,
          bathrooms: form.bathrooms.trim() ? Number(form.bathrooms) : null,
          ai_valuation_ngn: form.ai_valuation_ngn.trim() ? Number(form.ai_valuation_ngn.replace(/,/g, "")) : null,
          images: [], verification_status: "verified",
          is_published: true, is_featured: form.is_featured,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Create failed")
      const id = data.id as string

      for (const file of files) {
        const fd = new FormData()
        fd.set("file", file); fd.set("propertyId", id); fd.set("fileType", "image")
        const up = await fetch("/api/upload-property", { method: "POST", body: fd })
        if (!up.ok) { const uj = await up.json(); throw new Error(uj.error || "Upload failed") }
      }

      setMessage("Listing published successfully.")
      setForm({ ...emptyForm }); setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ""
      setTab("listings")
      await load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong")
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/properties/${id}`, { method: "DELETE" })
      setDeleteConfirm(null)
      await load()
    } catch { /* silent — reload will show current state */ }
  }

  async function toggleFeatured(p: PropertyRow) {
    await fetch(`/api/admin/properties/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: !p.is_featured }),
    })
    await load()
  }

  async function togglePublished(p: PropertyRow) {
    await fetch(`/api/admin/properties/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !p.is_published }),
    })
    await load()
  }

  const published = listings.filter((l) => l.is_published).length
  const featured = listings.filter((l) => l.is_featured).length
  const verified = listings.filter((l) => l.verification_status === "verified").length

  const inputCls = "mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#0072CE]/60 focus:outline-none focus:ring-1 focus:ring-[#0072CE]/30"
  const labelCls = "text-[10px] font-bold uppercase tracking-wider text-slate-500"

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Listings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your property inventory — images upload to Azure Blob.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
            <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} /> Refresh
          </button>
          <Link href="/search"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
            <ExternalLink className="h-4 w-4" /> Public site
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total listings", value: listings.length, color: "text-[#0033A1]" },
          { label: "Published", value: published, color: "text-emerald-600" },
          { label: "Featured", value: featured, color: "text-amber-600" },
          { label: "Verified", value: verified, color: "text-cyan-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
            <p className={clsx("mt-1 text-2xl font-bold tabular-nums", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {(["listings", "new"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={clsx("rounded-lg px-5 py-2 text-sm font-semibold transition",
              tab === t ? "bg-white shadow text-[#0033A1]" : "text-slate-500 hover:text-slate-700")}>
            {t === "listings" ? <span className="flex items-center gap-1.5"><LayoutList className="h-4 w-4" /> All listings</span>
              : <span className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> New listing</span>}
          </button>
        ))}
      </div>

      {/* Feedback banners */}
      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {message && (
        <div className={clsx("mt-4 rounded-xl border px-4 py-3 text-sm flex items-center justify-between gap-4",
          message.toLowerCase().includes("fail") || message.toLowerCase().includes("wrong")
            ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900")}>
          <span>{message}</span>
          <button onClick={() => setMessage(null)}><X className="h-4 w-4 opacity-50 hover:opacity-80" /></button>
        </div>
      )}

      {/* ── TAB: Listings ── */}
      {tab === "listings" && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20 text-slate-400"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : listings.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm font-medium text-slate-500">No listings yet.</p>
              <button onClick={() => setTab("new")} className="mt-3 text-sm font-semibold text-[#0033A1] hover:underline">Add your first listing →</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {listings.map((p) => {
                const imgs = getImages(p)
                return (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition group">
                    <ImageCarousel images={imgs} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/properties/${p.id}`} target="_blank"
                          className="font-semibold text-[#0f172a] hover:text-[#0033A1] text-sm truncate max-w-xs">
                          {p.title}
                        </Link>
                        <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", statusColor[p.verification_status] ?? "bg-slate-100 text-slate-500")}>
                          {p.verification_status === "verified" && <BadgeCheck className="h-3 w-3" />}
                          {p.verification_status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">{typeIcon[p.property_type]}{p.property_type}</span>
                        {" · "}{p.city}, {p.state}
                        {" · "}<span className="font-medium text-slate-700">{formatNgn(p.price_ngn)}</span>
                        {!p.is_published && <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">DRAFT</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 opacity-60 group-hover:opacity-100 transition">
                      <button type="button" onClick={() => void toggleFeatured(p)} title={p.is_featured ? "Unfeature" : "Feature on homepage"}
                        className={clsx("flex h-8 w-8 items-center justify-center rounded-lg transition",
                          p.is_featured ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-500")}>
                        <Star className="h-4 w-4" fill={p.is_featured ? "currentColor" : "none"} />
                      </button>
                      <button type="button" onClick={() => void togglePublished(p)} title={p.is_published ? "Unpublish" : "Publish"}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 transition">
                        {p.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={() => setEditTarget(p)} title="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-[#0033A1]/10 hover:text-[#0033A1] transition">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {deleteConfirm === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => void handleDelete(p.id)} className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-600">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200">Cancel</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setDeleteConfirm(p.id)} title="Delete"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── TAB: New listing ── */}
      {tab === "new" && (
        <section className="mt-6 rounded-2xl border border-[#0033A1]/20 bg-gradient-to-br from-[#0b1220] to-[#0f172a] p-7 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <Plus className="h-5 w-5 text-cyan-300" />
            <h2 className="text-xl font-bold">New listing</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">Saves as <strong className="text-white">verified + published</strong> — admin posts are pre-vetted.</p>

          <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
            <div>
              <label className={labelCls}>Title</label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="e.g. Verified 500sqm plot — Lekki Phase 1" />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Type</label>
                <select value={form.property_type} onChange={(e) => setForm((f) => ({ ...f, property_type: e.target.value as typeof form.property_type }))} className={inputCls}>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="bg-[#0f172a]">{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Price (₦)</label>
                <input value={form.price_ngn} onChange={(e) => setForm((f) => ({ ...f, price_ngn: e.target.value }))} className={inputCls} placeholder="85000000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>City</label>
                <input required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input required value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Neighbourhood</label>
                <input value={form.neighborhood} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className={labelCls}>Land sqm</label>
                <input type="number" value={form.land_size_sqm} onChange={(e) => setForm((f) => ({ ...f, land_size_sqm: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Built sqm</label>
                <input type="number" value={form.building_size_sqm} onChange={(e) => setForm((f) => ({ ...f, building_size_sqm: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Beds</label>
                <input type="number" min="0" value={form.bedrooms} onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Baths</label>
                <input type="number" min="0" value={form.bathrooms} onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>AI valuation mid (₦)</label>
              <input value={form.ai_valuation_ngn} onChange={(e) => setForm((f) => ({ ...f, ai_valuation_ngn: e.target.value }))} className={inputCls} placeholder="optional" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="rounded border-white/30 bg-transparent" />
              Feature on homepage
            </label>
            <div>
              <label className={`flex items-center gap-1.5 ${labelCls}`}>
                <UploadCloud className="h-3.5 w-3.5" /> Photos (Azure Blob)
              </label>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="mt-2 w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0072CE] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="relative h-14 w-20 overflow-hidden rounded-lg border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-[#0f172a] shadow-lg transition hover:bg-slate-100 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              Save listing &amp; upload images
            </button>
          </form>
        </section>
      )}

      {/* Inline edit modal */}
      {editTarget && (
        <EditModal
          listing={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={async () => { setEditTarget(null); await load() }}
        />
      )}
    </div>
  )
}
