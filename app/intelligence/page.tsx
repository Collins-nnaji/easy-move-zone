import { CustomReportForm } from "@/components/platform/CustomReportForm"
import { IntelligencePageClient } from "@/components/platform/IntelligencePageClient"
import { PublicShell } from "@/components/platform/PublicShell"
import { getMarkets, getReports } from "@/lib/platform"

export default async function IntelligencePage() {
  const [markets, reports] = await Promise.all([getMarkets(), getReports({ sort: "most_recent" })])

  return (
    <PublicShell>
      <IntelligencePageClient markets={markets} reports={reports} />
      <section id="commission" className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">Commission custom intelligence</h2>
          <p className="mt-2 text-sm text-[#6b6560]">
            Need insight for a market or sector not covered by public reports? Tell us what you need.
          </p>
          <div className="mt-5">
            <CustomReportForm markets={markets} />
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
