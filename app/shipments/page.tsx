import { PublicShell } from "@/components/platform/PublicShell"
import { ShipmentsClient } from "@/components/agro/ShipmentsClient"

export const metadata = {
  title: "My Shipments — EasyMoveZone",
  description: "Track your agro shipments in real time.",
}

export default function ShipmentsPage() {
  return (
    <PublicShell>
      <ShipmentsClient />
    </PublicShell>
  )
}
