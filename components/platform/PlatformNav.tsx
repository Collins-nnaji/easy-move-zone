"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Search,
  UserRound,
  ShieldCheck,
  HardHat,
  Banknote,
  Zap,
  KeyRound,
  ArrowLeftRight,
} from "lucide-react"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth/client"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"
import { clsx } from "clsx"

const NAV_BLUE = "#0033A1"
const CTA_BLUE = "#0072CE"

const navPillars = [
  {
    href: "/search",
    label: "BUY",
    sublabel: "Verified Properties",
    icon: ShieldCheck,
    accent: "text-cyan-300",
    desc: "Curated homes with 100% title verification",
  },
  {
    href: "/build",
    label: "BUILD",
    sublabel: "Managed Construction",
    icon: HardHat,
    accent: "text-amber-300",
    desc: "Architect, permits & quality-controlled build",
  },
  {
    href: "/finance",
    label: "FINANCE",
    sublabel: "Mortgage & NHF",
    icon: Banknote,
    accent: "text-emerald-300",
    desc: "Access Bank, Stanbic IBTC & diaspora NHF loans",
  },
  {
    href: "/upgrade",
    label: "UPGRADE",
    sublabel: "Solar & Smart Home",
    icon: Zap,
    accent: "text-yellow-300",
    desc: "Off-grid solar, smart locks & water systems",
  },
  {
    href: "/own",
    label: "RENT TO OWN",
    sublabel: "Lease-Purchase Pathway",
    icon: KeyRound,
    accent: "text-purple-300",
    desc: "Move in now, buy over time — no mortgage needed",
  },
  {
    href: "/swap",
    label: "SWAP",
    sublabel: "Sell, Match & Relocate",
    icon: ArrowLeftRight,
    accent: "text-rose-300",
    desc: "Sell your home, find an equivalent, move city",
  },
]

function navIsActive(pathname: string, href: string) {
  if (href.includes("?")) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}


export function PlatformNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { data: sessionData, isPending: sessionPending, refetch: refetchSession } = authClient.useSession()

  useEffect(() => {
    const timeout = setTimeout(() => { void refetchSession() }, 120)
    return () => clearTimeout(timeout)
  }, [pathname, refetchSession])

  useEffect(() => {
    const onFocus = () => { void refetchSession() }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refetchSession])

  async function handleSignOut() {
    setIsOpen(false)
    await authClient.signOut()
    await refetchSession()
    router.push("/")
    router.refresh()
  }

  const user = sessionData?.user ?? null

  return (
    <header
      className="sticky top-0 z-50 shadow-sm shadow-black/[0.06]"
      data-emz-support-email={PUBLIC_CONTACT_EMAIL}
    >
      <div className="border-b border-[#002880]" style={{ backgroundColor: NAV_BLUE }}>
        <div className="mx-auto flex h-[52px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-14 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 text-white">
            <Image
              src="/emz.png"
              alt="EMZ easymovezone logo"
              width={52}
              height={32}
              className="h-8 w-auto object-contain brightness-0 invert"
              priority
            />
            <span className="hidden font-display text-[17px] font-bold tracking-tight sm:block">
              EasyMoveZone
            </span>
          </Link>

          {/* Desktop nav — direct pillar links */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {navPillars.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className={clsx(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold tracking-wide transition-all duration-200",
                  navIsActive(pathname, p.href)
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/12 hover:text-white"
                )}
              >
                <p.icon className={clsx("h-3.5 w-3.5 shrink-0", p.accent)} />
                {p.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/search"
              className="flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/10"
              aria-label="Search listings"
            >
              <Search className="h-5 w-5" />
            </Link>
            <div className="hidden h-6 w-px bg-white/25 sm:block" aria-hidden />

            {sessionPending ? (
              <div className="ml-1 h-9 w-28 animate-pulse rounded-md bg-white/10" />
            ) : user ? (
              <div className="ml-1 flex items-center gap-1.5">
                <Link
                  href="/dashboard"
                  className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-white/10 sm:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-white/25 px-2.5 text-white transition hover:bg-white/10"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="ml-1 flex items-center gap-2">
                <Link
                  href="/auth?mode=signup"
                  className="hidden rounded-md border border-white/30 px-3 py-2 text-[13px] font-medium text-white transition hover:bg-white/10 sm:inline-block"
                >
                  Register
                </Link>
                <Link
                  href="/auth"
                  className="pill-cta pill-cta-white text-[13px] shadow-none"
                >
                  <UserRound className="h-4 w-4 shrink-0 opacity-90" />
                  Sign in
                </Link>
              </div>
            )}

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white lg:hidden"
              onClick={() => setIsOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-white/15 px-4 py-4 lg:hidden" style={{ backgroundColor: NAV_BLUE }}>
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Services</p>
          <nav className="flex flex-col gap-0.5" aria-label="Mobile main">
            {navPillars.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-3 transition",
                  navIsActive(pathname, p.href) ? "bg-white/15" : "hover:bg-white/10"
                )}
              >
                <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10", p.accent)}>
                  <p.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className={clsx("text-[13px] font-bold", p.accent)}>{p.label}</p>
                  <p className="text-[11px] text-white/55">{p.sublabel}</p>
                </div>
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-white/10 pt-4">
            {sessionPending ? (
              <div className="h-11 animate-pulse rounded-lg bg-white/10" />
            ) : user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)}
                  className="block rounded-lg bg-white/15 px-4 py-3 text-center text-[15px] font-semibold text-white">
                  Dashboard
                </Link>
                <button type="button" onClick={handleSignOut}
                  className="mt-2 w-full rounded-lg border border-white/25 px-4 py-3 text-[15px] font-medium text-white">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth?mode=signup" onClick={() => setIsOpen(false)}
                  className="block rounded-lg border border-white/25 px-4 py-3 text-center text-[15px] font-medium text-white">
                  Register
                </Link>
                <Link href="/auth" onClick={() => setIsOpen(false)}
                  className="mt-2 block rounded-lg px-4 py-3 text-center text-[15px] font-semibold text-white"
                  style={{ backgroundColor: CTA_BLUE }}>
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
