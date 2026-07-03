import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { HomePageClient } from "@/components/platform/HomePageClient"

export const metadata: Metadata = {
  title: "EasyMoveZone — Your move, made easy.",
  description:
    "See the visas you qualify for and your exact document checklist in minutes — no consultant. Then sort movement and accommodation in one app.",
}

export default async function HomePage() {
  return (
    <PublicShell>
      <HomePageClient />
    </PublicShell>
  )
}
