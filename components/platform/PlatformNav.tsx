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
  User,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { authClient } from "@/lib/auth/client"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"
import { clsx } from "clsx"

const navLinks = [
  { href: "/purchase", label: "Purchase"    },
  { href: "/build",    label: "Build"       },
  { href: "/finance",  label: "Finance"     },
  { href: "/own",      label: "Rent to Own" },
  { href: "/relocate/hub", label: "Relocate" },
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
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    if (avatarOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [avatarOpen])

  function getInitials(name?: string | null, email?: string | null) {
    if (name) {
      const parts = name.trim().split(/\s+/)
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase()
    }
    return email ? email[0].toUpperCase() : "U"
  }

  const initials = getInitials(user?.name, user?.email)

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
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-full px-4 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                )}
              >
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
            <div className="relative flex items-center gap-1.5" ref={avatarRef}>
              <button
                type="button"
                onClick={() => setAvatarOpen((p) => !p)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-[13px] font-bold text-white shadow-md ring-2 ring-white/10 transition hover:ring-white/30 hover:shadow-cyan-500/30"
                aria-label="Account menu"
                aria-expanded={avatarOpen}
              >
                {initials}
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-11 z-50 min-w-[200px] rounded-2xl border border-white/10 bg-[#0f1b33] py-2 shadow-2xl shadow-black/50">
                  <div className="border-b border-white/10 px-4 pb-2.5 pt-1">
                    <p className="text-[13px] font-semibold text-white truncate">{user.name ?? "Account"}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <LayoutDashboard className="h-4 w-4 text-cyan-400" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Profile
                  </Link>
                  <div className="mt-1 border-t border-white/10 pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
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
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "rounded-xl px-4 py-3 text-[14px] font-semibold transition",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
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
