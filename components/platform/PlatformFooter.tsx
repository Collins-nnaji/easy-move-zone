import Link from "next/link"
import { ShieldCheck, Lock, BadgeCheck, Headphones } from "lucide-react"

const footerLinks = {
  Platform: [
    { href: "/search", label: "Browse Properties" },
    { href: "/about", label: "How It Works" },
    { href: "/auth?mode=signup", label: "Create Account" },
  ],
  "For Agents": [
    { href: "/portal", label: "Agent Portal" },
    { href: "/portal/new", label: "List a Property" },
    { href: "/about", label: "Verification Process" },
  ],
  Cities: [
    { href: "/search?city=lagos", label: "Lagos" },
    { href: "/search?city=abuja", label: "Abuja" },
    { href: "/search?city=accra", label: "Accra" },
    { href: "/search?city=nairobi", label: "Nairobi" },
  ],
}

export function PlatformFooter() {
  return (
    <footer className="emz-footer-glow relative border-t border-white/10 bg-[#0b1220] text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#155eef] via-[#3ec6f5] to-[#0f766e] opacity-90" />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 border-b border-white/[0.06] px-4 py-6 sm:px-6 lg:justify-between lg:px-8">
        {[
          { icon: ShieldCheck, label: "Title verification" },
          { icon: Lock, label: "Bank-grade security" },
          { icon: BadgeCheck, label: "Vetted agents" },
          { icon: Headphones, label: "Diaspora support" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-sm text-[#94a3b8]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-[#60a5fa] ring-1 ring-white/[0.08]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-medium text-[#cbd5e1]">{label}</span>
          </div>
        ))}
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#155eef] to-[#0f4ec4] shadow-lg shadow-[#155eef]/25">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-[var(--font-playfair)] text-2xl font-bold">
              EasyMove<span className="bg-gradient-to-r from-[#60a5fa] to-[#34d399] bg-clip-text text-transparent">Zone</span>
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#60a5fa]/90">
            Trusted African Property
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#94a3b8]">
            Every listing is title-verified before going live. Every transaction is guided
            end to end. Buy land and property in Africa without the risk of fraud.
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Markets we cover</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["NG", "GH", "KE", "ZA"].map((code) => (
              <span
                key={code}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#94a3b8]"
              >
                {code}
              </span>
            ))}
          </div>
        </div>

        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#60a5fa] mb-4">{title}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[#94a3b8] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-[#64748b]">&copy; {new Date().getFullYear()} EasyMoveZone. All rights reserved.</p>
          <p className="text-[11px] text-[#64748b]">Lagos &middot; Abuja &middot; Accra &middot; Nairobi &middot; Johannesburg</p>
        </div>
      </div>
    </footer>
  )
}
