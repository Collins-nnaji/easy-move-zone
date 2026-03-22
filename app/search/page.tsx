import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  BadgeCheck,
  Sparkles,
} from "lucide-react"

const filters = {
  cities: ["All Cities", "Lagos", "Abuja", "Accra", "Nairobi", "Port Harcourt", "Ibadan", "Johannesburg"],
  types: ["All Types", "Land", "House", "Apartment", "Commercial"],
  verification: ["Any Status", "Verified Only", "Pending", "Unverified"],
  priceRanges: ["Any Price", "Under ₦10M", "₦10M – ₦50M", "₦50M – ₦100M", "₦100M – ₦500M", "₦500M+"],
}

const mockListings = [
  { id: "1", title: "Verified 800sqm Plot — Lekki Phase 2", city: "Lagos", neighborhood: "Lekki Phase 2", price: "₦85,000,000", size: "800 sqm", type: "Land", status: "verified" as const, aiValue: "₦82M – ₦90M", gradient: "linear-gradient(135deg, #0a1628, #1a4a7a)" },
  { id: "2", title: "Title-Clear 3BR Detached — Maitama", city: "Abuja", neighborhood: "Maitama", price: "₦120,000,000", size: "450 sqm", type: "House", status: "verified" as const, aiValue: "₦115M – ₦128M", gradient: "linear-gradient(135deg, #0a2818, #1a6a4a)" },
  { id: "3", title: "600sqm C of O Land — East Legon", city: "Accra", neighborhood: "East Legon", price: "GH₵2,800,000", size: "600 sqm", type: "Land", status: "verified" as const, aiValue: "GH₵2.6M – GH₵3.0M", gradient: "linear-gradient(135deg, #281a08, #6a4a2a)" },
  { id: "4", title: "1200sqm Industrial Plot — Apapa", city: "Lagos", neighborhood: "Apapa", price: "₦250,000,000", size: "1,200 sqm", type: "Commercial", status: "pending" as const, aiValue: "₦240M – ₦265M", gradient: "linear-gradient(135deg, #1a0a28, #4a1a6a)" },
  { id: "5", title: "4BR Semi-Detached — Gwarinpa", city: "Abuja", neighborhood: "Gwarinpa", price: "₦75,000,000", size: "380 sqm", type: "House", status: "verified" as const, aiValue: "₦70M – ₦80M", gradient: "linear-gradient(135deg, #0a2828, #1a6a6a)" },
  { id: "6", title: "500sqm Residential — Ikoyi", city: "Lagos", neighborhood: "Ikoyi", price: "₦350,000,000", size: "500 sqm", type: "Land", status: "verified" as const, aiValue: "₦330M – ₦370M", gradient: "linear-gradient(135deg, #280a0a, #6a1a1a)" },
  { id: "7", title: "2BR Luxury Apartment — Victoria Island", city: "Lagos", neighborhood: "Victoria Island", price: "₦95,000,000", size: "140 sqm", type: "Apartment", status: "verified" as const, aiValue: "₦90M – ₦102M", gradient: "linear-gradient(135deg, #0a1a28, #1a3a5a)" },
  { id: "8", title: "1,000sqm Fenced Plot — Karen", city: "Nairobi", neighborhood: "Karen", price: "KSh 45,000,000", size: "1,000 sqm", type: "Land", status: "pending" as const, aiValue: "KSh 42M – KSh 48M", gradient: "linear-gradient(135deg, #180a28, #3a1a5a)" },
  { id: "9", title: "3BR Bungalow — Asokoro", city: "Abuja", neighborhood: "Asokoro", price: "₦200,000,000", size: "550 sqm", type: "House", status: "verified" as const, aiValue: "₦185M – ₦215M", gradient: "linear-gradient(135deg, #281808, #5a3a1a)" },
]

const statusStyles: Record<string, { bg: string; color: string }> = {
  verified: { bg: "#f0fdf4", color: "#059669" },
  pending: { bg: "#fffbeb", color: "#d97706" },
  unverified: { bg: "#f8fafc", color: "#94a3b8" },
}

