import type { Metadata } from "next"
import { AssessmentsClient } from "@/components/career/AssessmentsClient"
import { authServer } from "@/lib/auth/server"
import { AuthPreviewGate } from "@/components/platform/AuthPreviewGate"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Work Simulations and Skill Badges",
  description: "Timed role work simulations with bronze, silver, and gold badges for careers you want to move into.",
  path: "/work-simulation",
  keywords: ["work simulation", "job simulation", "skills assessment", "career badges", "prove your skills"],
})

export default async function WorkSimulationPage() {
  const session = await authServer.getSession()
  return (
    <AuthPreviewGate signedIn={Boolean(session?.data?.user)} redirectTo="/work-simulation" title="Work Simulation">
      <AssessmentsClient />
    </AuthPreviewGate>
  )
}
