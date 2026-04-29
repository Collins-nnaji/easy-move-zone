import { PublicShell } from "@/components/platform/PublicShell"
import { HomePageClient } from "@/components/platform/HomePageClient"
import { getPropertyCountsByCity } from "@/lib/property/data"

export default async function HomePage() {
  const cityCounts = await getPropertyCountsByCity()

  return (
    <PublicShell>
      <HomePageClient cityCounts={cityCounts} />
    </PublicShell>
  )
}
