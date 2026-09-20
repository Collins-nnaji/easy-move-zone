import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { HomeCarsClient } from "@/components/cars/HomeCarsClient"
import { BRAND } from "@/lib/brand"

export const metadata: Metadata = {
  title: BRAND.tagline,
  description: BRAND.description,
}

export default async function HomePage() {
  return (
    <PublicShell>
      <CarsShell>
        <HomeCarsClient />
      </CarsShell>
    </PublicShell>
  )
}
