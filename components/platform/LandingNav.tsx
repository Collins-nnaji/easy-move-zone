"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SiteLogo } from "@/components/brand/SiteLogo"
import { authClient } from "@/lib/auth/client"

const LINKS = [
  { href: "/cars", label: "Cars" },
  { href: "/parts", label: "Parts" },
  { href: "/garages", label: "Garages" },
] as const

export function LandingNav() {
  const pathname = usePathname()
  const { data } = authClient.useSession()
  const signedIn = Boolean(data?.user)

  return (
    <header className="sticky top-0 z-50 border-b border-[#e4dfd5] bg-[#f6f3ec]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <SiteLogo href="/" height={28} priority />

        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" aria-label="Primary">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                  active ? "bg-white text-[#1b231e] shadow-sm" : "text-[#4a5047] hover:text-[#1b231e]"
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        {signedIn ? (
          <Link
            href="/account"
            className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold ${
              pathname === "/account" ? "bg-[#e0511f] text-white" : "text-[#4a5047] hover:text-[#1b231e]"
            }`}
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/auth?redirect=/account"
            className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#4a5047]"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
