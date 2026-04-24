"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LogOut,
  Menu,
  X,
  Wheat,
  LayoutDashboard,
  UserRound,
  Sprout,
  Truck,
  BarChart3,
  Mail,
} from "lucide-react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { authClient } from "@/lib/auth/client"
import { clsx } from "clsx"

const NAV_GREEN = "#0d3d10"
const CTA_GREEN = "#22c55e"

const mainNavItems = [
  { href: "/produce", label: "Produce Market", icon: Sprout },
  { href: "/transporters", label: "Transporters", icon: Truck },
  { href: "/price-board", label: "Price Board", icon: BarChart3 },
  { href: "/contact", label: "Contact", icon: Mail },
]

function navItemIsActive(pathname: string, href: string) {
  if (href.includes("#")) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PlatformNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: sessionData, isPending: sessionPending, refetch: refetchSession } = authClient.useSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => void refetchSession(), 120)
    return () => clearTimeout(timeout)
  }, [pathname, refetchSession])

  useEffect(() => {
    const onFocus = () => void refetchSession()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refetchSession])

  // close mobile menu on route change
  useEffect(() => { setIsOpen(false) }, [pathname])

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
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "shadow-[0_18px_60px_-28px_rgba(0,0,0,0.9)]" : "shadow-sm shadow-black/[0.08]"
      )}
    >
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-500" />

      <div
        className={clsx(
          "border-b border-emerald-900/50 transition-all duration-300",
          scrolled
            ? "bg-gradient-to-r from-[#061a09]/95 via-[#0b2611]/95 to-[#081f0d]/95 backdrop-blur-2xl"
            : "bg-gradient-to-r from-[#0a2e0a] via-[#0c2f0f] to-[#0a2b0c]"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-[60px] sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 text-white group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-400/30 transition group-hover:bg-emerald-500/30 group-hover:ring-emerald-300/60">
              <Wheat className="h-5 w-5 text-emerald-300" strokeWidth={2} />
            </div>
            <div className="flex flex-col leading-tight sm:flex-row sm:items-center sm:gap-2">
              <span className="text-[15px] font-bold tracking-tight sm:text-[17px]">
                EasyMove<span className="text-emerald-400">Zone</span>
              </span>
              <span className="text-[8.5px] font-bold uppercase tracking-[0.24em] text-emerald-500/80 hidden sm:flex items-center gap-2">
                Africa Agro Logistics
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {mainNavItems.map((item) => {
              const isActive = navItemIsActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "group flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 hover:-translate-y-0.5",
                    isActive
                      ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 opacity-70 transition group-hover:opacity-100" strokeWidth={2} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden items-center gap-1.5 rounded-lg border border-emerald-700/40 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400 xl:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Nigeria
            </span>

            <div className="hidden h-5 w-px bg-white/15 sm:block" aria-hidden />

            {sessionPending ? (
              <div className="ml-1 h-8 w-24 animate-pulse rounded-lg bg-white/10" />
            ) : user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/dashboard"
                  className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-white/10 sm:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/auth?mode=signup"
                  className="hidden rounded-lg border border-white/20 px-3 py-1.5 text-[13px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-block"
                >
                  Register
                </Link>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-[13px] font-bold text-white shadow-sm shadow-emerald-900/40 transition hover:bg-emerald-400 active:scale-[0.97]"
                >
                  <UserRound className="h-3.5 w-3.5 shrink-0" />
                  Sign in
                </Link>
              </div>
            )}

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setIsOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={clsx(
              "overflow-hidden border-t border-emerald-900/30 lg:hidden",
              scrolled
                ? "bg-gradient-to-b from-[#061a09]/98 via-[#071f0b]/98 to-[#061808]/98 backdrop-blur-2xl"
                : "bg-gradient-to-b from-[#0a2e0a] via-[#0c2f0f] to-[#0a2b0c]"
            )}
          >
            <nav className="mx-auto max-w-7xl px-4 py-5 flex flex-col gap-1" aria-label="Mobile main">
              {mainNavItems.map((item) => {
                const isActive = navItemIsActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15.5px] font-semibold transition-all active:scale-[0.98]",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/20 shadow-sm"
                        : "text-white/80 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 opacity-70 shrink-0" strokeWidth={2} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="mx-auto max-w-7xl px-4 pb-6 border-t border-white/8 pt-5 mt-1">
              {sessionPending ? (
                <div className="h-12 animate-pulse rounded-xl bg-white/10" />
              ) : user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-emerald-900/40"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-xl border border-white/20 px-4 py-3.5 text-[15px] font-semibold text-white/70 active:bg-white/10"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/auth?mode=signup"
                    className="flex-1 rounded-xl border border-white/20 px-4 py-3.5 text-center text-[15px] font-semibold text-white/80 active:bg-white/10"
                  >
                    Register
                  </Link>
                  <Link
                    href="/auth"
                    className="flex-1 rounded-xl bg-emerald-500 px-4 py-3.5 text-center text-[15px] font-bold text-white shadow-lg shadow-emerald-900/40"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
