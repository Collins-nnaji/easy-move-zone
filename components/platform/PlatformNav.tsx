"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  MapPin,
  Users,
  Bot,
} from "lucide-react"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth/client"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"
import { clsx } from "clsx"
import { BrandLogoLink } from "@/components/platform/BrandLogoLink"

const navLinks = [
  { href: "/explore",   label: "Explore",    icon: MapPin },
  { href: "/community", label: "Community",  icon: Users },
  { href: "/ai",        label: "AI Concierge", icon: Bot },
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
      className="sticky top-0 z-50 bg-white border-b border-[#E4DFDA]"
      data-emz-support-email={PUBLIC_CONTACT_EMAIL}
    >
      <div className="mx-auto flex h-[60px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <BrandLogoLink size="nav" className="gap-2" />

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
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all duration-200",
                  active
                    ? "bg-[rgba(232,92,45,0.1)] text-[#E85C2D]"
                    : "text-[#6B6460] hover:bg-[#F0EDE8] hover:text-[#1A1612]"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {sessionPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-[#EDE9E4]" />
          ) : user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/dashboard"
                className="hidden items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-[#6B6460] transition hover:bg-[#F0EDE8] hover:text-[#1A1612] sm:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4DFDA] text-[#6B6460] transition hover:bg-[#F0EDE8] hover:text-[#1A1612]"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth?mode=signup"
                className="hidden rounded-lg border border-[#E4DFDA] px-4 py-2 text-[13px] font-semibold text-[#6B6460] transition hover:bg-[#F0EDE8] hover:text-[#1A1612] sm:inline-block"
              >
                Register
              </Link>
              <Link
                href="/auth"
                className="flex items-center gap-1.5 rounded-lg bg-[#E85C2D] px-4 py-2 text-[13px] font-bold text-white shadow-md transition hover:bg-[#D44E22]"
              >
                Sign in
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6B6460] transition hover:bg-[#F0EDE8] lg:hidden"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#E4DFDA] bg-white px-4 py-4 lg:hidden">
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
                      ? "bg-[rgba(232,92,45,0.1)] text-[#E85C2D]"
                      : "text-[#6B6460] hover:bg-[#F0EDE8] hover:text-[#1A1612]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-4 border-t border-[#E4DFDA] pt-4">
            {sessionPending ? (
              <div className="h-11 animate-pulse rounded-xl bg-[#EDE9E4]" />
            ) : user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                  className="block rounded-xl bg-[rgba(232,92,45,0.1)] px-4 py-3 text-center text-[14px] font-semibold text-[#E85C2D]">
                  Dashboard
                </Link>
                <button type="button" onClick={handleSignOut}
                  className="mt-2 w-full rounded-xl border border-[#E4DFDA] px-4 py-3 text-[14px] font-semibold text-[#6B6460]">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth?mode=signup" onClick={() => setMobileOpen(false)}
                  className="block rounded-xl border border-[#E4DFDA] px-4 py-3 text-center text-[14px] font-semibold text-[#6B6460]">
                  Register
                </Link>
                <Link href="/auth" onClick={() => setMobileOpen(false)}
                  className="mt-2 block rounded-xl bg-[#E85C2D] px-4 py-3 text-center text-[14px] font-bold text-white">
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
