import type { ReactNode } from "react"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="emz-surface min-h-screen min-w-0 text-[#1a1a1a]">
      <PlatformNav />
      <main className="emz-soft-enter min-w-0 pb-6">{children}</main>
      <PlatformFooter />
    </div>
  )
}
