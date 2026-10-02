import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { AudienceView } from "@/components/produce/AudienceView"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "For traders",
  description: "Buy Nigerian produce by the tonne with origin, grade and a truck on the same record.",
  path: "/traders",
})

export default function TradersPage() {
  return (
    <PublicShell>
      <AudienceView id="traders" />
    </PublicShell>
  )
}
