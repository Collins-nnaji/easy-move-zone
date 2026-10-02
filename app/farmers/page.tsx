import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { AudienceView } from "@/components/produce/AudienceView"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "For farmers",
  description: "Move a Nigerian harvest between states. Book a truck from the farm state to the next market or port.",
  path: "/farmers",
})

export default function FarmersPage() {
  return (
    <PublicShell>
      <AudienceView id="farmers" />
    </PublicShell>
  )
}
