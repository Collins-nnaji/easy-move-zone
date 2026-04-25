import Link from "next/link"
import { Wheat, Mail, Sprout, Truck, BarChart3, MapPin } from "lucide-react"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"

const footerLinks = {
  Platform: [
    { href: "/produce", label: "Produce Market", icon: Sprout },
    { href: "/transporters", label: "Transporters", icon: Truck },
    { href: "/price-board", label: "Price Board", icon: BarChart3 },
    { href: "/shipments", label: "Track Shipments", icon: null },
    { href: "/contact", label: "Contact", icon: null },
    { href: "/auth?mode=signup", label: "Create account", icon: null },
  ],
  "List & Register": [
    { href: "/produce/list", label: "List your produce", icon: null },
    { href: "/transporters/register", label: "Register fleet", icon: null },
  ],
  "Market Hubs": [
    { href: "/produce?hub=lagos", label: "Lagos", icon: null },
    { href: "/produce?hub=kano", label: "Kano", icon: null },
    { href: "/produce?hub=onitsha", label: "Onitsha", icon: null },
    { href: "/produce?hub=ibadan", label: "Ibadan", icon: null },
    { href: "/produce?hub=abuja", label: "Abuja", icon: null },
  ],
}

export function PlatformFooter() {
  return (
    <footer className="relative z-[45] border-t border-white/8 bg-gradient-to-b from-[#061308] via-[#040d06] to-[#020703] text-white">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 top-8 h-[260px] w-[260px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -left-32 bottom-0 h-[240px] w-[240px] rounded-full bg-lime-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
                <Wheat className="h-4.5 w-4.5 text-emerald-400" strokeWidth={2} />
              </div>
              <span className="text-lg font-bold tracking-tight">
                EasyMove<span className="text-emerald-400">Zone</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-xs">
              Africa&apos;s agro logistics platform — connecting farmers, transporters, and buyers. Reducing post-harvest loss across the continent.
            </p>

            <div className="mt-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact</p>
              <a
                href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400/90 transition hover:text-emerald-300"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {PUBLIC_CONTACT_EMAIL}
              </a>
            </div>

            <div className="mt-5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-600" />
              Nigeria · Ghana · Kenya · Africa
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-emerald-300 hover:translate-x-0.5"
                    >
                      {link.icon && <link.icon className="h-3.5 w-3.5 text-slate-600" strokeWidth={1.75} />}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.05] pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-[11px] text-slate-600">&copy; {new Date().getFullYear()} EasyMoveZone. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
            <span>System operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
