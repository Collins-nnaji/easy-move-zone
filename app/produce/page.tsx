import { PublicShell } from "@/components/platform/PublicShell"
import { ProduceMarketClient } from "@/components/agro/ProduceMarketClient"

export const metadata = {
  title: "Produce Market — EasyMoveZone",
  description: "Browse fresh farm listings across Africa. Buy directly from verified farmers.",
}

export default function ProduceMarketPage() {
  return (
    <PublicShell>
      <ProduceMarketClient />
    </PublicShell>
  )
}
