import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { AudienceView } from "@/components/produce/AudienceView"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "For exporters",
  description: "Move export-grade Nigerian cocoa, sesame, cashew, ginger and hibiscus from the state of origin to Apapa, Tin Can or Onne.",
  path: "/exporters",
})

export default function ExportersPage() {
  return (
    <PublicShell>
      <AudienceView id="exporters" />
    </PublicShell>
  )
}
