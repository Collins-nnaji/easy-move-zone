import type { Metadata } from "next"
import { headers } from "next/headers"
import { PropertyApp } from "@/components/property/PropertyApp"
import { buildPageMetadata } from "@/lib/site-metadata"
import { metaForPath } from "@/property/app/config/seo"

/*
 * Every page of the property site (/, /property, /verify, /manage, /admin…) is
 * rewritten here by next.config.ts and routed in the browser by react-router.
 * Keeping it one fixed route means client navigation never remounts the app.
 * The middleware passes the visited path so the first HTML has the right title.
 */
export async function generateMetadata(): Promise<Metadata> {
  const path = (await headers()).get("x-emz-path") || "/"
  const meta = metaForPath(path) as { title: string; description: string; noIndex: boolean; canonicalPath: string }
  return buildPageMetadata({
    title: meta.title,
    absoluteTitle: true,
    description: meta.description,
    path: meta.canonicalPath,
    noIndex: meta.noIndex,
  })
}

export default function PropertyAppPage() {
  return <PropertyApp />
}
