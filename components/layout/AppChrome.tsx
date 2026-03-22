"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pageHasOwnChrome =
    pathname === "/" ||
    pathname === "/search" ||
    pathname === "/about" ||
    pathname === "/auth" ||
    pathname === "/profile" ||
    pathname.startsWith("/properties") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/portal")

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
