"use client"

import { usePathname } from "next/navigation"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Auth pages get no chrome at all — full-screen layout
  const isAuthPage = pathname === "/auth" || pathname.startsWith("/auth/")
  // The /move "find a city" experience keeps the nav (so you can always get
  // home) but drops the footer to stay app-like and immersive.
  const isMove = pathname === "/move" || pathname.startsWith("/move/")

  if (isAuthPage) {
    return <main className="flex-1 min-w-0">{children}</main>
  }

  if (isMove) {
    return (
      <>
        <PlatformNav />
        <main className="flex-1 min-w-0">{children}</main>
      </>
    )
  }

  return (
    <>
      <PlatformNav />
      <main className="flex-1 min-w-0">{children}</main>
      <PlatformFooter />
    </>
  )
}
