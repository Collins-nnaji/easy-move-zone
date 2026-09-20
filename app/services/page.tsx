import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { ServicesPageClient } from "@/components/platform/ServicesPageClient"

export const metadata: Metadata = {
  title: "Services",
  description:
    "Sea freight, air freight, road haulage, customs clearance, and warehousing for Nigeria export and import.",
}

export default function ServicesPage() {
  return (
    <PublicShell>
      <ServicesPageClient />
    </PublicShell>
  )
}
