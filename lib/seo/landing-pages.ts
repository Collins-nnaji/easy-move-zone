/** Public product pages. Drives the sitemap, footer and footer visibility. */
export const LANDING_PAGES = [
  { href: "/routes", label: "Delivery routes", priority: 0.9 },
  { href: "/book", label: "Arrange delivery", priority: 0.9 },
  { href: "/lots", label: "Buy produce", priority: 0.9 },
  { href: "/export", label: "Export services", priority: 0.8 },
  { href: "/track", label: "Track a shipment", priority: 0.7 },
  { href: "/farmers", label: "Farmers", priority: 0.6 },
  { href: "/traders", label: "Traders", priority: 0.6 },
  { href: "/exporters", label: "Exporters", priority: 0.6 },
] as const

export type LandingHref = (typeof LANDING_PAGES)[number]["href"]

export const LANDING_HREFS: readonly string[] = LANDING_PAGES.map((page) => page.href)
