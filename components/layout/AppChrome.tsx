"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"
import { SupportWidget } from "@/components/platform/SupportWidget"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Auth stays fully chrome-free (focused sign-in card).
  const isAuth = pathname === "/auth" || pathname.startsWith("/auth/")
  // The Move app is the product: it keeps the minimal header but no marketing footer.
  const isApp = pathname === "/move" || pathname.startsWith("/move/")
  // Admins have their own support channels — keep the widget off those screens.
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
      <PlatformNav />
      <main className="flex-1 min-w-0">{children}</main>
      {!isApp && <PlatformFooter />}
      {!isAdmin && <SupportWidget />}
    </>
  )
}
