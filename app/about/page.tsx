import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { AboutPageClient } from "@/components/platform/AboutPageClient"
import { CarsShell } from "@/components/cars/CarsShell"

export const metadata: Metadata = {
  title: "About",
  description:
    "EasyMoveZone helps you find, finance, and buy your next car — including CFR imports shipped from abroad.",
}

export default function AboutPage() {
  return (
    <PublicShell>
      <CarsShell>
        <AboutPageClient />
      </CarsShell>
    </PublicShell>
  )
}
