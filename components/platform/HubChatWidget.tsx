"use client"

import { useState } from "react"
import { MessageCircle, X, Sparkles } from "lucide-react"
import { MortgageFinder } from "@/components/platform/MortgageFinder"

export function HubChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating button — fixed bottom-right, doesn't affect layout */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Hub Advisor"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e0511f] text-white shadow-lg transition hover:bg-[#0d4bc9] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#e0511f] focus:ring-offset-2 [bottom:max(1.5rem,env(safe-area-inset-bottom))] [right:max(1.5rem,env(safe-area-inset-right))]"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Popup panel — fixed, collapsible */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop on mobile */}
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/30 sm:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div className="relative flex h-[85vh] max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-[#e2e8f0] bg-white shadow-2xl sm:h-[560px] sm:max-h-none sm:w-[400px] sm:rounded-2xl sm:border-2">
            <div className="flex shrink-0 items-center justify-between border-b border-[#e8edf6] bg-[#f8fbff] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e0511f]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0f172a]">Hub Advisor</p>
                  <p className="text-[11px] text-[#64748b]">Mortgage, move questions &amp; more</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#e2e8f0] hover:text-[#0f172a]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <MortgageFinder />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
