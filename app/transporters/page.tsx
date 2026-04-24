import { PublicShell } from "@/components/platform/PublicShell"
import { TransportersPageClient } from "@/components/agro/TransportersPageClient"

export const metadata = {
  title: "Transporters — EasyMoveZone",
  description: "Find verified trucks and logistics companies to move your produce across Africa.",
}

export default function TransportersPage() {
  return (
    <PublicShell>
      <TransportersPageClient />
    </PublicShell>
  )
}
