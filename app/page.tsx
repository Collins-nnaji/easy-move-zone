import Link from "next/link"
import { DirectionDetector } from "@/components/platform/DirectionDetector"
import { NewsletterSignupForm } from "@/components/platform/NewsletterSignupForm"
import { PublicShell } from "@/components/platform/PublicShell"
import { TestimonialsRotator } from "@/components/platform/TestimonialsRotator"
import {
  getCityMarkets,
  getFeaturedListings,
  getOpportunityRows,
  getPropertyTestimonials,
  getRevenueStreams,
} from "@/lib/property"

export default async function HomePage() {
  const [cities, listings, testimonials] = await Promise.all([
    getCityMarkets(),
    getFeaturedListings(),
    getPropertyTestimonials(),
  ])
  const opportunityRows = getOpportunityRows()
  const revenueStreams = getRevenueStreams()

  const cityTicker = cities
    .filter((city) => city.status === "active")
    .map((city) => `${city.flagEmoji} ${city.name} · Security ${city.securityScore}/100 · Rent avg $${city.avgRentUsd.toLocaleString()}`)

  return (
    <PublicShell>
      <section className="border-b border-black/10 bg-[#f5f0e8]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
          <div>
            <span className="inline-flex items-center rounded-full border border-[#c9a84c]/40 bg-[#ede8de] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b6560]">
              Strategic Business Overview · 2025
            </span>
            <h1 className="mt-5 font-[var(--font-playfair)] text-6xl font-black leading-[0.92] tracking-tight text-[#0d0d0d] md:text-8xl">
              Find your land. <em className="text-[#c9a84c]">Start your chapter.</em>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#6b6560]">
              EasyMoveZone Property Finder helps movers secure verified homes and commercial spaces
              across Nigeria and Africa — without agent fraud, listing chaos, or relocation guesswork.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/services" className="emz-pill-cta rounded-full bg-[#0d0d0d] px-6 py-3 text-base font-medium text-[#f5f0e8]">
                Browse Verified Listings
              </Link>
              <Link href="/contact" className="emz-pill-cta rounded-full border border-black/15 px-6 py-3 text-base font-medium text-[#0d0d0d]">
                Talk to a Move Advisor
              </Link>
            </div>
          </div>
          <div className="emz-hero-float space-y-4 rounded-3xl bg-[#1a3a2a] p-6 text-[#f5f0e8]">
            {[
              {
                title: "Domestic Movers",
                text: "Relocate within Nigeria: Lagos ↔ Abuja ↔ Port Harcourt with verified listings.",
              },
              {
                title: "Diaspora Returnees",
                text: "Secure property remotely before arrival from UK, US, Canada, and Europe.",
              },
              {
                title: "Pan-African Professionals",
                text: "Move across African cities like Accra, Nairobi, Johannesburg, and Kigali.",
              },
            ].map((journey) => {
              return (
                <div key={journey.title} className="rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{journey.title}</p>
                    <span className="rounded-full bg-[#c9a84c]/20 px-2 py-1 text-[10px] uppercase tracking-wider text-[#e8c96a]">Active</span>
                  </div>
                  <p className="mt-2 text-xs text-[#f5f0e8]/65">{journey.text}</p>
                </div>
              )
            })}
          </div>
        </div>
        <div className="overflow-hidden border-t border-black/10 bg-[#ede8de] py-2">
          <div className="animate-ticker whitespace-nowrap text-sm text-[#6b6560]">
            {[...cityTicker, ...cityTicker].map((item, index) => (
              <span key={`${item}-${index}`} className="mx-8 inline-block">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <DirectionDetector />
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1a4a6b]">The Problem</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Property search is broken for movers</h2>
          <ol className="mt-4 space-y-3 text-sm text-[#6b6560]">
            <li><strong className="text-[#0d0d0d]">No single trusted platform:</strong> listings are fragmented and hard to verify.</li>
            <li><strong className="text-[#0d0d0d]">High fraud risk:</strong> fake agents and duplicate payment traps are common.</li>
            <li><strong className="text-[#0d0d0d]">No arrival context:</strong> weak neighborhood data creates bad decisions.</li>
            <li><strong className="text-[#0d0d0d]">Time pressure:</strong> movers need quality options fast before deadlines.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-black/10 bg-[#1a3a2a] p-6 text-[#f5f0e8] shadow-[0_18px_40px_-26px_rgba(13,13,13,0.6)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c96a]">The Solution</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-3xl font-bold">What EasyMoveZone delivers</h2>
          <ol className="mt-4 space-y-3 text-sm text-[#f5f0e8]/75">
            <li><strong className="text-[#f5f0e8]">Verified listings:</strong> rental and purchase options in key African cities.</li>
            <li><strong className="text-[#f5f0e8]">AI matching:</strong> budget, lifestyle, commute, and move timeline fit.</li>
            <li><strong className="text-[#f5f0e8]">Trusted agents:</strong> identity-verified profiles with performance history.</li>
            <li><strong className="text-[#f5f0e8]">Legal support:</strong> tenancy docs, title checks, and secure payment flow.</li>
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">Move-ready Listings</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">Verified properties available now</h2>
        </div>
        <div className="emz-gloss-card overflow-hidden rounded-2xl bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#ede8de] text-[#0d0d0d]">
              <tr>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Neighborhood</th>
                <th className="px-4 py-3">Price (USD)</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => {
                return (
                  <tr key={listing.id} className="border-t border-black/5">
                    <td className="px-4 py-3">{listing.citySlug.replace("-", " ")}</td>
                    <td className="px-4 py-3">{listing.type}</td>
                    <td className="px-4 py-3">{listing.neighborhood}</td>
                    <td className="px-4 py-3">${listing.priceUsd.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">City Coverage</p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">Where we serve movers</h2>
          </div>
          <Link href="/markets" className="text-sm font-medium text-[#0d0d0d] underline">
            View all city insights
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((city) => (
            <Link key={city.id} href={`/markets`} className="emz-gloss-card rounded-2xl p-4">
              <div className="text-3xl">{city.flagEmoji}</div>
              <h3 className="mt-2 text-lg font-semibold text-[#0d0d0d]">{city.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-[#6b6560]">{city.status.replace("_", " ")}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {city.topSectors.slice(0, 3).map((sector) => (
                  <span key={sector} className="rounded-full bg-[#ede8de] px-2 py-1 text-[11px] text-[#6b6560]">{sector}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <TestimonialsRotator testimonials={testimonials.slice(0, 3)} />
        <div className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">Newsletter Signup</p>
          <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0d0d0d]">Monthly relocation intelligence. No noise.</h3>
          <p className="mt-2 text-sm text-[#6b6560]">Market availability, neighborhood trends, and mover insights.</p>
          <div className="mt-5">
            <NewsletterSignupForm />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">Market Opportunity & Revenue Model</p>
          <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">Built for scale across Nigeria and Africa</h3>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[#6b6560]">Opportunity</h4>
              <ul className="mt-2 space-y-2 text-sm text-[#6b6560]">
                {opportunityRows.map((row) => (
                  <li key={row.segment}>
                    <strong className="text-[#0d0d0d]">{row.segment}:</strong> {row.sizeVolume} — {row.whyNow}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[#6b6560]">Revenue Streams</h4>
              <ul className="mt-2 space-y-2 text-sm text-[#6b6560]">
                {revenueStreams.map((stream) => (
                  <li key={stream.name}>
                    <strong className="text-[#0d0d0d]">{stream.name}:</strong> {stream.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
