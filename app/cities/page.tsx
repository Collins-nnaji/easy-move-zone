import { PublicShell } from "@/components/platform/PublicShell"
import { CitiesPageClient } from "@/components/platform/CitiesPageClient"
import { getCityMarkets, getPropertyListings } from "@/lib/property"

export default async function CitiesPage() {
  const [markets, listings] = await Promise.all([getCityMarkets(), getPropertyListings()])

  return (
    <PublicShell>
      {/* Page header */}
      <div className="border-b border-[#e8edf6] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#155eef]">Territory intelligence</p>
          <h1 className="mt-1 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a] md:text-5xl">
            Scout the right city before you move
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#64748b]">
            Compare cities by cost of living, growth score, safety, opportunity index, and community vibe — then move to listings with clarity.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {["Cost of living", "Growth score", "Safety", "Opportunity index", "Community vibe", "AI city advisor"].map(tag => (
              <span key={tag} className="rounded-full border border-[#dbe4f0] bg-[#f8fbff] px-3 py-1 text-xs font-medium text-[#475569]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <CitiesPageClient markets={markets} listings={listings} />
    </PublicShell>
  )
}
