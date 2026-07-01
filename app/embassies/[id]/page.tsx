import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { EmbassyDetailClient } from "@/components/visa/EmbassyDetailClient"

export const metadata: Metadata = {
  title: "Embassy details | EasyMoveZone",
}

export default async function EmbassyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-32 sm:px-6">
        <EmbassyDetailClient id={id} />
      </div>
    </PublicShell>
  )
}
