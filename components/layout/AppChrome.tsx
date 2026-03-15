"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pageHasOwnChrome =
    pathname === "/" ||
    pathname === "/services" ||
    pathname === "/individual" ||
    pathname === "/corporate" ||
    pathname === "/pricing" ||
    pathname === "/about" ||
    pathname === "/index" ||
    pathname === "/auth" ||
    pathname === "/profile" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/corp")

  if (pageHasOwnChrome) {
    return <main className="flex-1 min-w-0">{children}</main>
  }

  return (
    <>
      <PlatformNav />
      <main className="flex-1">{children}</main>
      <PlatformFooter />
    </>
  )
}
