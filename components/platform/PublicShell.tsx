import type { ReactNode } from "react"

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-w-0 overflow-x-hidden text-[#0f172a]">
      <div className="emz-page-bg" aria-hidden />
      <div className="relative z-10 min-w-0">{children}</div>
    </div>
  )
}
