import Link from "next/link"
import {
  MapPin,
  Home,
  TrendingUp,
  Ruler,
  Calendar,
  FileCheck,
  MessageSquare,
  Heart,
  Share2,
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Eye,
  BedDouble,
  Bath,
  Plane,
} from "lucide-react"
import type { PropertyRow } from "@/lib/property/db-row"
import { formatAiRange, formatNgnPrice, parseImages } from "@/lib/property/db-row"
import { listingHeroStyle, rowToPublicCard } from "@/lib/property/map-public"
import { PropertyEnquiry } from "@/components/property/PropertyEnquiry"

function parseStringArray(json: unknown): string[] {
  if (!Array.isArray(json)) return []
  return json.filter((x): x is string => typeof x === "string" && x.length > 0)
}

const statusConfig: Record<
  string,
  { bg: string; color: string; border: string; icon: typeof BadgeCheck; label: string }
> = {
  verified: { bg: "#f0fdf4", color: "#059669", border: "#bbf7d0", icon: BadgeCheck, label: "Title verified" },
  pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", icon: FileCheck, label: "Verification pending" },
  unverified: { bg: "#f8fafc", color: "#94a3b8", border: "#e2e8f0", icon: FileCheck, label: "Unverified" },
  flagged: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", icon: FileCheck, label: "Flagged" },
  rejected: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca", icon: FileCheck, label: "Rejected" },
}

export function PropertyDetailServer({ property: p }: { property: PropertyRow }) {
  const card = rowToPublicCard(p)
  const imgs = parseImages(p.images)
  const sc = statusConfig[p.verification_status] ?? statusConfig.unverified
  const Icon = sc.icon
  const features = parseStringArray(p.features)
  const aiRange = formatAiRange(p.ai_valuation_ngn, p.ai_valuation_confidence)
  const listed = p.created_at
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(p.created_at))
    : "—"

  const lineAddress = [p.address, p.neighborhood, p.city, p.state].filter(Boolean).join(", ")

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/search"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748b] transition-colors hover:text-[#0f172a]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="mb-6 rounded-2xl border border-[#e0511f]/20 bg-[#0b1220] px-4 py-3 text-center text-sm text-slate-300 sm:text-left">
        <strong className="text-white">Platform-managed listing.</strong> Published by EasyMoveZone after internal verification—
        not a third-party syndicated feed.
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
            {imgs.length === 0 ? (
              <div
                className="col-span-4 min-h-[280px]"
                style={listingHeroStyle({ ...card, imageUrl: null })}
              />
            ) : (
              <>
                <div
                  className="col-span-4 min-h-[280px] sm:col-span-2 sm:row-span-2 sm:min-h-[280px]"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.5), transparent), url(${imgs[0]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                {imgs.slice(1, 4).map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="hidden min-h-[136px] sm:block"
                    style={{
                      backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.45), transparent), url(${src})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ))}
              </>
            )}
          </div>

          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div
                    className="flex items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ backgroundColor: sc.bg, border: `1px solid ${sc.border}` }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: sc.color }} />
                    <span className="text-xs font-bold" style={{ color: sc.color }}>
                      {sc.label}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#475569]">
                    {p.property_type}
                  </span>
                </div>
                <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">{p.title}</h1>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-[#64748b]">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {lineAddress || `${p.city}, ${p.state}`}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-[#e2e8f0] p-2.5 text-[#64748b] hover:bg-[#f8fafc]"
                  aria-label="Save"
                >
                  <Heart className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[#e2e8f0] p-2.5 text-[#64748b] hover:bg-[#f8fafc]"
                  aria-label="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
              <div className="mb-1 text-xs text-[#64748b]">Price</div>
              <div className="font-[var(--font-playfair)] text-xl font-bold text-[#0f172a]">{formatNgnPrice(p.price_ngn)}</div>
            </div>
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
              <div className="mb-1 text-xs text-[#64748b]">Size</div>
              <div className="flex items-center gap-1.5">
                <Ruler className="h-4 w-4 text-[#e0511f]" />
                <span className="font-bold text-[#0f172a]">{card.size}</span>
              </div>
            </div>
            {(p.bedrooms != null || p.bathrooms != null) && (
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                <div className="mb-1 text-xs text-[#64748b]">Rooms</div>
                <div className="flex flex-wrap gap-2 text-sm font-semibold text-[#0f172a]">
                  {p.bedrooms != null && (
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="h-4 w-4 text-[#e0511f]" /> {p.bedrooms} bed
                    </span>
                  )}
                  {p.bathrooms != null && (
                    <span className="inline-flex items-center gap-1">
                      <Bath className="h-4 w-4 text-[#e0511f]" /> {p.bathrooms} bath
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
              <div className="mb-1 text-xs text-[#64748b]">Listed</div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#64748b]" />
                <span className="font-bold text-[#0f172a]">{listed}</span>
              </div>
            </div>
          </div>

          {aiRange && (
            <div className="rounded-2xl border border-[#059669]/20 bg-[#f0fdf4] p-5">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#059669]" />
                <h3 className="font-semibold text-[#059669]">AI-estimated range</h3>
              </div>
              <div className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">{aiRange}</div>
              {p.ai_valuation_confidence != null && (
                <p className="mt-1 text-xs text-[#475569]">
                  Model confidence{" "}
                  {(() => {
                    const c = Number(p.ai_valuation_confidence)
                    const pct = c <= 1 ? Math.round(c * 100) : Math.round(c)
                    return `${pct}%`
                  })()}{" "}
                  — indicative only.
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-[#0f172a]">Description</h2>
            <p className="text-sm leading-relaxed text-[#475569]">
              {p.description?.trim() || "Full description will appear here once added in admin."}
            </p>
          </div>

          {features.length > 0 && (
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <h2 className="mb-3 text-lg font-bold text-[#0f172a]">Features</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 rounded-lg bg-[#f8fafc] px-3 py-2 text-sm text-[#475569]">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#059669]" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0f172a]">Verification</h2>
              <Link href={`/verify/${p.id}`} className="flex items-center gap-1 text-sm font-semibold text-[#e0511f] hover:underline">
                Verification centre <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-sm text-[#64748b]">
              Title documents are reviewed internally before we publish. Request the full diligence pack from our team when you
              are ready to proceed.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 space-y-5">
            <PropertyEnquiry propertyId={p.id} city={p.city} />

            <Link
              href="/relocate/hub"
              className="block rounded-2xl border border-[#e0511f]/20 bg-[#1b231e] p-5 text-white transition-all hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-2 text-[#f3aa79]">
                <Plane className="h-5 w-5" strokeWidth={2.25} />
                <span className="text-sm font-bold">Relocating to {p.city}?</span>
              </div>
              <p className="text-xs text-white/70">Plan your whole move — visa route, checklist and settling in — alongside this home.</p>
            </Link>

            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-[#0f172a]">Activity</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-[#64748b]">
                    <Eye className="h-3.5 w-3.5" /> Views
                  </span>
                  <span className="font-semibold text-[#0f172a]">{p.view_count ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-[#64748b]">
                    <MessageSquare className="h-3.5 w-3.5" /> Enquiries
                  </span>
                  <span className="font-semibold text-[#0f172a]">{p.enquiry_count ?? 0}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/verify/${p.id}`}
              className="block rounded-2xl border border-[#059669]/20 bg-[#f0fdf4] p-5 transition-all hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-2 text-[#059669]">
                <Home className="h-5 w-5" strokeWidth={2.25} />
                <span className="text-sm font-bold">Verification centre</span>
              </div>
              <p className="text-xs text-[#475569]">Title status, document trail, and risk notes for this listing.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
