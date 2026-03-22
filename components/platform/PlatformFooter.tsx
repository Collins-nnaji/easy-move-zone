import Link from "next/link"
import { Mail, ShieldCheck } from "lucide-react"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"

const footerLinks = {
  Platform: [
    { href: "/search", label: "Listings" },
    { href: "/mortgage", label: "Mortgages & NHF" },
    { href: "/contact", label: "Contact" },
    { href: "/auth?mode=signup", label: "Create account" },
  ],
  Cities: [
    { href: "/search?city=lagos", label: "Lagos" },
    { href: "/search?city=abuja", label: "Abuja" },
    { href: "/search?city=port harcourt", label: "Port Harcourt" },
    { href: "/search?city=ibadan", label: "Ibadan" },
  ],
}

export function PlatformFooter() {
  return (
    <footer
      id="contact"
      className="relative z-[45] border-t border-white/10 bg-[#0b1220] text-white scroll-mt-24"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#0033A1] via-[#0072CE] to-emerald-600/80 opacity-90" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#0033A1] to-[#0072CE]">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                EasyMove<span className="text-cyan-300">Zone</span>
              </span>
            </div>
            <p className="mt-2 text-xs text-[#94a3b8]">
              Verified property in Nigeria — listed and managed in-house. No third-party syndication.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 sm:gap-14">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact</h4>
              <a
                href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200/95 transition hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-cyan-400/90" aria-hidden />
                {PUBLIC_CONTACT_EMAIL}
              </a>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#64748b]">
                For listing questions, verification, and diaspora buying support. Or use the{" "}
                <Link href="/contact" className="font-semibold text-cyan-200/90 underline decoration-cyan-500/30 underline-offset-2 hover:text-white">
                  contact form
                </Link>
                .
              </p>
            </div>
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</h4>
                <ul className="mt-2 space-y-1.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-[#94a3b8] transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-[11px] text-[#64748b]">&copy; {new Date().getFullYear()} EasyMoveZone</p>
          <p className="text-[11px] text-[#64748b]">Nigeria · Lagos · Abuja</p>
        </div>
      </div>
    </footer>
  )
}
