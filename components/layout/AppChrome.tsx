"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Auth and move app get no chrome — full-screen mobile layout
  const isFullScreen =
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/move" ||
    pathname.startsWith("/move/")

  if (isFullScreen) {
    return <main className="flex-1 min-w-0">{children}</main>
  }

  return (
    <>
      <PlatformNav />
      <main className="flex-1 min-w-0">{children}</main>
      <PlatformFooter />
    </>
  )
}
