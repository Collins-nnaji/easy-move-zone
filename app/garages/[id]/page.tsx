import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { GarageDetailsClient } from "@/components/cars/GaragesClient"
import { GARAGES, getGarage } from "@/lib/cars/garages"

export function generateStaticParams() {
  return GARAGES.map((g) => ({ id: g.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const garage = getGarage(id)
  return { title: garage?.name ?? "Garage" }
}

export default async function GaragePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getGarage(id)) notFound()
  return (
    <PublicShell>
      <CarsShell>
        <GarageDetailsClient id={id} />
      </CarsShell>
    </PublicShell>
  )
}
