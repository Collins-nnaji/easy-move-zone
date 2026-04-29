import Link from "next/link"
import Image from "next/image"
import { Mail } from "lucide-react"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"

const cities = [
  { href: "/purchase?city=lagos",         label: "Lagos" },
  { href: "/purchase?city=abuja",         label: "Abuja" },
  { href: "/purchase?city=port harcourt", label: "Port Harcourt" },
  { href: "/purchase?city=ibadan",        label: "Ibadan" },
  { href: "/purchase?city=enugu",         label: "Enugu" },
]

const company = [
  { href: "/mortgage",         label: "Mortgage calculator" },
  { href: "/contact",          label: "Contact us" },
  { href: "/auth?mode=signup", label: "Create account" },
  { href: "/auth",             label: "Sign in" },
]

export function PlatformFooter() {
  return (
    <footer
      id="contact"
      className="relative z-[45] border-t border-white/10 bg-[#0b1220] text-white scroll-mt-24"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#0033A1] via-[#0072CE] to-emerald-600/80 opacity-90" />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/emz.png"
                alt="EasyMoveZone Logo"
                width={140}
                height={36}
                className="h-9 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-400 max-w-xs">
              Nigeria's complete homeownership ecosystem — verified land, managed construction, mortgage brokering, and rent-to-own pathways.
            </p>
            <a
              href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200/90 transition hover:text-white"
            >
              <Mail className="h-4 w-4 text-cyan-400/80" aria-hidden />
              {PUBLIC_CONTACT_EMAIL}
            </a>
            <p className="mt-2 text-xs text-slate-600">
              For listings, verification & diaspora buying support. Or use the{" "}
              <Link href="/contact" className="font-semibold text-cyan-200/80 underline decoration-cyan-500/30 underline-offset-2 hover:text-white">
                contact form
              </Link>.
            </p>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Cities</h4>
            <ul className="space-y-2.5">
              {cities.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-slate-400 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Company</h4>
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
          <p className="text-[11px] text-[#64748b]">&copy; {new Date().getFullYear()} EasyMoveZone. Nigeria &middot; Lagos &middot; Abuja &middot; Port Harcourt</p>
          <p className="text-[11px] text-[#64748b]">PURCHASE &middot; BUILD &middot; FINANCE &middot; RENT TO OWN</p>
        </div>
      </div>
    </footer>
  )
}
