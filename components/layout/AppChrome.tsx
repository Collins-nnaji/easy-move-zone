"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideLegacyChrome =
    pathname === "/" ||
    pathname === "/services" ||
    pathname === "/intelligence" ||
    pathname.startsWith("/intelligence/") ||
    pathname === "/markets" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/dashboard/client" ||
    pathname === "/dashboard/admin"

  if (hideLegacyChrome) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
