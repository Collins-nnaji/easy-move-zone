import Link from "next/link"
import { notFound } from "next/navigation"
import { PublicShell } from "@/components/platform/PublicShell"
import { getCityMarkets, getPropertyListings } from "@/lib/property"

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
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#c9a84c]">Neighbourhood Intelligence · City Detail</p>
        <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">
          {market.flagEmoji} {market.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#6b6560]">
          Security score {market.securityScore}/100 · Commute score {market.commuteScore}/100 · Lifestyle score {market.lifestyleScore}/100
        </p>
        <Link href="/intelligence" className="mt-4 inline-block text-sm text-[#0d0d0d] underline">
          ← Back to all neighbourhood intelligence
        </Link>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {listings.map((listing) => (
            <article key={listing.id} className="emz-gloss-card rounded-2xl p-5">
              <p className="text-xs uppercase tracking-wider text-[#c9a84c]">{listing.type}</p>
              <h2 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">{listing.title}</h2>
              <p className="mt-2 text-sm text-[#6b6560]">{listing.description}</p>
              <p className="mt-3 text-sm"><strong>Price:</strong> ${listing.priceUsd.toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
