import { AskYourMarketChat } from "@/components/platform/AskYourMarketChat"
import {
  getClientDeliverables,
  getClientEngagement,
  getClientIntelligenceFeed,
  getClientIntroductions,
  getClientMessages,
} from "@/lib/platform"

function daysSince(startDate: string): number {
  const start = new Date(startDate).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)))
}

export default async function ClientDashboardPage() {
  const engagement = await getClientEngagement()
  if (!engagement) return <div className="p-8 text-sm">No active engagement yet.</div>

  const [deliverables, feed, introductions, messages] = await Promise.all([
    getClientDeliverables(engagement.id),
    getClientIntelligenceFeed(engagement.corridorId),
    getClientIntroductions(engagement.id),
    getClientMessages(engagement.id),
  ])

  return (
    <div className="emz-surface min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#c9a84c]">Client Dashboard</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">{engagement.engagementType}</h1>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <div><p className="text-xs text-[#6b6560]">Current phase</p><p className="text-sm font-medium">{engagement.phase}</p></div>
            <div><p className="text-xs text-[#6b6560]">Next milestone</p><p className="text-sm font-medium">{engagement.nextMilestone}</p></div>
            <div><p className="text-xs text-[#6b6560]">Advisor</p><p className="text-sm font-medium">{engagement.advisorName}</p></div>
            <div><p className="text-xs text-[#6b6560]">Contract value</p><p className="text-sm font-medium">${engagement.contractValue.toLocaleString()}</p></div>
            <div><p className="text-xs text-[#6b6560]">Days active</p><p className="text-sm font-medium">{daysSince(engagement.startDate)}</p></div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="emz-gloss-card rounded-2xl p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Deliverables tracker</h2>
            <ul className="mt-4 space-y-2">
              {deliverables.map((deliverable) => (
                <li key={deliverable.id} className="rounded-xl border border-black/10 bg-white/70 p-3 text-sm">
                  <p className="font-medium">{deliverable.name}</p>
                  <p className="text-[#6b6560]">Due: {deliverable.dueDate} · Status: {deliverable.status}</p>
                  <a href={deliverable.fileUrl} className="mt-1 inline-block text-xs text-[#0d0d0d] underline">Download file</a>
                </li>
              ))}
            </ul>
          </article>

          <article className="emz-gloss-card rounded-2xl p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Intelligence feed</h2>
            <ul className="mt-4 space-y-2">
              {feed.map((item) => (
                <li key={item.id} className="rounded-xl border border-black/10 bg-white/70 p-3 text-sm">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-[#6b6560]">{item.content}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <AskYourMarketChat corridorId={engagement.corridorId} />

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="emz-gloss-card rounded-2xl p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Introduction tracker</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {introductions.map((intro) => (
                <li key={intro.id} className="rounded-xl border border-black/10 bg-white/70 p-3">
                  <p className="font-medium">{intro.contactName} · {intro.company}</p>
                  <p className="text-[#6b6560]">{intro.purpose}</p>
                  <p className="text-[#6b6560]">Status: {intro.outcomeStatus.replaceAll("_", " ")}</p>
                </li>
              ))}
            </ul>
          </article>
          <article className="emz-gloss-card rounded-2xl p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Support messages</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {messages.map((message) => (
                <li key={message.id} className="rounded-xl border border-black/10 bg-white/70 p-3">
                  <p className="font-medium">{message.senderRole === "advisor" ? "Advisor" : "You"}</p>
                  <p className="text-[#6b6560]">{message.content}</p>
                  <p className="text-xs text-[#6b6560]">{new Date(message.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </div>
  )
}
