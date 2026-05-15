import type { Metadata } from "next"
import { VendorDashboardClient } from "@/components/vendor/VendorDashboardClient"

export const metadata: Metadata = {
  title: "Vendor Dashboard — EasyMoveZone",
  description: "Manage your moving and relocation services on EasyMoveZone.",
}

export default function VendorPage() {
  return <VendorDashboardClient />
}
