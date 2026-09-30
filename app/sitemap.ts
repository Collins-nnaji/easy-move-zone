import type { MetadataRoute } from "next"
import { BRAND } from "@/lib/brand"
import { LANDING_PAGES } from "@/lib/seo/landing-pages"

type Entry = {
  path: string
  priority: number
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
}

const corePages: Entry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/jobs", priority: 0.9, changeFrequency: "daily" },
  { path: "/sponsors", priority: 0.9, changeFrequency: "weekly" },
  { path: "/workspace", priority: 0.9, changeFrequency: "monthly" },
  { path: "/education", priority: 0.8, changeFrequency: "monthly" },
  { path: "/work-simulation", priority: 0.7, changeFrequency: "monthly" },
  { path: "/specialist-support", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/legal/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/legal/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/legal/cookies", priority: 0.3, changeFrequency: "yearly" },
]

const landingPages: Entry[] = LANDING_PAGES.map((page) => ({
  path: page.href,
  priority: page.priority,
  changeFrequency: "monthly",
}))

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.url.replace(/\/$/, "")
  const now = new Date()
  return [...corePages, ...landingPages].map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }))
}
