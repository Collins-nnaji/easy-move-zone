import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { HomePageClient } from "@/components/platform/HomePageClient"

export const metadata: Metadata = {
  title: "EasyMoveZone — Get there. Stay there. Visa sorted.",
  description:
    "Movement, accommodation, and visa in one app. Book how you get there, where you stay, and how you get in — two weeks or forever.",
}

export default async function HomePage() {
  return (
    <PublicShell>
      <HomePageClient />
    </PublicShell>
  )
}
