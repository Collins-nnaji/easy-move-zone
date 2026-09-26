"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Newspaper, Trash2 } from "lucide-react"

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
  published: boolean
  publishedAt: string | null
  createdAt: string
}

const emptyForm = {
  title: "",
  summary: "",
  body: "",
  source: "",
  sourceUrl: "",
  imageUrl: "",
  category: "Immigration",
  published: true,
}

export function AdminNewsClient() {
  const [articles, setArticles] = useState<Article[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/news")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load")
      setArticles(data.articles ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function publish(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary || null,
          body: form.body,
          source: form.source || null,
          sourceUrl: form.sourceUrl || null,
          imageUrl: form.imageUrl || null,
          category: form.category || "Immigration",
          published: form.published,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Publish failed")
      setForm(emptyForm)
      setNotice(form.published ? "Published to /news" : "Saved as draft")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed")
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(article: Article) {
    setError(null)
    const res = await fetch("/api/admin/news", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: article.id, published: !article.published }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Update failed")
      return
    }
    await load()
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this article?")) return
    setError(null)
    const res = await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Delete failed")
      return
    }
    await load()
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e0511f]/60"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#e0511f]">Publish</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Immigration news</h1>
          <p className="mt-1 text-sm text-white/50">Stories appear on the public /news page when published.</p>
        </div>
        <a href="/news" target="_blank" rel="noreferrer" className="text-xs font-semibold text-white/60 hover:text-white">
          View public page →
        </a>
      </div>

      {error && <p className="mt-4 rounded-xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-200">{error}</p>}
      {notice && <p className="mt-4 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200">{notice}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <form onSubmit={(e) => void publish(e)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Newspaper className="h-4 w-4 text-[#e0511f]" />
            New article
          </h2>
          <label className="mt-4 block text-xs font-semibold text-white/60">
            Title
            <input
              required
              className={field}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="UK Skilled Worker salary thresholds update"
            />
          </label>
          <label className="mt-3 block text-xs font-semibold text-white/60">
            Summary
            <textarea
              className={`${field} min-h-[72px]`}
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              placeholder="One or two lines for the card."
            />
          </label>
          <label className="mt-3 block text-xs font-semibold text-white/60">
            Body
            <textarea
              required
              className={`${field} min-h-[180px]`}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Full article text…"
            />
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-white/60">
              Category
              <input className={field} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </label>
            <label className="block text-xs font-semibold text-white/60">
              Source name
              <input className={field} value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} placeholder="GOV.UK" />
            </label>
            <label className="block text-xs font-semibold text-white/60 sm:col-span-2">
              Source URL
              <input className={field} value={form.sourceUrl} onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))} placeholder="https://…" />
            </label>
            <label className="block text-xs font-semibold text-white/60 sm:col-span-2">
              Image URL
              <input className={field} value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
            </label>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/80">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              className="accent-[#e0511f]"
            />
            Publish immediately
          </label>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#e0511f] text-sm font-bold text-white disabled:opacity-60 sm:w-auto sm:px-6"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {form.published ? "Publish" : "Save draft"}
          </button>
        </form>

        <div>
          <h2 className="text-sm font-bold text-white/70">All articles ({articles.length})</h2>
          {loading ? (
            <p className="mt-4 text-sm text-white/40">Loading…</p>
          ) : articles.length === 0 ? (
            <p className="mt-4 text-sm text-white/40">Nothing published yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {articles.map((article) => (
                <li key={article.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{article.title}</p>
                      <p className="mt-1 text-[11px] text-white/40">
                        {article.published ? "Published" : "Draft"} · /{article.slug}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void remove(article.id)}
                      className="rounded-lg p-2 text-white/40 hover:bg-rose-500/15 hover:text-rose-300"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => void togglePublished(article)}
                    className="mt-3 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white/70 hover:bg-white/5"
                  >
                    {article.published ? "Unpublish" : "Publish"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
