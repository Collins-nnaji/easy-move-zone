import { CustomReportForm } from "@/components/platform/CustomReportForm"
import { IntelligencePageClient } from "@/components/platform/IntelligencePageClient"
import { PublicShell } from "@/components/platform/PublicShell"
import { getCityMarkets, getPropertyListings } from "@/lib/property"

export default async function IntelligencePage() {
  const [cities, listings] = await Promise.all([getCityMarkets(), getPropertyListings()])

  return (
    <PublicShell>
      <IntelligencePageClient cities={cities} listings={listings} />
      <section id="commission" className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-6">
          <h2 className="font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">Request a custom move brief</h2>
          <p className="mt-2 text-base text-[#6b6560]">
            Need a tailored city or neighbourhood brief before you relocate? Tell us what you need.
          </p>
          <div className="mt-5">
            <CustomReportForm markets={cities} />
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
