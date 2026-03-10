"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { getPrimaryListingImage } from "@/lib/property/media"
import type { AgentProfile, CityMarket, PropertyFaq, PropertyListing } from "@/lib/property/types"

interface ServicesPageClientProps {
  cities: CityMarket[]
  listings: PropertyListing[]
  agents: AgentProfile[]
  faqs: PropertyFaq[]
}

export function ServicesPageClient({ cities, listings, agents, faqs }: ServicesPageClientProps) {
  const [citySlug, setCitySlug] = useState<string>("all")
  const [listingType, setListingType] = useState<"all" | "buy" | "commercial">("all")
  const [maxBudget, setMaxBudget] = useState<number>(500000)
  const [moveInReadyOnly, setMoveInReadyOnly] = useState(false)

  const filtered = useMemo(
    () =>
      listings
        .filter((listing) => (citySlug === "all" ? true : listing.citySlug === citySlug))
        .filter((listing) => (listingType === "all" ? true : listing.type === listingType))
        .filter((listing) => listing.priceUsd <= maxBudget)
        .filter((listing) => (moveInReadyOnly ? listing.moveInReady : true)),
    [listings, citySlug, listingType, maxBudget, moveInReadyOnly]
  )

  return (
    <>
      <section className="emz-hero-section">
        <div className="property-hero-image flex items-end p-5 md:p-6">
          <div className="max-w-2xl rounded-2xl border border-white/25 bg-black/35 p-6 text-white backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-100">Verified property inventory</p>
            <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-bold leading-[0.95] md:text-6xl">
              Browse verified homes for ownership
            </h1>
            <p className="mt-3 text-sm text-sky-50/90">
              Compare buy opportunities, set your budget, and shortlist faster for purchase, installment, or trade-up plans.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <select value={citySlug} onChange={(event) => setCitySlug(event.target.value)} className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm">
              <option value="all">All cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.slug}>{city.name}</option>
              ))}
            </select>
            <select value={listingType} onChange={(event) => setListingType(event.target.value as "all" | "buy" | "commercial")} className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm">
              <option value="all">All ownership types</option>
              <option value="buy">Buy</option>
              <option value="commercial">Commercial</option>
            </select>
            <div className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm">
              Max budget: ${maxBudget.toLocaleString()}
            </div>
            <input
              type="range"
              min={10000}
              max={600000}
              step={5000}
              value={maxBudget}
              onChange={(event) => setMaxBudget(Number(event.target.value))}
              className="range-slider"
            />
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-[#475569]">
            <input type="checkbox" checked={moveInReadyOnly} onChange={(event) => setMoveInReadyOnly(event.target.checked)} />
            Ready-to-close only
          </label>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 md:grid-cols-3">
          <article className="emz-gloss-card rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Pathway 1</p>
            <h2 className="mt-2 text-xl font-bold text-[#0f172a]">Direct purchase</h2>
            <p className="mt-1 text-sm text-[#64748b]">Buy verified properties with full legal and documentation support.</p>
          </article>
          <article className="emz-gloss-card rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Pathway 2</p>
            <h2 className="mt-2 text-xl font-bold text-[#0f172a]">Installment plans</h2>
            <p className="mt-1 text-sm text-[#64748b]">Shortlist homes with flexible payment structures that fit your cash flow.</p>
          </article>
          <article className="emz-gloss-card rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Pathway 3</p>
            <h2 className="mt-2 text-xl font-bold text-[#0f172a]">Sell and top-up</h2>
            <p className="mt-1 text-sm text-[#64748b]">Sell your current property, add funds, and upgrade into a better home.</p>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="emz-gloss-card rounded-2xl p-6 text-center">
            <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">No listings match these filters</h3>
            <p className="mt-2 text-sm text-[#64748b]">Try increasing budget, changing city, or disabling “ready-to-close only”.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((listing) => (
              <article key={listing.id} className="emz-gloss-card rounded-2xl p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getPrimaryListingImage(listing)} alt={listing.title} className="h-44 w-full rounded-xl object-cover" />
                <p className="mt-3 text-xs uppercase tracking-wider text-[#0f766e]">{listing.citySlug.replace("-", " ")} · {listing.type}</p>
                <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">{listing.title}</h3>
                <p className="mt-1 text-sm text-[#64748b]">{listing.neighborhood}, {listing.country}</p>
                <p className="mt-3 text-sm text-[#475569]">{listing.description}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-[#0f172a]">
                  <p><strong>${listing.priceUsd.toLocaleString()}</strong></p>
                  <p>{listing.areaSqm} sqm</p>
                  <p>{listing.bedrooms} bed / {listing.bathrooms} bath</p>
                  <p>{listing.commuteMinutes} mins commute</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.verified ? <span className="rounded-full bg-[#eaf1ff] px-2 py-1 text-[11px] text-[#155eef]">Verified</span> : null}
                  {listing.moveInReady ? <span className="rounded-full bg-[#e7f7f2] px-2 py-1 text-[11px] text-[#0f766e]">Ready to close</span> : null}
                  <span className="rounded-full bg-[#f1f5f9] px-2 py-1 text-[11px] text-[#64748b]">{listing.schoolsNearby} schools nearby</span>
                </div>
                <Link href={`/contact?market=${listing.citySlug}&message=I%20want%20to%20view%20${encodeURIComponent(listing.title)}`} className="emz-pill-cta mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
                  Request purchase support
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="property-section-title text-[#0f172a]">Trusted agents</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {agents.map((agent) => (
            <article key={agent.id} className="emz-gloss-card rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#0f172a]">{agent.name}</h3>
              <p className="text-sm text-[#64748b]">{agent.company}</p>
              <p className="mt-1 text-sm text-[#64748b]">Cities: {agent.cityCoverage.join(", ")}</p>
              <p className="text-sm text-[#64748b]">Rating: {agent.rating} · {agent.transactions} completed transactions</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="property-section-title text-[#0f172a]">Frequently asked questions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.id} className="emz-gloss-card rounded-xl p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#0f172a]">{faq.question}</summary>
              <p className="mt-2 text-sm text-[#64748b]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
