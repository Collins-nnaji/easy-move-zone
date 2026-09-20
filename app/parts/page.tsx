import type { Metadata } from "next"
import { Suspense } from "react"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { PartsBrowseClient } from "@/components/cars/PartsClient"

export const metadata: Metadata = {
  title: "Parts & tyres",
  description: "Tyres, brakes, batteries and car parts — then book a garage to fit them.",
}

export default function PartsPage() {
  return (
    <PublicShell>
      <CarsShell>
        <Suspense fallback={<div className="min-h-[40vh]" />}>
          <PartsBrowseClient />
        </Suspense>
      </CarsShell>
    </PublicShell>
  )
}
