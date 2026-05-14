"use client"

import { useState, useCallback, useEffect } from "react"
import { clsx } from "clsx"
import { Menu } from "lucide-react"

/**
 * Mobile drawer for `.relo-sidebar`: off-canvas below lg, static sidebar on lg+.
 */
export function useReloMobileNav() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const openNav = useCallback(() => setOpen(true), [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const asideClassName = clsx(
    "relo-sidebar fixed inset-y-0 left-0 z-[60] h-[100dvh] w-[min(17.75rem,calc(100vw-2.5rem))] max-w-[300px] border-r border-[#E4DFDA] transition-transform duration-200 ease-out motion-reduce:transition-none lg:static lg:z-auto lg:h-auto lg:max-w-none lg:w-[220px] lg:translate-x-0",
    open ? "translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.12)]" : "-translate-x-full lg:translate-x-0"
  )

  const backdrop =
    open ? (
      <button
        type="button"
        aria-label="Close navigation"
        className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-[1px] lg:hidden"
        onClick={close}
      />
    ) : null

  const menuButton = (
    <button
      type="button"
      className="lg:hidden -ml-0.5 mr-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E4DFDA] text-[#1A1612] hover:bg-[#F0EDE8] active:bg-[#EDE9E4]"
      onClick={openNav}
      aria-expanded={open}
      aria-controls="relo-app-sidebar"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" strokeWidth={2} />
    </button>
  )

  return { open, close, asideClassName, backdrop, menuButton }
}
