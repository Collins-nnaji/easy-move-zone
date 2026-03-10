import { PublicShell } from "@/components/platform/PublicShell"
import { ServicesPageClient } from "@/components/platform/ServicesPageClient"
import { getAgents, getCityMarkets, getPropertyFaqs, getPropertyListings } from "@/lib/property"

export default async function ListingsPage() {
  const [cities, listings, agents, faqs] = await Promise.all([
    getCityMarkets(),
    getPropertyListings(),
    getAgents(),
    getPropertyFaqs(),
  ])

  return (
    <PublicShell>
      <ServicesPageClient cities={cities} listings={listings} agents={agents} faqs={faqs} />
    </PublicShell>
  )
}