export default function SearchPage() {
  return (
    <PublicShell>
      {/* Search hero */}
      <section className="relative overflow-hidden border-b border-[#e2e8f0]/80 bg-gradient-to-br from-white via-[#f8fafc] to-[#eef2ff]/40">
        <div className="pointer-events-none absolute inset-0 opacity-[0.4]" aria-hidden>
          <div className="home-hero-grid h-full w-full opacity-50" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <span className="emz-section-eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Discover
            </span>
            <h1 className="mt-4 font-[var(--font-playfair)] text-4xl font-bold tracking-tight text-[#0f172a] md:text-5xl">
              Find verified property
            </h1>
            <p className="mt-3 text-lg text-[#475569]">
              Search by city, filter by verification status, or describe what you want — results are title-checked on platform.
            </p>
          </div>

          <div className="emz-hero-bento relative p-1.5 sm:p-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Location, neighbourhood, property type, or budget…"
                  className="w-full rounded-[1rem] border border-[#e2e8f0]/90 bg-white/95 py-3.5 pl-12 pr-4 text-[15px] text-[#0f172a] shadow-inner shadow-black/[0.02] placeholder:text-[#94a3b8] focus:border-[#155eef]/35 focus:outline-none focus:ring-2 focus:ring-[#155eef]/12"
                />
              </div>
              <button
                type="button"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[1rem] border border-[#e2e8f0] bg-white px-5 py-3.5 text-sm font-semibold text-[#475569] shadow-sm transition hover:border-[#155eef]/25 hover:bg-[#f8fafc] md:rounded-xl"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e2e8f0]/60 pt-4">
              {filters.cities.slice(0, 6).map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    city === "All Cities"
                      ? "bg-gradient-to-r from-[#155eef] to-[#1249d1] text-white shadow-md shadow-[#155eef]/20"
                      : "border border-[#e2e8f0] bg-white/80 text-[#475569] hover:border-[#155eef]/25 hover:bg-[#155eef]/5"
                  }`}
                >
                  {city}
                </button>
              ))}
              <button
                type="button"
                className="rounded-full border border-dashed border-[#cbd5e1] px-3.5 py-1.5 text-xs font-semibold text-[#64748b] hover:border-[#155eef]/30 hover:text-[#155eef]"
              >
                More <ChevronDown className="ml-1 inline h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#64748b]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] px-3 py-1 text-xs font-semibold text-[#059669] ring-1 ring-[#bbf7d0]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verification-first catalogue
            </span>
            <span>Updated daily across West &amp; East Africa</span>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-[#e2e8f0]/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[#64748b]">
                Showing{" "}
                <strong className="text-[#0f172a]">{mockListings.length}</strong> properties
              </p>
              <p className="mt-1 text-xs text-[#94a3b8]">Sorted by relevance · Title status shown on every card</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Sort</span>
              <select className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-medium text-[#0f172a] shadow-sm focus:border-[#155eef]/40 focus:outline-none focus:ring-2 focus:ring-[#155eef]/10">
                <option>Most relevant</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockListings.map((listing) => {
              const sty = statusStyles[listing.status]
              return (
                <Link
                  key={listing.id}
                  href={`/properties/${listing.id}`}
                  className="emz-rich-card group block overflow-hidden p-0"
                >
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className="absolute inset-0 transition duration-700 group-hover:scale-105"
                      style={{ background: listing.gradient }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/75 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-sm" style={{ backgroundColor: sty.bg }}>
                      {listing.status === "verified" && <BadgeCheck className="h-3 w-3" style={{ color: sty.color }} />}
                      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: sty.color }}>
                        {listing.status}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                      {listing.type}
                    </div>
                    <div className="absolute bottom-3 left-4">
                      <p className="text-sm font-bold text-white drop-shadow">{listing.city}</p>
                      <p className="text-xs text-white/85">{listing.neighborhood}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold leading-snug text-[#0f172a] transition-colors group-hover:text-[#155eef]">{listing.title}</h3>
                    <div className="mt-3 flex items-center justify-between border-t border-[#e2e8f0]/80 pt-3">
                      <div className="font-[var(--font-playfair)] text-lg font-bold text-[#0f172a]">{listing.price}</div>
                      <span className="rounded-lg bg-[#f1f5f9] px-2 py-1 text-xs font-semibold text-[#64748b]">{listing.size}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-[#bbf7d0]/50 bg-[#f0fdf4] px-3 py-2 text-xs">
                      <TrendingUp className="h-3.5 w-3.5 text-[#059669]" />
                      <span className="font-semibold text-[#059669]">AI value: {listing.aiValue}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-[#155eef]/15 bg-gradient-to-br from-[#eff6ff] to-white p-8 text-center shadow-sm">
            <p className="font-[var(--font-playfair)] text-xl font-bold text-[#0f172a]">Not seeing a perfect match?</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[#475569]">
              Tell our assistant what you need — we&apos;ll scan new listings and verification updates for you.
            </p>
            <Link
              href="/about"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#155eef] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#155eef]/25 transition hover:bg-[#1249d1]"
            >
              How verification works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
