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
      <section className="border-b border-black/10 bg-[#ede8de]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-[var(--font-playfair)] text-6xl font-black leading-[0.95] text-[#0d0d0d]">
            Know your neighbourhood before you move.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#6b6560]">
            Compare commute, security, school access, and lifestyle fit before signing any lease or purchase.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#reports" className="rounded-full bg-[#0d0d0d] px-5 py-2.5 text-sm text-[#f5f0e8]">Browse Neighbourhood Intel</a>
            <a href="#commission" className="rounded-full border border-black/15 px-5 py-2.5 text-sm text-[#0d0d0d]">Ask for Custom Move Brief</a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <div className="emz-gloss-card rounded-2xl p-4">
            <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">Search & Filter</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <select value={citySlug} onChange={(event) => setCitySlug(event.target.value)} className="rounded-xl border border-black/15 bg-[#f5f0e8] px-3 py-2 text-sm">
                <option value="all">All cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.slug}>{city.name}</option>
                ))}
              </select>
              <div className="rounded-xl border border-black/15 bg-[#f5f0e8] px-3 py-2 text-sm">
                Max commute: {maxCommute} mins
              </div>
              <input type="range" min={10} max={90} value={maxCommute} onChange={(event) => setMaxCommute(Number(event.target.value))} className="range-slider" />
              <div className="rounded-xl border border-black/10 bg-[#ede8de] px-3 py-2 text-sm text-[#6b6560]">
                {filteredListings.length} neighbourhood match{filteredListings.length === 1 ? "" : "es"}
              </div>
            </div>
          </div>

          <div id="reports" className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredListings.map((listing) => {
              const city = cityMap.get(listing.citySlug)
              return (
                <article key={listing.id} className="emz-gloss-card rounded-2xl p-4">
                  <p className="text-3xl">{city?.flagEmoji ?? "🌍"}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-[#c9a84c]">{city?.name ?? "City"} · {listing.neighborhood}</p>
                  <h3 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">{listing.title}</h3>
                  <p className="mt-2 text-sm text-[#6b6560]">{listing.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full bg-[#ede8de] px-2 py-1 text-[11px] text-[#6b6560]">Security {city?.securityScore ?? "-"}/100</span>
                    <span className="rounded-full bg-[#ede8de] px-2 py-1 text-[11px] text-[#6b6560]">{listing.commuteMinutes} mins commute</span>
                    <span className="rounded-full bg-[#ede8de] px-2 py-1 text-[11px] text-[#6b6560]">{listing.schoolsNearby} schools</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-[#6b6560]">{listing.type}</span>
                    <strong>${listing.priceUsd.toLocaleString()}</strong>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => setPreviewId(listing.id)} className="rounded-full border border-black/15 px-3 py-1.5 text-sm">Preview</button>
                    <Link href={`/contact?market=${listing.citySlug}&message=I%20need%20help%20with%20${encodeURIComponent(listing.title)}`} className="emz-pill-cta rounded-full bg-[#0d0d0d] px-3 py-1.5 text-sm text-[#f5f0e8]">Get help</Link>
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
          <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Free relocation intel sample</h3>
          <p className="mt-2 text-sm text-[#6b6560]">
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
            <h4 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">{preview.title}</h4>
            <p className="mt-2 text-sm text-[#6b6560]">{preview.description}</p>
            <p className="mt-4 text-sm text-[#6b6560]">
              This property sits in {preview.neighborhood}, with approx {preview.commuteMinutes} minutes average commute and {preview.schoolsNearby} nearby schools.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button type="button" onClick={() => setPreviewId(null)} className="rounded-full border border-black/15 px-3 py-2 text-sm">Close</button>
              <Link href={`/contact?market=${preview.citySlug}`} className="rounded-full bg-[#0d0d0d] px-3 py-2 text-sm text-[#f5f0e8]">Request viewing support</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
