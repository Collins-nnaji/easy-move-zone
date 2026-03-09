import { MonthlyDigestGenerator } from "@/components/platform/MonthlyDigestGenerator"
import Link from "next/link"
import { getLeadManagementRows } from "@/lib/platform"
import { getAgents, getCityMarkets, getPropertyListings } from "@/lib/property"

export default async function AdminDashboardPage() {
  const [leads, listings, markets, agents] = await Promise.all([
    getLeadManagementRows(100),
    getPropertyListings(),
    getCityMarkets(),
    getAgents(),
  ])

  return (
    <div className="emz-surface min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#c9a84c]">Admin Dashboard</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">Property platform operations</h1>
          <p className="mt-2 text-sm text-[#6b6560]">Manage mover leads, listings, cities, agents, and platform intelligence in one place.</p>
          <div className="mt-4">
            <Link
              href="/dashboard/crm"
              className="inline-flex rounded-xl bg-[#155eef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Open CRM workspace
            </Link>
          </div>
        </section>

        <section className="emz-gloss-card rounded-2xl p-5">
          <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Lead management</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#ede8de] text-[#0d0d0d]">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Journey</th>
                  <th className="px-3 py-2">Market</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">AI Summary</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-black/10">
                    <td className="px-3 py-2">{lead.firstName} {lead.lastName}</td>
                    <td className="px-3 py-2">{lead.direction}</td>
                    <td className="px-3 py-2">{lead.targetMarket}</td>
                    <td className="px-3 py-2">{lead.status}</td>
                    <td className="px-3 py-2 text-[#6b6560]">{lead.aiSummary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="emz-gloss-card rounded-2xl p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Content management</h2>
            <ul className="mt-4 space-y-2 text-sm text-[#6b6560]">
              <li>Listings available: {listings.length}</li>
              <li>Markets available: {markets.length}</li>
              <li>Trusted agents: {agents.length}</li>
              <li>Neighbourhood intelligence and pricing signals managed from database tables.</li>
            </ul>
          </article>
          <article className="emz-gloss-card rounded-2xl p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">City inventory snapshot</h2>
            <ul className="mt-4 space-y-2 text-sm text-[#6b6560]">
              {markets.map((market) => (
                <li key={market.id}>
                  {market.flagEmoji} {market.name} · {listings.filter((listing) => listing.citySlug === market.slug).length} listings · security {market.securityScore}/100
                </li>
              ))}
            </ul>
          </article>
        </section>

        <MonthlyDigestGenerator />
      </div>
    </div>
  )
}
