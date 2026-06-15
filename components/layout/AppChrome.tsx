"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Auth pages and the immersive /move experience get no chrome — full-screen layout
  const isAuthPage = pathname === "/auth" || pathname.startsWith("/auth/")
  const isImmersive = pathname === "/move" || pathname.startsWith("/move/")

  if (isAuthPage || isImmersive) {
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
