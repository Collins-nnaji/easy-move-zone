"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"
import { SupportWidget } from "@/components/platform/SupportWidget"
import { ClientErrorBoundary } from "@/components/monitoring/ClientErrorBoundary"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth = pathname === "/auth" || pathname.startsWith("/auth/")
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/")
  const isHomeLanding = pathname === "/"

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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PlatformNav />
        <main className="min-h-0 min-w-0 flex-1">{children}</main>
        {isHomeLanding && <PlatformFooter />}
        {!isAdmin && <SupportWidget />}
      </div>
    </ClientErrorBoundary>
  )
}
