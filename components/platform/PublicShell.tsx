import type { ReactNode } from "react"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="emz-surface min-h-screen text-[#1a1a1a]">
      <PlatformNav />
      <main className="emz-soft-enter">{children}</main>
      <PlatformFooter />
    </div>
  )
}
