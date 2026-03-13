import Link from "next/link"
import { Store, UserPlus } from "lucide-react"
import { PublicShell } from "@/components/platform/PublicShell"
import { HubClient } from "@/components/platform/HubClient"
import { HubChatWidget } from "@/components/platform/HubChatWidget"

export default function HubPage() {
  return (
    <PublicShell>
      <main className="min-w-0 flex-1">
        {/* Hero — icon + text only, no header-style background */}
        <section className="border-b border-[#e2e8f0] bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff]">
              <Store className="h-6 w-6 text-[#155eef]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a] sm:text-3xl">
                The Hub
              </h1>
              <p className="mt-0.5 text-sm text-[#64748b]">
                Financing, brokers, and services in one place. Ask the advisor anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Single filter + integrated content (vendors + financing) */}
        <HubClient />

        {/* CTA: become a vendor */}
        <section className="border-t border-[#e2e8f0] bg-[#0f172a]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
            <div className="flex items-center gap-4 text-center lg:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                <UserPlus className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-[var(--font-playfair)] text-xl font-bold text-white sm:text-2xl">
                  Sell on EasyMoveZone
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  Get verified and reach families and professionals planning their move.
                </p>
              </div>
            </div>
            <Link
              href="/contact?direction=Vendor%20marketplace%20onboarding"
              className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-white/90"
            >
              Get listed as a vendor →
            </Link>
          </div>
        </section>
      </main>

      {/* Floating collapsible chatbot — fixed bottom-right, doesn't affect layout */}
      <HubChatWidget />
    </PublicShell>
  )
}
