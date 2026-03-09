import { PublicShell } from "@/components/platform/PublicShell"
import { getOpportunityRows, getRevenueStreams } from "@/lib/property"

export default async function AboutPage() {
  const opportunityRows = getOpportunityRows()
  const revenueStreams = getRevenueStreams()

  return (
    <PublicShell>
      <section className="bg-[#0d0d0d]">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c96a]">Strategic Business Overview · Nigeria & Africa · 2025</p>
          <h1 className="mt-3 font-[var(--font-playfair)] text-6xl font-black leading-[0.95] text-[#f5f0e8] md:text-8xl">
            EasyMoveZone Property Finder
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-[#f5f0e8]/70">
            Tech-enabled property search and acquisition for people on the move.
            Making land-finding easy — wherever your next chapter begins.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="emz-gloss-card rounded-2xl p-6">
          <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">1. Vision & Concept</h2>
          <p className="mt-3 text-sm leading-7 text-[#6b6560]">
            EasyMoveZone Property Finder removes confusion, risk, and friction from finding a home
            or commercial property in a new city or country.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[#6b6560]">
            <li><strong className="text-[#0d0d0d]">Domestic movers:</strong> Lagos, Abuja, Port Harcourt and beyond.</li>
            <li><strong className="text-[#0d0d0d]">Diaspora arrivals:</strong> UK, US, Canada, and global returnees.</li>
            <li><strong className="text-[#0d0d0d]">Pan-African professionals:</strong> Accra, Nairobi, Johannesburg, Kigali, and more.</li>
          </ul>
        </article>
        <article className="emz-gloss-card rounded-2xl p-6">
          <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">2. The Problem We Solve</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#6b6560]">
            <li><strong className="text-[#0d0d0d]">No single platform:</strong> listings fragmented across agents, social apps, and word-of-mouth.</li>
            <li><strong className="text-[#0d0d0d]">Agent fraud risk:</strong> fake listings, duplicate payments, and weak verification.</li>
            <li><strong className="text-[#0d0d0d]">No arrival context:</strong> poor insight into commute, schools, and security fit.</li>
            <li><strong className="text-[#0d0d0d]">Pan-African gap:</strong> weak structure for cross-border movers between African cities.</li>
            <li><strong className="text-[#0d0d0d]">Time pressure:</strong> movers need reliable options before start dates and visa deadlines.</li>
          </ul>
        </article>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">3. Market Opportunity</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#ede8de] text-[#0d0d0d]">
              <tr>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Size / Volume</th>
                <th className="px-4 py-3">Why Now</th>
              </tr>
            </thead>
            <tbody>
              {opportunityRows.map((row) => (
                <tr key={row.segment} className="border-t border-black/5">
                  <td className="px-4 py-3">{row.segment}</td>
                  <td className="px-4 py-3">{row.sizeVolume}</td>
                  <td className="px-4 py-3">{row.whyNow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">4. Revenue Model</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {revenueStreams.map((stream) => (
            <article key={stream.name} className="emz-gloss-card rounded-2xl p-5">
              <h3 className="text-xl font-semibold text-[#0d0d0d]">{stream.name}</h3>
              <p className="mt-2 text-sm text-[#6b6560]">{stream.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
