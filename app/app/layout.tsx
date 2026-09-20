import type { Metadata } from "next"
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google"
import { BRAND } from "@/lib/brand"
import { requireAnyAppRole } from "@/lib/auth/guard"
import { LogisticsApp } from "@/components/app/LogisticsApp"
import "../move/move.css"

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Client portal",
  description: BRAND.description,
  applicationName: BRAND.shortName,
}

export default async function AppPortalLayout() {
  const session = await requireAnyAppRole("/app")
  const primaryRole = session.roles.includes("company")
    ? "company"
    : "driver"

  return (
    <div style={{ display: "contents" }} className={`${hanken.variable} ${plexMono.variable}`}>
      <LogisticsApp
        roles={session.roles}
        primaryRole={primaryRole}
        userName={session.name}
        userEmail={session.email}
      />
    </div>
  )
}
