"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LogOut,
  Menu,
  X,
  ShieldCheck,
  LayoutDashboard,
  Search,
  ChevronDown,
  UserRound,
} from "lucide-react"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth/client"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"
import { clsx } from "clsx"

/** Stanbic-style palette */
const NAV_BLUE = "#0033A1"
const CTA_BLUE = "#0072CE"
const mainNavItems = [
  { href: "/search", label: "Listings" },
  { href: "/mortgage", label: "Mortgages & NHF" },
  { href: "/contact", label: "Contact" },
]

function navItemIsActive(pathname: string, href: string) {
  if (href.includes("#")) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PlatformNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { data: sessionData, isPending: sessionPending, refetch: refetchSession } = authClient.useSession()

  useEffect(() => {
    const timeout = setTimeout(() => {
      void refetchSession()
    }, 120)
    return () => clearTimeout(timeout)
  }, [pathname, refetchSession])

  useEffect(() => {
    const onFocus = () => {
      void refetchSession()
    }
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
          <Link href="/" className="flex shrink-0 items-center gap-2.5 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-[17px] font-bold tracking-tight">EasyMoveZone</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/75">Nigeria-first property</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {mainNavItems.map((item) => {
              const isActive = navItemIsActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-md px-2.5 py-2 text-[13px] font-medium text-white/95 transition-colors",
                    isActive ? "bg-white/15 text-white" : "hover:bg-white/10",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-1 text-[12px] font-medium text-white/90 md:flex lg:hidden">
            <Link href="/contact" className="rounded-md px-2 py-1.5 hover:bg-white/10">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-white/85 xl:inline-flex">
              <span aria-hidden>🇳🇬</span>
              Nigeria
              <ChevronDown className="h-3 w-3.5 text-white/60" aria-hidden />
            </span>
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
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:brightness-110"
                  style={{ backgroundColor: CTA_BLUE }}
                >
                  <UserRound className="h-4 w-4 shrink-0 opacity-95" />
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

      {isOpen && (
        <div className="border-t border-white/15 px-4 py-4 lg:hidden" style={{ backgroundColor: NAV_BLUE }}>
          <nav className="flex flex-col gap-0.5" aria-label="Mobile main">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-white/95 hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-white/10 pt-4">
            {sessionPending ? (
              <div className="h-11 animate-pulse rounded-lg bg-white/10" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg bg-white/15 px-4 py-3 text-center text-[15px] font-semibold text-white"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-2 w-full rounded-lg border border-white/25 px-4 py-3 text-[15px] font-medium text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth?mode=signup"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg border border-white/25 px-4 py-3 text-center text-[15px] font-medium text-white"
                >
                  Register
                </Link>
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 block rounded-lg px-4 py-3 text-center text-[15px] font-semibold text-white"
                  style={{ backgroundColor: CTA_BLUE }}
                >
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
