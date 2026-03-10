import { ComingSoonInterestForm } from "@/components/platform/ComingSoonInterestForm"
import { MarketComparisonTool } from "@/components/platform/MarketComparisonTool"
import { MarketsMap } from "@/components/platform/MarketsMap"
import { PublicShell } from "@/components/platform/PublicShell"
import { getCityMarkets, getPropertyListings } from "@/lib/property"

export default async function CitiesPage() {
  const [markets, listings] = await Promise.all([getCityMarkets(), getPropertyListings()])
  const comingSoon = markets.filter((market) => market.status !== "active")

  return (
    <PublicShell>
      <section className="emz-hero-section">
        <div className="property-hero-image p-5 md:p-6">
          <div className="max-w-2xl rounded-2xl border border-white/30 bg-black/35 p-6 text-white backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-100">City coverage</p>
            <h1 className="mt-2 font-[var(--font-playfair)] text-6xl font-bold leading-[0.95]">
              City intelligence for ownership decisions
            </h1>
            <p className="mt-3 max-w-xl text-sm text-sky-100">
              Explore map context, city dynamics, and AI-powered neighbourhood intel with live web-informed analysis.
            </p>
          </div>
        </div>
      </section>

      <section id="intel-tool" className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <MarketsMap markets={markets} listings={listings} />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <MarketComparisonTool markets={markets.filter((market) => market.status === "active")} />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-6">
          <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0f172a]">Coming soon cities</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            We are expanding platform coverage in these cities. Register your interest and get notified at launch.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {comingSoon.map((market) => (
              <span key={market.id} className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-sm text-[#155eef]">
                {market.flagEmoji} {market.name}
              </span>
            ))}
          </div>
          <div className="mt-5">
            <ComingSoonInterestForm markets={comingSoon.length > 0 ? comingSoon : markets} />
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
