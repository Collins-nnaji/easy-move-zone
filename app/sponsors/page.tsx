import type { Metadata } from "next"
import { MobilityFrame } from "@/components/mobility/MobilityFrame"
import { SponsorChecker } from "@/components/career/SponsorChecker"
import { authServer } from "@/lib/auth/server"
import { AuthPreviewGate } from "@/components/platform/AuthPreviewGate"

export const metadata: Metadata = {
  title: "Visa sponsors",
  description:
    "Search the UK licensed sponsor register and explore skilled worker routes in Ireland, the Netherlands, Germany, Canada, Australia, the US and more.",
  alternates: { canonical: "/sponsors" },
}

export default async function SponsorsPage() {
  const session = await authServer.getSession()
  return (
    <AuthPreviewGate signedIn={Boolean(session?.data?.user)} redirectTo="/sponsors" title="sponsor search">
      <MobilityFrame
        eyebrow="Sponsors"
        title="Find employers who can sponsor your visa."
        lede="Pick a country to see its skilled worker routes and who hires there. A licence means the employer is allowed to sponsor — it is not the same as this vacancy offering sponsorship."
      >
        <SponsorChecker />
      </MobilityFrame>
    </AuthPreviewGate>
  )
}
