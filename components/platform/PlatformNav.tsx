"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu, X, ShieldCheck, LayoutDashboard } from "lucide-react"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth/client"

const navItems = [
  { href: "/search", label: "Browse Properties" },
  { href: "/about", label: "How It Works" },
]

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
    <header className="emz-nav-glow sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#155eef]/35 to-transparent" />
      <div className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#155eef] flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-[var(--font-playfair)] text-[19px] font-bold tracking-tight text-[#0f172a]">
              EasyMove<span className="bg-gradient-to-r from-[#155eef] to-[#0f766e] bg-clip-text text-transparent">Zone</span>
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              Trusted African Property
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#155eef]/8 text-[#155eef] font-semibold"
                    : "text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}

          <div className="ml-2 h-5 w-px bg-[#e2e8f0]" />

          {sessionPending ? (
            <div className="ml-2 h-10 w-24 animate-pulse rounded-full bg-[#f1f5f9]" />
          ) : user ? (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#155eef] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#1249d1]"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] px-3 py-2 text-[13px] font-medium text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href="/auth"
                className="rounded-full border border-[#e2e8f0] px-4 py-2 text-[14px] font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
              >
                Sign in
              </Link>
              <Link
                href="/auth?mode=signup"
                className="rounded-full bg-[#155eef] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#1249d1]"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#0f172a] md:hidden"
          onClick={() => setIsOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-[#e2e8f0] bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-xl px-4 py-3 text-[15px] font-medium ${
                    isActive ? "bg-[#155eef]/8 text-[#155eef]" : "text-[#475569]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="my-2 h-px bg-[#e2e8f0]" />
            {sessionPending ? (
              <div className="h-11 animate-pulse rounded-xl bg-[#f1f5f9]" />
            ) : user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="rounded-xl bg-[#155eef] px-4 py-3 text-center text-[15px] font-semibold text-white">
                  Dashboard
                </Link>
                <button type="button" onClick={handleSignOut} className="mt-1 rounded-xl border border-[#e2e8f0] px-4 py-3 text-[15px] font-medium text-[#64748b]">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" onClick={() => setIsOpen(false)} className="rounded-xl border border-[#e2e8f0] px-4 py-3 text-center text-[15px] font-medium text-[#0f172a]">
                  Sign in
                </Link>
                <Link href="/auth?mode=signup" onClick={() => setIsOpen(false)} className="rounded-xl bg-[#155eef] px-4 py-3 text-center text-[15px] font-semibold text-white">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
