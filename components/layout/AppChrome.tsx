"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Auth stays fully chrome-free (focused sign-in card).
  const isAuth = pathname === "/auth" || pathname.startsWith("/auth/")
  // The Move app is the product: it keeps the minimal header but no marketing footer.
  const isApp = pathname === "/move" || pathname.startsWith("/move/")

  if (isAuth) {
    return <main className="flex-1 min-w-0">{children}</main>
  }

  return (
    <>
      <PlatformNav />
      <main className="flex-1 min-w-0">{children}</main>
      {!isApp && <PlatformFooter />}
    </>
  )
}
