import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { HowItWorksClient } from "@/components/cars/HowItWorksClient"

export const metadata: Metadata = {
  title: "How it works",
  description: "Find your car, choose how to pay, part-exchange, and collect or arrange delivery.",
}

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <CarsShell>
        <HowItWorksClient />
      </CarsShell>
    </PublicShell>
  )
}
