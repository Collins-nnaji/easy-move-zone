import { PublicShell } from "@/components/platform/PublicShell"
import { getPartners, getPressItems, getTeamMembers, getValueCards } from "@/lib/platform"

export default async function AboutPage() {
  const [team, advisors, values, press, partners] = await Promise.all([
    getTeamMembers("team"),
    getTeamMembers("advisor"),
    getValueCards(),
    getPressItems(),
    getPartners(),
  ])

  return (
    <PublicShell>
      <section className="bg-[#0d0d0d]">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c96a]">Our Story</p>
          <h1 className="mt-3 font-[var(--font-playfair)] text-6xl font-black leading-[0.95] text-[#f5f0e8] md:text-8xl">
            Built on the belief that every great move changes everything.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-[#f5f0e8]/70">
            EasyMoveZone exists for businesses that know they should move, but want to move wisely.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="rounded-2xl border border-black/10 bg-[#1a3a2a] p-6 text-[#f5f0e8] shadow-[0_24px_54px_-34px_rgba(13,13,13,0.8)]">
          <blockquote className="font-[var(--font-playfair)] text-3xl italic leading-relaxed">
            “Go from your country, your people and your father&apos;s household to the land I will show you.”
          </blockquote>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#e8c96a]">Genesis 12:1–3</p>
        </article>
        <article className="emz-gloss-card rounded-2xl p-6">
          <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">The Genesis story</h2>
          <p className="mt-3 text-sm leading-7 text-[#6b6560]">
            Abram moved without a full map. Direction came first, full visibility came later. We built EasyMoveZone for businesses with that same call — they know they must move, but need trusted intelligence before execution.
          </p>
          <p className="mt-3 text-sm leading-7 text-[#6b6560]">
            We become the crossing point between vision and real-world market entry: context, partners, regulation, and strategic momentum.
          </p>
        </article>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="emz-gloss-card rounded-2xl p-7 text-center">
          <p className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">
            “To be the most trusted crossing point between African markets and the world.”
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="emz-gloss-card rounded-2xl p-6">
          <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Why inbound matters</h3>
          <p className="mt-3 text-sm leading-7 text-[#6b6560]">
            Africa is not a risk label. It is a portfolio of high-opportunity markets where disciplined entry creates outsized upside.
          </p>
        </article>
        <article className="emz-gloss-card rounded-2xl p-6">
          <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Why outbound matters</h3>
          <p className="mt-3 text-sm leading-7 text-[#6b6560]">
            African excellence deserves global shelf space, distribution, and valuation. We help businesses cross that gap with structure and speed.
          </p>
        </article>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">Team</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <article key={member.id} className="emz-gloss-card rounded-2xl p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={member.photoUrl} alt={member.name} className="h-16 w-16 rounded-full object-cover" />
              <h3 className="mt-3 text-lg font-semibold text-[#0d0d0d]">{member.name}</h3>
              <p className="text-sm text-[#6b6560]">{member.title}</p>
              <p className="mt-2 text-sm text-[#6b6560]">{member.bio}</p>
              <a className="mt-3 inline-block text-sm text-[#0d0d0d] underline" href={member.linkedinUrl}>LinkedIn</a>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">Advisors</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {advisors.map((advisor) => (
            <article key={advisor.id} className="emz-gloss-card rounded-2xl border border-[#c9a84c]/30 bg-[#ede8de] p-5">
              <h3 className="text-lg font-semibold text-[#0d0d0d]">{advisor.name}</h3>
              <p className="text-sm text-[#6b6560]">{advisor.title}</p>
              <p className="mt-2 text-sm text-[#6b6560]">{advisor.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">Values</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <article key={value.id} className="emz-gloss-card rounded-2xl p-5">
              <p className="text-3xl font-black text-[#c9a84c]/45">{String(value.orderIndex).padStart(2, "0")}</p>
              <h3 className="mt-2 text-xl font-semibold text-[#0d0d0d]">{value.title}</h3>
              <p className="mt-2 text-sm text-[#6b6560]">{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">Press & recognition</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {press.map((item) => (
            <a key={item.id} href={item.articleUrl} className="emz-gloss-card rounded-xl p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.logoUrl} alt={item.name} className="h-10 w-auto object-contain" />
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="font-[var(--font-playfair)] text-4xl font-black text-[#0d0d0d]">Partnerships</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {partners.map((partner) => (
            <a key={partner.id} href={partner.websiteUrl} className="emz-gloss-card rounded-xl p-4">
              <p className="text-sm font-semibold text-[#0d0d0d]">{partner.name}</p>
              <p className="text-xs text-[#6b6560]">{partner.country}</p>
            </a>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
