"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { IntelligenceChatbot } from "@/components/platform/IntelligenceChatbot"
import { NewsletterSignupForm } from "@/components/platform/NewsletterSignupForm"
import type { CityMarket, PropertyListing } from "@/lib/property/types"

interface IntelligencePageClientProps {
  cities: CityMarket[]
  listings: PropertyListing[]
}

export function IntelligencePageClient({ cities, listings }: IntelligencePageClientProps) {
  const [citySlug, setCitySlug] = useState("all")
  const [maxCommute, setMaxCommute] = useState(45)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const cityMap = useMemo(() => new Map(cities.map((city) => [city.slug, city])), [cities])

  const filteredListings = useMemo(
    () =>
      listings
        .filter((listing) => (citySlug === "all" ? true : listing.citySlug === citySlug))
        .filter((listing) => listing.commuteMinutes <= maxCommute),
    [listings, citySlug, maxCommute]
  )

  const preview = filteredListings.find((listing) => listing.id === previewId)

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="property-hero-image p-6 md:p-8">
          <div className="max-w-2xl rounded-2xl border border-white/30 bg-black/35 p-6 text-white backdrop-blur-sm">
            <h1 className="font-[var(--font-playfair)] text-5xl font-bold leading-[0.95] md:text-6xl">
              Neighbourhood intelligence before you sign
            </h1>
            <p className="mt-3 text-sm text-sky-100">
              Filter city options by commute, compare local fit, and ask our relocation AI for practical guidance.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="#reports" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0f172a]">Browse intel</a>
              <a href="#commission" className="rounded-full border border-white/50 px-5 py-2.5 text-sm font-semibold text-white">Request custom brief</a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <div className="emz-gloss-card rounded-2xl p-4">
            <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">Search & filter</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <select value={citySlug} onChange={(event) => setCitySlug(event.target.value)} className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm">
                <option value="all">All cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.slug}>{city.name}</option>
                ))}
              </select>
              <div className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm">
                Max commute: {maxCommute} mins
              </div>
              <input type="range" min={10} max={90} value={maxCommute} onChange={(event) => setMaxCommute(Number(event.target.value))} className="range-slider" />
              <div className="rounded-xl border border-[#dbe4f0] bg-[#f1f5f9] px-3 py-2 text-sm text-[#64748b]">
                {filteredListings.length} neighbourhood match{filteredListings.length === 1 ? "" : "es"}
              </div>
            </div>
          </div>

          <div id="reports" className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredListings.map((listing) => {
              const city = cityMap.get(listing.citySlug)
              return (
                <article key={listing.id} className="emz-gloss-card rounded-2xl p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={listing.images[0]} alt={listing.title} className="h-40 w-full rounded-xl object-cover" />
                  <p className="mt-3 text-xs uppercase tracking-wider text-[#0f766e]">{city?.flagEmoji ?? "🌍"} {city?.name ?? "City"} · {listing.neighborhood}</p>
                  <h3 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">{listing.title}</h3>
                  <p className="mt-2 text-sm text-[#64748b]">{listing.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full bg-[#eaf1ff] px-2 py-1 text-[11px] text-[#155eef]">Security {city?.securityScore ?? "-"}/100</span>
                    <span className="rounded-full bg-[#e7f7f2] px-2 py-1 text-[11px] text-[#0f766e]">{listing.commuteMinutes} mins commute</span>
                    <span className="rounded-full bg-[#f1f5f9] px-2 py-1 text-[11px] text-[#64748b]">{listing.schoolsNearby} schools</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-[#64748b]">{listing.type}</span>
                    <strong>${listing.priceUsd.toLocaleString()}</strong>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => setPreviewId(listing.id)} className="rounded-full border border-[#c8d8f0] px-3 py-1.5 text-sm">Preview</button>
                    <Link href={`/contact?market=${listing.citySlug}&message=I%20need%20help%20with%20${encodeURIComponent(listing.title)}`} className="emz-pill-cta rounded-full px-3 py-1.5 text-sm font-semibold">Get help</Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <IntelligenceChatbot />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-5">
          <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Free relocation intel sample</h3>
          <p className="mt-2 text-sm text-[#64748b]">
            Get one free neighbourhood brief in exchange for your email.
          </p>
          <div className="mt-4 max-w-xl">
            <NewsletterSignupForm />
          </div>
        </div>
      </section>

      {preview ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div className="emz-gloss-card w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">{preview.title}</h4>
            <p className="mt-2 text-sm text-[#64748b]">{preview.description}</p>
            <p className="mt-4 text-sm text-[#64748b]">
              This property sits in {preview.neighborhood}, with approx {preview.commuteMinutes} minutes average commute and {preview.schoolsNearby} nearby schools.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button type="button" onClick={() => setPreviewId(null)} className="rounded-full border border-[#c8d8f0] px-3 py-2 text-sm">Close</button>
              <Link href={`/contact?market=${preview.citySlug}`} className="emz-pill-cta rounded-full px-3 py-2 text-sm font-semibold">Request viewing support</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
