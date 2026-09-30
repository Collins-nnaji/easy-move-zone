import { AlertTriangle, BadgeCheck, Clock, Info, Landmark } from "lucide-react"
import { Container, SectionHeading } from "@/components/seo/LandingPage"
import type { SponsorRegisterStats } from "@/lib/seo/sponsor-stats"

const PRIMARY = "#2f5d50"

const LICENCE_TERMS = [
  {
    icon: Landmark,
    term: "Worker licence",
    body: "Covers long-term routes such as Skilled Worker, Senior or Specialist Worker, Minister of Religion and International Sportsperson.",
  },
  {
    icon: Clock,
    term: "Temporary Worker licence",
    body: "Covers temporary routes such as Creative Worker, Charity Worker, Religious Worker and Government Authorised Exchange.",
  },
  {
    icon: BadgeCheck,
    term: "A rating",
    body: "The sponsor is meeting its duties and can assign certificates of sponsorship. Premium and SME+ are A-rated service levels.",
  },
  {
    icon: AlertTriangle,
    term: "B rating",
    body: "The licence has been downgraded. The sponsor must follow a Home Office action plan and usually can't sponsor new workers until it's A-rated again.",
  },
] as const

function BarList({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) {
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <div className="min-w-0 rounded-2xl border border-[#e4dfd5] bg-white p-5 sm:p-6">
      <h3 className="text-base font-extrabold sm:text-lg">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 font-semibold text-[#1b231e]">{item.label}</span>
              <span className="shrink-0 font-bold tabular-nums" style={{ color: PRIMARY }}>
                {item.value.toLocaleString("en-GB")}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#efece4]" aria-hidden>
              <div className="h-full rounded-full" style={{ width: `${Math.max(2, (item.value / max) * 100)}%`, background: PRIMARY }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SponsorRegisterInsights({ stats, registerDate }: { stats: SponsorRegisterStats | null; registerDate: string | null }) {
  return (
    <>
      <section className="border-t border-[#e4dfd5] bg-white py-12 sm:py-16">
        <Container>
          <SectionHeading
            eyebrow="Reading the results"
            title="How to read a UK sponsor licence"
            subtitle="Every entry on the register shows a licence type, a rating and the routes the employer can sponsor. Here's what they mean."
          />
          <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LICENCE_TERMS.map((item) => (
              <div key={item.term} className="min-w-0 rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5efeb]" style={{ color: PRIMARY }}>
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <dt className="mt-4 text-base font-extrabold">{item.term}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-[#646a63]">{item.body}</dd>
              </div>
            ))}
          </dl>
          <div className="mx-auto mt-6 flex max-w-4xl gap-3 rounded-2xl border border-[#d8d2c6] bg-[#f6f3ec] p-4 text-sm leading-relaxed text-[#4a5047] sm:p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0" style={{ color: PRIMARY }} aria-hidden />
            <p>
              <strong className="text-[#1b231e]">A licence isn&apos;t a job offer.</strong> It means the employer is allowed to
              sponsor. Whether a specific vacancy offers sponsorship is up to the employer — and the role still has to be
              eligible and meet the salary rules for your visa route. Always confirm before you apply.
            </p>
          </div>
        </Container>
      </section>

      {stats && stats.topRoutes.length > 0 && (
        <section className="border-t border-[#e4dfd5] py-12 sm:py-16">
          <Container>
            <SectionHeading
              eyebrow="The register at a glance"
              title="Who holds a UK sponsor licence"
              subtitle={`${stats.organisations.toLocaleString("en-GB")} organisations across ${stats.towns.toLocaleString("en-GB")} towns and cities hold a licence to sponsor workers.`}
            />
            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BarList
                title="Organisations by visa route"
                items={stats.topRoutes.map((route) => ({ label: route.route, value: route.organisations }))}
              />
              <BarList
                title="Organisations by town or city"
                items={stats.topTowns.map((town) => ({ label: town.town, value: town.organisations }))}
              />
            </div>
            <p className="mx-auto mt-4 max-w-[54ch] text-center text-xs leading-relaxed text-[#7c827a]">
              Counts are distinct organisations in our copy of the Home Office register{registerDate ? ` dated ${registerDate}` : ""}.
              One organisation can hold several routes.
            </p>
          </Container>
        </section>
      )}
    </>
  )
}
