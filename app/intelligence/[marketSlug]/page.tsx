import Link from "next/link"
import { notFound } from "next/navigation"
import { PublicShell } from "@/components/platform/PublicShell"
import { getMarketBySlug, getReports } from "@/lib/platform"

export default async function IntelligenceMarketPage({
  params,
}: {
  params: Promise<{ marketSlug: string }>
}) {
  const { marketSlug } = await params
  const market = await getMarketBySlug(marketSlug)
  if (!market) notFound()

  const reports = await getReports({ marketId: market.id, sort: "most_recent" })

  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#c9a84c]">Intelligence · Market Detail</p>
        <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">
          {market.flagEmoji} {market.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#6b6560]">{market.regulatoryNotes}</p>
        <Link href="/intelligence" className="mt-4 inline-block text-sm text-[#0d0d0d] underline">
          ← Back to all intelligence reports
        </Link>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <article key={report.id} className="rounded-2xl border border-black/10 bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-[#c9a84c]">{report.direction}</p>
              <h2 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">{report.title}</h2>
              <p className="mt-2 text-sm text-[#6b6560]">{report.summary}</p>
              <p className="mt-3 text-sm"><strong>Price:</strong> ${report.price.toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
