import Link from "next/link"
import { DirectionDetector } from "@/components/platform/DirectionDetector"
import { NewsletterSignupForm } from "@/components/platform/NewsletterSignupForm"
import { PublicShell } from "@/components/platform/PublicShell"
import { TestimonialsRotator } from "@/components/platform/TestimonialsRotator"
import { getCorridors, getMarkets, getTestimonials } from "@/lib/platform"

export default async function HomePage() {
  const [markets, corridors, testimonials] = await Promise.all([
    getMarkets(),
    getCorridors(),
    getTestimonials(),
  ])

  const marketMap = new Map(markets.map((market) => [market.id, market]))
  const corridorTicker = corridors
    .filter((corridor) => corridor.status === "active")
    .map((corridor) => {
      const origin = corridor.originMarket ?? marketMap.get(corridor.originMarketId)
      const destination = corridor.destinationMarket ?? marketMap.get(corridor.destinationMarketId)
      return `${origin?.flagEmoji ?? ""} ${origin?.name ?? "Origin"} → ${destination?.flagEmoji ?? ""} ${destination?.name ?? "Destination"} · ${corridor.sector}`
    })

  return (
    <PublicShell>
      <section className="border-b border-black/10 bg-[#f5f0e8]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
          <div>
            <span className="inline-flex items-center rounded-full border border-[#c9a84c]/40 bg-[#ede8de] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b6560]">
              Trade Bridge · Africa & World
            </span>
            <h1 className="mt-5 font-[var(--font-playfair)] text-6xl font-black leading-[0.92] tracking-tight text-[#0d0d0d] md:text-8xl">
              Your market move, <em className="text-[#c9a84c]">guided.</em>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#6b6560]">
              One platform for two moves: entering Africa, or taking African businesses global.
              We provide market intelligence, local execution, and ongoing advisory.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact?direction=inbound" className="rounded-full bg-[#0d0d0d] px-6 py-3 text-base font-medium text-[#f5f0e8]">
                I want to enter Africa
              </Link>
              <Link href="/contact?direction=outbound" className="rounded-full border border-black/15 px-6 py-3 text-base font-medium text-[#0d0d0d]">
                I want to go global
              </Link>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl bg-[#1a3a2a] p-6 text-[#f5f0e8]">
            {corridors.slice(0, 4).map((corridor) => {
              const origin = corridor.originMarket ?? marketMap.get(corridor.originMarketId)
              const destination = corridor.destinationMarket ?? marketMap.get(corridor.destinationMarketId)
              const direction =
                destination?.region.toLowerCase().includes("africa") || destination?.countryCode === "NG"
                  ? "Inbound"
                  : "Outbound"
              return (
                <div key={corridor.id} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">
                      {origin?.flagEmoji} {origin?.name} → {destination?.flagEmoji} {destination?.name}
                    </p>
                    <span className="rounded-full bg-[#c9a84c]/20 px-2 py-1 text-[10px] uppercase tracking-wider text-[#e8c96a]">{direction}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#f5f0e8]/65">{corridor.sector} · {corridor.activeClientCount} active clients</p>
                </div>
              )
            })}
          </div>
        </div>
        <div className="overflow-hidden border-t border-black/10 bg-[#ede8de] py-2">
          <div className="animate-ticker whitespace-nowrap text-sm text-[#6b6560]">
            {[...corridorTicker, ...corridorTicker].map((item, index) => (
              <span key={`${item}-${index}`} className="mx-8 inline-block">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <DirectionDetector />
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1a4a6b]">Inbound · World → Africa</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm text-[#6b6560]">
            <li><strong className="text-[#0d0d0d]">1. Territory intelligence:</strong> market, regulation, and risk mapping.</li>
            <li><strong className="text-[#0d0d0d]">2. Ground truth:</strong> vetted partners and in-market validation.</li>
            <li><strong className="text-[#0d0d0d]">3. Setup & launch:</strong> coordinated market entry execution.</li>
            <li><strong className="text-[#0d0d0d]">4. Ongoing intelligence:</strong> monthly updates and strategic support.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-black/10 bg-[#1a3a2a] p-6 text-[#f5f0e8]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c96a]">Outbound · Africa → World</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-3xl font-bold">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm text-[#f5f0e8]/75">
            <li><strong className="text-[#f5f0e8]">1. Export readiness:</strong> product, compliance, and positioning review.</li>
            <li><strong className="text-[#f5f0e8]">2. Market selection:</strong> data-backed prioritization and sequencing.</li>
            <li><strong className="text-[#f5f0e8]">3. Entry execution:</strong> channel setup, localization, and visibility.</li>
            <li><strong className="text-[#f5f0e8]">4. Growth retainer:</strong> ongoing expansion and partnership support.</li>
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">Live Corridor Feed</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">Active trade momentum</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#ede8de] text-[#0d0d0d]">
              <tr>
                <th className="px-4 py-3">Origin</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Active Clients</th>
              </tr>
            </thead>
            <tbody>
              {corridors.map((corridor) => {
                const origin = corridor.originMarket ?? marketMap.get(corridor.originMarketId)
                const destination = corridor.destinationMarket ?? marketMap.get(corridor.destinationMarketId)
                return (
                  <tr key={corridor.id} className="border-t border-black/5">
                    <td className="px-4 py-3">{origin?.flagEmoji} {origin?.name}</td>
                    <td className="px-4 py-3">{destination?.flagEmoji} {destination?.name}</td>
                    <td className="px-4 py-3">{corridor.sector}</td>
                    <td className="px-4 py-3">{corridor.activeClientCount}</td>
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">Featured Markets</p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">Where we are active</h2>
          </div>
          <Link href="/markets" className="text-sm font-medium text-[#0d0d0d] underline">
            View all market intelligence
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {markets.slice(0, 8).map((market) => (
            <Link key={market.id} href={`/intelligence/${market.slug}`} className="rounded-2xl border border-black/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="text-3xl">{market.flagEmoji}</div>
              <h3 className="mt-2 text-lg font-semibold text-[#0d0d0d]">{market.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-[#6b6560]">{market.status.replace("_", " ")}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {market.topSectors.slice(0, 3).map((sector) => (
                  <span key={sector} className="rounded-full bg-[#ede8de] px-2 py-1 text-[11px] text-[#6b6560]">{sector}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <TestimonialsRotator testimonials={testimonials.slice(0, 3)} corridors={corridors} />
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">Newsletter Signup</p>
          <h3 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0d0d0d]">Monthly intelligence on African markets. No noise.</h3>
          <p className="mt-2 text-sm text-[#6b6560]">One field. One click. Insight, not inbox clutter.</p>
          <div className="mt-5">
            <NewsletterSignupForm />
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
