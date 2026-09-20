import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { CarDashboardClient } from "@/components/cars/CarDashboardClient"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your car garage — saved cars, your vehicle details, and enquiries.",
}

export default function AccountPage() {
  return (
    <PublicShell>
      <CarsShell>
        <CarDashboardClient />
      </CarsShell>
    </PublicShell>
  )
}
