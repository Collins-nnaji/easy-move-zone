"use client"

import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

export function FilterGroup({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-lg bg-[#faf8f3]">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-2.5 py-1.5 text-left">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#6e746b]">{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#9aa097] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="space-y-1.5 px-2.5 pb-2.5">{children}</div> : null}
    </div>
  )
}
