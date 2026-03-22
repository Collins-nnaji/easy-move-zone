"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"

const TYPES = [
  { value: "land", label: "Land" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed-use", label: "Mixed-use" },
] as const

export function ListPropertyForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      title: String(fd.get("title") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim() || null,
      property_type: String(fd.get("property_type") ?? ""),
      city: String(fd.get("city") ?? "").trim(),
      state: String(fd.get("state") ?? "").trim(),
      country: String(fd.get("country") ?? "").trim() || "Nigeria",
      neighborhood: String(fd.get("neighborhood") ?? "").trim() || null,
      address: String(fd.get("address") ?? "").trim() || null,
      price_ngn: (() => {
        const v = String(fd.get("price_ngn") ?? "").replace(/,/g, "")
        return v ? Math.round(Number(v)) : null
      })(),
      land_size_sqm: (() => {
        const v = String(fd.get("land_size_sqm") ?? "")
        return v ? Number(v) : null
      })(),
      building_size_sqm: (() => {
        const v = String(fd.get("building_size_sqm") ?? "")
        return v ? Number(v) : null
      })(),
      bedrooms: (() => {
        const v = String(fd.get("bedrooms") ?? "")
        return v ? Math.round(Number(v)) : null
      })(),
      bathrooms: (() => {
        const v = String(fd.get("bathrooms") ?? "")
        return v ? Math.round(Number(v)) : null
      })(),
    }

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not create listing")
        return
      }
      if (data.id) {
        router.push(`/properties/${data.id}`)
        router.refresh()
        return
      }
      setError("Unexpected response")
    } catch {
      setError("Network error — try again")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/portal"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748b] hover:text-[#0f172a]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to portal
      </Link>
      <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">List a property</h1>
      <p className="mt-1 text-sm text-[#64748b]">
        Create a draft listing. You can add photos and request verification after it&apos;s saved.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6 rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-[#0f172a]">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
            placeholder="e.g. 800sqm verified plot — Lekki Phase 2"
          />
        </div>

        <div>
          <label htmlFor="property_type" className="block text-sm font-semibold text-[#0f172a]">
            Property type <span className="text-red-500">*</span>
          </label>
          <select
            id="property_type"
            name="property_type"
            required
            className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-[#0f172a]">
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              name="city"
              required
              className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
              placeholder="Lagos"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-semibold text-[#0f172a]">
              State / region <span className="text-red-500">*</span>
            </label>
            <input
              id="state"
              name="state"
              required
              className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
              placeholder="Lagos"
            />
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-semibold text-[#0f172a]">
            Country
          </label>
          <input
            id="country"
            name="country"
            defaultValue="Nigeria"
            className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="neighborhood" className="block text-sm font-semibold text-[#0f172a]">
            Neighborhood
          </label>
          <input
            id="neighborhood"
            name="neighborhood"
            className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
            placeholder="Lekki Phase 2"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-[#0f172a]">
            Address (optional)
          </label>
          <input
            id="address"
            name="address"
            className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="price_ngn" className="block text-sm font-semibold text-[#0f172a]">
            Price (NGN)
          </label>
          <input
            id="price_ngn"
            name="price_ngn"
            inputMode="numeric"
            className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
            placeholder="85000000"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="land_size_sqm" className="block text-sm font-semibold text-[#0f172a]">
              Land size (sqm)
            </label>
            <input
              id="land_size_sqm"
              name="land_size_sqm"
              inputMode="decimal"
              className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="building_size_sqm" className="block text-sm font-semibold text-[#0f172a]">
              Building size (sqm)
            </label>
            <input
              id="building_size_sqm"
              name="building_size_sqm"
              inputMode="decimal"
              className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-semibold text-[#0f172a]">
              Bedrooms
            </label>
            <input
              id="bedrooms"
              name="bedrooms"
              inputMode="numeric"
              className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="bathrooms" className="block text-sm font-semibold text-[#0f172a]">
              Bathrooms
            </label>
            <input
              id="bathrooms"
              name="bathrooms"
              inputMode="numeric"
              className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-[#0f172a]">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="mt-1.5 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm outline-none ring-[#155eef]/20 focus:ring-2"
            placeholder="Highlights, access road, title status notes…"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#155eef] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1249d1] disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Publish listing"
          )}
        </button>
      </form>
    </div>
  )
}
