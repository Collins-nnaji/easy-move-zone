import Link from "next/link"
import { notFound } from "next/navigation"
import { PublicShell } from "@/components/platform/PublicShell"
import { getCityMarkets, getPrimaryListingImage, getPropertyListings } from "@/lib/property"

export default async function IntelligenceMarketPage({
  params,
}: {
  params: Promise<{ marketSlug: string }>
}) {
  const { marketSlug } = await params
  const [cities, listings] = await Promise.all([getCityMarkets(), getPropertyListings({ citySlug: marketSlug })])
  const market = cities.find((city) => city.slug === marketSlug)
  if (!market) notFound()

  return (
    <PublicShell>
      <section className="emz-hero-section">
        <div className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#155eef]">Neighbourhood Intelligence · City Detail</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0f172a]">
            {market.flagEmoji} {market.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[#64748b]">
            Security score {market.securityScore}/100 · Commute score {market.commuteScore}/100 · Lifestyle score {market.lifestyleScore}/100
          </p>
          <Link href="/intelligence" className="mt-4 inline-block text-sm font-semibold text-[#155eef] underline">
            ← Back to all neighbourhood intelligence
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {listings.length === 0 ? (
          <div className="emz-gloss-card rounded-2xl p-6 text-center">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">No listings yet in this city</h2>
            <p className="mt-2 text-sm text-[#64748b]">Check back soon or contact us for manual sourcing support.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((listing) => (
              <article key={listing.id} className="emz-gloss-card rounded-2xl p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getPrimaryListingImage(listing)} alt={listing.title} className="h-40 w-full rounded-xl object-cover" />
                <p className="mt-3 text-xs uppercase tracking-wider text-[#0f766e]">{listing.type}</p>
                <h2 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">{listing.title}</h2>
                <p className="mt-2 text-sm text-[#64748b]">{listing.description}</p>
                <p className="mt-3 text-sm"><strong>Price:</strong> ${listing.priceUsd.toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  )
}
