import { AskYourMarketChat } from "@/components/platform/AskYourMarketChat"
import { getFeaturedListings } from "@/lib/property"

const moveChecklist = [
  "Confirm shortlisted properties are fully verified",
  "Book virtual or in-person viewings",
  "Review tenancy or purchase documentation",
  "Complete payment flow and move-in checklist",
]

export default async function ClientDashboardPage() {
  const featuredListings = await getFeaturedListings()

  return (
    <div className="emz-surface min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#c9a84c]">Mover Dashboard</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">Your relocation workspace</h1>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div><p className="text-xs text-[#6b6560]">Journey type</p><p className="text-sm font-medium">Property relocation</p></div>
            <div><p className="text-xs text-[#6b6560]">Current phase</p><p className="text-sm font-medium">Shortlisting</p></div>
            <div><p className="text-xs text-[#6b6560]">Assigned advisor</p><p className="text-sm font-medium">EasyMoveZone Team</p></div>
            <div><p className="text-xs text-[#6b6560]">SLA</p><p className="text-sm font-medium">24h response</p></div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="emz-gloss-card rounded-2xl p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Saved shortlist</h2>
            <ul className="mt-4 space-y-2">
              {featuredListings.slice(0, 4).map((listing) => (
                <li key={listing.id} className="rounded-xl border border-black/10 bg-white/70 p-3 text-sm">
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-[#6b6560]">{listing.neighborhood}, {listing.citySlug.replace("-", " ")}</p>
                  <p className="text-[#6b6560]">${listing.priceUsd.toLocaleString()} · {listing.type}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="emz-gloss-card rounded-2xl p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Move checklist</h2>
            <ul className="mt-4 space-y-2">
              {moveChecklist.map((item) => (
                <li key={item} className="rounded-xl border border-black/10 bg-white/70 p-3 text-sm text-[#6b6560]">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <AskYourMarketChat corridorId="property-relocation" />

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="emz-gloss-card rounded-2xl p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Viewing tracker</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {featuredListings.slice(0, 3).map((listing, index) => (
                <li key={listing.id} className="rounded-xl border border-black/10 bg-white/70 p-3">
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-[#6b6560]">Slot: {index + 1} · Status: {index === 0 ? "Confirmed" : "Pending confirmation"}</p>
                </li>
              ))}
            </ul>
          </article>
          <article className="emz-gloss-card rounded-2xl p-5">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Support thread</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="rounded-xl border border-black/10 bg-white/70 p-3">
                <p className="font-medium">Advisor</p>
                <p className="text-[#6b6560]">We prepared 4 verified options matching your budget and school requirements.</p>
              </li>
              <li className="rounded-xl border border-black/10 bg-white/70 p-3">
                <p className="font-medium">You</p>
                <p className="text-[#6b6560]">Please prioritize move-in ready units with shorter commute to the CBD.</p>
              </li>
            </ul>
          </article>
        </section>

        <section id="help-center" className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#c9a84c]">Get Help</p>
          <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">Support inside your dashboard</h2>
          <p className="mt-2 text-sm text-[#6b6560]">
            Need quick assistance? Use these channels and we will respond based on your support SLA.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-sm">
              <p className="font-semibold text-[#0d0d0d]">Priority chat</p>
              <p className="mt-1 text-[#6b6560]">Ask your move question in the support thread above.</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-sm">
              <p className="font-semibold text-[#0d0d0d]">Email support</p>
              <p className="mt-1 text-[#6b6560]">hello@easymovezone.com</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-sm">
              <p className="font-semibold text-[#0d0d0d]">Advisor callback</p>
              <p className="mt-1 text-[#6b6560]">Book a call via contact form for complex move plans.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
