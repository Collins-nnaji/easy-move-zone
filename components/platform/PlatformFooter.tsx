import Link from "next/link"
import Image from "next/image"
import { Mail } from "lucide-react"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"

const productLinks = [
  { href: "/onboarding", label: "Get started" },
  { href: "/explore",    label: "City explorer" },
  { href: "/community",  label: "Community" },
  { href: "/ai",         label: "AI concierge" },
  { href: "/dashboard",  label: "Dashboard" },
]

const forLinks = [
  { href: "/onboarding", label: "Movers" },
  { href: "/landlord",   label: "Landlords" },
  { href: "/partner",    label: "Relocation partners" },
]

const companyLinks = [
  { href: "/auth",             label: "Sign in" },
  { href: "/auth?mode=signup", label: "Create account" },
  { href: "/contact",          label: "Contact us" },
]

export function PlatformFooter() {
  return (
    <footer className="bg-[#1A1612] text-white border-t border-[#2A2520]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 inline-block transition hover:opacity-90">
              <Image
                src="/emz.svg"
                alt="EasyMoveZone"
                width={160}
                height={40}
                className="h-9 w-auto max-w-[200px] object-contain object-left brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-[#6B6460] leading-relaxed max-w-xs">
              The operating system for moving and settling. From "I think I want to move" to "I live here now" — in one personalised dashboard.
            </p>
            <a
              href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-[#6B6460] hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              {PUBLIC_CONTACT_EMAIL}
            </a>
          </div>

          {/* Product */}
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#4A4440] uppercase mb-4">Product</div>
            <ul className="flex flex-col gap-3">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[#6B6460] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For */}
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#4A4440] uppercase mb-4">For</div>
            <ul className="flex flex-col gap-3">
              {forLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[#6B6460] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#4A4440] uppercase mb-4">Company</div>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[#6B6460] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#2A2520] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4A4440]">© 2026 EasyMoveZone. The relocation OS.</p>
          <div className="flex items-center gap-4 text-xs text-[#4A4440]">
            <span>42k+ movers</span>
            <span>·</span>
            <span>180+ cities</span>
            <span>·</span>
            <span>4.8★ rated</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
