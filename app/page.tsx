import Link from "next/link"
import { DirectionDetector } from "@/components/platform/DirectionDetector"
import { NewsletterSignupForm } from "@/components/platform/NewsletterSignupForm"
import { PublicShell } from "@/components/platform/PublicShell"
import { TestimonialsRotator } from "@/components/platform/TestimonialsRotator"
import {
  getCityMarkets,
  getFeaturedListings,
  getPrimaryListingImage,
  getPropertyTestimonials,
} from "@/lib/property"

export default async function HomePage() {
  const [cities, listings, testimonials] = await Promise.all([
    getCityMarkets(),
    getFeaturedListings(),
    getPropertyTestimonials(),
  ])
  const activeCities = cities.filter((city) => city.status === "active")

  return (
    <PublicShell>
      <section className="emz-hero-section grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-[#bfd1ee] bg-[#eef4ff] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">
            Property relocation platform
          </span>
          <h1 className="font-[var(--font-playfair)] text-5xl font-black leading-[0.92] text-[#0f172a] md:text-7xl">
            Move smarter.
            <br />
            Find home faster.
          </h1>
          <p className="max-w-xl text-base leading-7 text-[#475569] md:text-lg">
            Verified listings, city intelligence, and advisor support in one clear flow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/services" className="emz-pill-cta rounded-full px-6 py-3 text-sm font-semibold">
              Browse listings
            </Link>
            <Link href="/markets#intel-tool" className="rounded-full border border-[#c8d8f0] bg-white px-6 py-3 text-sm font-semibold text-[#0f172a]">
              Explore city intel
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#334155]">
            <span className="rounded-full bg-[#eef4ff] px-3 py-1.5">Verified supply</span>
            <span className="rounded-full bg-[#ecfdf5] px-3 py-1.5">AI city insights</span>
            <span className="rounded-full bg-[#fff7ed] px-3 py-1.5">Advisor support</span>
          </div>
        </div>
        <div className="property-hero-image emz-hero-float flex items-end p-5 text-white md:p-6">
          <div className="w-full max-w-md space-y-3 rounded-2xl border border-white/30 bg-white/12 p-4 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-100">Live platform snapshot</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-black/25 p-2">
                <p className="text-lg font-bold">{cities.length}+</p>
                <p className="text-[10px] text-sky-100">Cities</p>
              </div>
              <div className="rounded-xl bg-black/25 p-2">
                <p className="text-lg font-bold">{listings.length}+</p>
                <p className="text-[10px] text-sky-100">Listings</p>
              </div>
              <div className="rounded-xl bg-black/25 p-2">
                <p className="text-lg font-bold">&lt;24h</p>
                <p className="text-[10px] text-sky-100">Response</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-sky-50/90">
              Designed for movers who need quick, confident decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="emz-gloss-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Step 1</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0f172a]">Shortlist</h2>
            <p className="mt-1 text-sm text-[#64748b]">Filter verified listings that match your budget and move window.</p>
          </article>
          <article className="emz-gloss-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Step 2</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0f172a]">Validate</h2>
            <p className="mt-1 text-sm text-[#64748b]">Check city and neighbourhood intelligence before committing.</p>
          </article>
          <article className="emz-gloss-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Step 3</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0f172a]">Move</h2>
            <p className="mt-1 text-sm text-[#64748b]">Get advisor help for viewings, documentation, and final decision.</p>
          </article>
        </div>
      </section>

      <section id="about" className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">About EasyMoveZone</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Built for confident relocation</h2>
          <p className="mt-3 text-sm leading-7 text-[#475569]">
            We combine trusted listings, city context, and practical guidance so movers can decide faster.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[#155eef]">Domestic movers</span>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[#155eef]">Diaspora returnees</span>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[#155eef]">Pan-African professionals</span>
          </div>
        </article>
        <article className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f766e]">AI Move Match</p>
          <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Describe your move</h3>
          <div className="mt-4">
            <DirectionDetector />
          </div>
        </article>
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
          {listings.slice(0, 3).map((listing) => (
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
        <div className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">Cities</p>
          <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Where should you move?</h3>
          <p className="mt-2 text-sm text-[#64748b]">Use the city map and AI intel workbench to compare fit quickly.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeCities.slice(0, 5).map((city) => (
              <span key={city.id} className="rounded-full border border-[#dbe4f0] bg-white px-3 py-1.5 text-xs text-[#334155]">
                {city.flagEmoji} {city.name}
              </span>
            ))}
          </div>
          <Link href="/markets#intel-tool" className="emz-pill-cta mt-5 inline-block rounded-full px-5 py-2 text-sm font-semibold">
            Open cities + AI intel
          </Link>
        </div>
        <TestimonialsRotator testimonials={testimonials.slice(0, 3)} />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">Updates</p>
              <h3 className="mt-1 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Get monthly move intelligence</h3>
            </div>
            <Link href="/contact" className="rounded-full border border-[#c8d8f0] bg-white px-5 py-2 text-sm font-semibold text-[#0f172a]">
              Talk to an advisor
            </Link>
          </div>
          <div className="mt-5 max-w-xl">
            <NewsletterSignupForm />
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
