import { redirect } from "next/navigation"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import { ListPropertyForm } from "./ListPropertyForm"

export default async function PortalNewListingPage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/portal/new")

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#f6f8fb]">
        <ListPropertyForm />
      </div>
    </PublicShell>
  )
}
