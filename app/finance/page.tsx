import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { FinanceClient } from "@/components/cars/FinanceClient"

export const metadata: Metadata = {
  title: "Car Finance",
  description: "Find a finance option that works with your budget.",
}

export default function FinancePage() {
  return (
    <PublicShell>
      <CarsShell>
        <FinanceClient />
      </CarsShell>
    </PublicShell>
  )
}
