import Link from "next/link"
import type { ReactNode } from "react"
import { PublicShell } from "@/components/platform/PublicShell"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"

export const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/cookies", label: "Cookie Policy" },
] as const

export type LegalSection = { id: string; title: string; body: ReactNode }

export function LegalPage({ title, intro, updated, sections, current }: {
  title: string
  intro: ReactNode
  updated: string
  sections: LegalSection[]
  current: (typeof LEGAL_LINKS)[number]["href"]
}) {
  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0511f]">Legal</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1b231e] sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-[#6e746b]">Last updated: {updated}</p>
          <div className="mt-5 text-[15px] leading-relaxed text-[#4a5047]">{intro}</div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <nav aria-label="Legal documents" className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={link.href === current ? "page" : undefined}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition ${link.href === current ? "bg-[#1b231e] text-white" : "text-[#4a5047] hover:bg-white"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="On this page" className="mt-6 hidden border-t border-[#e4dfd5] pt-5 lg:block">
              <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a9087]">On this page</p>
              <ol className="mt-2 space-y-0.5">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="block rounded-lg px-3 py-1.5 text-[13px] text-[#5f655c] hover:bg-white hover:text-[#1b231e]">
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="max-w-3xl space-y-10 text-[15px] leading-relaxed text-[#4a5047]">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-lg font-extrabold text-[#1b231e]">{index + 1}. {section.title}</h2>
                <div className="mt-3 space-y-3">{section.body}</div>
              </section>
            ))}
            <section className="rounded-2xl border border-[#e4dfd5] bg-white p-5">
              <h2 className="text-base font-extrabold text-[#1b231e]">Questions?</h2>
              <p className="mt-1.5 text-sm">
                Email <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="font-semibold text-[#e0511f] underline-offset-2 hover:underline">{PUBLIC_CONTACT_EMAIL}</a> or use our{" "}
                <Link href="/contact" className="font-semibold text-[#e0511f] underline-offset-2 hover:underline">contact page</Link>.
              </p>
            </section>
          </article>
        </div>
      </div>
    </PublicShell>
  )
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-[#2f5d50]">
      {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
  )
}

export function Mail() {
  return <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="font-semibold text-[#e0511f] underline-offset-2 hover:underline">{PUBLIC_CONTACT_EMAIL}</a>
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http")
  return external
    ? <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-[#e0511f] underline-offset-2 hover:underline">{children}</a>
    : <Link href={href} className="font-semibold text-[#e0511f] underline-offset-2 hover:underline">{children}</Link>
}
