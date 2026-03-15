import { PublicShell } from "@/components/platform/PublicShell"
import { ServicesPageClient } from "@/components/platform/ServicesPageClient"
import { seedCities, seedListings, seedAgents, seedPropertyFaqs } from "@/lib/property/seed"

export default function PublicServicesPage() {
  return (
    <PublicShell>
      <div className="bg-[#f8fbff] min-h-screen">
        <ServicesPageClient 
          cities={seedCities}
          listings={seedListings}
          agents={seedAgents}
          faqs={seedPropertyFaqs}
        />
      </div>
    </PublicShell>
  )
}
