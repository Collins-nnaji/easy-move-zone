"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { AlertTriangle, ArrowRight, BadgeCheck, Briefcase, ExternalLink, Loader2, MapPin, Search } from "lucide-react"

const PRIMARY = "#2f5d50"
const GOV_REGISTER_URL = "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
const SUGGESTIONS = ["NHS", "Deloitte", "Tesco", "University"]
const MAX_GROUPS = 6
/** `searchSponsors` returns at most this many rows. */
const API_ROW_LIMIT = 20

type SponsorRow = {
  id: number
  name: string
  city: string | null
  county: string | null
  typeAndRating: string | null
  route: string | null
  jobCount: number
}

type SponsorGroup = {
  key: string
  name: string
  place: string
  ratings: string[]
  routes: string[]
  jobCount: number
}

/** The register lists one row per organisation, town and route; show one card per organisation and town. */
function groupRows(rows: SponsorRow[]): SponsorGroup[] {
  const groups = new Map<string, SponsorGroup>()
  for (const row of rows) {
    const key = `${row.name.trim().toLowerCase()}|${(row.city ?? "").trim().toLowerCase()}`
    const group = groups.get(key) ?? {
      key,
      name: row.name.trim(),
      place: [row.city, row.county].filter(Boolean).join(", ") || "United Kingdom",
      ratings: [],
      routes: [],
      jobCount: 0,
    }
    if (row.typeAndRating && !group.ratings.includes(row.typeAndRating)) group.ratings.push(row.typeAndRating)
    if (row.route && !group.routes.includes(row.route)) group.routes.push(row.route)
    group.jobCount = Math.max(group.jobCount, row.jobCount ?? 0)
    groups.set(key, group)
  }
  return [...groups.values()]
}

