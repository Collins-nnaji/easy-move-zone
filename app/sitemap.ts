import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

type Entry = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
};

/** Public pages: the property site (app/property-app) and moving (/moving). */
const pages: Entry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/listings", priority: 0.9, changeFrequency: "daily" },
  { path: "/listings/sell", priority: 0.8, changeFrequency: "monthly" },
  { path: "/listings/rent", priority: 0.8, changeFrequency: "daily" },
  { path: "/verify", priority: 0.8, changeFrequency: "monthly" },
  { path: "/verify/photo-scan", priority: 0.7, changeFrequency: "monthly" },
  { path: "/manage", priority: 0.8, changeFrequency: "monthly" },
  { path: "/renovate", priority: 0.7, changeFrequency: "monthly" },
  { path: "/moving", priority: 0.9, changeFrequency: "weekly" },
  { path: "/moving/book", priority: 0.7, changeFrequency: "monthly" },
  { path: "/moving/prices", priority: 0.7, changeFrequency: "monthly" },
  { path: "/moving/track", priority: 0.7, changeFrequency: "monthly" },
  { path: "/moving/crew", priority: 0.7, changeFrequency: "monthly" },
  { path: "/moving/help", priority: 0.7, changeFrequency: "monthly" },
  { path: "/areas", priority: 0.8, changeFrequency: "daily" },
  { path: "/consult", priority: 0.6, changeFrequency: "monthly" },
  { path: "/help", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/moving/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/moving/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/moving/cookies", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.url.replace(/\/$/, "");
  const now = new Date();
  return pages.map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
