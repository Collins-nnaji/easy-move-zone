"use client"

import { useMemo, useState } from "react"
import {
  Truck,
  Package,
  Archive,
  Home,
  FileCheck,
  Smartphone,
  Mail,
  Phone,
  Globe,
  BadgeCheck,
  Search,
  LayoutGrid,
  Filter,
  MapPin,
} from "lucide-react"
import type { VendorCategory, MoveVendor } from "@/lib/marketplace/vendors"

const CATEGORY_ICONS: Record<VendorCategory, React.ComponentType<{ className?: string }>> = {
  logistics: Truck,
  packing: Package,
  storage: Archive,
  removals: Home,
  document_visa: FileCheck,
  settling: Smartphone,
}

interface MarketplaceClientProps {
  categories: { id: VendorCategory; label: string; description: string }[]
  vendors: MoveVendor[]
  /** When true, used inside Hub: toolbar is rendered by Hub */
  hideToolbar?: boolean
  /** Initial category when embedded in Hub */
  initialCategory?: VendorCategory | "all"
  /** Controlled search (when provided by Hub) */
  searchQuery?: string
  countryFilter?: string
  onSearchQueryChange?: (v: string) => void
  onCountryFilterChange?: (v: string) => void
}

function getCategoryInfo(
  categories: { id: VendorCategory; label: string }[],
  id: VendorCategory
) {
  return categories.find((c) => c.id === id)?.label ?? id
}

function VendorCard({
  vendor,
  categoryLabel,
}: {
  vendor: MoveVendor
  categoryLabel: string
}) {
  const Icon = CATEGORY_ICONS[vendor.category]

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm transition hover:border-[#155eef]/40 hover:shadow-lg">
      {/* Card header with category strip */}
      <div className="flex items-center justify-between border-b border-[#f1f5f9] bg-[#f8fbff] px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#155eef]">
          {categoryLabel}
        </span>
        {vendor.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
            <BadgeCheck className="h-3 w-3" /> Verified
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#eef4ff] to-[#e0f2fe]">
            <Icon className="h-6 w-6 text-[#155eef]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-[var(--font-playfair)] text-lg font-semibold text-[#0f172a] group-hover:text-[#155eef] transition">
              {vendor.name}
            </h3>
            <p className="mt-0.5 text-sm text-[#64748b] line-clamp-2">{vendor.tagline}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {vendor.highlights.slice(0, 4).map((h) => (
            <span
              key={h}
              className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[11px] text-[#475569]"
            >
              {h}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#64748b]">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{vendor.countries.join(", ")}</span>
          {vendor.cities?.length ? (
            <span className="text-[#94a3b8]">· {vendor.cities.slice(0, 2).join(", ")}</span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#f1f5f9] pt-4">
          {vendor.email && (
            <a
              href={`mailto:${vendor.email}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#155eef] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0f4bb5]"
            >
              <Mail className="h-3.5 w-3.5" /> Contact
            </a>
          )}
          {vendor.phone && !vendor.email && (
            <a
              href={`tel:${vendor.phone}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#155eef] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0f4bb5]"
            >
              <Phone className="h-3.5 w-3.5" /> Call
            </a>
          )}
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] px-3 py-2.5 text-xs font-semibold text-[#0f172a] transition hover:bg-[#f8fbff]"
            >
              <Globe className="h-3.5 w-3.5" />
            </a>
          )}
          {!vendor.email && !vendor.phone && (
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-[#f8fbff] px-4 py-2.5 text-xs font-medium text-[#64748b]">
              Contact option coming soon
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export function MarketplaceClient({
  categories,
  vendors,
  hideToolbar,
  initialCategory,
  searchQuery: searchQueryProp,
  countryFilter: countryFilterProp,
  onSearchQueryChange,
  onCountryFilterChange,
}: MarketplaceClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | "all">(initialCategory ?? "all")
  const [internalCountry, setInternalCountry] = useState("")
  const [internalSearch, setInternalSearch] = useState("")
  const searchQuery = searchQueryProp ?? internalSearch
  const setSearchQuery = onSearchQueryChange ?? ((v: string) => setInternalSearch(v))
  const countryFilter = countryFilterProp ?? internalCountry
  const setCountryFilter = onCountryFilterChange ?? ((v: string) => setInternalCountry(v))

  const allCountries = useMemo(() => {
    const set = new Set<string>()
    vendors.forEach((v) => v.countries.forEach((c) => set.add(c)))
    return Array.from(set).sort()
  }, [vendors])

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      if (selectedCategory !== "all" && v.category !== selectedCategory) return false
      if (countryFilter && !v.countries.some((c) => c.toLowerCase() === countryFilter.toLowerCase()))
        return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !v.name.toLowerCase().includes(q) &&
          !v.tagline.toLowerCase().includes(q) &&
          !v.highlights.some((h) => h.toLowerCase().includes(q))
        )
          return false
      }
      return true
    })
  }, [vendors, selectedCategory, countryFilter, searchQuery])

  const searchAndCountryBar = (
    <div className="sticky top-[65px] z-10 border-b border-[#e2e8f0] bg-white/95 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="search"
            placeholder="Search services…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fbff] py-2.5 pl-9 pr-3 text-sm placeholder:text-[#94a3b8] focus:border-[#155eef] focus:outline-none focus:ring-1 focus:ring-[#155eef]/20"
          />
        </div>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-[#0f172a] focus:border-[#155eef] focus:outline-none"
        >
          <option value="">All countries</option>
          {allCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-xs text-[#94a3b8]">
          {filteredVendors.length} service{filteredVendors.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl">
      {!hideToolbar ? (
        <>
          <div className="sticky top-[65px] z-10 border-b border-[#e2e8f0] bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="search"
                  placeholder="Search services (e.g. packing, Lagos, storage…)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fbff] py-3 pl-11 pr-4 text-sm placeholder:text-[#94a3b8] focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#64748b]">
                  <Filter className="h-3.5 w-3.5" /> Category
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      selectedCategory === "all"
                        ? "bg-[#155eef] text-white"
                        : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.id]
                    const isActive = selectedCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                          isActive
                            ? "bg-[#155eef] text-white"
                            : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-[#64748b]">Serves</span>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-[#0f172a] focus:border-[#155eef] focus:outline-none"
                >
                  <option value="">All countries</option>
                  {allCountries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-[#94a3b8]">
                  {filteredVendors.length} service{filteredVendors.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : onSearchQueryChange == null ? (
        searchAndCountryBar
      ) : null}

      {/* Results grid */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {filteredVendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e2e8f0] bg-[#f8fbff] py-16 text-center">
            <LayoutGrid className="h-12 w-12 text-[#cbd5e1]" />
            <p className="mt-4 font-semibold text-[#475569]">No services match your filters</p>
            <p className="mt-1 text-sm text-[#64748b]">Try a different category or country.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all")
                setCountryFilter("")
                setSearchQuery("")
              }}
              className="mt-4 rounded-full bg-[#155eef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f4bb5]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVendors.map((v) => (
              <VendorCard
                key={v.id}
                vendor={v}
                categoryLabel={getCategoryInfo(categories, v.category)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
