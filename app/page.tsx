import Image from "next/image"
import Link from "next/link"
import { DirectionDetector } from "@/components/platform/DirectionDetector"
import { NewsletterSignupForm } from "@/components/platform/NewsletterSignupForm"
import { PublicShell } from "@/components/platform/PublicShell"
import { TestimonialsRotator } from "@/components/platform/TestimonialsRotator"
import {
  getCityMarkets,
  getFeaturedListings,
  getOpportunityRows,
  getPropertyListings,
  getPropertyTestimonials,
  getResourceGuides,
} from "@/lib/property"

const floatingCardClasses = [
  "left-0 top-0 w-[290px] h-[215px] rotate-[-2deg] home-float-card-a",
  "right-0 top-4 w-[280px] h-[205px] rotate-[1.5deg] home-float-card-b",
  "left-6 bottom-3 w-[265px] h-[195px] rotate-[-1.5deg] home-float-card-c",
  "right-5 bottom-0 w-[225px] h-[168px] rotate-[2deg] home-float-card-d",
]

function listingEmoji(type: "rent" | "buy" | "commercial") {
  if (type === "commercial") return "🏢"
  if (type === "buy") return "🏠"
  return "🏘️"
}

export default async function HomePage() {
  const [cities, featuredListings, allListings, testimonials, guides] = await Promise.all([
    getCityMarkets(),
    getFeaturedListings(),
    getPropertyListings(),
    getPropertyTestimonials(),
    getResourceGuides(),
  ])
  const opportunityRows = getOpportunityRows()
  const activeCities = cities.filter((city) => city.status === "active")
  const avgSecurity =
    activeCities.length > 0
      ? Math.round(activeCities.reduce((sum, city) => sum + city.securityScore, 0) / activeCities.length)
      : 0

  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[#091520] pb-0">
        <div className="home-hero-grid" />
        <div className="home-glow-a" />
        <div className="home-glow-b" />
        <div className="home-glow-c" />

        <div className="relative z-[2] mx-auto grid w-full max-w-7xl gap-10 px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1fr_520px] lg:px-8">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2d4e76] bg-[#102237] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6dcaf4]">
              <span className="h-2 w-2 rounded-full bg-[#3ec6f5]" />
              Scout · Secure · Settle — one platform
            </span>
            <h1 className="font-[var(--font-playfair)] text-4xl font-semibold leading-[0.95] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Find Your Territory.
              <br />
              <em className="text-[#3ec6f5]">Make Your Move.</em>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/55">
              Compare cities, choose a verified property, match with territory-ready lenders, and book logistics and move services from verified vendors — all in one place.
            </p>
            <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Scout your next territory</p>
              <div className="grid gap-2 sm:grid-cols-4">
                <input
                  defaultValue=""
                  placeholder="City"
                  className="rounded-xl border border-white/20 bg-[#10253b] px-3 py-2 text-sm text-white placeholder:text-white/45 outline-none"
                />
                <input
                  defaultValue=""
                  placeholder="Country"
                  className="rounded-xl border border-white/20 bg-[#10253b] px-3 py-2 text-sm text-white placeholder:text-white/45 outline-none"
                />
                <select className="rounded-xl border border-white/20 bg-[#10253b] px-3 py-2 text-sm text-white outline-none">
                  <option>Lifestyle</option>
                  <option>Family-friendly</option>
                  <option>Career growth</option>
                  <option>Remote worker</option>
                  <option>Investor</option>
                </select>
                <Link href="/cities" className="inline-flex items-center justify-center rounded-xl bg-[#1769d0] px-4 py-2 text-sm font-semibold text-white">
                  Scout cities
                </Link>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/listings" className="rounded-full bg-[#1769d0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1e80e8]">
                Browse listings →
              </Link>
              <Link href="/cities" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/50 hover:text-white">
                Explore city intel
              </Link>
              <Link href="/hub" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/50 hover:text-white">
                The Hub
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {["50+ cities", "Verified listings", "Mortgage finder", "The Hub"].map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Desktop: overlapping floating cards; mobile: single-column stack */}
          <div className="relative hidden h-[450px] md:block">
            {featuredListings.slice(0, 4).map((listing, index) => (
              <article
                key={listing.id}
                className={`absolute overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm ${floatingCardClasses[index] ?? "left-0 top-0 h-[200px] w-[260px]"}`}
              >
                <div className="relative h-[62%] w-full">
                  <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="300px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
                  <span className="absolute left-3 top-3 rounded-md bg-[#1769d0] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {listing.type}
                  </span>
                </div>
                <div className="px-4 pb-4 pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6dcaf4]">
                    {listing.citySlug.replace("-", " ")}
                  </p>
                  <h3 className="font-[var(--font-playfair)] text-lg font-semibold text-white">{listing.title}</h3>
                  <p className="mt-0.5 text-xs text-white/55">
                    ${listing.priceUsd.toLocaleString()} · {listingEmoji(listing.type)}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {featuredListings.slice(0, 4).map((listing) => (
              <article
                key={listing.id}
                className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm"
              >
                <div className="relative h-40 w-full">
                  <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
                  <span className="absolute left-3 top-3 rounded-md bg-[#1769d0] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {listing.type}
                  </span>
                </div>
                <div className="px-4 pb-4 pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6dcaf4]">
                    {listing.citySlug.replace("-", " ")}
                  </p>
                  <h3 className="font-[var(--font-playfair)] text-base font-semibold text-white">{listing.title}</h3>
                  <p className="mt-0.5 text-xs text-white/55">
                    ${listing.priceUsd.toLocaleString()} · {listingEmoji(listing.type)}
                  </p>
                  <Link
                    href={`/listings/${listing.id}`}
                    className="mt-2 inline-block text-xs font-semibold text-[#6dcaf4] hover:underline"
                  >
                    View listing →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="relative z-[2] mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-4 gap-y-5 border-t border-white/10 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="min-w-0">
            <p className="font-[var(--font-playfair)] text-3xl font-semibold text-white sm:text-4xl">50+</p>
            <p className="text-xs text-white/40">Cities with intel</p>
          </div>
          <div className="min-w-0">
            <p className="font-[var(--font-playfair)] text-3xl font-semibold text-white sm:text-4xl">{allListings.length}+</p>
            <p className="text-xs text-white/40">Verified listings</p>
          </div>
          <div className="min-w-0">
            <p className="font-[var(--font-playfair)] text-3xl font-semibold text-white sm:text-4xl">3</p>
            <p className="text-xs text-white/40">Steps: Scout, Secure, Settle</p>
          </div>
          <div className="min-w-0">
            <p className="font-[var(--font-playfair)] text-3xl font-semibold text-white sm:text-4xl">✓</p>
            <p className="text-xs text-white/40">Lenders + move vendors</p>
          </div>
          <div className="min-w-0">
            <p className="font-[var(--font-playfair)] text-3xl font-semibold text-white sm:text-4xl">{avgSecurity}/100</p>
            <p className="text-xs text-white/40">Avg city security score</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">How it works</p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-3xl font-semibold text-[#091520] sm:text-4xl md:text-5xl">Scout, secure, then settle</h2>
            <p className="mt-3 max-w-md text-sm text-[#526070]">
              From &quot;where should I go?&quot; to &quot;I&apos;m moved in&quot; — city intel, verified properties, financing, and move services in one flow.
            </p>
          </div>
          <Link href="/listings" className="shrink-0 text-sm font-semibold text-[#1769d0] hover:underline">
            See all listings →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: "🔍",
              title: "Scout",
              text: "Compare cities by cost of living, safety, and opportunity. Find the territory that fits your lifestyle and goals.",
              href: "/cities",
            },
            {
              step: "02",
              icon: "🏠",
              title: "Secure",
              text: "Browse verified properties and use the mortgage finder to match with territory-ready lenders. Secure your home and financing together.",
              href: "/listings",
            },
            {
              step: "03",
              icon: "✅",
              title: "Settle",
              text: "Use the verified vendor marketplace for logistics, packing, storage, removals, and settling-in services.",
              href: "/hub",
            },
          ].map((item) => (
            <article key={item.step} className="emz-gloss-card relative overflow-hidden rounded-2xl p-7">
              <span className="absolute right-4 top-0 font-[var(--font-playfair)] text-[92px] text-[#f0f4f9]">
                {item.step}
              </span>
              <div className="relative z-[1]">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4eef9] text-xl">
                  {item.icon}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1769d0]">Step {item.step}</p>
                <h3 className="mt-1 font-[var(--font-playfair)] text-3xl font-semibold text-[#091520]">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#526070]">{item.text}</p>
                <Link href={item.href} className="mt-4 inline-block text-sm font-semibold text-[#1769d0]">
                  Continue →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f0f4f9] py-14">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="emz-gloss-card rounded-3xl p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">About EasyMoveZone</p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold leading-[1.05] text-[#091520]">
              One platform from territory to keys
            </h2>
            <p className="mt-4 text-sm leading-8 text-[#526070]">
              We bring together city intelligence, verified property listings, an AI mortgage finder, and a verified vendor marketplace for logistics, packing, storage, and removals — so you can scout, secure, and settle without juggling multiple tools.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Individuals", "Families", "Professionals", "Diaspora movers"].map((chip) => (
                <span key={chip} className="rounded-full border border-[#c9ddf8] bg-[#e4eef9] px-3 py-1 text-xs font-medium text-[#1769d0]">
                  {chip}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-3xl bg-[#091520] p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6dcaf4]">AI move direction</p>
            <h3 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold leading-[1.05] text-white">
              Where do you want to move?
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/50">
              Describe your move in one sentence. We&apos;ll suggest the best next step — city scouting, listings, mortgage, or move services.
            </p>
            <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-3">
              <DirectionDetector />
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">Featured inventory</p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold text-[#091520]">
              Verified properties to secure your move
            </h2>
          </div>
          <Link href="/listings" className="hidden text-sm font-semibold text-[#1769d0] sm:inline">
            View all listings →
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredListings.slice(0, 3).map((listing) => (
            <article key={listing.id} className="emz-gloss-card group overflow-hidden rounded-2xl transition hover:-translate-y-1">
              <div className="relative h-52 overflow-hidden">
                <Image src={listing.images[0]} alt={listing.title} fill className="object-cover transition group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute left-3 top-3 rounded-md bg-[#1769d0] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {listing.type}
                </div>
                {listing.verified && (
                  <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#1769d0]">{listing.citySlug.replace("-", " ")}</p>
                <h3 className="mt-1 font-[var(--font-playfair)] text-3xl font-semibold text-[#091520]">{listing.title}</h3>
                <p className="mt-1 text-sm text-[#526070]">{listing.neighborhood}, {listing.country}</p>
                <div className="mt-2 flex gap-3 text-xs text-[#64748b]">
                  <span>🛏 {listing.bedrooms} beds</span>
                  <span>🚿 {listing.bathrooms} baths</span>
                  <span>📐 {listing.areaSqm.toLocaleString()} sqm</span>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-[#e8edf6] pt-4">
                  <p className="font-[var(--font-playfair)] text-3xl font-bold text-[#091520]">
                    ${listing.priceUsd.toLocaleString()}
                  </p>
                  <Link href={`/listings/${listing.id}`}
                    className="rounded-xl bg-[#091520] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1769d0]">
                    View listing →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="/listings" className="text-sm font-semibold text-[#1769d0]">View all listings →</Link>
        </div>
      </section>

      <section className="bg-[#f4f7fb] py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">Step 1: Scout</p>
              <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold text-[#091520]">Compare cities and find your territory</h2>
            </div>
            <Link href="/cities" className="text-sm font-semibold text-[#1769d0]">
              Explore all cities →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cities.slice(0, 8).map((city, index) => (
              <Link
                key={city.id}
                href="/cities"
                className={`home-city-card home-city-gradient-${(index % 8) + 1}`}
              >
                <span className="home-city-icon">{city.flagEmoji}</span>
                <p className="home-city-country">{city.country}</p>
                <p className="home-city-name">{city.name}</p>
                <p className="home-city-count">{allListings.filter((l) => l.citySlug === city.slug).length} listings</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0f2235] py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6dcaf4]">What buyers say</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-semibold text-white">Real stories, real ownership</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <TestimonialsRotator testimonials={testimonials.slice(0, 3)} />
            <div className="emz-gloss-card rounded-2xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">Monthly market brief</p>
              <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-semibold text-[#091520]">Stay ahead of market shifts</h3>
              <p className="mt-2 text-sm text-[#526070]">
                Get verified supply updates, city trend snapshots, and ownership pathways in one concise brief.
              </p>
              <div className="mt-4">
                <NewsletterSignupForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1769d0] py-14">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="font-[var(--font-playfair)] text-3xl font-semibold leading-[1.1] text-white sm:text-4xl md:text-5xl">
              Ready to find your territory and
              <br />
              make your move?
            </h2>
            <p className="mt-3 text-sm text-white/70">
              Scout cities, secure a verified property, match with lenders, and book move services — all in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/listings" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1769d0] transition hover:translate-y-[-1px]">
              Browse listings →
            </Link>
            <Link href="/hub" className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Find a mortgage
            </Link>
            <Link href="/cities" className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/70">
              Explore cities
            </Link>
            <Link href="/hub" className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/70">
              The Hub
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="emz-gloss-card rounded-2xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769d0]">Market intelligence</p>
            <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-semibold text-[#091520]">
              Opportunity snapshot
            </h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {opportunityRows.map((row) => (
                <div key={row.segment} className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-4">
                  <p className="text-xs font-bold text-[#0f172a]">{row.segment}</p>
                  <p className="mt-1 text-lg font-semibold text-[#1769d0]">{row.sizeVolume}</p>
                  <p className="mt-1 text-xs text-[#64748b]">{row.whyNow}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {guides.slice(0, 2).map((guide) => (
              <article key={guide.id} className="flex flex-1 flex-col rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1769d0]">
                  {guide.category} · {guide.readMinutes} min read
                </p>
                <h4 className="mt-1 font-[var(--font-playfair)] text-2xl font-semibold text-[#091520]">{guide.title}</h4>
                <p className="mt-1 text-sm text-[#526070]">{guide.summary}</p>
                <Link href={guide.href} className="mt-auto pt-3 text-sm font-semibold text-[#1769d0]">
                  Open guide →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
