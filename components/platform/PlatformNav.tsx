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
  Truck,
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
  {
    href: "/logistics",
    label: "LOGISTICS",
    sublabel: "Standalone Moving Engine",
    icon: Truck,
    accent: "text-rose-400",
    desc: "Secure cross-city moving & full inventory management",
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
      className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10 shadow-lg shadow-black/20"
      data-emz-support-email={PUBLIC_CONTACT_EMAIL}
    >
      <div className="w-full">
        <div className="mx-auto flex h-[52px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-14 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center text-white transition hover:opacity-80">
            <Image
              src="/emz.png"
              alt="EMZ easymovezone logo"
              width={52}
              height={32}
              className="h-8 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>

          {/* Desktop nav — direct pillar links */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navPillars.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className={clsx(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold tracking-wide transition-all duration-300",
                  navIsActive(pathname, p.href)
                    ? "bg-gradient-to-r from-[#0072CE]/30 to-[#0033A1]/30 text-white ring-1 ring-[#0072CE]/40 shadow-inner shadow-[#0072CE]/10"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
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
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Search listings"
            >
              <Search className="h-5 w-5" />
            </Link>
            <div className="hidden h-6 w-px bg-white/10 sm:block" aria-hidden />

            {sessionPending ? (
              <div className="ml-1 h-9 w-28 animate-pulse rounded-full bg-white/10" />
            ) : user ? (
              <div className="ml-1 flex items-center gap-1.5">
                <Link
                  href="/dashboard"
                  className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white sm:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="ml-1 flex items-center gap-2">
                <Link
                  href="/auth?mode=signup"
                  className="hidden rounded-full border border-white/20 px-4 py-2 text-[13px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:inline-block"
                >
                  Register
                </Link>
                <Link
                  href="/auth"
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-[13px] font-bold text-white transition hover:brightness-110 hover:shadow-lg hover:shadow-cyan-500/25 shrink-0 shadow-md"
                >
                  <UserRound className="h-4 w-4 shrink-0 opacity-90" />
                  Sign in
                </Link>
              </div>
            )}

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
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
        <div className="border-t border-white/10 px-4 py-4 lg:hidden bg-slate-950/95 backdrop-blur-xl">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Services</p>
          <nav className="flex flex-col gap-1" aria-label="Mobile main">
            {navPillars.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                  navIsActive(pathname, p.href)
                    ? "bg-gradient-to-r from-[#0072CE]/20 to-[#0033A1]/20 text-white ring-1 ring-[#0072CE]/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5", p.accent)}>
                  <p.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className={clsx("text-[13px] font-bold", p.accent)}>{p.label}</p>
                  <p className="text-[11px] text-slate-400">{p.sublabel}</p>
                </div>
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-white/10 pt-4">
            {sessionPending ? (
              <div className="h-11 animate-pulse rounded-xl bg-white/5" />
            ) : user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)}
                  className="block rounded-xl bg-white/10 px-4 py-3 text-center text-[15px] font-semibold text-white">
                  Dashboard
                </Link>
                <button type="button" onClick={handleSignOut}
                  className="mt-2 w-full rounded-xl border border-white/20 px-4 py-3 text-[15px] font-medium text-slate-300">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth?mode=signup" onClick={() => setIsOpen(false)}
                  className="block rounded-xl border border-white/20 px-4 py-3 text-center text-[15px] font-medium text-slate-300">
                  Register
                </Link>
                <Link href="/auth" onClick={() => setIsOpen(false)}
                  className="mt-2 block rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-center text-[15px] font-bold text-white shadow-md">
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
