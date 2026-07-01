import type { Metadata } from "next"
import { PublicShell } from "@/components/platform/PublicShell"
import { ContactPageClient } from "@/components/platform/ContactPageClient"

export const metadata: Metadata = {
  title: "Contact | EasyMoveZone",
  description: "Reach EasyMoveZone for move planning, visa questions, bookings, and relocation support.",
}

function firstString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v[0] : v
}

function safeDecodeParam(s: string) {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "))
  } catch {
    return s
  }
}

function buildPageContext(searchParams: Record<string, string | string[] | undefined>): string | null {
  const parts: string[] = []
  const market = firstString(searchParams.market)
  const service = firstString(searchParams.service)
  const agent = firstString(searchParams.agent)
  const direction = firstString(searchParams.direction)
  if (market) parts.push(`Market: ${safeDecodeParam(market)}`)
  if (service) parts.push(`Topic: ${safeDecodeParam(service)}`)
  if (agent) parts.push(`Agent: ${safeDecodeParam(agent)}`)
  if (direction) parts.push(`Direction: ${safeDecodeParam(direction)}`)
  return parts.length ? parts.join(" · ") : null
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const q = await searchParams
  const rawMessage = firstString(q.message)
  const initialMessage = rawMessage ? safeDecodeParam(rawMessage) : ""
  const pageContext = buildPageContext(q)

  return (
    <PublicShell>
      <ContactPageClient initialMessage={initialMessage} pageContext={pageContext} />
    </PublicShell>
  )
}
