"use client"

import { useEffect, useRef, useState } from "react"
import { BadgeCheck, BookOpen, ExternalLink, Loader2, MapPin, Search, SlidersHorizontal, X } from "lucide-react"
import {
  INSTITUTION_KIND_LABELS,
  INSTITUTION_KINDS,
  type InstitutionKind,
  type UniversitySearchResult,
  type UniversitySort,
  type UniversityWithCount,
} from "@/lib/education/types"
import { COUNTRY_FLAGS, DataSourcesNote, PRIMARY, displayName } from "./shared"

const COUNTRIES = ["United Kingdom", "Australia", "Canada", "Ireland", "Netherlands"]

function Option({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition ${checked ? "bg-[#fff3ec]" : "hover:bg-[#f6f3ec]"}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 h-4 w-4 shrink-0 accent-[#e0511f]" />
      <span className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-[#1b231e]">{label}</span>
      {count != null && <span className="shrink-0 pt-px text-xs tabular-nums text-[#9aa094]">{count.toLocaleString()}</span>}
    </label>
  )
}

export function InstitutionDirectory({
  initialCountries = [],
  onFindCourses,
}: {
  initialCountries?: string[]
  onFindCourses: (university: UniversityWithCount) => void
}) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [countries, setCountries] = useState<string[]>(initialCountries)
  const [kinds, setKinds] = useState<InstitutionKind[]>([])
  const [sponsorOnly, setSponsorOnly] = useState(false)
  const [hasCourses, setHasCourses] = useState(false)
  const [sort, setSort] = useState<UniversitySort>("recommended")
  const [mobileFilters, setMobileFilters] = useState(false)
  const [result, setResult] = useState<UniversitySearchResult | null>(null)
  const [items, setItems] = useState<UniversityWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!mobileFilters) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileFilters])

  const params = (page: number) => {
    const out = new URLSearchParams()
    if (debouncedQuery) out.set("q", debouncedQuery)
    if (countries.length) out.set("country", countries.join("|"))
    if (kinds.length) out.set("kind", kinds.join("|"))
    if (sponsorOnly) out.set("sponsor", "1")
    if (hasCourses) out.set("courses", "1")
    if (sort !== "recommended") out.set("sort", sort)
    if (page > 1) out.set("page", String(page))
    return out.toString()
  }

  useEffect(() => {
    const id = ++requestId.current
    setLoading(true)
    void fetch(`/api/education/universities?${params(1)}`, { cache: "no-store" })
      .then((res) => res.json() as Promise<UniversitySearchResult>)
      .then((data) => {
        if (id !== requestId.current) return
        setResult(data)
        setItems(data.universities ?? [])
      })
      .finally(() => id === requestId.current && setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, countries, kinds, sponsorOnly, hasCourses, sort])

  async function loadMore() {
    if (!result) return
    const id = requestId.current
    setLoadingMore(true)
    try {
      const data = (await (await fetch(`/api/education/universities?${params(result.page + 1)}`, { cache: "no-store" })).json()) as UniversitySearchResult
      if (id !== requestId.current) return
      setResult({ ...result, page: data.page })
      setItems((current) => [...current, ...(data.universities ?? []).filter((u) => !current.some((c) => c.id === u.id))])
    } finally {
      setLoadingMore(false)
    }
  }

  const toggleIn = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  const total = result?.total ?? 0
  const activeCount = countries.length + kinds.length + (sponsorOnly ? 1 : 0) + (hasCourses ? 1 : 0)
  const clearFilters = () => {
    setCountries([])
    setKinds([])
    setSponsorOnly(false)
    setHasCourses(false)
  }
  const chips = [
    ...countries.map((country) => ({ id: country, label: `${COUNTRY_FLAGS[country] ?? "🎓"} ${country}`, remove: () => setCountries((c) => toggleIn(c, country)) })),
    ...kinds.map((kind) => ({ id: kind, label: INSTITUTION_KIND_LABELS[kind], remove: () => setKinds((k) => toggleIn(k, kind)) })),
    ...(sponsorOnly ? [{ id: "sponsor", label: "Licensed for student visas", remove: () => setSponsorOnly(false) }] : []),
    ...(hasCourses ? [{ id: "courses", label: "Courses listed here", remove: () => setHasCourses(false) }] : []),
  ]

  const filterPanel = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold">Filters</p>
        {activeCount > 0 && <button type="button" onClick={clearFilters} className="text-xs font-bold" style={{ color: PRIMARY }}>Clear all</button>}
      </div>
      <label className={`mt-3 flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition ${sponsorOnly ? "border-[#2f5d50] bg-[#e4f0ea]" : "border-transparent bg-[#eef5f1]"}`}>
        <input type="checkbox" checked={sponsorOnly} onChange={() => setSponsorOnly(!sponsorOnly)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#2f5d50]" />
        <span className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-[#1b231e]">
          <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 shrink-0 text-[#2f5d50]" /> Licensed for student visas</span>
          <span className="mt-0.5 block text-xs font-medium text-[#5f655c]">Can sponsor your study visa</span>
        </span>
      </label>
      <section className="border-b border-[#ece7dd] py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5047]">Destination</p>
        <div className="mt-2 space-y-0.5">
          {COUNTRIES.map((country) => (
            <Option key={country} checked={countries.includes(country)} onChange={() => setCountries((c) => toggleIn(c, country))} label={`${COUNTRY_FLAGS[country]} ${country}`} count={result?.countries?.[country] ?? 0} />
          ))}
        </div>
      </section>
      <section className="border-b border-[#ece7dd] py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5047]">Type</p>
        <div className="mt-2 space-y-0.5">
          {INSTITUTION_KINDS.map((kind) => (
            <Option key={kind} checked={kinds.includes(kind)} onChange={() => setKinds((k) => toggleIn(k, kind))} label={INSTITUTION_KIND_LABELS[kind]} count={result?.kinds?.[kind] ?? 0} />
          ))}
        </div>
      </section>
      <section className="pt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5047]">Courses</p>
        <div className="mt-2">
          <Option checked={hasCourses} onChange={() => setHasCourses(!hasCourses)} label="Only show institutions with courses listed here" />
        </div>
      </section>
    </>
  )

  return (
    <div className="mt-6 lg:grid lg:grid-cols-[296px_minmax(0,1fr)] lg:gap-7">
      <aside className="hidden self-start rounded-2xl border border-[#e4dfd5] bg-white px-5 py-4 lg:sticky lg:top-20 lg:block">{filterPanel}</aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa094]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search universities, colleges or cities"
              className="h-11 w-full rounded-xl border border-[#e4dfd5] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#e0511f]"
            />
          </div>
          <div className="flex gap-2">
            <select value={sort} onChange={(event) => setSort(event.target.value as UniversitySort)} aria-label="Sort institutions" className="h-11 min-w-0 flex-1 rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm font-semibold sm:flex-none">
              <option value="recommended">Universities first</option>
              <option value="courses">Most courses</option>
              <option value="name">A to Z</option>
            </select>
            <button type="button" onClick={() => setMobileFilters(true)} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#e4dfd5] bg-white px-4 text-sm font-bold lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeCount > 0 && <span className="rounded-full bg-[#e0511f] px-1.5 text-[10px] text-white">{activeCount}</span>}
            </button>
          </div>
        </div>

        {mobileFilters && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#f6f3ec] lg:hidden" role="dialog" aria-modal="true" aria-label="Institution filters">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] bg-white px-4 py-3">
              <p className="text-base font-extrabold">Filter institutions</p>
              <button type="button" onClick={() => setMobileFilters(false)} className="rounded-full p-2 hover:bg-[#f6f3ec]" aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white px-4 py-4">{filterPanel}</div>
            <div className="border-t border-[#e4dfd5] bg-white p-4">
              <button type="button" onClick={() => setMobileFilters(false)} className="h-12 w-full rounded-xl bg-[#1b231e] text-sm font-extrabold text-white">
                {loading ? "Updating…" : `Show ${total.toLocaleString()} ${total === 1 ? "institution" : "institutions"}`}
              </button>
            </div>
          </div>
        )}

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <span key={chip.id} className="inline-flex items-center gap-1.5 rounded-full border border-[#e4dfd5] bg-white py-1 pl-3 pr-1 text-xs font-bold text-[#1b231e]">
                {chip.label}
                <button type="button" onClick={chip.remove} className="rounded-full p-1 text-[#8a9086] hover:bg-[#f6f3ec] hover:text-[#1b231e]" aria-label={`Remove ${chip.label}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {chips.length > 1 && <button type="button" onClick={clearFilters} className="px-1 text-xs font-bold" style={{ color: PRIMARY }}>Clear all</button>}
          </div>
        )}

        <p className="mt-5 text-sm font-medium text-[#5f655c]">
          {loading ? "Loading institutions…" : <><span className="font-extrabold text-[#1b231e]">{total.toLocaleString()}</span> {total === 1 ? "institution" : "institutions"}</>}
        </p>

        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/70" />)
            : items.map((university) => {
                const name = displayName(university.name)
                const location = [university.city, university.country].filter(Boolean).join(", ")
                return (
                  <article key={university.id} className="flex flex-col rounded-2xl border border-[#e4dfd5] bg-white p-4 shadow-[0_1px_2px_rgba(27,35,30,0.04)] transition hover:border-[#d6cfc2] hover:shadow-[0_18px_40px_rgba(27,35,30,0.07)] sm:p-5">
                    <h3 className="text-[15px] font-extrabold leading-snug tracking-tight sm:text-base">{name}</h3>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium text-[#6b716a]">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" /> {COUNTRY_FLAGS[university.country] ?? "🎓"} {location}</span>
                      {university.institutionType && <span className="text-[#9aa094]">· {university.institutionType}</span>}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {university.studentSponsor && (
                        <span title={university.sponsorNote ?? undefined} className="inline-flex items-center gap-1 rounded-full bg-[#e8f1ed] px-2.5 py-1 text-[11px] font-bold text-[#285045]">
                          <BadgeCheck className="h-3.5 w-3.5" /> Visa sponsor
                        </span>
                      )}
                      {university.courseCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f3ec] px-2.5 py-1 text-[11px] font-bold text-[#3f463f]">
                          <BookOpen className="h-3.5 w-3.5" /> {university.courseCount.toLocaleString()} {university.courseCount === 1 ? "course" : "courses"}
                        </span>
                      )}
                    </div>
                    {university.summary && <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-[#5f655c]">{university.summary}</p>}
                    <div className="flex-1" />
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#efe9dd] pt-3 text-sm">
                      {university.courseCount > 0 ? (
                        <button type="button" onClick={() => onFindCourses(university)} className="inline-flex h-9 items-center rounded-xl bg-[#1b231e] px-3.5 text-xs font-extrabold text-white transition hover:bg-[#2f5d50]">
                          See courses
                        </button>
                      ) : (
                        <span className="text-xs text-[#8a9086]">Courses listed on the institution&apos;s site</span>
                      )}
                      <a
                        href={university.website ?? `https://www.google.com/search?q=${encodeURIComponent(`${name} ${university.city} international students`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#4a5047] hover:underline"
                      >
                        {university.website ? "Website" : "Find website"} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </article>
                )
              })}
        </div>

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d8d2c6] bg-white/60 px-6 py-12 text-center">
            <p className="font-extrabold">No institutions match</p>
            <p className="mt-1 text-sm text-[#5f655c]">Try a different name or city, or remove a filter.</p>
            {activeCount > 0 && <button type="button" onClick={clearFilters} className="mt-3 text-sm font-bold" style={{ color: PRIMARY }}>Clear filters</button>}
          </div>
        )}

        {!loading && items.length < total && (
          <div className="flex flex-col items-center gap-2 pt-5">
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e4dfd5] bg-white px-6 text-sm font-bold transition hover:border-[#2f5d50] disabled:opacity-60"
            >
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />} Show more
            </button>
            <p className="text-xs text-[#8a9086]">Showing {items.length.toLocaleString()} of {total.toLocaleString()}</p>
          </div>
        )}
        <DataSourcesNote />
      </div>
    </div>
  )
}