function RatingBadge({ rating }: { rating: string }) {
  const downgraded = /B rating/i.test(rating)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        downgraded ? "bg-amber-50 text-amber-800" : "bg-[#e5efeb] text-[#285045]"
      }`}
    >
      {downgraded ? <AlertTriangle className="h-3 w-3" aria-hidden /> : <BadgeCheck className="h-3 w-3" aria-hidden />}
      {rating}
    </span>
  )
}

export function SponsorLookup({
  fullSearchHref,
  fullSearchLabel,
  registerDate,
}: {
  fullSearchHref: string
  fullSearchLabel: string
  registerDate: string | null
}) {
  const [query, setQuery] = useState("")
  const [searched, setSearched] = useState("")
  const [groups, setGroups] = useState<SponsorGroup[]>([])
  const [capped, setCapped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null)

  useEffect(() => () => controller.current?.abort(), [])

  function clearResults() {
    setGroups([])
    setSearched("")
    setCapped(false)
  }

  async function runSearch(value: string) {
    const q = value.trim()
    if (q.length < 2) {
      controller.current?.abort()
      setLoading(false)
      clearResults()
      setError("Type at least 2 characters of the company name.")
      return
    }
    controller.current?.abort()
    const next = new AbortController()
    controller.current = next
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sponsors/search?q=${encodeURIComponent(q)}`, { signal: next.signal })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Search failed")
      const rows: SponsorRow[] = Array.isArray(data) ? data : []
      setGroups(groupRows(rows))
      setCapped(rows.length >= API_ROW_LIMIT)
      setSearched(q)
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      clearResults()
      setError("We couldn't search the register just now. Please try again.")
    } finally {
      if (controller.current === next) setLoading(false)
    }
  }

  const shown = groups.slice(0, MAX_GROUPS)

  return (
    <div className="mx-auto w-full max-w-2xl text-left">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          void runSearch(query)
        }}
        className="flex flex-col gap-2 rounded-2xl border border-[#d8d2c6] bg-white p-2 shadow-[0_18px_40px_rgba(27,35,30,0.08)] sm:flex-row"
      >
        <label htmlFor="sponsor-lookup" className="sr-only">
          Company name
        </label>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a9087]" aria-hidden />
          <input
            id="sponsor-lookup"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter a company name, e.g. Deloitte"
            autoComplete="organization"
            className="h-12 w-full rounded-xl bg-[#f6f3ec] pl-11 pr-3 text-base text-[#1b231e] outline-none placeholder:text-[#8a9087] focus:ring-2 focus:ring-[#2f5d50]/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-bold text-white transition hover:brightness-105 disabled:opacity-70"
          style={{ background: PRIMARY }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
          Check sponsor
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#6e746b]">
        <span>Try:</span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setQuery(suggestion)
              void runSearch(suggestion)
            }}
            className="rounded-full border border-[#d8d2c6] bg-white/80 px-3 py-1 text-[#1b231e] transition hover:border-[#2f5d50]/50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-4">
        {error && <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">{error}</p>}

        {!error && searched && groups.length === 0 && !loading && (
          <div className="rounded-2xl border border-[#e4dfd5] bg-white p-5 text-sm leading-relaxed text-[#5f655c]">
            <p className="font-extrabold text-[#1b231e]">No licensed sponsor found for &ldquo;{searched}&rdquo;.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>The register uses registered company names, which can differ from brand names. Try part of the name.</li>
              <li>The employer may have been licensed recently. Check the official GOV.UK register to be sure.</li>
              <li>If it isn&apos;t listed, the employer can&apos;t currently sponsor you unless it applies for a licence.</li>
            </ul>
            <a
              href={GOV_REGISTER_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-bold underline-offset-4 hover:underline"
              style={{ color: PRIMARY }}
            >
              Open the official register <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        )}

        {shown.length > 0 && (
          <div className="rounded-2xl border border-[#e4dfd5] bg-white">
            <p className="border-b border-[#ece7dd] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#6e746b] sm:px-5">
              {groups.length}
              {capped ? "+" : ""} licensed {groups.length === 1 && !capped ? "sponsor" : "sponsors"} matching &ldquo;{searched}&rdquo;
            </p>
            <ul className="divide-y divide-[#ece7dd]">
              {shown.map((group) => (
                <li key={group.key} className="px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex items-start gap-2 font-extrabold text-[#1b231e]">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PRIMARY }} aria-label="Licensed sponsor" />
                        <span className="min-w-0 break-words">{group.name}</span>
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 pl-6 text-xs text-[#6e746b]">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {group.place}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-6 sm:justify-end sm:pl-0">
                      {group.ratings.map((rating) => (
                        <RatingBadge key={rating} rating={rating} />
                      ))}
                    </div>
                  </div>
                  {group.routes.length > 0 && (
                    <p className="mt-2 pl-6 text-xs leading-relaxed text-[#5f655c]">
                      <span className="font-bold text-[#1b231e]">Routes:</span> {group.routes.join(" · ")}
                    </p>
                  )}
                  {group.jobCount > 0 && (
                    <p className="mt-1.5 flex items-center gap-1.5 pl-6 text-xs font-bold" style={{ color: PRIMARY }}>
                      <Briefcase className="h-3.5 w-3.5" aria-hidden />
                      {group.jobCount} {group.jobCount === 1 ? "role" : "roles"} in our jobs database
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-[#ece7dd] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-[#6e746b]">
                {groups.length > MAX_GROUPS || capped ? `Showing the top ${shown.length} matches. ` : ""}
                See careers pages, open roles and occupation codes in the full search.
              </p>
              <Link
                href={fullSearchHref}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline"
                style={{ color: PRIMARY }}
              >
                {fullSearchLabel} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-[#7c827a]">
        Searches our copy of the Home Office register of licensed sponsors{registerDate ? `, dated ${registerDate}` : ""}.{" "}
        A licence means an employer can sponsor, not that every vacancy does.{" "}
        <a href={GOV_REGISTER_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          Official register
        </a>
      </p>
    </div>
  )
}
