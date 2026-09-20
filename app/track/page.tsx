import type { Metadata } from "next"
import { Suspense } from "react"
import { PublicShell } from "@/components/platform/PublicShell"
import { TrackPageClient } from "@/components/platform/TrackPageClient"

export const metadata: Metadata = {
  title: "Track shipment",
  description: "Track your EasyMoveZone freight shipment by reference number.",
}

export default function TrackPage() {
  return (
    <PublicShell>
      <Suspense fallback={<div className="min-h-[40vh]" style={{ background: "#efece4" }} />}>
        <TrackPageClient />
      </Suspense>
    </PublicShell>
  )
}
