import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { HomePageClient } from "@/components/platform/HomePageClient"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Move Nigerian Food Across States and Borders · EasyMoveZone",
  absoluteTitle: true,
  description:
    "EasyMoveZone handles collection, transport and delivery for Nigerian farm produce. Arrange a delivery, explore bulk produce or plan transport to port with one team.",
  path: "/",
  keywords: [
    "Nigeria agricultural logistics",
    "move farm produce between states",
    "bulk sesame cocoa cashew",
    "Apapa export",
    "food commodity haulage Nigeria",
    "EasyMoveZone",
  ],
})

export default function HomePage() {
  return (
    <PublicShell>
      <HomePageClient />
    </PublicShell>
  )
}
