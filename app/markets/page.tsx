import { ComingSoonInterestForm } from "@/components/platform/ComingSoonInterestForm"
import { MarketComparisonTool } from "@/components/platform/MarketComparisonTool"
import { MarketsMap } from "@/components/platform/MarketsMap"
import { PublicShell } from "@/components/platform/PublicShell"
import { getCorridors, getMarkets, getReports } from "@/lib/platform"

export default async function MarketsPage() {
  const [markets, corridors, reports] = await Promise.all([getMarkets(), getCorridors(), getReports()])
  const comingSoon = markets.filter((market) => market.status !== "active")

  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">Markets</p>
        <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">
          We operate where the opportunity is.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#6b6560]">
          Explore active markets, corridor dynamics, and current intelligence coverage with live data from the platform.
        </p>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <MarketsMap markets={markets} corridors={corridors} reports={reports} />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <MarketComparisonTool markets={markets.filter((market) => market.status === "active")} />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">Coming soon markets</h2>
          <p className="mt-2 text-sm text-[#6b6560]">
            We are expanding intelligence coverage in these markets. Register your interest and get notified at launch.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {comingSoon.map((market) => (
              <span key={market.id} className="rounded-full bg-[#ede8de] px-3 py-1.5 text-sm text-[#6b6560]">
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
