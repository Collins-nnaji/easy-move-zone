import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PublicShell } from "@/components/platform/PublicShell"
import { CarsShell } from "@/components/cars/CarsShell"
import { PartDetailsClient } from "@/components/cars/PartsClient"
import { getPart, PARTS } from "@/lib/cars/parts"

export function generateStaticParams() {
  return PARTS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const part = getPart(id)
  return { title: part?.name ?? "Part" }
}

export default async function PartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getPart(id)) notFound()
  return (
    <PublicShell>
      <CarsShell>
        <PartDetailsClient id={id} />
      </CarsShell>
    </PublicShell>
  )
}
