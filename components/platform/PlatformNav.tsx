"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth/client"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Listings" },
  { href: "/intelligence", label: "Neighbourhood Intel" },
  { href: "/markets", label: "Cities" },
  { href: "/about", label: "About" },
  { href: "/get-help", label: "Get Help" },
]

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
    <header className="sticky top-0 z-50 border-b border-[#d9e3f1]/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="leading-tight">
          <p className="font-[var(--font-playfair)] text-2xl font-bold tracking-tight text-[#0f172a]">
            EasyMoveZone
          </p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#155eef]">Property Finder</p>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-[14px] font-medium transition ${
                  isActive
                    ? "bg-[#eaf1ff] text-[#155eef]"
                    : "text-[#475569] hover:bg-[#eef4ff] hover:text-[#0f172a]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          {sessionPending ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-[#eef4ff]" />
          ) : user ? (
            <>
              <Link
                href="/dashboard/client"
                className="ml-2 rounded-full border border-[#c8d8f0] px-4 py-2 text-[14px] font-semibold text-[#0f172a]"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 rounded-full bg-[#0f172a] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#1e293b]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="ml-2 rounded-full border border-[#c8d8f0] px-4 py-2 text-[14px] font-semibold text-[#0f172a]"
              >
                Sign in
              </Link>
              <Link
                href="/contact?direction=Domestic%20move%20within%20Nigeria"
                className="emz-pill-cta rounded-full px-4 py-2 text-[14px] font-semibold"
              >
                Start My Move
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#0f172a] md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-[#d9e3f1] bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-3 py-2 text-base ${
                    isActive ? "bg-[#eaf1ff] text-[#155eef]" : "text-[#475569]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {sessionPending ? (
              <div className="h-10 animate-pulse rounded-full bg-[#eef4ff]" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard/client"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-[#c8d8f0] px-4 py-2 text-center text-base text-[#0f172a]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-1 rounded-full bg-[#0f172a] px-4 py-2 text-center text-base font-medium text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-[#c8d8f0] px-4 py-2 text-center text-base text-[#0f172a]"
                >
                  Sign in
                </Link>
                <Link
                  href="/contact?direction=Domestic%20move%20within%20Nigeria"
                  onClick={() => setIsOpen(false)}
                  className="emz-pill-cta rounded-full px-4 py-2 text-center text-base font-semibold"
                >
                  Start My Move
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
