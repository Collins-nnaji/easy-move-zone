import Link from "next/link"
import { Store, UserPlus } from "lucide-react"
import { PublicShell } from "@/components/platform/PublicShell"
import { MarketplaceClient } from "@/components/platform/MarketplaceClient"
import {
  VENDOR_CATEGORIES,
  MOVE_VENDORS,
} from "@/lib/marketplace/vendors"

export default function MarketplacePage() {
  return (
    <PublicShell>
      {/* Marketplace hero — compact, browse-style */}
      <section className="border-b border-[#e2e8f0] bg-gradient-to-b from-[#f8fbff] to-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#155eef] text-white">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a] sm:text-3xl">
                  Move services marketplace
                </h1>
                <p className="mt-0.5 text-sm text-[#64748b]">
                  Verified vendors for logistics, packing, storage, removals &amp; more
                </p>
              </div>
            </div>
            <p className="text-xs text-[#94a3b8] sm:text-right">
              {MOVE_VENDORS.length} verified service{MOVE_VENDORS.length !== 1 ? "s" : ""} · Browse by category or country
            </p>
          </div>
        </div>
      </section>

      {/* Main marketplace: filters + grid */}
      <section className="min-h-[60vh]">
        <MarketplaceClient categories={VENDOR_CATEGORIES} vendors={MOVE_VENDORS} />
      </section>

      {/* CTA: become a vendor — marketplace-style "Sell with us" strip */}
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
    </PublicShell>
  )
}
