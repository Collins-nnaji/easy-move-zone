import type { Metadata } from "next"
import { AssessmentsClient } from "@/components/career/AssessmentsClient"
import { authServer } from "@/lib/auth/server"
import { AuthPreviewGate } from "@/components/platform/AuthPreviewGate"

export const metadata: Metadata = {
  title: "Work Simulation",
  description: "Timed role work simulations with bronze, silver, and gold badges for careers you want to move into.",
  alternates: { canonical: "/work-simulation" },
}

export default async function WorkSimulationPage() {
  const session = await authServer.getSession()
  return (
    <AuthPreviewGate signedIn={Boolean(session?.data?.user)} redirectTo="/work-simulation" title="Work Simulation">
      <AssessmentsClient />
    </AuthPreviewGate>
  )
}
