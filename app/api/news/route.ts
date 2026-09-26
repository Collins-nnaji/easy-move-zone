import { NextResponse } from "next/server"
import { listPublishedNews, getNewsBySlug } from "@/lib/career/news"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get("slug")?.trim()
  try {
    if (slug) {
      const article = await getNewsBySlug(slug)
      if (!article || !article.published) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      return NextResponse.json({ article })
    }
    const articles = await listPublishedNews(50)
    return NextResponse.json({ articles })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load news" },
      { status: 500 },
    )
  }
}
