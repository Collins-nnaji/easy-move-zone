import { PublicShell } from "@/components/platform/PublicShell"
import { getOpportunityRows, getRevenueStreams } from "@/lib/property"

export default async function AboutPage() {
  const opportunityRows = getOpportunityRows()
  const revenueStreams = getRevenueStreams()

  return (
    <PublicShell>
      <section className="emz-hero-section">
        <div className="property-hero-image p-5 md:p-6">
          <div className="max-w-2xl rounded-2xl border border-white/30 bg-black/35 p-6 text-white backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">Strategic overview · Nigeria & Africa</p>
            <h1 className="mt-3 font-[var(--font-playfair)] text-6xl font-bold leading-[0.95] md:text-7xl">
              EasyMoveZone Property Finder
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-sky-100">
              We built a modern relocation property platform for people on the move — combining
              verified inventory, local intelligence, and guided human support.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="emz-gloss-card rounded-2xl p-6">
          <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0f172a]">1. Vision & Concept</h2>
          <p className="mt-3 text-sm leading-7 text-[#475569]">
            EasyMoveZone Property Finder removes confusion, risk, and friction from finding a home
            or commercial property in a new city or country.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[#475569]">
            <li><strong className="text-[#0f172a]">Domestic movers:</strong> Lagos, Abuja, Port Harcourt and beyond.</li>
            <li><strong className="text-[#0f172a]">Diaspora arrivals:</strong> UK, US, Canada, and global returnees.</li>
            <li><strong className="text-[#0f172a]">Pan-African professionals:</strong> Accra, Nairobi, Johannesburg, Kigali, and more.</li>
          </ul>
        </article>
        <article className="emz-gloss-card rounded-2xl p-6">
          <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0f172a]">2. The Problem We Solve</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#475569]">
            <li><strong className="text-[#0f172a]">No single platform:</strong> listings fragmented across agents, social apps, and word-of-mouth.</li>
            <li><strong className="text-[#0f172a]">Agent fraud risk:</strong> fake listings, duplicate payments, and weak verification.</li>
            <li><strong className="text-[#0f172a]">No arrival context:</strong> poor insight into commute, schools, and security fit.</li>
            <li><strong className="text-[#0f172a]">Pan-African gap:</strong> weak structure for cross-border movers between African cities.</li>
            <li><strong className="text-[#0f172a]">Time pressure:</strong> movers need reliable options before start dates and visa deadlines.</li>
          </ul>
        </article>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-5xl font-black text-[#0f172a]">3. Market Opportunity</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f1f5f9] text-[#0f172a]">
              <tr>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Size / Volume</th>
                <th className="px-4 py-3">Why Now</th>
              </tr>
            </thead>
            <tbody>
              {opportunityRows.map((row) => (
                <tr key={row.segment} className="border-t border-[#e2e8f0] text-[#475569]">
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
        <h2 className="font-[var(--font-playfair)] text-5xl font-black text-[#0f172a]">4. Revenue Model</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {revenueStreams.map((stream) => (
            <article key={stream.name} className="emz-gloss-card rounded-2xl p-5">
              <h3 className="text-xl font-semibold text-[#0f172a]">{stream.name}</h3>
              <p className="mt-2 text-sm text-[#475569]">{stream.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
