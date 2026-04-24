import { PublicShell } from "@/components/platform/PublicShell"
import { ListProduceClient } from "@/components/agro/ListProduceClient"

export const metadata = {
  title: "List Your Produce — EasyMoveZone",
  description: "Post your harvest. Connect with buyers and transporters across Africa.",
}

export default function ListProducePage() {
  return (
    <PublicShell>
      <ListProduceClient />
    </PublicShell>
  )
}
