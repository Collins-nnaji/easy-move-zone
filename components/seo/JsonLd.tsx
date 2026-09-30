import { BRAND } from "@/lib/brand"
import { SITE_ORIGIN, absoluteUrl } from "@/lib/site-metadata"

type Schema = Record<string, unknown>

const WEBSITE_ID = `${SITE_ORIGIN}/#website`
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`

/** Renders one or more schema.org objects as a single JSON-LD script. */
export function JsonLd({ data }: { data: Schema | Schema[] }) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data }
  return (
    <script
      type="application/ld+json"
      // `<` is escaped so page copy can never close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  )
}

export function organizationSchema(): Schema {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: BRAND.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl(BRAND.logo),
  }
}

export function websiteSchema(): Schema {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: BRAND.name,
    url: absoluteUrl("/"),
    description: BRAND.description,
    inLanguage: "en-GB",
    publisher: { "@id": ORGANIZATION_ID },
  }
}

export function webPageSchema({ path, name, description }: { path: string; name: string; description: string }): Schema {
  const url = absoluteUrl(path)
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "en-GB",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
  }
}

export function faqPageSchema({ path, faqs }: { path: string; faqs: ReadonlyArray<{ question: string; answer: string }> }): Schema {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}

export function softwareApplicationSchema({
  name,
  description,
  path,
  category = "BusinessApplication",
}: {
  name: string
  description: string
  path: string
  category?: string
}): Schema {
  return {
    "@type": "SoftwareApplication",
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: category,
    operatingSystem: "Web, iOS, Android",
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    publisher: { "@id": ORGANIZATION_ID },
  }
}

export function articleSchema({
  path,
  headline,
  description,
  datePublished,
  dateModified,
}: {
  path: string
  headline: string
  description: string
  datePublished: string
  dateModified?: string
}): Schema {
  const url = absoluteUrl(path)
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    headline,
    description,
    url,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    mainEntityOfPage: { "@id": `${url}#webpage` },
  }
}
