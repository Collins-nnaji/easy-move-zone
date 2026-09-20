import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { SellCarClient } from "@/components/cars/SellCarClient"
import { SellListingForm } from "@/components/cars/SellListingForm"

export const metadata: Metadata = {
  title: "Sell Your Car",
  description: "Get an estimated valuation and use your current car towards your next one.",
}

export default function SellPage() {
  return (
    <PublicShell>
      <CarsShell>
        <SellCarClient />
        <div className="mx-auto w-full max-w-xl px-4 pb-16 sm:px-6">
          <SellListingForm />
        </div>
      </CarsShell>
    </PublicShell>
  )
}
