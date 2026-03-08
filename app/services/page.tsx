import { PublicShell } from "@/components/platform/PublicShell"
import { ServicesPageClient } from "@/components/platform/ServicesPageClient"
import { getFaqs, getServices } from "@/lib/platform"

export default async function ServicesPage() {
  const [services, faqs] = await Promise.all([getServices(), getFaqs()])

  return (
    <PublicShell>
      <ServicesPageClient services={services} faqs={faqs} />
    </PublicShell>
  )
}
