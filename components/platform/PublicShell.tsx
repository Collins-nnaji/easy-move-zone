import type { ReactNode } from "react"
import { PlatformNav } from "@/components/platform/PlatformNav"
import { PlatformFooter } from "@/components/platform/PlatformFooter"

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#1a1a1a]">
      <PlatformNav />
      <main>{children}</main>
      <PlatformFooter />
    </div>
  )
}
