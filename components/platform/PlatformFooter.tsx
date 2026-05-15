import Link from "next/link"
import Image from "next/image"
import { Mail, ArrowRight, MapPin, Users, Bot, Home } from "lucide-react"
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

const quickLinks = [
  { href: "/explore",   icon: MapPin,  label: "Explore cities" },
  { href: "/community", icon: Users,   label: "Community" },
  { href: "/ai",        icon: Bot,     label: "AI Concierge" },
  { href: "/dashboard", icon: Home,    label: "My Dashboard" },
]

export function PlatformFooter() {
  return (
    <footer className="bg-[#1A1612] text-white border-t border-[#2A2520]">
      {/* Quick nav strip */}
      <div className="border-b border-[#2A2520]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
            {quickLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-[#6B6460] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[#2A2520]"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-5 inline-block transition hover:opacity-90">
              <Image
                src="/emz.svg"
                alt="EasyMoveZone"
                width={160}
                height={40}
                className="h-9 w-auto max-w-[200px] object-contain object-left brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-[#6B6460] leading-relaxed max-w-xs mb-5">
              The operating system for moving and settling. From "I think I want to move" to "I live here now" — in one personalised dashboard.
            </p>
            <a
              href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 text-sm text-[#6B6460] hover:text-white transition-colors mb-6"
            >
              <Mail className="h-4 w-4" />
              {PUBLIC_CONTACT_EMAIL}
            </a>

            {/* Mini CTA */}
            <div>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 bg-[#E85C2D] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#D44E22] transition-colors"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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
          <div className="flex items-center gap-3 text-xs text-[#4A4440]">
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
