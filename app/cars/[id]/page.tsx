import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { CarDetailsClient } from "@/components/cars/CarDetailsClient"
import { CARS, carTitle, getCar } from "@/lib/cars/catalog"
import { getApprovedListingCar } from "@/lib/cars/marketplace"

export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return CARS.map((car) => ({ id: car.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const car = getCar(id) ?? (await getApprovedListingCar(id))
  if (!car) return { title: "Car" }
  return {
    title: carTitle(car),
    description: `${carTitle(car)} — ${car.stockType === "uk_stock" ? "UK stock" : `${car.incoterm ?? "Import"} from ${car.originCountry}`}.`,
  }
}

export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const car = getCar(id) ?? (await getApprovedListingCar(id))
  if (!car) notFound()

  return (
    <PublicShell>
      <CarsShell>
        <CarDetailsClient car={car} />
      </CarsShell>
    </PublicShell>
  )
}
