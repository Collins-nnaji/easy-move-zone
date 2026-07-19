import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { HomePageClient } from "@/components/platform/HomePageClient"

export const metadata: Metadata = {
  title: "EasyMoveZone — Commercial driving shifts for drivers",
  description:
    "Claim local commercial driving shifts, track routes live, cash out instantly, and keep your compliance docs verified — built for drivers and fleet managers.",
}

export default async function HomePage() {
  return (
    <PublicShell>
      <HomePageClient />
    </PublicShell>
  )
}
