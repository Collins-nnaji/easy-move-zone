"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { AgentProfile, CityMarket, PropertyListing } from "@/lib/property/types"

interface ServicesPageClientProps {
  cities: CityMarket[]
  listings: PropertyListing[]
  agents: AgentProfile[]
}

export function ServicesPageClient({ cities, listings, agents }: ServicesPageClientProps) {
  const [citySlug, setCitySlug] = useState<string>("all")
  const [listingType, setListingType] = useState<"all" | "rent" | "buy" | "commercial">("all")
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
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-6">
          <h1 className="font-[var(--font-playfair)] text-6xl font-black leading-[0.95] text-[#0d0d0d]">
            Verified property listings for movers
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#6b6560]">
            Search rentals, purchases, and commercial spaces with filters designed for relocation decisions.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <select value={citySlug} onChange={(event) => setCitySlug(event.target.value)} className="rounded-xl border border-black/15 bg-[#f5f0e8] px-3 py-2 text-sm">
              <option value="all">All cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.slug}>{city.name}</option>
              ))}
            </select>
            <select value={listingType} onChange={(event) => setListingType(event.target.value as "all" | "rent" | "buy" | "commercial")} className="rounded-xl border border-black/15 bg-[#f5f0e8] px-3 py-2 text-sm">
              <option value="all">All listing types</option>
              <option value="rent">Rent</option>
              <option value="buy">Buy</option>
              <option value="commercial">Commercial</option>
            </select>
            <div className="rounded-xl border border-black/15 bg-[#f5f0e8] px-3 py-2 text-sm">
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
          <div className="mt-3">
            <label className="inline-flex items-center gap-2 text-sm text-[#6b6560]">
              <input type="checkbox" checked={moveInReadyOnly} onChange={(event) => setMoveInReadyOnly(event.target.checked)} />
              Move-in ready only
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing) => (
            <article key={listing.id} className="emz-gloss-card rounded-2xl p-5">
              <p className="text-xs uppercase tracking-wider text-[#c9a84c]">{listing.citySlug.replace("-", " ")} · {listing.type}</p>
              <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">{listing.title}</h3>
              <p className="mt-1 text-sm text-[#6b6560]">{listing.neighborhood}, {listing.country}</p>
              <p className="mt-3 text-sm text-[#6b6560]">{listing.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-[#1a1a1a]">
                <p><strong>${listing.priceUsd.toLocaleString()}</strong></p>
                <p>{listing.areaSqm} sqm</p>
                <p>{listing.bedrooms} bed / {listing.bathrooms} bath</p>
                <p>{listing.commuteMinutes} mins commute</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {listing.verified ? <span className="rounded-full bg-[#ede8de] px-2 py-1 text-[11px] text-[#6b6560]">Verified</span> : null}
                {listing.moveInReady ? <span className="rounded-full bg-[#ede8de] px-2 py-1 text-[11px] text-[#6b6560]">Move-in ready</span> : null}
                <span className="rounded-full bg-[#ede8de] px-2 py-1 text-[11px] text-[#6b6560]">{listing.schoolsNearby} schools nearby</span>
              </div>
              <Link href={`/contact?market=${listing.citySlug}&message=I%20want%20to%20view%20${encodeURIComponent(listing.title)}`} className="emz-pill-cta mt-4 inline-block rounded-full bg-[#0d0d0d] px-4 py-2 text-sm text-[#f5f0e8]">
                Book Viewing Support
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">Pricing</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="emz-gloss-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-[#6b6560]">Explorer</p>
            <h3 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold">Verified Search</h3>
            <p className="mt-1 text-4xl font-black">$299</p>
            <p className="mt-2 text-sm text-[#6b6560]">Shortlist + verification support</p>
          </div>
          <div className="rounded-2xl border border-[#1a3a2a] bg-[#1a3a2a] p-5 text-[#f5f0e8] shadow-xl">
            <p className="text-xs uppercase tracking-wider text-[#e8c96a]">Most Popular</p>
            <h3 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold">Move Concierge</h3>
            <p className="mt-1 text-4xl font-black">$1.5K</p>
            <p className="mt-2 text-sm text-[#f5f0e8]/70">End-to-end move support</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-[#0d0d0d] p-5 text-[#f5f0e8] shadow-[0_18px_40px_-26px_rgba(13,13,13,0.6)]">
            <p className="text-xs uppercase tracking-wider text-[#f5f0e8]/60">Full Service</p>
            <h3 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold">Corporate Relocation</h3>
            <p className="mt-1 text-4xl font-black">$5K+</p>
            <p className="mt-2 text-sm text-[#f5f0e8]/70">Team and executive move package</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">Trusted Agents</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {agents.map((agent) => (
            <article key={agent.id} className="emz-gloss-card rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#0d0d0d]">{agent.name}</h3>
              <p className="text-sm text-[#6b6560]">{agent.company}</p>
              <p className="mt-1 text-sm text-[#6b6560]">Cities: {agent.cityCoverage.join(", ")}</p>
              <p className="text-sm text-[#6b6560]">Rating: {agent.rating} · {agent.transactions} completed transactions</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
