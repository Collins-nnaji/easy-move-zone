import type { ReactNode } from "react"

/** Cream shell for marketing pages — no fixed full-viewport overlay that peeks past the footer. */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden text-[#1b231e]"
      style={{ background: "#efece4" }}
    >
      {children}
    </div>
  )
}
