import Link from "next/link";
import { getCrmClients, getCrmDashboardMetrics, getCrmProspects, getCrmThreads, isCrmDatabaseConfigured } from "@/lib/crm";

function statCard(label: string, value: string) {
  return (
    <article className="emz-gloss-card rounded-2xl p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[#64748b]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#0f172a]">{value}</p>
    </article>
  );
}

export default async function CrmOverviewPage() {
  const [metrics, prospects, clients, threads] = await Promise.all([
    getCrmDashboardMetrics(),
    getCrmProspects({ limit: 5 }),
    getCrmClients({ limit: 5 }),
    getCrmThreads({ limit: 5 }),
  ]);

  if (!isCrmDatabaseConfigured) {
    return (
      <section className="emz-gloss-card rounded-2xl p-6">
        <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Database not configured</h2>
        <p className="mt-2 text-sm text-[#64748b]">Set DATABASE_URL to load CRM data.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCard("Open prospects", String(metrics.openProspects))}
        {statCard("Proposals out", String(metrics.proposalsOut))}
        {statCard("Active clients", String(metrics.activeClients))}
        {statCard("Open tasks", String(metrics.openTasks))}
        {statCard("Unread messages", String(metrics.unreadMessages))}
        {statCard("Total ARR", `$${metrics.totalArrUsd.toLocaleString()}`)}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="emz-gloss-card rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Top prospects</h2>
            <Link href="/dashboard/crm/prospects" className="text-sm font-semibold text-[#155eef]">View all</Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {prospects.map((prospect) => (
              <li key={prospect.id} className="rounded-xl border border-[#dbe4f0] bg-white/80 p-3">
                <p className="font-semibold">{prospect.firstName} {prospect.lastName}</p>
                <p className="text-[#64748b]">{prospect.companyName ?? "No company"} · {prospect.lifecycle} · score {prospect.score}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="emz-gloss-card rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Clients snapshot</h2>
            <Link href="/dashboard/crm/clients" className="text-sm font-semibold text-[#155eef]">View all</Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {clients.map((client) => (
              <li key={client.id} className="rounded-xl border border-[#dbe4f0] bg-white/80 p-3">
                <p className="font-semibold">{client.companyName}</p>
                <p className="text-[#64748b]">
                  {client.primaryContactName} · ARR ${client.arrUsd.toLocaleString()} · renewal {client.renewalDate ?? "n/a"}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="emz-gloss-card rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Recent inbox threads</h2>
          <Link href="/dashboard/crm/inbox" className="text-sm font-semibold text-[#155eef]">Open inbox</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-[#eef4ff] text-[#0f172a]">
              <tr>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Channel</th>
                <th className="px-3 py-2">Unread</th>
                <th className="px-3 py-2">Last message</th>
              </tr>
            </thead>
            <tbody>
              {threads.map((thread) => (
                <tr key={thread.id} className="border-t border-[#dbe4f0]">
                  <td className="px-3 py-2">
                    <Link href={`/dashboard/crm/inbox/${thread.id}`} className="font-semibold text-[#155eef]">
                      {thread.subject}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{thread.relatedName}</td>
                  <td className="px-3 py-2">{thread.channel}</td>
                  <td className="px-3 py-2">{thread.unreadCount}</td>
                  <td className="px-3 py-2 text-[#64748b]">{thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleString() : "n/a"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
