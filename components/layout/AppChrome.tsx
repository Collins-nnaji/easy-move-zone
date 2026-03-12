"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pageHasOwnChrome =
    pathname === "/" ||
    pathname === "/services" ||
    pathname === "/listings" ||
    pathname === "/markets" ||
    pathname === "/cities" ||
    pathname === "/contact" ||
    pathname === "/auth" ||
    pathname === "/mortgage" ||
    pathname.startsWith("/relocate") ||
    pathname.startsWith("/admin")

  if (pageHasOwnChrome) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      <PlatformNav />
      <main className="flex-1">{children}</main>
      <PlatformFooter />
    </>
  )
}
