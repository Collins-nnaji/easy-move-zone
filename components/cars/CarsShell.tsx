"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Home, Search, UserRound } from "lucide-react"
import type { ReactNode } from "react"
import { LandingNav } from "@/components/platform/LandingNav"
import { LandingFooter } from "@/components/platform/LandingFooter"

export function CarsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const lockBrowse =
    pathname === "/cars" ||
    pathname === "/garages" ||
    /^\/cars\/[^/]+$/.test(pathname) ||
    /^\/garages\/[^/]+$/.test(pathname)

  return (
    <div
      className={`flex flex-col ${
        lockBrowse
          ? "h-dvh overflow-hidden pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0"
          : "min-h-screen pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0"
      }`}
      style={{ background: "#efece4", color: "#1b231e" }}
    >
      <LandingNav />
      <div className={lockBrowse ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "flex-1"}>{children}</div>
      {lockBrowse ? null : <LandingFooter />}
      <CarsBottomNav />
    </div>
  )
}

const TABS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/cars", label: "Cars", icon: Search, match: (p: string) => p.startsWith("/cars") },
  { href: "/garages", label: "Map", icon: Heart, match: (p: string) => p.startsWith("/garages") || p.startsWith("/parts") },
  { href: "/account", label: "Garage", icon: UserRound, match: (p: string) => p === "/account" || p === "/enquire" },
] as const

function CarsBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e4dfd5] bg-[#f6f3ec]/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile"
    >
      <div className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.match(pathname)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold ${
                active ? "text-[#e0511f]" : "text-[#6e746b]"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
