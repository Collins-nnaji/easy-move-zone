import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { RelocateHubClient } from "@/components/relocate/RelocateHubClient"

export const metadata: Metadata = {
  title: "Relocation workspace — EasyMoveZone",
  description:
    "Plan your international move: save your relocation plan, track visa and logistics tasks, manage your budget, and keep local contacts in one place.",
}

export default function RelocateHubPage() {
  return (
    <PublicShell>
      <div className="min-h-screen bg-[#f6f8fb] py-8">
        <RelocateHubClient />
      </div>
    </PublicShell>
  )
}
