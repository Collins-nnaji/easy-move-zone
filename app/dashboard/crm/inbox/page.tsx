import Link from "next/link";
import { getCrmThreads } from "@/lib/crm";

export default async function CrmInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; status?: string }>;
}) {
  const params = await searchParams;
  const channel = params.channel?.trim() ?? "";
  const status = params.status?.trim() ?? "";

  const threads = await getCrmThreads({
    channel: channel || undefined,
    status: status || undefined,
    limit: 200,
  });

  return (
    <section className="emz-gloss-card rounded-2xl p-5">
      <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Communication Inbox</h2>

      <form className="mt-4 grid gap-3 md:grid-cols-4" method="get">
        <select
          name="channel"
          defaultValue={channel}
          className="rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm"
        >
          <option value="">All channels</option>
          <option value="in_app">in_app</option>
          <option value="email">email</option>
          <option value="sms">sms</option>
        </select>
        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          <option value="open">open</option>
          <option value="closed">closed</option>
          <option value="archived">archived</option>
        </select>
        <button type="submit" className="rounded-xl bg-[#155eef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
          Apply filters
        </button>
      </form>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-[#eef4ff] text-[#0f172a]">
            <tr>
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Channel</th>
              <th className="px-3 py-2">Status</th>
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
                <td className="px-3 py-2">{thread.status}</td>
                <td className="px-3 py-2">{thread.unreadCount}</td>
                <td className="px-3 py-2 text-[#64748b]">{thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
