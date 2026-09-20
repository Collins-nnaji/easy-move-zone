import type { Metadata } from "next"
import { Suspense } from "react"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { EnquireClient } from "@/components/cars/EnquireClient"

export const metadata: Metadata = {
  title: "Enquiry",
  description: "Book a test drive, ask about a car, discuss finance, or part-exchange.",
}

export default function EnquirePage() {
  return (
    <PublicShell>
      <CarsShell>
        <Suspense fallback={<div className="min-h-[40vh]" />}>
          <EnquireClient />
        </Suspense>
      </CarsShell>
    </PublicShell>
  )
}
