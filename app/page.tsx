import Link from "next/link"
import { DirectionDetector } from "@/components/platform/DirectionDetector"
import { HomeVisualHero } from "@/components/platform/HomeVisualHero"
import { NewsletterSignupForm } from "@/components/platform/NewsletterSignupForm"
import { PublicShell } from "@/components/platform/PublicShell"
import { TestimonialsRotator } from "@/components/platform/TestimonialsRotator"
import {
  getCityMarkets,
  getPrimaryListingImage,
  getPropertyListings,
  getPropertyTestimonials,
} from "@/lib/property"

export default async function HomePage() {
  const [cities, allListings, testimonials] = await Promise.all([
    getCityMarkets(),
    getPropertyListings(),
    getPropertyTestimonials(),
  ])

  const activeCities = cities.filter((city) => city.status === "active")
  const featuredListings = allListings.filter((listing) => listing.verified).slice(0, 3)
  const fallbackVisuals = [
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=1400&q=80",
  ]

  const listingVisuals = allListings.map((listing) => getPrimaryListingImage(listing))
  const heroVisuals = [...listingVisuals, ...fallbackVisuals].slice(0, 6)
  const cityNamesBySlug = new Map(cities.map((city) => [city.slug, city.name]))
  const listingCountByCity = allListings.reduce<Record<string, number>>((acc, listing) => {
    acc[listing.citySlug] = (acc[listing.citySlug] ?? 0) + 1
    return acc
  }, {})

  const heroCards = allListings.slice(0, 4).map((listing) => ({
    image: getPrimaryListingImage(listing),
    city: cityNamesBySlug.get(listing.citySlug) ?? listing.citySlug.replace("-", " "),
    title: listing.title,
    price: `$${listing.priceUsd.toLocaleString()}`,
    badge: listing.type === "commercial" ? "Commercial" : listing.priceUsd <= 250000 ? "Installment" : "Buy",
  })) as Array<{ image: string; city: string; title: string; price: string; badge: "Buy" | "Installment" | "Commercial" }>

  const galleryItems = allListings.slice(0, 12).map((listing) => ({
    image: getPrimaryListingImage(listing),
    city: cityNamesBySlug.get(listing.citySlug) ?? listing.citySlug.replace("-", " "),
    title: listing.title,
    type: listing.type === "commercial" ? "Commercial" : "Buy",
    price: `$${listing.priceUsd.toLocaleString()}`,
    href: `/services?city=${listing.citySlug}`,
  }))

  return (
    <PublicShell>
      <HomeVisualHero
        heroVisuals={heroVisuals}
        heroCards={heroCards}
        citiesCount={activeCities.length}
        listingsCount={allListings.length}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">How it works</p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold text-[#0f172a]">Three steps to ownership</h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-[#64748b]">
            A structured journey from first search to final signature with verified inventory, financing clarity, and closing support.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              id: "01",
              icon: "🔍",
              title: "Shortlist",
              desc: "Filter verified homes that match your budget, city, and ownership goals across buy, installment, and trade-up pathways.",
              href: "/services",
            },
            {
              id: "02",
              icon: "💳",
              title: "Finance",
              desc: "Plan installment and top-up options before you commit. Compare structures and choose the best cashflow fit.",
              href: "/services",
            },
            {
              id: "03",
              icon: "✅",
              title: "Close",
              desc: "Get support with selling, documentation, and final ownership transfer until keys are in your hands.",
              href: "/contact",
            },
          ].map((step) => (
            <article key={step.id} className="group relative overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white p-7 shadow-[0_16px_38px_-28px_rgba(15,23,42,0.24)] transition hover:-translate-y-1 hover:shadow-[0_24px_44px_-28px_rgba(15,23,42,0.32)]">
              <span className="pointer-events-none absolute right-5 top-2 font-[var(--font-playfair)] text-7xl font-bold text-[#eef3fb] transition group-hover:text-[#dde9fb]">
                {step.id}
              </span>
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf1ff] text-2xl">{step.icon}</div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#155eef]">Step {step.id}</p>
                <h3 className="mt-2 font-[var(--font-playfair)] text-3xl font-semibold text-[#0f172a]">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#64748b]">{step.desc}</p>
                <Link href={step.href} className="mt-4 inline-flex items-center text-sm font-semibold text-[#155eef]">
                  Continue
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="emz-gloss-card rounded-3xl p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">About EasyMoveZone</p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold text-[#0f172a]">Built to make home ownership real</h2>
            <p className="mt-3 text-sm leading-7 text-[#475569]">
              We combine trusted listings, city context, and practical guidance so buyers and sellers can close faster whether they are first-time buyers, upgraders, or diaspora investors.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[#155eef]">First-time buyers</span>
              <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[#155eef]">Home upgraders</span>
              <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[#155eef]">Diaspora investors</span>
              <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[#155eef]">Commercial buyers</span>
            </div>
          </article>

          <article className="overflow-hidden rounded-3xl border border-[#1b3554] bg-[#0b1829] p-8 shadow-[0_26px_58px_-36px_rgba(13,27,42,0.9)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7cc8ff]">AI Ownership Match</p>
            <h3 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold text-white">Describe your plan</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              Tell us your goal in one sentence and get a suggested journey, city fit, and support plan.
            </p>
            <div className="mt-5">
              <DirectionDetector dark />
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">Featured inventory</p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold text-[#0f172a]">Verified properties for sale</h2>
          </div>
          <Link href="/services" className="text-sm font-semibold text-[#155eef]">View all listings</Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredListings.map((listing, index) => (
            <article key={listing.id} className="group overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white shadow-[0_16px_38px_-30px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_24px_44px_-24px_rgba(15,23,42,0.38)]">
              <div className="relative h-56 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getPrimaryListingImage(listing)} alt={listing.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                <span
                  className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    listing.type === "commercial"
                      ? "bg-[#7b1fa2] text-white"
                      : index === 2
                        ? "bg-[#e8a020] text-[#0b1829]"
                        : "bg-[#1976d2] text-white"
                  }`}
                >
                  {listing.type === "commercial" ? "Commercial" : index === 2 ? "Installment" : "Buy"}
                </span>
                <span className="absolute bottom-3 left-3 rounded-md bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                  Verified
                </span>
                <button
                  type="button"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-[#0f172a] transition hover:scale-110"
                >
                  ♡
                </button>
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#155eef]">
                  {cityNamesBySlug.get(listing.citySlug) ?? listing.citySlug.replace("-", " ")} · {listing.type}
                </p>
                <h3 className="mt-1 font-[var(--font-playfair)] text-3xl font-semibold text-[#0f172a]">{listing.title}</h3>
                <p className="mt-1 text-sm text-[#64748b]">{listing.neighborhood}, {listing.country}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-[#64748b]">
                  <span>{listing.bedrooms} beds</span>
                  <span>{listing.bathrooms} baths</span>
                  <span>{listing.areaSqm} sqm</span>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-[#e8edf6] pt-3">
                  <p className="font-[var(--font-playfair)] text-3xl font-semibold text-[#0f172a]">${listing.priceUsd.toLocaleString()}</p>
                  <Link href={`/contact?market=${listing.citySlug}`} className="rounded-lg bg-[#0b1829] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1976d2]">
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">City intelligence</p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold text-[#0f172a]">Browse by city</h2>
          </div>
          <Link href="/markets" className="text-sm font-semibold text-[#155eef]">All cities</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activeCities.slice(0, 8).map((city, index) => (
            <Link key={city.id} href={`/markets?city=${city.slug}`} className="group relative min-h-[170px] overflow-hidden rounded-2xl">
              <div
                className="absolute inset-0 transition duration-300 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.74)), url(${listingVisuals[index] ?? fallbackVisuals[index % fallbackVisuals.length]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="relative z-10 flex h-full flex-col justify-end p-4 text-white">
                <p className="text-xs text-white/70">{city.country}</p>
                <h3 className="font-[var(--font-playfair)] text-3xl font-semibold">{city.name}</h3>
                <p className="text-xs text-[#7cc8ff]">{listingCountByCity[city.slug] ?? 0} listings</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <TestimonialsRotator testimonials={testimonials.slice(0, 3)} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#155eef]">Live ownership gallery</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-semibold text-[#0f172a]">
            {activeCities.length}+ cities · {allListings.length} verified listings
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {galleryItems.map((item, index) => {
            const size = index % 3 === 0 ? "h-[300px] w-[240px]" : index % 3 === 1 ? "h-[220px] w-[340px]" : "h-[240px] w-[240px]"
            return (
              <Link
                key={`${item.title}-${index}`}
                href={item.href}
                className={`group relative shrink-0 overflow-hidden rounded-2xl ${size}`}
              >
                <div
                  className="absolute inset-0 transition duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.72) 100%), url(${item.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 z-10 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">{item.city}</p>
                  <p className="font-[var(--font-playfair)] text-2xl font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-[#9bdfff]">{item.price} · {item.type}</p>
                </div>
              </Link>
            )
          })}
        </div>
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
