"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"
import { SupportWidget } from "@/components/platform/SupportWidget"
import { ClientErrorBoundary } from "@/components/monitoring/ClientErrorBoundary"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuth = pathname === "/auth" || pathname.startsWith("/auth/")
  // The role chooser is the app entry point — render it full-bleed with no
  // marketing nav/footer so it feels like a native app splash.
  const isStart = pathname === "/start"
  // Audience landings bring their own nav + footer (LandingNav/LandingFooter),
  // so the shared marketing chrome must not be added on top.
  const isLanding = pathname === "/driver" || pathname === "/company"
  const isApp =
    pathname === "/move" ||
    pathname.startsWith("/move/") ||
    pathname === "/fleet" ||
    pathname.startsWith("/fleet/")
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/")

  useEffect(() => {
    document.body.classList.toggle("move-app-active", isApp)
    return () => {
      document.body.classList.remove("move-app-active")
    }
  }, [isApp])

  if (isStart) {
    return (
      <ClientErrorBoundary>
        <main className="flex-1 min-w-0">{children}</main>
      </ClientErrorBoundary>
    )
  }

  if (isLanding) {
    return (
      <ClientErrorBoundary>
        <main className="flex-1 min-w-0">
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
