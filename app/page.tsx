import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { HomePageClient } from "@/components/platform/HomePageClient"

export const metadata: Metadata = {
  title: "EasyMoveZone — Visa requirements, checklist & embassy directory",
  description:
    "Look up visa requirements, track your document checklist, and find embassies — with AI guidance throughout.",
}

export default async function HomePage() {
  return (
    <PublicShell>
      <HomePageClient />
    </PublicShell>
  )
}
