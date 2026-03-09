import { PublicShell } from "@/components/platform/PublicShell"
import { ServicesPageClient } from "@/components/platform/ServicesPageClient"
import { getAgents, getCityMarkets, getPropertyListings } from "@/lib/property"

export default async function ServicesPage() {
  const [cities, listings, agents] = await Promise.all([
    getCityMarkets(),
    getPropertyListings(),
    getAgents(),
  ])

  return (
    <PublicShell>
      <ServicesPageClient cities={cities} listings={listings} agents={agents} />
    </PublicShell>
  )
}
