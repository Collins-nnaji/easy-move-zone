import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { HomePageClient } from "@/components/platform/HomePageClient"

export const metadata: Metadata = {
  title: "EasyMoveZone — Trips, stays & visas for every move",
  description:
    "Book your trip, find a place to stay, and sort your visa — one app for every kind of move, whether you're going for two weeks or forever.",
}

export default async function HomePage() {
  return (
    <PublicShell>
      <HomePageClient />
    </PublicShell>
  )
}
