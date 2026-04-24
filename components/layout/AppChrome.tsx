"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pageHasOwnChrome =
    pathname === "/" ||
    pathname === "/search" ||
    pathname === "/contact" ||
    pathname === "/mortgage" ||
    pathname === "/auth" ||
    pathname === "/profile" ||
    pathname.startsWith("/properties") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/produce") ||
    pathname.startsWith("/transporters") ||
    pathname.startsWith("/price-board") ||
    pathname.startsWith("/shipments")

  if (pageHasOwnChrome) {
    return <main className="flex-1 min-w-0">{children}</main>
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#050a06] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-emerald-500/15 blur-[140px]" />
        <div className="absolute -bottom-40 left-0 h-[380px] w-[380px] rounded-full bg-lime-500/10 blur-[130px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      </div>
      <PlatformNav />
      <main className="flex-1">{children}</main>
      <PlatformFooter />
    </div>
  )
}
