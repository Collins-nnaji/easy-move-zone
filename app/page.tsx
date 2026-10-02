import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { HomePageClient } from "@/components/platform/HomePageClient"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Your Move, Made Easy · EasyMoveZone",
  absoluteTitle: true,
  description:
    "Move your home, office or heavy items without the stress. Book a truck, movers and packing help in Lagos with clear pricing and reliable coordination.",
  path: "/",
  keywords: [
    "house movers Nigeria",
    "office relocation Lagos",
    "furniture and appliance delivery",
    "packing and loading crews",
    "truck and van booking Lagos",
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
