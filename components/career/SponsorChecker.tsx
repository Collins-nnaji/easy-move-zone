"use client"

import { useState } from "react"
import { ArrowLeft, Building2, ChevronRight, ExternalLink, MapPin, Search } from "lucide-react"
import { CountryRouteGuide } from "@/components/career/CountryRouteGuide"
import { COUNTRY_GUIDES, getCountryGuide } from "@/lib/sponsors/country-guides"

type Sponsor = {
  id: number
  name: string
  city: string | null
  county: string | null
  typeAndRating: string | null
  route: string | null
  careerUrl: string | null
  careerUrlSource: "saved" | "jobs" | null
  jobCount: number
  matchedCompany: string | null
  openings: Array<{ title: string; url: string }>
}

type OccupationCode = {
  code: string
  jobType: string
  relatedJobTitles: string | null
  standardGoingRate: string | null
  lowerGoingRate: string | null
}

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{sponsor.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5f655c]">
            <MapPin className="h-4 w-4" />
            {[sponsor.city, sponsor.county].filter(Boolean).join(", ") || "United Kingdom"}
          </p>
        </div>
        {sponsor.typeAndRating && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
            {sponsor.typeAndRating}
          </span>
        )}
      </div>
      {sponsor.route && (
        <p className="mt-2 text-sm text-[#5f655c]">
          Route: <span className="font-semibold text-[#1b231e]">{sponsor.route}</span>
        </p>
      )}
      <div className="mt-4 rounded-xl bg-[#f6f3ec] p-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Building2 className="h-4 w-4 text-[#e0511f]" />
          {sponsor.jobCount > 0 ? `${sponsor.jobCount} roles in our jobs database` : "No matching roles in our jobs database yet"}
        </div>
        {sponsor.careerUrl ? (
          <a
            href={sponsor.careerUrl}
            target="_blank"
            rel="noreferrer"
            className={
              sponsor.careerUrlSource === "saved"
                ? "mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e0511f] px-4 py-2 text-sm font-bold text-white hover:bg-[#c9461a]"
                : "mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#e0511f]"
            }
          >
            {sponsor.careerUrlSource === "saved" ? "Visit careers page" : "Careers site from job links"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <p className="mt-2 text-sm text-[#7c827a]">No careers page on file for this employer yet.</p>
        )}
        {sponsor.openings.length > 0 && (
          <ul className="mt-3 space-y-1">
            {sponsor.openings.map((job) => (
              <li key={job.url}>
                <a href={job.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#1b231e] underline-offset-2 hover:underline">
                  {job.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

export function SponsorChecker() {
  const [activeCountry, setActiveCountry] = useState<string | null>(null)
  const [tab, setTab] = useState<"companies" | "codes">("companies")
  const [query, setQuery] = useState("")
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [codes, setCodes] = useState<OccupationCode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState("")
  const [featured, setFeatured] = useState<{ sponsors: Sponsor[]; total: number } | null>(null)
  const [featuredLoading, setFeaturedLoading] = useState(false)

  async function openUk() {
    setActiveCountry("uk")
    setFeaturedLoading(true)
    try {
      const res = await fetch("/api/sponsors/careers", { cache: "no-store" })
      const data = await res.json()
      if (res.ok) setFeatured({ sponsors: data.sponsors ?? [], total: data.total ?? 0 })
    } catch {
      // The search still works without this list.
    } finally {
      setFeaturedLoading(false)
    }
  }

  async function search(event?: React.FormEvent, mode = tab) {
    event?.preventDefault()
    const q = query.trim()
    if (mode === "companies" && q.length < 2) {
      setError("Type at least 2 characters.")
      return
    }
    setLoading(true)
    setError(null)
    setSearched(q)
    try {
      const path = mode === "companies" ? "/api/sponsors/search" : "/api/occupation-codes"
      const res = await fetch(`${path}?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Search failed")
      if (mode === "companies") setSponsors(data)
      else setCodes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setLoading(false)
    }
  }

  const guide = activeCountry && activeCountry !== "uk" ? getCountryGuide(activeCountry) : undefined
  if (guide) return <CountryRouteGuide guide={guide} onBack={() => setActiveCountry(null)} />

  if (!activeCountry) {
    return (
      <div>
        <button
          type="button"
          onClick={() => void openUk()}
          className="group flex w-full flex-col rounded-2xl border border-[#e4dfd5] bg-white px-5 py-4 text-left shadow-sm transition hover:border-[#e0511f]/50 hover:shadow-md sm:flex-row sm:items-center sm:gap-5"
        >
          <span className="text-4xl" aria-hidden>🇬🇧</span>
          <span className="mt-3 min-w-0 flex-1 sm:mt-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight">United Kingdom</span>
              <span className="rounded-full bg-[#e0511f] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Live register</span>
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-[#5f655c]">
              Skilled Worker visa. Search every licensed sponsor and SOC occupation code, with links to careers pages when we hold jobs for that employer.
            </span>
          </span>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#e0511f] group-hover:underline sm:mt-0">
            Search sponsors <ChevronRight className="h-4 w-4" />
          </span>
        </button>

        <p className="mb-3 mt-6 text-sm font-semibold text-[#5f655c]">More countries with skilled worker routes</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COUNTRY_GUIDES.map((country) => (
            <button
              key={country.id}
              type="button"
              onClick={() => setActiveCountry(country.id)}
              className="group flex flex-col rounded-2xl border border-[#e4dfd5] bg-white p-5 text-left transition hover:border-[#e0511f]/50 hover:shadow-md"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-3xl" aria-hidden>{country.flag}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    country.register ? "bg-[#e8f1ed] text-[#285045]" : "bg-[#f6f3ec] text-[#6b716a]"
                  }`}
                >
                  {country.register ? "Official list" : "Route guide"}
                </span>
              </span>
              <span className="mt-3 text-lg font-extrabold tracking-tight">{country.name}</span>
              <span className="mt-1 text-sm leading-relaxed text-[#5f655c]">{country.headline}</span>
              <span className="mt-3 truncate text-xs font-semibold text-[#8a9086]">{country.routes.map((route) => route.name).join(" · ")}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setActiveCountry(null)
          setError(null)
          setSearched("")
          setSponsors([])
          setCodes([])
          setQuery("")
        }}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#5f655c] hover:text-[#1b231e]"
      >
        <ArrowLeft className="h-4 w-4" />
        All countries
      </button>

      <div className="mb-5 rounded-3xl border border-[#e4dfd5] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl" aria-hidden>
            🇬🇧
          </span>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">UK sponsor register</h2>
            <p className="text-sm text-[#5f655c]">Licensed sponsors · SOC occupation codes</p>
          </div>
        </div>
      </div>

      <div className="inline-flex rounded-full bg-white p-1">
        {([
          ["companies", "Companies"],
          ["codes", "Occupation codes"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (id === tab) return
              setTab(id)
              setError(null)
              setSearched("")
              if (id === "codes") void search(undefined, "codes")
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === id ? "bg-[#1b231e] text-white" : "text-[#4a5047]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={(event) => void search(event)} className="mt-4 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa097]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tab === "companies" ? "Company name or city" : "SOC code or job type"}
            className="h-12 w-full rounded-2xl border border-[#ded7cb] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#e0511f]"
            autoFocus
          />
        </div>
        <button type="submit" className="rounded-2xl bg-[#e0511f] px-5 text-sm font-bold text-white">
          Search
        </button>
      </form>

      <p className="mt-3 max-w-2xl text-sm text-[#7c827a]">
        {tab === "companies"
          ? "A company on this register is licensed to sponsor workers in the UK. That is not the same as this vacancy offering sponsorship."
          : "Eligible Skilled Worker occupations with their going rates. Search by 4-digit SOC code or job title, e.g. 2136, nurse, software developer."}
      </p>
      {error && <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
      {loading && <p className="mt-6 text-sm text-[#7c827a]">Searching the register…</p>}

      {!loading && tab === "companies" && searched && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-[#5f655c]">
            {sponsors.length === 1 ? "1 licensed sponsor" : `${sponsors.length} licensed sponsors`}
          </p>
          {sponsors.map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      )}

      {!loading && tab === "companies" && !searched && (featuredLoading || (featured && featured.sponsors.length > 0)) && (
        <div className="mt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-extrabold tracking-tight">Sponsors with careers pages</h3>
            {featured && featured.total > featured.sponsors.length && (
              <p className="text-xs font-semibold text-[#7c827a]">
                Showing {featured.sponsors.length} of {featured.total.toLocaleString()} · search to find more
              </p>
            )}
          </div>
          <p className="mt-1 text-sm text-[#5f655c]">Licensed sponsors whose careers page we track. Apply directly on their site.</p>
          {featuredLoading && !featured && <p className="mt-4 text-sm text-[#7c827a]">Loading sponsors…</p>}
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {featured?.sponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        </div>
      )}

      {!loading && tab === "codes" && !error && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-[#5f655c]">
            {codes.length === 0
              ? searched ? `No occupation codes match “${searched}”. Try one word, like “engineer” or “nurse”.` : ""
              : searched ? `${codes.length === 1 ? "1 occupation" : `${codes.length} occupations`} matching “${searched}”` : `All ${codes.length} eligible occupations · search to narrow down`}
          </p>
          {codes.map((code) => (
            <article key={code.code} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{code.jobType}</h3>
                  {code.relatedJobTitles && code.relatedJobTitles.trim() !== code.jobType.trim() && (
                    <p className="mt-1 text-sm text-[#5f655c]">{code.relatedJobTitles.split(/\n+/).map((title) => title.trim()).filter(Boolean).join(" · ")}</p>
                  )}
                </div>
                <span className="rounded-lg bg-[#efece4] px-2.5 py-1 text-xs font-bold">{code.code}</span>
              </div>
              <p className="mt-3 text-sm text-[#5f655c]">
                {code.lowerGoingRate ? "Standard going rate" : "Going rate"}: {code.standardGoingRate?.replace(/\s+/g, " ") || "—"}
                {code.lowerGoingRate ? ` · Lower ${code.lowerGoingRate.replace(/\s+/g, " ")}` : ""}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
