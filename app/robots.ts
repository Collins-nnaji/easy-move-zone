import type { MetadataRoute } from "next"
import { BRAND } from "@/lib/brand"

export default function robots(): MetadataRoute.Robots {
  const base = BRAND.url.replace(/\/$/, "")
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/auth", "/profile", "/application-pack"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
