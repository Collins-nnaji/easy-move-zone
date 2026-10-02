import type { Metadata } from "next"
import { Suspense } from "react"
import { PublicShell } from "@/components/platform/PublicShell"
import { TrackMove } from "@/components/moving/TrackMove"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Track Your Move",
  description: "Track your EasyMoveZone move request, quote, crew arrangements and arrival updates.",
  path: "/track",
})

export default function TrackPage() {
  return (
    <PublicShell>
      <Suspense fallback={<div className="px-4 py-16 text-sm text-[#5f655c]">Loading tracking…</div>}>
        <TrackMove />
      </Suspense>
    </PublicShell>
  )
}
