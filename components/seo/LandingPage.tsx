import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, Check, ChevronDown, Minus } from "lucide-react"
import type { ReactNode } from "react"
import { PublicShell } from "@/components/platform/PublicShell"
import { JsonLd, faqPageSchema, softwareApplicationSchema, webPageSchema } from "@/components/seo/JsonLd"
import { authServer } from "@/lib/auth/server"

const PRIMARY = "#2f5d50"
const ACCENT = "#e0511f"
const INK = "#1b231e"

type Card = { icon: LucideIcon; title: string; body: string; href?: string; linkLabel?: string }

export type LandingFaq = { question: string; answer: string }

export type LandingContent = {
  path: string
  /** Mirrors the page's meta title/description for the WebPage schema. */
  schema: { name: string; description: string; softwareApp?: { name: string; description: string } }
  hero: {
    eyebrow: string
    title: string
    highlight?: string
    lede: string
    cta: SmartCtaConfig
    secondary: { label: string; href: string }
    trust: string[]
    /** Interactive tool shown between the lede and the CTAs. */
    extra?: (context: { signedIn: boolean }) => ReactNode
  }
  /** Page-specific sections rendered after the features grid. */
  afterFeatures?: ReactNode
  stats: Array<{ value: string; label: string }>
  steps: { title: string; subtitle: string; items: Array<{ title: string; body: string }> }
  features: { eyebrow: string; title: string; subtitle: string; items: Card[] }
  comparison?: {
    title: string
    subtitle: string
    competitor: string
    rows: Array<{ feature: string; us: string | boolean; them: string | boolean }>
    note: string
  }
  audiences: { title: string; subtitle: string; items: Card[] }
  faqs: LandingFaq[]
  crossLink: { eyebrow: string; title: string; body: string; href: string; label: string }
  bottomCta: { title: string; body: string }
}

type SmartCtaConfig = {
  /** In-app destination for signed-in visitors; signed-out visitors sign up and land here afterwards. */
  appHref: string
  signedInLabel: string
  signedOutLabel: string
}

function SmartCta({ cta, signedIn, className = "" }: { cta: SmartCtaConfig; signedIn: boolean; className?: string }) {
  return (
    <Link
      href={smartHref(cta, signedIn)}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-[15px] font-bold text-white transition hover:brightness-105 ${className}`}
      style={{ background: PRIMARY, boxShadow: "0 12px 28px rgba(47,93,80,.24)" }}
    >
      {signedIn ? cta.signedInLabel : cta.signedOutLabel}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}

export function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto text-center">
      {eyebrow && (
        <p className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: ACCENT }}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${eyebrow ? "mt-2" : ""}`}>{title}</h2>
      {subtitle && <p className="mx-auto mt-3 max-w-[54ch] text-sm leading-relaxed text-[#5f655c] sm:text-base">{subtitle}</p>}
    </div>
  )
}

