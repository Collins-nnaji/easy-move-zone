"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"
import { SupportWidget } from "@/components/platform/SupportWidget"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuth = pathname === "/auth" || pathname.startsWith("/auth/")
  const isApp =
    pathname === "/move" ||
    pathname.startsWith("/move/") ||
    pathname === "/fleet" ||
    pathname.startsWith("/fleet/")
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/")

  if (isAuth) {
    return (
      <main className="flex-1 min-w-0">
        {children}
        <SupportWidget />
      </main>
    )
  }

  return (
    <>
      {!isApp && <PlatformNav />}
      <main className="flex-1 min-w-0">{children}</main>
      {!isApp && <PlatformFooter />}
      {!isAdmin && !isApp && <SupportWidget />}
    </>
  )
}
