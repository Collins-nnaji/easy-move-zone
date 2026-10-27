import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const base = BRAND.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        // The agent application is the one portal page meant for search.
        allow: ["/", "/portal/agent/apply"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/auth",
          "/manage/",
          "/tenant",
          "/agent/",
          "/portal",
          "/listings/confirm/",
          "/moving/checkout",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
