import type { Metadata } from "next"
import { NewsClient } from "@/components/career/NewsClient"
import { listPublishedNews } from "@/lib/career/news"

export const metadata: Metadata = {
  title: "Immigration news",
  description: "Visa policy updates, sponsor guidance, and pathway changes that affect your move.",
}

export const dynamic = "force-dynamic"

export default async function NewsPage() {
  const articles = await listPublishedNews(50)
  return (
    <NewsClient
      initial={articles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        body: article.body,
        source: article.source,
        sourceUrl: article.sourceUrl,
        imageUrl: article.imageUrl,
        category: article.category,
        tags: article.tags,
        publishedAt: article.publishedAt,
      }))}
    />
  )
}
