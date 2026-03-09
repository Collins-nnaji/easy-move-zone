import { redirect } from "next/navigation"
import { neonAuth } from "@neondatabase/auth/next/server"
import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace"
import { getCityMarkets } from "@/lib/property"

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { session, user } = await neonAuth()
  if (!session || !user) redirect("/auth?redirect=/profile")

  const params = await searchParams
  const role = params.role === "seller" ? "seller" : "buyer"
  const cities = await getCityMarkets()
  const cityOptions = cities.map((city) => ({ slug: city.slug, name: city.name }))
  const displayName = user.name || user.email || "My account"
  const email = user.email || ""

  return (
    <ProfileWorkspace initialRole={role} displayName={displayName} email={email} cityOptions={cityOptions} />
  )
}
