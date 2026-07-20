import Link from "next/link"
import { Mail, ArrowUpRight } from "lucide-react"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"
import { SiteLogo } from "@/components/brand/SiteLogo"

const services = [
  { href: "/move/shifts", label: "Browse loads", badge: "Live" },
  { href: "/fleet", label: "Fleet console", badge: null },
  { href: "/move/wallet", label: "Instant wallet", badge: null },
  { href: "/move/vault", label: "Compliance vault", badge: null },
]

const explore = [
  { href: "/move", label: "Driver / owner-operator" },
  { href: "/fleet", label: "Fleet operators" },
]

const company = [
  { href: "/contact", label: "Contact us" },
  { href: "/auth", label: "Sign in" },
  { href: "/auth?mode=signup", label: "Create account" },
]

export function PlatformFooter() {
  return (
    <footer
      id="contact"
      className="relative z-[45] border-t border-white/10 bg-[#0b1220] text-white scroll-mt-24"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#e0511f] via-[#bf6a3c] to-amber-500/80 opacity-90" />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <SiteLogo href="/" height={36} invert />
            <p className="mt-3 text-[13px] leading-relaxed text-slate-400 max-w-xs">
              Commission-based logistics marketplace. Drivers and truck owners claim loads;
              fleet operators post routes and manage workload.
            </p>
            <a
              href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-200/90 transition hover:text-white"
            >
              <Mail className="h-4 w-4 text-orange-400/80" aria-hidden />
              {PUBLIC_CONTACT_EMAIL}
            </a>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/move"
                className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-bold text-orange-300 hover:bg-orange-500/20 hover:text-white transition-all"
              >
                Driver app
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/80 hover:bg-white/10 transition-all"
              >
                Fleet console
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Product</h4>
            <ul className="space-y-2.5">
              {services.map(({ href, label, badge }) => (
                <li key={label}>
                  <Link href={href} className="group inline-flex items-center gap-2 text-[13px] text-slate-400 transition hover:text-white">
                    {label}
                    {badge && (
                      <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[9px] font-bold text-orange-400">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Roles</h4>
            <ul className="space-y-2.5">
              {explore.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-[13px] text-slate-400 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {company.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-slate-400 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-[11px] text-[#64748b]">&copy; {new Date().getFullYear()} EasyMoveZone. Logistics marketplace.</p>
          <p className="text-[11px] text-[#64748b]">DRIVERS · FLEET · PAYOUTS · RATINGS</p>
        </div>
      </div>
    </footer>
  )
}
