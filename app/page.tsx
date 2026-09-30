import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { HomePageClient } from "@/components/platform/HomePageClient"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Visa-Sponsored Jobs Across Countries · EasyMoveZone",
  absoluteTitle: true,
  description:
    "Find visa-sponsored jobs from licensed employers, check your visa route to 12 destinations, and apply with a CV tailored to each role. It's free to start.",
  path: "/",
  keywords: [
    "visa sponsorship jobs",
    "visa sponsored jobs",
    "jobs abroad with visa sponsorship",
    "UK licensed sponsors",
    "skilled worker visa jobs",
    "work abroad",
    "career change abroad",
    "tailored CV",
    "jobs in UK with visa sponsorship",
    "visa sponsor checker",
    "EasyMoveZone",
  ],
})

export default async function HomePage() {
  return (
    <PublicShell>
      <HomePageClient />
    </PublicShell>
  )
}
