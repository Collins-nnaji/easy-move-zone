import type { MetadataRoute } from "next"
import { BRAND } from "@/lib/brand"

const paths = [
  "/",
  "/workspace",
  "/sponsors",
  "/jobs",
  "/education",
  "/work-simulation",
  "/specialist-support",
  "/contact",
  "/profile",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.url.replace(/\/$/, "")
  const now = new Date()
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/workspace" || path === "/jobs" ? 0.9 : 0.7,
  }))
}
