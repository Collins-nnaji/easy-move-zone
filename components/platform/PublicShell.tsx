import type { ReactNode } from "react"

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-w-0 overflow-x-hidden text-[#1A1612]">
      <div className="relative z-10 min-w-0">{children}</div>
    </div>
  )
}
