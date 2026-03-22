"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Plus,
  RefreshCw,
  ImagePlus,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Star,
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
}

const PROPERTY_TYPES = ["land", "house", "apartment", "commercial", "mixed-use"] as const

export function AdminListingsClient() {
  const [listings, setListings] = useState<PropertyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    property_type: "land" as (typeof PROPERTY_TYPES)[number],
    city: "",
    state: "",
    neighborhood: "",
    address: "",
    price_ngn: "",
    land_size_sqm: "",
    building_size_sqm: "",
    bedrooms: "",
    bathrooms: "",
    ai_valuation_ngn: "",
    is_featured: false,
  })
  const [files, setFiles] = useState<File[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/properties?limit=200")
      if (res.status === 403) {
        setError("You do not have admin access.")
        setListings([])
        return
      }
      if (!res.ok) throw new Error("Failed to load")
      const data = (await res.json()) as { properties: PropertyRow[] }
      setListings(data.properties ?? [])
    } catch {
      setError("Could not load listings.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const priceNgn = form.price_ngn.trim() ? Number(form.price_ngn.replace(/,/g, "")) : null
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          property_type: form.property_type,
          city: form.city.trim(),
          state: form.state.trim(),
          country: "Nigeria",
          neighborhood: form.neighborhood.trim() || null,
          address: form.address.trim() || null,
          price_ngn: priceNgn != null && Number.isFinite(priceNgn) ? priceNgn : null,
          land_size_sqm: form.land_size_sqm.trim() ? Number(form.land_size_sqm) : null,
          building_size_sqm: form.building_size_sqm.trim() ? Number(form.building_size_sqm) : null,
          bedrooms: form.bedrooms.trim() ? Number(form.bedrooms) : null,
          bathrooms: form.bathrooms.trim() ? Number(form.bathrooms) : null,
          ai_valuation_ngn: form.ai_valuation_ngn.trim() ? Number(form.ai_valuation_ngn.replace(/,/g, "")) : null,
          images: [],
          verification_status: "verified",
          is_published: true,
          is_featured: form.is_featured,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Create failed")

      const id = data.id as string
      const urls: string[] = []

      for (const file of files) {
        const fd = new FormData()
        fd.set("file", file)
        fd.set("propertyId", id)
        fd.set("fileType", "image")
        const up = await fetch("/api/upload-property", { method: "POST", body: fd })
        const uj = await up.json()
        if (!up.ok) throw new Error(uj.error || "Upload failed")
        urls.push(uj.url as string)
      }

      if (urls.length > 0) {
        const patch = await fetch(`/api/admin/properties/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: urls }),
        })
        if (!patch.ok) throw new Error("Saved listing but failed to attach images")
      }

      setMessage("Listing published.")
      setForm({
        title: "",
        description: "",
        property_type: "land",
        city: "",
        state: "",
        neighborhood: "",
        address: "",
        price_ngn: "",
        land_size_sqm: "",
        building_size_sqm: "",
        bedrooms: "",
        bathrooms: "",
        ai_valuation_ngn: "",
        is_featured: false,
      })
      setFiles([])
      await load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function toggleFeatured(p: PropertyRow) {
    await fetch(`/api/admin/properties/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: !p.is_featured }),
    })
    await load()
  }

  async function togglePublished(p: PropertyRow) {
    await fetch(`/api/admin/properties/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !p.is_published }),
    })
    await load()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#e2e8f0] pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Listings admin</h1>
          <p className="mt-2 max-w-xl text-sm text-[#64748b]">
            Post verified inventory only. Images upload to Azure Blob (when configured) and URLs are stored on the property
            row—live on the site immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] shadow-sm hover:bg-[#f8fafc]"
          >
            <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-[#155eef] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1249d1]"
          >
            View public site
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {message && (
        <div
          className={clsx(
            "mt-6 rounded-xl border px-4 py-3 text-sm",
            message.includes("fail") || message.includes("wrong")
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          )}
        >
          {message}
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0f172a]">Existing listings</h2>
          {loading ? (
            <div className="mt-8 flex justify-center py-12 text-[#64748b]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : listings.length === 0 ? (
            <p className="mt-4 text-sm text-[#64748b]">No rows in `properties` yet. Create one with the form.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#e2e8f0]">
              {listings.map((p) => (
                <li key={p.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/properties/${p.id}`} className="font-semibold text-[#155eef] hover:underline">
                      {p.title}
                    </Link>
                    <p className="text-xs text-[#64748b]">
                      {p.city}, {p.state} · {p.property_type} · {p.verification_status}
                      {!p.is_published && " · draft"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleFeatured(p)}
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold",
                        p.is_featured ? "bg-amber-100 text-amber-900" : "bg-[#f1f5f9] text-[#475569]"
                      )}
                    >
                      <Star className="h-3.5 w-3.5" />
                      {p.is_featured ? "Featured" : "Feature"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void togglePublished(p)}
                      className="rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#475569]"
                    >
                      {p.is_published ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#155eef]/20 bg-gradient-to-br from-[#0b1220] to-[#0f172a] p-6 text-white shadow-xl">
          <div className="flex items-center gap-2 text-[#93c5fd]">
            <Plus className="h-5 w-5" />
            <h2 className="font-[var(--font-playfair)] text-xl font-bold">New listing</h2>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            We verify before publishing—defaults save as <strong className="text-white">verified</strong> because admin posts
            are pre-vetted internally.
          </p>

          <form onSubmit={(e) => void handleCreate(e)} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#155eef]/50 focus:outline-none"
                placeholder="e.g. Verified 500sqm — Lekki"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#155eef]/50 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Type</label>
                <select
                  value={form.property_type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, property_type: e.target.value as (typeof PROPERTY_TYPES)[number] }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0f172a]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Price (₦)</label>
                <input
                  value={form.price_ngn}
                  onChange={(e) => setForm((f) => ({ ...f, price_ngn: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                  placeholder="85000000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">City</label>
                <input
                  required
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">State</label>
                <input
                  required
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Neighbourhood</label>
              <input
                value={form.neighborhood}
                onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Land sqm</label>
                <input
                  value={form.land_size_sqm}
                  onChange={(e) => setForm((f) => ({ ...f, land_size_sqm: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Built sqm</label>
                <input
                  value={form.building_size_sqm}
                  onChange={(e) => setForm((f) => ({ ...f, building_size_sqm: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bedrooms</label>
                <input
                  value={form.bedrooms}
                  onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bathrooms</label>
                <input
                  value={form.bathrooms}
                  onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI valuation mid (₦)</label>
              <input
                value={form.ai_valuation_ngn}
                onChange={(e) => setForm((f) => ({ ...f, ai_valuation_ngn: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder="optional"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                className="rounded border-white/30"
              />
              Feature on homepage
            </label>
            <div>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <ImagePlus className="h-4 w-4" />
                Photos (Azure)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="mt-2 w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#155eef] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-[#0f172a] shadow-lg transition hover:bg-[#f1f5f9] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save listing &amp; upload images
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
