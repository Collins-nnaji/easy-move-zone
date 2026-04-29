"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  UserRound,
  ShieldCheck,
  HardHat,
  Banknote,
  KeyRound,
} from "lucide-react"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth/client"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"
import { clsx } from "clsx"

const navLinks = [
  { href: "/purchase", label: "Purchase",    icon: ShieldCheck, accent: "text-cyan-400"   },
  { href: "/build",    label: "Build",       icon: HardHat,     accent: "text-amber-400"  },
  { href: "/finance",  label: "Finance",     icon: Banknote,    accent: "text-emerald-400"},
  { href: "/own",      label: "Rent to Own", icon: KeyRound,    accent: "text-purple-400" },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PlatformNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
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

  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleSignOut() {
    setMobileOpen(false)
    await authClient.signOut()
    await refetchSession()
    router.push("/")
    router.refresh()
  }

  const user = sessionData?.user ?? null

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#060d1f]/90 backdrop-blur-xl shadow-lg shadow-black/20"
      data-emz-support-email={PUBLIC_CONTACT_EMAIL}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center transition hover:opacity-80">
          <Image
            src="/emz.png"
            alt="EMZ easymovezone"
            width={52}
            height={32}
            className="h-8 w-auto object-contain brightness-0 invert"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "group flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200",
                  active
                    ? "bg-white/10 text-white ring-1 ring-white/20"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <Icon className={clsx("h-3.5 w-3.5 shrink-0 transition-colors", active ? "text-white" : link.accent)} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {sessionPending ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/dashboard"
                className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth?mode=signup"
                className="hidden rounded-full border border-white/15 px-4 py-2 text-[13px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:inline-block"
              >
                Register
              </Link>
              <Link
                href="/auth"
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-[13px] font-bold text-white shadow-md transition hover:brightness-110 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                <UserRound className="h-3.5 w-3.5 shrink-0 opacity-90" />
                Sign in
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.08] bg-[#060d1f]/95 px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold transition",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  <Icon className={clsx("h-4.5 w-4.5 shrink-0", active ? "text-white" : link.accent)} />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-4 border-t border-white/[0.08] pt-4">
            {sessionPending ? (
              <div className="h-11 animate-pulse rounded-xl bg-white/5" />
            ) : user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                  className="block rounded-xl bg-white/10 px-4 py-3 text-center text-[14px] font-semibold text-white">
                  Dashboard
                </Link>
                <button type="button" onClick={handleSignOut}
                  className="mt-2 w-full rounded-xl border border-white/15 px-4 py-3 text-[14px] font-medium text-slate-300">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth?mode=signup" onClick={() => setMobileOpen(false)}
                  className="block rounded-xl border border-white/15 px-4 py-3 text-center text-[14px] font-medium text-slate-300">
                  Register
                </Link>
                <Link href="/auth" onClick={() => setMobileOpen(false)}
                  className="mt-2 block rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-center text-[14px] font-bold text-white shadow-md">
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
