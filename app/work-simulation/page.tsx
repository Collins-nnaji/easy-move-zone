import type { Metadata } from "next"
import { AssessmentsClient } from "@/components/career/AssessmentsClient"

export const metadata: Metadata = {
  title: "Work Simulation",
  description: "Timed role work simulations with bronze, silver, and gold badges for careers you want to move into.",
  alternates: { canonical: "/work-simulation" },
}

export default function WorkSimulationPage() {
  return <AssessmentsClient />
}
