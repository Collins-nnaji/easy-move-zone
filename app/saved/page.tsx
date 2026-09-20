import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { SavedCarsClient } from "@/components/cars/SavedCarsClient"

export const metadata: Metadata = {
  title: "Saved Cars",
  description: "Keep track of the cars you're interested in and compare them.",
}

export default function SavedPage() {
  return (
    <PublicShell>
      <CarsShell>
        <SavedCarsClient />
      </CarsShell>
    </PublicShell>
  )
}
