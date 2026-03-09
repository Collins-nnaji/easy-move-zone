import { getCrmProspects } from "@/lib/crm";

export default async function CrmProspectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lifecycle?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const lifecycle = params.lifecycle?.trim() ?? "";

  const prospects = await getCrmProspects({
    query: query || undefined,
    lifecycle: lifecycle || undefined,
    limit: 200,
  });

  return (
    <section className="emz-gloss-card rounded-2xl p-5">
      <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Prospects</h2>
      <form className="mt-4 grid gap-3 md:grid-cols-4" method="get">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search name or company"
          className="rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm"
        />
        <select
          name="lifecycle"
          defaultValue={lifecycle}
          className="rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm"
        >
          <option value="">All lifecycle stages</option>
          <option value="new">new</option>
          <option value="qualified">qualified</option>
          <option value="proposal">proposal</option>
          <option value="won">won</option>
          <option value="lost">lost</option>
        </select>
        <button type="submit" className="rounded-xl bg-[#155eef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
          Apply filters
        </button>
      </form>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#eef4ff] text-[#0f172a]">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2">Lifecycle</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Last contacted</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((prospect) => (
              <tr key={prospect.id} className="border-t border-[#dbe4f0]">
                <td className="px-3 py-2 font-semibold">{prospect.firstName} {prospect.lastName}</td>
                <td className="px-3 py-2">{prospect.companyName ?? "-"}</td>
                <td className="px-3 py-2">{prospect.lifecycle}</td>
                <td className="px-3 py-2">{prospect.score}</td>
                <td className="px-3 py-2">{prospect.email}</td>
                <td className="px-3 py-2">{prospect.phone ?? "-"}</td>
                <td className="px-3 py-2 text-[#64748b]">{prospect.lastContactedAt ? new Date(prospect.lastContactedAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
