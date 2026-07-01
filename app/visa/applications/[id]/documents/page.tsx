import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { DocumentUploadCard } from "@/components/visa/DocumentUploadCard"

export const metadata: Metadata = {
  title: "Visa documents | EasyMoveZone",
}

export default async function ApplicationDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await authServer.getSession()
  const { id } = await params
  if (!session?.data?.user) redirect(`/auth?redirect=/visa/applications/${id}/documents`)

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6">
        <DocumentUploadCard applicationId={id} />
      </div>
    </PublicShell>
  )
}
