import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { SellForm } from "@/components/sell/SellForm"

export const metadata: Metadata = {
  title: "List Your Property — EasyMoveZone",
  description: "Submit your property for sale or rent-to-own on EasyMoveZone. We verify every listing before it goes live.",
}

export default function SellPage() {
  return (
    <PublicShell>
      <SellForm />
    </PublicShell>
  )
}
