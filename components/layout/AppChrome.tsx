"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"
import { SupportWidget } from "@/components/platform/SupportWidget"
import { ClientErrorBoundary } from "@/components/monitoring/ClientErrorBoundary"

const MARKETING_OWN_CHROME = new Set([
  "/",
  "/services",
  "/quote",
  "/track",
  "/about",
  "/driver",
  "/company",
  "/cars",
  "/finance",
  "/sell",
  "/saved",
  "/account",
  "/enquire",
  "/how-it-works",
  "/contact",
  "/parts",
  "/garages",
])

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuth = pathname === "/auth" || pathname.startsWith("/auth/")
  const isStart = pathname === "/start"
  const isMarketingLanding =
    MARKETING_OWN_CHROME.has(pathname) ||
    pathname.startsWith("/cars/") ||
    pathname.startsWith("/parts/") ||
    pathname.startsWith("/garages/")
  const isApp =
    pathname === "/move" ||
    pathname.startsWith("/move/") ||
    pathname === "/fleet" ||
    pathname.startsWith("/fleet/") ||
    pathname === "/app" ||
    pathname.startsWith("/app/")
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/")

  useEffect(() => {
    document.body.classList.toggle("move-app-active", isApp)
    // Marketing pages end on a dark footer — match body so no cream strip peeks below.
    document.body.classList.toggle("emz-marketing", isMarketingLanding)
    return () => {
      document.body.classList.remove("move-app-active")
      document.body.classList.remove("emz-marketing")
    }
  }, [isApp, isMarketingLanding])

  if (isStart) {
    return (
      <ClientErrorBoundary>
        <main className="min-w-0">{children}</main>
      </ClientErrorBoundary>
    )
  }

  if (isMarketingLanding) {
    // No flex-1 — that stretched main past the footer and left empty white space.
    return (
      <ClientErrorBoundary>
        <main className="min-w-0">
          {children}
          <SupportWidget />
        </main>
      </ClientErrorBoundary>
    )
  }

  if (isAuth) {
    return (
      <ClientErrorBoundary>
        <main className="flex-1 min-w-0">
          {children}
          <SupportWidget />
        </main>
      </ClientErrorBoundary>
    )
  }

  return (
    <ClientErrorBoundary>
      {!isApp && <PlatformNav />}
      <main className={`flex-1 min-w-0${isApp ? " overflow-hidden" : ""}`}>{children}</main>
      {!isApp && <PlatformFooter />}
      {!isAdmin && !isApp && <SupportWidget />}
    </ClientErrorBoundary>
  )
}
