import type { Metadata } from "next"
import { Suspense } from "react"
import { PublicShell } from "@/components/platform/PublicShell"
import { TrackClient } from "@/components/produce/TrackClient"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Track a shipment",
  description: "Track an EasyMoveZone produce shipment from loading to the market or the port.",
  path: "/track",
})

export default function TrackPage() {
  return (
    <PublicShell>
      <Suspense fallback={<div className="px-4 py-16 text-sm text-[#5f655c]">Loading tracking…</div>}>
        <TrackClient />
      </Suspense>
    </PublicShell>
  )
}
