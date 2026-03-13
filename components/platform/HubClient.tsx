"use client"

import { useState, useMemo } from "react"
import { Store, Building2, Filter, Search } from "lucide-react"
import type { VendorCategory } from "@/lib/marketplace/vendors"
import { VENDOR_CATEGORIES, MOVE_VENDORS } from "@/lib/marketplace/vendors"
import { MortgageBrokersSection } from "@/components/platform/MortgageBrokersSection"
import { MarketplaceClient } from "@/components/platform/MarketplaceClient"
import {
  Truck,
  Package,
  Archive,
  Home,
  FileCheck,
  Smartphone,
} from "lucide-react"

const CATEGORY_ICONS: Record<VendorCategory, React.ComponentType<{ className?: string }>> = {
  logistics: Truck,
  packing: Package,
  storage: Archive,
  removals: Home,
  document_visa: FileCheck,
  settling: Smartphone,
}

type HubCategory = "all" | VendorCategory | "financing"

export function HubClient() {
  const [selectedCategory, setSelectedCategory] = useState<HubCategory>("all")
  const [hubSearchQuery, setHubSearchQuery] = useState("")
  const [hubCountryFilter, setHubCountryFilter] = useState("")

  const hubVendorCountries = useMemo(() => {
    const set = new Set<string>()
    MOVE_VENDORS.forEach((v) => v.countries.forEach((c) => set.add(c)))
    return Array.from(set).sort()
  }, [])

  const showSearchBar = selectedCategory !== "financing"

  return (
    <>
      {/* Filter then search in one strip — all services */}
      <div className="sticky top-[65px] z-10 border-b border-[#e2e8f0] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          {/* Category filter */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#64748b]">
              <Filter className="h-3.5 w-3.5" /> Category
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === "all"
                    ? "bg-[#155eef] text-white"
                    : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                }`}
              >
                <Store className="h-3.5 w-3.5" />
                All
              </button>
              {VENDOR_CATEGORIES.map((cat) => {
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
              <button
                type="button"
                onClick={() => setSelectedCategory("financing")}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === "financing"
                    ? "bg-[#155eef] text-white"
                    : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                Financing
              </button>
            </div>
          </div>

          {/* Search bar — right after filter, only when showing services (not only financing) */}
          {showSearchBar && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="search"
                  placeholder="Search services…"
                  value={hubSearchQuery}
                  onChange={(e) => setHubSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fbff] py-2.5 pl-9 pr-3 text-sm placeholder:text-[#94a3b8] focus:border-[#155eef] focus:outline-none focus:ring-1 focus:ring-[#155eef]/20"
                />
              </div>
              <select
                value={hubCountryFilter}
                onChange={(e) => setHubCountryFilter(e.target.value)}
                className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-[#0f172a] focus:border-[#155eef] focus:outline-none"
              >
                <option value="">All countries</option>
                {hubVendorCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content: one integrated flow */}
      {selectedCategory === "financing" && (
        <div className="mx-auto max-w-7xl">
          <MortgageBrokersSection />
        </div>
      )}

      {selectedCategory === "all" && (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MortgageBrokersSection />
          </div>
          <MarketplaceClient
            key="all"
            categories={VENDOR_CATEGORIES}
            vendors={MOVE_VENDORS}
            hideToolbar
            initialCategory="all"
            searchQuery={hubSearchQuery}
            countryFilter={hubCountryFilter}
            onSearchQueryChange={setHubSearchQuery}
            onCountryFilterChange={setHubCountryFilter}
          />
        </>
      )}

      {selectedCategory !== "all" && selectedCategory !== "financing" && (
        <MarketplaceClient
          key={selectedCategory}
          categories={VENDOR_CATEGORIES}
          vendors={MOVE_VENDORS}
          hideToolbar
          initialCategory={selectedCategory}
          searchQuery={hubSearchQuery}
          countryFilter={hubCountryFilter}
          onSearchQueryChange={setHubSearchQuery}
          onCountryFilterChange={setHubCountryFilter}
        />
      )}
    </>
  )
}
