import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { QuotePageClient } from "@/components/platform/QuotePageClient"

export const metadata: Metadata = {
  title: "Get a quote",
  description:
    "Request an EasyMoveZone freight quote for export from Nigeria or import into Nigeria — sea, air, or road.",
}

export default function QuotePage() {
  return (
    <PublicShell>
      <QuotePageClient />
    </PublicShell>
  )
}
