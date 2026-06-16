import Link from "next/link"
import Image from "next/image"
import { Mail, ArrowUpRight } from "lucide-react"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"

const services = [
  { href: "/move",         label: "Plan your move", badge: "Move" },
  { href: "/move",         label: "Book a trip",    badge: null   },
  { href: "/move",         label: "Find a stay",    badge: null   },
  { href: "/move",         label: "Sort your visa", badge: "Visa" },
]

const explore = [
  { href: "/move",         label: "The Move Spectrum" },
  { href: "/relocate/hub", label: "My workspace"      },
  { href: "/settle",       label: "Settling guides"   },
]

const company = [
  { href: "/contact",          label: "Contact us"      },
  { href: "/auth",             label: "Sign in"         },
  { href: "/auth?mode=signup", label: "Create account"  },
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

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
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
              Book your trip, find a place to stay, and sort your visa — one app for every kind of move, two
              weeks or forever.
            </p>
            <a
              href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-200/90 transition hover:text-white"
            >
              <Mail className="h-4 w-4 text-orange-400/80" aria-hidden />
              {PUBLIC_CONTACT_EMAIL}
            </a>
            <p className="mt-2 text-xs text-slate-600">
              Questions about a move, a visa or a booking? Use the{" "}
              <Link href="/contact" className="font-semibold text-orange-200/80 underline decoration-orange-500/30 underline-offset-2 hover:text-white">
                contact form
              </Link>.
            </p>

            {/* Primary CTA */}
            <Link
              href="/move"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-bold text-orange-300 hover:bg-orange-500/20 hover:text-white transition-all"
            >
              Start your move
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Services</h4>
            <ul className="space-y-2.5">
              {services.map(({ href, label, badge }) => (
                <li key={label}>
                  <Link href={href} className="group inline-flex items-center gap-2 text-[13px] text-slate-400 transition hover:text-white">
                    {label}
                    {badge && (
                      <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[9px] font-bold text-orange-400 group-hover:bg-orange-500/30">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Explore</h4>
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

          {/* Company */}
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
          <p className="text-[11px] text-[#64748b]">&copy; {new Date().getFullYear()} EasyMoveZone. Nigeria &middot; Lagos &middot; Abuja &middot; Port Harcourt</p>
          <p className="text-[11px] text-[#64748b]">TRIPS &middot; STAYS &middot; VISAS &middot; RELOCATE &middot; SETTLE</p>
        </div>
      </div>
    </footer>
  )
}
