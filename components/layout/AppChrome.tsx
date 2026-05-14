"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

// These pages use the full-screen app shell (sidebar nav) — no top nav or footer
const APP_SHELL_PATHS = [
  "/dashboard",
  "/explore",
  "/community",
  "/ai",
  "/landlord",
  "/partner",
  "/profile",
]

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuthPage = pathname === "/auth" || pathname.startsWith("/auth/")
  const isOnboarding = pathname === "/onboarding" || pathname.startsWith("/onboarding/")
  const isAppShell = APP_SHELL_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (isAuthPage || isOnboarding || isAppShell) {
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
