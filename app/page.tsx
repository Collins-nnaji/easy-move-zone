import Link from "next/link"
import { DirectionDetector } from "@/components/platform/DirectionDetector"
import { NewsletterSignupForm } from "@/components/platform/NewsletterSignupForm"
import { PublicShell } from "@/components/platform/PublicShell"
import { TestimonialsRotator } from "@/components/platform/TestimonialsRotator"
import {
  getCityMarkets,
  getFeaturedListings,
  getPrimaryListingImage,
  getOpportunityRows,
  getPropertyTestimonials,
  getResourceGuides,
  getRevenueStreams,
} from "@/lib/property"

export default async function HomePage() {
  const [cities, listings, testimonials, guides] = await Promise.all([
    getCityMarkets(),
    getFeaturedListings(),
    getPropertyTestimonials(),
    getResourceGuides(),
  ])
  const opportunityRows = getOpportunityRows()
  const revenueStreams = getRevenueStreams()

  const cityTicker = cities
    .filter((city) => city.status === "active")
    .map((city) => `${city.flagEmoji} ${city.name} · Security ${city.securityScore}/100 · Rent avg $${city.avgRentUsd.toLocaleString()}`)

  return (
    <PublicShell>
      <section className="emz-hero-section grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-[#bfd1ee] bg-[#eef4ff] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">
            Strategic relocation platform · 2025
          </span>
          <h1 className="property-section-title text-[#0f172a]">
            Find the right property before your move starts.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[#475569]">
            EasyMoveZone combines verified listings, neighbourhood intelligence, and human relocation
            support so you can move with confidence across Nigeria and Africa.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/services" className="emz-pill-cta rounded-full px-6 py-3 text-sm font-semibold">
              Explore listings
            </Link>
            <Link href="/contact" className="rounded-full border border-[#c8d8f0] bg-white px-6 py-3 text-sm font-semibold text-[#0f172a]">
              Book advisor call
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="emz-gloss-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-[#64748b]">Cities covered</p>
              <p className="mt-2 text-3xl font-bold text-[#0f172a]">{cities.length}+</p>
            </div>
            <div className="emz-gloss-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-[#64748b]">Verified listings</p>
              <p className="mt-2 text-3xl font-bold text-[#0f172a]">{listings.length}+</p>
            </div>
            <div className="emz-gloss-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-[#64748b]">Avg response</p>
              <p className="mt-2 text-3xl font-bold text-[#0f172a]">&lt;24h</p>
            </div>
          </div>
        </div>
        <div className="property-hero-image emz-hero-float p-5 text-white md:p-6">
          <div className="max-w-sm rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-100">For movers</p>
            <p className="mt-2 text-sm leading-6 text-sky-50/90">
              Domestic movers, diaspora returnees, and pan-African professionals use one platform to
              shortlist, verify, and secure property faster.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="property-photo-tile" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80')" }} />
          <div className="property-photo-tile" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80')" }} />
          <div className="property-photo-tile" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80')" }} />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">AI match</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Describe your move</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Our assistant maps your profile to suitable city options, move support level, and budget route.
          </p>
          <div className="mt-4">
            <DirectionDetector />
          </div>
        </div>
        <div className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f766e]">Live city pulse</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Where demand is moving</h2>
          <div className="mt-4 space-y-2">
            {cityTicker.slice(0, 6).map((item) => (
              <p key={item} className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] px-3 py-2 text-sm text-[#475569]">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">Featured inventory</p>
            <h2 className="property-section-title mt-2 text-[#0f172a]">Move-ready properties</h2>
          </div>
          <Link href="/services" className="text-sm font-semibold text-[#155eef]">View all listings</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.slice(0, 6).map((listing) => (
            <article key={listing.id} className="emz-gloss-card rounded-2xl p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getPrimaryListingImage(listing)} alt={listing.title} className="h-44 w-full rounded-xl object-cover" />
              <p className="mt-3 text-xs uppercase tracking-[0.15em] text-[#0f766e]">{listing.citySlug.replace("-", " ")} · {listing.type}</p>
              <h3 className="mt-1 text-2xl font-bold text-[#0f172a]">{listing.title}</h3>
              <p className="mt-1 text-sm text-[#64748b]">{listing.neighborhood}, {listing.country}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-lg font-semibold text-[#0f172a]">${listing.priceUsd.toLocaleString()}</p>
                <p className="text-sm text-[#64748b]">{listing.commuteMinutes} min commute</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <TestimonialsRotator testimonials={testimonials.slice(0, 3)} />
        <div className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">Relocation updates</p>
          <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Get monthly property intelligence</h3>
          <p className="mt-2 text-sm text-[#64748b]">Curated city insights, pricing shifts, and verified supply updates.</p>
          <div className="mt-5">
            <NewsletterSignupForm />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between">
          <h3 className="font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Relocation guides</h3>
          <Link href="/intelligence" className="text-sm font-semibold text-[#155eef]">See all intelligence</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {guides.map((guide) => (
            <article key={guide.id} className="emz-gloss-card rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#0f766e]">{guide.category} · {guide.readMinutes} min read</p>
              <h4 className="mt-2 text-2xl font-bold text-[#0f172a]">{guide.title}</h4>
              <p className="mt-2 text-sm text-[#64748b]">{guide.summary}</p>
              <Link href={guide.href} className="mt-3 inline-block text-sm font-semibold text-[#155eef]">
                Open guide
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-6">
          <h3 className="font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Market opportunity and revenue model</h3>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">Opportunity snapshot</h4>
              <ul className="mt-2 space-y-2 text-sm text-[#475569]">
                {opportunityRows.map((row) => (
                  <li key={row.segment}>
                    <strong className="text-[#0f172a]">{row.segment}:</strong> {row.sizeVolume} — {row.whyNow}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">Revenue streams</h4>
              <ul className="mt-2 space-y-2 text-sm text-[#475569]">
                {revenueStreams.map((stream) => (
                  <li key={stream.name}>
                    <strong className="text-[#0f172a]">{stream.name}:</strong> {stream.description}
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
