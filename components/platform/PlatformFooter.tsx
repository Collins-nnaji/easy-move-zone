import Link from "next/link"
import { Gauge } from "lucide-react"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"
import { SiteLogo } from "@/components/brand/SiteLogo"

const LINKS = [
  { href: "/easymovescore", label: "EasyMove Score" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/jobs", label: "Jobs" },
  { href: "/work-simulation", label: "Work Simulation" },
  { href: "/news", label: "News" },
  { href: "/specialist-support", label: "Specialist help" },
  { href: "/contact", label: "Contact" },
] as const

export function PlatformFooter() {
  return (
    <footer className="relative z-10 shrink-0 border-t border-[#e4dfd5] bg-[#f6f3ec]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-7 lg:px-8">
        <div className="min-w-0">
          <SiteLogo href="/" height={24} />
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#5f655c] sm:text-sm">
            Career transition and visa-sponsored jobs — one score, many destinations.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-[#4a5047]">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex items-center gap-1 hover:text-[#1b231e]">
              {link.href === "/easymovescore" ? <Gauge className="h-3.5 w-3.5 text-[#e0511f]" /> : null}
              {link.label}
            </Link>
          ))}
        </nav>
        <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="text-sm font-semibold text-[#e0511f]">
          {PUBLIC_CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  )
}
