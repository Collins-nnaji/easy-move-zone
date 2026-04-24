import { PublicShell } from "@/components/platform/PublicShell"
import { PriceBoardClient } from "@/components/agro/PriceBoardClient"

export const metadata = {
  title: "Commodity Price Board — EasyMoveZone",
  description: "Live commodity prices from markets across Africa. Updated daily. No information asymmetry.",
}

export default function PriceBoardPage() {
  return (
    <PublicShell>
      <PriceBoardClient />
    </PublicShell>
  )
}
