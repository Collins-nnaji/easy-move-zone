"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, ArrowUpRight, Building2, ExternalLink, FileCheck2, Route, Search } from "lucide-react"
import type { CountryGuide } from "@/lib/sponsors/country-guides"

type Employer = {
  name: string
  jobCount: number
  careerUrl: string | null
  openings: Array<{ title: string; url: string }>
}

export function CountryRouteGuide({ guide, onBack }: { guide: CountryGuide; onBack: () => void }) {
  const [query, setQuery] = useState("")
  const [employers, setEmployers] = useState<Employer[]>([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (q: string) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/sponsors/employers?country=${encodeURIComponent(guide.id)}&q=${encodeURIComponent(q)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Search failed")
        setEmployers(data.employers ?? [])
        setTotalJobs(data.totalJobs ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed")
      } finally {
        setLoading(false)
      }
    },
    [guide.id],
  )

  useEffect(() => {
    void load("")
  }, [load])

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#5f655c] hover:text-[#1b231e]"
      >
        <ArrowLeft className="h-4 w-4" />
        All countries
      </button>

      <div className="rounded-3xl border border-[#e4dfd5] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-4xl" aria-hidden>
            {guide.flag}
          </span>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">{guide.name}</h2>
            <p className="text-sm text-[#5f655c]">{guide.headline}</p>
          </div>
        </div>

        <h3 className="mt-7 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#e0511f]">
          <Route className="h-4 w-4" /> Skilled worker routes
        </h3>
        <ul className="mt-3 divide-y divide-[#efe9dd]">
          {guide.routes.map((route) => (
            <li key={route.name} className="py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-extrabold text-[#1b231e]">{route.name}</p>
                {route.url && (
                  <a href={route.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#2f5d50] hover:underline">
                    Official page <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[#5f655c]">{route.summary}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl bg-[#f6f3ec] p-4">
          <p className="text-sm font-extrabold">How sponsorship works here</p>
          <p className="mt-1 text-sm leading-relaxed text-[#5f655c]">{guide.sponsorship}</p>
        </div>

        {guide.register && (
          <a
            href={guide.register.url}
            target="_blank"
            rel="noreferrer"
            className="group mt-4 flex items-start gap-3 rounded-2xl border border-[#cfe0d9] bg-[#eef5f2] p-4 transition hover:border-[#2f5d50]"
          >
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2f5d50]" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-extrabold text-[#1f4a3e]">
                {guide.register.label} <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-[#4f6b62]">{guide.register.note}</span>
            </span>
          </a>
        )}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {guide.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-[#4a5047] underline-offset-4 hover:underline">
              {link.label} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#8a9086]">Rules and salary thresholds change often. Always confirm on the official page before you apply.</p>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-extrabold tracking-tight">Employers hiring in {guide.name}</h3>
        <p className="mt-1 text-sm text-[#5f655c]">
          From our jobs board{totalJobs > 0 ? ` · ${totalJobs.toLocaleString()} roles` : ""}. Being listed here doesn&apos;t mean an employer sponsors visas; check each vacancy.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void load(query)
          }}
          className="mt-4 flex gap-2"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa097]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Company or job title"
              className="h-12 w-full rounded-2xl border border-[#ded7cb] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#e0511f]"
            />
          </div>
          <button type="submit" className="rounded-2xl bg-[#e0511f] px-5 text-sm font-bold text-white">
            Search
          </button>
        </form>

        {error && <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
        {loading ? (
          <p className="mt-6 text-sm text-[#7c827a]">Loading employers…</p>
        ) : employers.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-[#d8d2c6] bg-white/60 px-5 py-8 text-center text-sm text-[#6b716a]">
            No roles in {guide.name} on our jobs board yet. Use the official links above to find employers.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {employers.map((employer) => (
              <article key={employer.name} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold">{employer.name}</h4>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f6f3ec] px-2.5 py-1 text-xs font-bold text-[#4a5047]">
                    <Building2 className="h-3.5 w-3.5 text-[#e0511f]" />
                    {employer.jobCount} {employer.jobCount === 1 ? "role" : "roles"}
                  </span>
                </div>
                {employer.openings.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {employer.openings.map((job) => (
                      <li key={job.url} className="truncate">
                        <a href={job.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#1b231e] underline-offset-2 hover:underline">
                          {job.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {employer.careerUrl && (
                  <a href={employer.careerUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#e0511f]">
                    Careers site <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
