import type { Metadata } from "next"
import { Suspense } from "react"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { GaragesBrowseClient } from "@/components/cars/GaragesClient"

export const metadata: Metadata = {
  title: "Garages",
  description: "Find a garage for MOT, tyres, servicing and repairs — with reviews.",
}

export default function GaragesPage() {
  return (
    <PublicShell>
      <CarsShell>
        <Suspense fallback={<div className="min-h-[40vh]" />}>
          <GaragesBrowseClient />
        </Suspense>
      </CarsShell>
    </PublicShell>
  )
}
