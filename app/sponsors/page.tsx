import type { Metadata } from "next"
import { MobilityFrame } from "@/components/mobility/MobilityFrame"
import { SponsorChecker } from "@/components/career/SponsorChecker"

export const metadata: Metadata = {
  title: "Visa sponsors",
  description:
    "Search licensed visa sponsor registers by country. UK register live today — more destinations next.",
  alternates: { canonical: "/sponsors" },
}

export default function SponsorsPage() {
  return (
    <MobilityFrame
      eyebrow="Sponsors"
      title="Find employers who can sponsor your visa."
      lede="Pick a country register below. A licence means the employer is allowed to sponsor — it is not the same as this vacancy offering sponsorship."
    >
      <SponsorChecker />
    </MobilityFrame>
  )
}
