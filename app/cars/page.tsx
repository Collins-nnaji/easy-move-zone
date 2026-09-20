import type { Metadata } from "next"
import { Suspense } from "react"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { BrowseCarsClient } from "@/components/cars/BrowseCarsClient"
import { listApprovedListingCars } from "@/lib/cars/marketplace"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Cars for Sale",
  description: "Find the right car for your lifestyle and budget — UK stock, imports in transit, and CFR from abroad.",
}

export default async function CarsPage() {
  const marketplace = await listApprovedListingCars()
  return (
    <PublicShell>
      <CarsShell>
        <Suspense fallback={<div className="min-h-[40vh]" />}>
          <BrowseCarsClient marketplace={marketplace} />
        </Suspense>
      </CarsShell>
    </PublicShell>
  )
}