function CardGrid({ items, columns }: { items: Card[]; columns: 2 | 3 | 4 }) {
  const grid = columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
  return (
    <div className={`mt-8 grid grid-cols-1 gap-4 ${grid}`}>
      {items.map((item) => (
        <div key={item.title} className="flex min-w-0 flex-col rounded-2xl border border-[#e4dfd5] bg-white p-5 sm:p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5efeb]" style={{ color: PRIMARY }}>
            <item.icon className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="mt-4 text-base font-extrabold sm:text-lg">{item.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[#646a63]">{item.body}</p>
          {item.href && (
            <Link
              href={item.href}
              className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold underline-offset-4 hover:underline"
              style={{ color: PRIMARY }}
            >
              {item.linkLabel ?? "Learn more"} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

function ComparisonCell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: PRIMARY }}>
        <Check className="h-4 w-4 shrink-0" aria-hidden /> Yes
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[#8a9087]">
        <Minus className="h-4 w-4 shrink-0" aria-hidden /> No
      </span>
    )
  }
  return <span className={highlight ? "font-bold text-[#1b231e]" : "text-[#5f655c]"}>{value}</span>
}

export function smartHref(cta: SmartCtaConfig, signedIn: boolean) {
  return signedIn ? cta.appHref : `/auth?mode=signup&redirect=${encodeURIComponent(cta.appHref)}`
}

export async function LandingPage({ content }: { content: LandingContent }) {
  const session = await authServer.getSession()
  const signedIn = Boolean(session?.data?.user)
  const { hero, stats, steps, features, comparison, audiences, faqs, crossLink, bottomCta, schema, path } = content

  const schemas = [
    webPageSchema({ path, name: schema.name, description: schema.description }),
    faqPageSchema({ path, faqs }),
    ...(schema.softwareApp ? [softwareApplicationSchema({ ...schema.softwareApp, path })] : []),
  ]

  return (
    <PublicShell>
      <JsonLd data={schemas} />
      <div style={{ background: "#efece4", color: INK }}>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 55% at 8% -10%, rgba(47,93,80,0.18) 0%, transparent 55%), radial-gradient(50% 40% at 92% 20%, rgba(27,35,30,0.08) 0%, transparent 50%), linear-gradient(180deg, #f3f2ec 0%, #efece4 55%, #e8e3d8 100%)",
            }}
          />
          <Container className="relative py-10 sm:py-14 lg:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-extrabold tracking-tight sm:text-base" style={{ color: PRIMARY }}>
                {hero.eyebrow}
              </p>
              <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.08] tracking-tight sm:mt-3 sm:text-5xl lg:text-[3.25rem]">
                {hero.title}
                {hero.highlight && (
                  <>
                    {" "}
                    <span style={{ color: PRIMARY }}>{hero.highlight}</span>
                  </>
                )}
              </h1>
              <p className="mx-auto mt-4 max-w-[54ch] text-[15px] leading-relaxed text-[#5f655c] sm:text-lg">{hero.lede}</p>
              {hero.extra && <div className="mt-6">{hero.extra({ signedIn })}</div>}
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <SmartCta cta={hero.cta} signedIn={signedIn} className="sm:min-w-[12rem]" />
                <Link
                  href={hero.secondary.href}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white/85 px-6 text-[15px] font-bold text-[#1b231e] transition hover:bg-white sm:min-w-[12rem]"
                >
                  {hero.secondary.label}
                </Link>
              </div>
              <p className="mt-4 text-xs font-semibold text-[#6e746b] sm:text-sm">{hero.trust.join(" · ")}</p>
            </div>
          </Container>
        </section>

        <section aria-label="Key facts" className="border-y border-[#e4dfd5] bg-[#f6f3ec]">
          <Container>
            <dl className="grid grid-cols-2 divide-[#e4dfd5] py-5 sm:grid-cols-4 sm:divide-x">
              {stats.map((stat) => (
                <div key={stat.label} className="px-2 py-2 text-center sm:px-4">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-xl font-extrabold tracking-tight sm:text-2xl" style={{ color: PRIMARY }}>
                    {stat.value}
                  </dd>
                  <dd className="mt-0.5 text-xs font-semibold text-[#5f655c] sm:text-sm">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <Container>
            <SectionHeading eyebrow="How it works" title={steps.title} subtitle={steps.subtitle} />
            <ol className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#ece7dd]">
              {steps.items.map((step, index) => (
                <li key={step.title} className="flex flex-col items-center text-center md:px-6">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white"
                    style={{ background: PRIMARY }}
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-base font-extrabold sm:text-lg">{step.title}</h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-[#646a63]">{step.body}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className="border-t border-[#e4dfd5] py-12 sm:py-16">
          <Container>
            <SectionHeading eyebrow={features.eyebrow} title={features.title} subtitle={features.subtitle} />
            <CardGrid items={features.items} columns={features.items.length === 4 ? 4 : features.items.length === 3 ? 3 : 2} />
          </Container>
        </section>

        {content.afterFeatures}

        {comparison && (
          <section className="border-t border-[#e4dfd5] bg-white py-12 sm:py-16">
            <Container>
              <SectionHeading eyebrow="Side by side" title={comparison.title} subtitle={comparison.subtitle} />
              <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-[#e4dfd5]">
                <table className="w-full table-fixed border-collapse text-left text-[13px] sm:text-sm">
                  <thead>
                    <tr className="bg-[#f6f3ec]">
                      <th scope="col" className="w-[38%] px-3 py-3 font-extrabold sm:px-5">Feature</th>
                      <th scope="col" className="px-3 py-3 font-extrabold text-white sm:px-5" style={{ background: PRIMARY }}>
                        EasyMoveZone
                      </th>
                      <th scope="col" className="px-3 py-3 font-extrabold sm:px-5">{comparison.competitor}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.rows.map((row) => (
                      <tr key={row.feature} className="border-t border-[#ece7dd] align-top">
                        <th scope="row" className="px-3 py-3 font-semibold text-[#1b231e] sm:px-5">{row.feature}</th>
                        <td className="bg-[#eef4f1] px-3 py-3 sm:px-5"><ComparisonCell value={row.us} highlight /></td>
                        <td className="px-3 py-3 sm:px-5"><ComparisonCell value={row.them} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mx-auto mt-3 max-w-[54ch] text-center text-xs leading-relaxed text-[#7c827a]">{comparison.note}</p>
            </Container>
          </section>
        )}

        <section className="border-t border-[#e4dfd5] bg-[#f6f3ec] py-12 sm:py-16">
          <Container>
            <SectionHeading eyebrow="Who it's for" title={audiences.title} subtitle={audiences.subtitle} />
            <CardGrid items={audiences.items} columns={audiences.items.length === 2 ? 2 : 3} />
          </Container>
        </section>

        <section className="border-t border-[#e4dfd5] bg-white py-12 sm:py-16">
          <Container>
            <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
            <div className="mx-auto mt-8 max-w-3xl divide-y divide-[#ece7dd] rounded-2xl border border-[#e4dfd5] bg-white">
              {faqs.map((faq) => (
                <details key={faq.question} className="group px-4 sm:px-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[15px] font-extrabold [&::-webkit-details-marker]:hidden">
                    <h3>{faq.question}</h3>
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#6e746b] transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-[#5f655c]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-t border-[#e4dfd5] py-10 sm:py-12">
          <Container>
            <Link
              href={crossLink.href}
              className="group mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-[#d8d2c6] bg-white p-5 transition hover:border-[#2f5d50]/50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: ACCENT }}>
                  {crossLink.eyebrow}
                </p>
                <p className="mt-1 text-lg font-extrabold tracking-tight">{crossLink.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5f655c]">{crossLink.body}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold" style={{ color: PRIMARY }}>
                {crossLink.label} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </Container>
        </section>

        <section className="pb-14 sm:pb-20">
          <Container>
            <div className="mx-auto max-w-4xl rounded-3xl px-5 py-10 text-center text-white sm:px-10 sm:py-12" style={{ background: INK }}>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{bottomCta.title}</h2>
              <p className="mx-auto mt-3 max-w-[54ch] text-sm leading-relaxed text-white/75 sm:text-base">{bottomCta.body}</p>
              <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:flex-row sm:justify-center">
                <SmartCta cta={hero.cta} signedIn={signedIn} />
                <Link
                  href="/specialist-support"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 px-6 text-[15px] font-bold text-white transition hover:bg-white/10"
                >
                  Talk to a specialist
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </PublicShell>
  )
}
