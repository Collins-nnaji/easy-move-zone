import Link from "next/link";
import { notFound } from "next/navigation";
import { ThreadComposer } from "@/components/crm/ThreadComposer";
import { getCrmThreadDetail } from "@/lib/crm";

export default async function CrmThreadDetailPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const detail = await getCrmThreadDetail(threadId);

  if (!detail) notFound();

  const internalParticipant = detail.participants.find((participant) => participant.role === "internal") ?? null;
  const externalParticipant = detail.participants.find((participant) => participant.role !== "internal") ?? null;
  const aiSummary = detail.messages
    .slice(-3)
    .map((message) => `${message.senderDisplayName}: ${message.body}`)
    .join("\n")
    .slice(0, 1500);

  return (
    <div className="space-y-6">
      <section className="emz-gloss-card rounded-2xl p-5">
        <Link href="/dashboard/crm/inbox" className="text-sm font-semibold text-[#155eef]">← Back to inbox</Link>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#64748b]">{detail.thread.channel} · {detail.thread.status}</p>
        <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">{detail.thread.subject}</h2>
        <p className="mt-2 text-sm text-[#64748b]">Related contact: {detail.thread.relatedName}</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {detail.participants.map((participant) => (
            <div key={participant.id} className="rounded-xl border border-[#dbe4f0] bg-white/80 p-3 text-sm">
              <p className="font-semibold text-[#0f172a]">{participant.displayName}</p>
              <p className="text-[#64748b]">{participant.role}</p>
              {participant.email ? <p className="text-[#64748b]">{participant.email}</p> : null}
              {participant.phone ? <p className="text-[#64748b]">{participant.phone}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="emz-gloss-card rounded-2xl p-5">
        <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Timeline</h3>
        <ul className="mt-4 space-y-3">
          {detail.messages.map((message) => (
            <li key={message.id} className="rounded-xl border border-[#dbe4f0] bg-white/85 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748b]">
                <span className="font-semibold text-[#334155]">{message.senderDisplayName}</span>
                <span>{message.direction}</span>
                <span>{new Date(message.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#0f172a]">{message.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <ThreadComposer
        threadId={detail.thread.id}
        senderParticipantId={internalParticipant?.id ?? null}
        defaultChannel={detail.thread.channel}
        toEmail={externalParticipant?.email ?? null}
        toPhone={externalParticipant?.phone ?? null}
        aiContext={{
          relationshipType: detail.thread.prospectId ? "prospect" : "client",
          relationshipName: detail.thread.relatedName,
          threadSummary: aiSummary || detail.thread.subject,
        }}
      />
    </div>
  );
}
