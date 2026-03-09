import { getCrmClients } from "@/lib/crm";

export default async function CrmClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lifecycle?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const lifecycle = params.lifecycle?.trim() ?? "";

  const clients = await getCrmClients({
    query: query || undefined,
    lifecycle: lifecycle || undefined,
    limit: 200,
  });

  return (
    <section className="emz-gloss-card rounded-2xl p-5">
      <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Clients</h2>
      <form className="mt-4 grid gap-3 md:grid-cols-4" method="get">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search company or contact"
          className="rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm"
        />
        <select
          name="lifecycle"
          defaultValue={lifecycle}
          className="rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm"
        >
          <option value="">All lifecycle stages</option>
          <option value="won">won</option>
          <option value="churned">churned</option>
          <option value="proposal">proposal</option>
        </select>
        <button type="submit" className="rounded-xl bg-[#155eef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
          Apply filters
        </button>
      </form>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="bg-[#eef4ff] text-[#0f172a]">
            <tr>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2">Primary contact</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">ARR</th>
              <th className="px-3 py-2">Renewal date</th>
              <th className="px-3 py-2">Lifecycle</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-[#dbe4f0]">
                <td className="px-3 py-2 font-semibold">{client.companyName}</td>
                <td className="px-3 py-2">{client.primaryContactName}</td>
                <td className="px-3 py-2">{client.primaryContactEmail}</td>
                <td className="px-3 py-2">{client.primaryContactPhone ?? "-"}</td>
                <td className="px-3 py-2">${client.arrUsd.toLocaleString()}</td>
                <td className="px-3 py-2">{client.renewalDate ?? "-"}</td>
                <td className="px-3 py-2">{client.lifecycle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
