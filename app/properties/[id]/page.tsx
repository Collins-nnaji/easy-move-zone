import { notFound } from "next/navigation"
import { PublicShell } from "@/components/platform/PublicShell"
import { PropertyDetailServer } from "@/components/property/PropertyDetailServer"
import { getPropertyById } from "@/lib/property/get-property"

type Props = { params: Promise<{ id: string }> }

export default async function PropertyPage({ params }: Props) {
  const { id } = await params
  const property = await getPropertyById(id, true)
  if (!property || !property.is_published) notFound()

  return (
    <PublicShell>
      <PropertyDetailServer property={property} />
    </PublicShell>
  )
}
