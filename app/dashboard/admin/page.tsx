import { MonthlyDigestGenerator } from "@/components/platform/MonthlyDigestGenerator"
import { getCorridors, getLeadManagementRows, getMarkets, getReports, getServices } from "@/lib/platform"

export default async function AdminDashboardPage() {
  const [leads, services, reports, markets, corridors] = await Promise.all([
    getLeadManagementRows(100),
    getServices(),
    getReports(),
    getMarkets(),
    getCorridors(),
  ])

  return (
    <div className="min-h-screen bg-[#f5f0e8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#c9a84c]">Admin Dashboard</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">Platform operations</h1>
          <p className="mt-2 text-sm text-[#6b6560]">Manage leads, clients, content, reports, corridors, and AI tooling in one place.</p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Lead management</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#ede8de] text-[#0d0d0d]">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Direction</th>
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
          <article className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Content management</h2>
            <ul className="mt-4 space-y-2 text-sm text-[#6b6560]">
              <li>Services available: {services.length}</li>
              <li>Markets available: {markets.length}</li>
              <li>Reports published: {reports.length}</li>
              <li>FAQ and values managed from database tables.</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Corridor management</h2>
            <ul className="mt-4 space-y-2 text-sm text-[#6b6560]">
              {corridors.map((corridor) => (
                <li key={corridor.id}>
                  {corridor.originMarket?.name ?? corridor.originMarketId} → {corridor.destinationMarket?.name ?? corridor.destinationMarketId}
                  {" · "}
                  {corridor.activeClientCount} active clients
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
