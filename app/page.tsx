import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { HomePageClient } from "@/components/platform/HomePageClient"

export const metadata: Metadata = {
  title: "EasyMoveZone — AI-powered relocation guidance",
  description:
    "Relocating for work, school, or a visa? See what you qualify for, get a tailored document checklist, and settle in with AI guidance built for your destination — no consultant required.",
}

export default async function HomePage() {
  return (
    <PublicShell>
      <HomePageClient />
    </PublicShell>
  )
}
