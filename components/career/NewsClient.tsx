"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Newspaper } from "lucide-react"

type Article = {
  id: number
  title: string
  slug: string
  summary: string | null
  body: string
  source: string | null
  sourceUrl: string | null
  imageUrl: string | null
  category: string
  tags: string[]
  publishedAt: string | null
}

function formatDate(value: string | null) {
  if (!value) return ""
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return ""
  }
}

export function NewsClient({ initial }: { initial: Article[] }) {
  const [articles, setArticles] = useState(initial)
  const [selected, setSelected] = useState<Article | null>(null)

  useEffect(() => {
    setArticles(initial)
  }, [initial])

  return (
    <div style={{ background: "#efece4", color: "#1b231e" }}>
      <div className="mx-auto w-full max-w-[1600px] px-3 py-8 sm:px-5 lg:px-6 lg:py-10">
        <p className="text-sm font-extrabold tracking-tight text-[#e0511f]">Immigration news</p>
        <h1 className="page-title mt-2 max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[2.35rem]">
          Policy updates that affect your move.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5f655c] sm:text-base">
          Visa rules, sponsor guidance, and country pathway changes — published by EasyMoveZone.
        </p>

        {articles.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-[#e4dfd5] bg-white px-5 py-12 text-center">
            <Newspaper className="mx-auto h-8 w-8 text-[#e0511f]" />
            <p className="mt-3 text-lg font-bold">No stories yet</p>
            <p className="mt-1 text-sm text-[#5f655c]">Check back soon — new immigration updates will appear here.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-[#e4dfd5] bg-white shadow-sm"
              >
                {article.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.imageUrl} alt="" className="h-40 w-full object-cover sm:h-44" />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-[#f6f3ec] sm:h-32">
                    <Newspaper className="h-7 w-7 text-[#e0511f]" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#9aa097]">
                    <span className="rounded-full bg-[#fbeae0] px-2 py-0.5 text-[#7a3b24]">{article.category}</span>
                    {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
                  </div>
                  <h2 className="mt-2 text-lg font-extrabold leading-snug sm:text-xl">{article.title}</h2>
                  {article.summary && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#5f655c]">{article.summary}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelected(article)}
                      className="rounded-xl bg-[#e0511f] px-3.5 py-2 text-xs font-bold text-white"
                    >
                      Read
                    </button>
                    {article.sourceUrl && (
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl border border-[#ded7cb] px-3.5 py-2 text-xs font-bold text-[#4a5047]"
                      >
                        Source <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-[#7c827a]">
          Planning a move?{" "}
          <Link href="/easymovescore" className="font-bold text-[#e0511f] underline-offset-2 hover:underline">
            Open EasyMove Score
          </Link>
        </p>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <button type="button" className="absolute inset-0 bg-black/45" aria-label="Close" onClick={() => setSelected(null)} />
          <div
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#e4dfd5] px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa097]">{selected.category}</p>
                <h2 className="mt-1 text-lg font-extrabold leading-snug sm:text-xl">{selected.title}</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg px-2 py-1 text-sm font-bold text-[#7c827a]">
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
              {selected.source && (
                <p className="text-xs font-semibold text-[#7c827a]">
                  Source: {selected.source}
                  {selected.publishedAt ? ` · ${formatDate(selected.publishedAt)}` : ""}
                </p>
              )}
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#3d433c] sm:text-[15px]">
                {selected.body}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
