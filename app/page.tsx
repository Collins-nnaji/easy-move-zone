import Link from "next/link"
import { DirectionDetector } from "@/components/platform/DirectionDetector"
import { HomeVisualHero } from "@/components/platform/HomeVisualHero"
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
  const fallbackVisuals = [
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=1400&q=80",
  ]
  const listingVisuals = listings.map((listing) => getPrimaryListingImage(listing))
  const heroVisuals = [...listingVisuals, ...fallbackVisuals].slice(0, 6)
  const marqueeVisuals = [...listingVisuals, ...fallbackVisuals, ...listingVisuals, ...fallbackVisuals].slice(0, 16)

  return (
    <PublicShell>
      <HomeVisualHero heroVisuals={heroVisuals} citiesCount={cities.length} listingsCount={listings.length} />

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="emz-gloss-card overflow-hidden rounded-2xl p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">Live ownership gallery</p>
            <p className="text-xs text-[#64748b]">{cities.length}+ cities · {listings.length}+ verified listings</p>
          </div>
          <div className="emz-photo-marquee-frame">
            <div className="emz-photo-marquee">
              {[...marqueeVisuals, ...marqueeVisuals].map((photo, index) => (
                <div
                  key={`${photo}-${index}`}
                  className="emz-photo-marquee-item"
                  style={{ backgroundImage: `url(${photo})` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="emz-gloss-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Step 1</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0f172a]">Shortlist</h2>
            <p className="mt-1 text-sm text-[#64748b]">Filter verified homes that match your budget, city, and ownership goals.</p>
          </article>
          <article className="emz-gloss-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Step 2</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0f172a]">Finance</h2>
            <p className="mt-1 text-sm text-[#64748b]">Plan installment and top-up options before you commit.</p>
          </article>
          <article className="emz-gloss-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Step 3</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0f172a]">Close</h2>
            <p className="mt-1 text-sm text-[#64748b]">Get support with selling, documentation, and final ownership transfer.</p>
          </article>
        </div>
      </section>

      <section id="about" className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">About EasyMoveZone</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Built to make home ownership real</h2>
          <p className="mt-3 text-sm leading-7 text-[#475569]">
            We combine trusted listings, city context, and practical guidance so buyers and sellers can close faster.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[#155eef]">First-time buyers</span>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[#155eef]">Home upgraders</span>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[#155eef]">Diaspora investors</span>
          </div>
        </article>
        <article className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f766e]">AI Ownership Match</p>
          <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Describe your plan</h3>
          <div className="mt-4">
            <DirectionDetector />
          </div>
        </article>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">Featured inventory</p>
            <h2 className="property-section-title mt-2 text-[#0f172a]">Verified properties for sale</h2>
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
          <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Where should you buy?</h3>
          <p className="mt-2 text-sm text-[#64748b]">Use the city map and AI intel workbench to compare ownership fit quickly.</p>
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
              <h3 className="mt-1 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Get monthly ownership intelligence</h3>
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
