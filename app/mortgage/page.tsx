import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { MortgagePageContent } from "@/components/platform/MortgagePageContent"

export const metadata: Metadata = {
  title: "Nigeria mortgages & Diaspora NHF | EasyMoveZone",
  description:
    "Nigeria-focused mortgages: Access Bank, Stanbic IBTC, First Bank, and Diaspora National Housing Fund (NHF) through FMBN.",
}

export default function MortgagePage() {
  return (
    <PublicShell>
      <MortgagePageContent />
    </PublicShell>
  )
}
