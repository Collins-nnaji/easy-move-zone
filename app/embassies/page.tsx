import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { EmbassyDirectoryClient } from "@/components/visa/EmbassyDirectoryClient"

export const metadata: Metadata = {
  title: "Embassy directory | EasyMoveZone",
  description: "Find embassy, consulate, and visa application center contact details.",
}

export default function EmbassiesPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6">
        <EmbassyDirectoryClient />
      </div>
    </PublicShell>
  )
}
