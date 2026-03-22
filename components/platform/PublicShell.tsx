import type { ReactNode } from "react"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen min-w-0 overflow-x-hidden text-[#0f172a]">
      <div className="emz-page-bg" aria-hidden />
      <div className="relative z-10 flex min-h-screen min-w-0 flex-col">
        <PlatformNav />
        <main className="min-w-0 flex-1">{children}</main>
        <PlatformFooter />
      </div>
    </div>
  )
}
