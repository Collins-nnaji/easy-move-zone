"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth/client"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/markets", label: "Markets" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f0e8]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-[var(--font-playfair)] text-xl font-black tracking-tight text-[#0d0d0d]">
          Easy<span className="text-[#c9a84c]">Move</span>Zone
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-[15px] transition ${
                  isActive ? "bg-[#ede8de] text-[#0d0d0d]" : "text-[#6b6560] hover:bg-[#ede8de] hover:text-[#0d0d0d]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          {sessionPending ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-[#ede8de]" />
          ) : user ? (
            <>
              <Link
                href="/dashboard/client"
                className="ml-2 rounded-full border border-black/15 px-4 py-2 text-[15px] font-medium text-[#0d0d0d]"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 rounded-full bg-[#0d0d0d] px-4 py-2 text-[15px] font-medium text-[#f5f0e8] transition hover:bg-[#1a3a2a]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="ml-2 rounded-full border border-black/15 px-4 py-2 text-[15px] font-medium text-[#0d0d0d]"
              >
                Sign in
              </Link>
              <Link
                href="/contact?direction=inbound"
                className="emz-pill-cta rounded-full bg-[#0d0d0d] px-4 py-2 text-[15px] font-medium text-[#f5f0e8] transition hover:bg-[#1a3a2a]"
              >
                Start Your Move
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#0d0d0d] md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-black/10 bg-[#f5f0e8] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-3 py-2 text-base ${
                    isActive ? "bg-[#ede8de] text-[#0d0d0d]" : "text-[#6b6560]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {sessionPending ? (
              <div className="h-10 animate-pulse rounded-full bg-[#ede8de]" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard/client"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-black/15 px-4 py-2 text-center text-base text-[#0d0d0d]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-1 rounded-full bg-[#0d0d0d] px-4 py-2 text-center text-base font-medium text-[#f5f0e8]"
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
                  className="rounded-full border border-black/15 px-4 py-2 text-center text-base text-[#0d0d0d]"
                >
                  Sign in
                </Link>
                <Link
                  href="/contact?direction=inbound"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-[#0d0d0d] px-4 py-2 text-center text-base font-medium text-[#f5f0e8]"
                >
                  Start Your Move
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
