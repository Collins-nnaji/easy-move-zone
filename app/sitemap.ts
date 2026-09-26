import type { MetadataRoute } from "next"
import { BRAND } from "@/lib/brand"

const paths = [
  "/",
  "/easymovescore",
  "/sponsors",
  "/jobs",
  "/work-simulation",
  "/news",
  "/specialist-support",
  "/contact",
  "/profile",
  "/legal/privacy",
  "/legal/terms",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.url.replace(/\/$/, "")
  const now = new Date()
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/easymovescore" || path === "/jobs" ? 0.9 : 0.7,
  }))
}
