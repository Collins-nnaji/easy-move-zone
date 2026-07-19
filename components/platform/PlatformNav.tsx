"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LogOut,
  Menu,
  Truck,
  Mail,
  UserRound,
  User,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { authClient } from "@/lib/auth/client"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"
import { loadDriverFlowState } from "@/app/move/storage"
import { SiteLogo } from "@/components/brand/SiteLogo"

const guideLinks = [
  { href: "/move", label: "Open the app", icon: Truck },
  { href: "/contact", label: "Contact", icon: Mail },
] as const

export function PlatformNav() {
  const pathname = usePathname()
  const { data: sessionData, isPending: sessionPending, refetch: refetchSession } = authClient.useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [resumable, setResumable] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setResumable(!!loadDriverFlowState()?.completed)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => { void refetchSession() }, 120)
    return () => clearTimeout(timeout)
  }, [pathname, refetchSession])

  useEffect(() => {
    const onFocus = () => { void refetchSession() }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refetchSession])

  // Close the menu whenever the route changes.
  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  async function handleSignOut() {
    setMenuOpen(false)
    try {
      await authClient.signOut()
    } catch {
      // Even if the sign-out request fails, force a full reload below so the
      // user isn't left in a stuck, ambiguous signed-in-looking state.
    }
    // A hard navigation (not router.push/refresh) guarantees every server
    // component re-reads the now-cleared session cookie, instead of relying
    // on client-side cache invalidation that can leave stale account state
    // visible in the nav until a manual refresh.
    window.location.href = "/"
  }

  function getInitials(name?: string | null, email?: string | null) {
    if (name) {
      const parts = name.trim().split(/\s+/)
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase()
    }
    return email ? email[0].toUpperCase() : "U"
  }

  const user = sessionData?.user ?? null
  const initials = getInitials(user?.name, user?.email)
  const onMove = pathname === "/move" || pathname.startsWith("/move/")

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#e4dfd5] bg-[#f6f3ec]/95 backdrop-blur-xl"
      data-emz-support-email={PUBLIC_CONTACT_EMAIL}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <SiteLogo href="/" height={32} priority />

        {/* Right side: primary CTA + a single account/menu dropdown */}
        <div className="flex items-center gap-2">
          {!onMove && (
            <Link
              href="/move"
              className="hidden items-center gap-1.5 rounded-full bg-[#e0511f] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:opacity-90 sm:inline-flex"
            >
              <Truck className="h-3.5 w-3.5" />
              {resumable ? "Continue driving" : "Browse shifts"}
            </Link>
          )}

          <div className="relative" ref={menuRef}>
            {sessionPending ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-black/5" />
            ) : user ? (
              <button
                type="button"
                onClick={() => setMenuOpen((p) => !p)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#e0511f] to-[#bf6a3c] text-[13px] font-bold text-white shadow-sm ring-1 ring-black/5 transition hover:brightness-105"
                aria-label="Account menu"
                aria-expanded={menuOpen}
              >
                {initials}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d8d2c6] bg-white px-4 py-2 text-[13px] font-semibold text-[#4a5047] transition hover:border-[#e0511f]/40 hover:text-[#1b231e]"
                >
                  <UserRound className="h-3.5 w-3.5 opacity-80" />
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen((p) => !p)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#6e746b] transition hover:bg-black/5 hover:text-[#1b231e]"
                  aria-label="Menu"
                  aria-expanded={menuOpen}
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            )}

            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 min-w-[224px] overflow-hidden rounded-2xl border border-[#e4dfd5] bg-white py-2 shadow-2xl shadow-black/10">
                {user && (
                  <div className="border-b border-[#efe9dd] px-4 pb-2.5 pt-1">
                    <p className="truncate text-[13px] font-semibold text-[#1b231e]">{user.name ?? "Account"}</p>
                    <p className="truncate text-[11px] text-[#9aa097]">{user.email}</p>
                  </div>
                )}

                {guideLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#4a5047] transition hover:bg-[#faf8f3] hover:text-[#1b231e]"
                  >
                    <Icon className="h-4 w-4 text-[#e0511f]" />
                    {label}
                  </Link>
                ))}

                <div className="mt-1 border-t border-[#efe9dd] pt-1">
                  {user ? (
                    <>
                      <Link
                        href={onMove ? "/profile?from=move" : "/profile"}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#4a5047] transition hover:bg-[#faf8f3] hover:text-[#1b231e]"
                      >
                        <User className="h-4 w-4 text-[#9aa097]" />
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#c0492a] transition hover:bg-[#fbeae0]"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth?mode=signup"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#4a5047] transition hover:bg-[#faf8f3] hover:text-[#1b231e]"
                    >
                      <UserRound className="h-4 w-4 text-[#9aa097]" />
                      Create account
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
