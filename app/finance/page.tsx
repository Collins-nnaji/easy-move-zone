import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { FinancePageClient } from "@/components/platform/FinancePageClient"

export const metadata: Metadata = {
  title: "Mortgage & NHF Financing | EasyMoveZone",
  description:
    "Access Bank, Stanbic IBTC, and NHF loans brokered for you. Flexible terms, diaspora support, and an embedded mortgage calculator to know your numbers.",
}

export default function FinancePage() {
  return (
    <PublicShell>
      <FinancePageClient />
    </PublicShell>
  )
}
