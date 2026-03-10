import { redirect } from "next/navigation"

export default async function IntelligenceMarketPage({
  params,
}: {
  params: Promise<{ marketSlug: string }>
}) {
  const { marketSlug } = await params
  redirect(`/markets?city=${encodeURIComponent(marketSlug)}`)
}
