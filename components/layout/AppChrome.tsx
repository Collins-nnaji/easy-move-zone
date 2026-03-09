"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pageHasOwnChrome =
    pathname === "/" ||
    pathname === "/services" ||
    pathname === "/markets" ||
    pathname === "/contact" ||
    pathname === "/auth"

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
