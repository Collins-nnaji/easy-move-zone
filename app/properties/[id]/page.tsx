import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  MapPin,
  ShieldCheck,
  TrendingUp,
  Ruler,
  Home,
  Calendar,
  FileCheck,
  Download,
  MessageSquare,
  Heart,
  Share2,
  ArrowLeft,
  BadgeCheck,
  AlertTriangle,
  Phone,
  Mail,
  ChevronRight,
  Eye,
  Building2,
  BedDouble,
  Bath,
} from "lucide-react"

const mockProperty = {
  id: "1",
  title: "Verified 800sqm Plot — Lekki Phase 2",
  description: "A prime 800sqm plot of land located in the prestigious Lekki Phase 2, Lagos. This property comes with a verified Certificate of Occupancy (C of O) and is in a well-developed neighbourhood with good road networks, drainage systems, and proximity to major landmarks including the Lekki-Epe Expressway, Victoria Garden City, and several high-end estates. Ideal for residential development.",
  city: "Lagos",
  state: "Lagos",
  country: "Nigeria",
  neighborhood: "Lekki Phase 2",
  address: "Plot 47, Off Chevron Drive, Lekki Phase 2",
  propertyType: "Land",
  price: "₦85,000,000",
  priceUsd: "$52,000",
  size: "800 sqm",
  verificationStatus: "verified" as const,
  aiValuation: "₦82,000,000 – ₦90,000,000",
  aiConfidence: 87,
  features: ["Fenced & Gated", "C of O Title", "Good Road Access", "Near Chevron Drive", "Flat Terrain", "Residential Zone"],
  images: [
    "linear-gradient(135deg, #0a1628, #1a4a7a)",
    "linear-gradient(135deg, #1a2838, #2a5a8a)",
    "linear-gradient(135deg, #0a2028, #1a4a5a)",
    "linear-gradient(135deg, #1a1828, #3a2a5a)",
  ],
  documents: [
    { name: "Certificate of Occupancy (C of O)", status: "verified", type: "pdf" },
    { name: "Survey Plan", status: "verified", type: "pdf" },
    { name: "Purchase Receipt", status: "pending", type: "pdf" },
  ],
  agent: {
    name: "Adebayo Properties Ltd",
    initials: "AP",
    phone: "+234 803 456 7890",
    email: "info@adebayoproperties.ng",
    verified: true,
    listings: 24,
    rating: 4.8,
  },
  views: 342,
  enquiries: 18,
  listedAt: "2 weeks ago",
}

const statusConfig = {
  verified: { bg: "#f0fdf4", color: "#059669", border: "#bbf7d0", icon: BadgeCheck, label: "Title Verified" },
  pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", icon: AlertTriangle, label: "Verification Pending" },
  unverified: { bg: "#f8fafc", color: "#94a3b8", border: "#e2e8f0", icon: FileCheck, label: "Unverified" },
}

export default function PropertyPage() {
  const p = mockProperty
  const sc = statusConfig[p.verificationStatus]

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back */}
        <Link href="/search" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748b] hover:text-[#0f172a] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
              <div className="col-span-4 sm:col-span-2 sm:row-span-2 min-h-[280px] rounded-2xl sm:rounded-none sm:rounded-l-2xl" style={{ background: p.images[0] }} />
              {p.images.slice(1).map((img, i) => (
                <div key={i} className="hidden sm:block min-h-[136px]" style={{ background: img, borderRadius: i === 0 ? "0 1rem 0 0" : i === 2 ? "0 0 1rem 0" : 0 }} />
              ))}
            </div>

            {/* Title & Status */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ backgroundColor: sc.bg, border: `1px solid ${sc.border}` }}>
                      <sc.icon className="h-3.5 w-3.5" style={{ color: sc.color }} />
                      <span className="text-xs font-bold" style={{ color: sc.color }}>{sc.label}</span>
                    </div>
                    <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">{p.propertyType}</span>
                  </div>
                  <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">{p.title}</h1>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-[#64748b]">
                    <MapPin className="h-4 w-4" />
                    {p.address}, {p.neighborhood}, {p.city}, {p.state}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-xl border border-[#e2e8f0] p-2.5 text-[#64748b] hover:bg-[#f8fafc]"><Heart className="h-4 w-4" /></button>
                  <button className="rounded-xl border border-[#e2e8f0] p-2.5 text-[#64748b] hover:bg-[#f8fafc]"><Share2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            {/* Price & Key Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                <div className="text-xs text-[#64748b] mb-1">Price</div>
                <div className="font-[var(--font-playfair)] text-xl font-bold text-[#0f172a]">{p.price}</div>
                <div className="text-xs text-[#94a3b8]">≈ {p.priceUsd}</div>
              </div>
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                <div className="text-xs text-[#64748b] mb-1">Land Size</div>
                <div className="flex items-center gap-1.5">
                  <Ruler className="h-4 w-4 text-[#155eef]" />
                  <span className="font-bold text-[#0f172a]">{p.size}</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                <div className="text-xs text-[#64748b] mb-1">AI Confidence</div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[#059669]" />
                  <span className="font-bold text-[#0f172a]">{p.aiConfidence}%</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                <div className="text-xs text-[#64748b] mb-1">Listed</div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#64748b]" />
                  <span className="font-bold text-[#0f172a]">{p.listedAt}</span>
                </div>
              </div>
            </div>

            {/* AI Valuation */}
            <div className="rounded-2xl border border-[#059669]/20 bg-[#f0fdf4] p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-[#059669]" />
                <h3 className="font-semibold text-[#059669]">AI-Estimated Market Value</h3>
              </div>
              <div className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">{p.aiValuation}</div>
              <p className="mt-1 text-xs text-[#475569]">Based on comparable sales, location data, and market trends. {p.aiConfidence}% confidence score.</p>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <h2 className="text-lg font-bold text-[#0f172a] mb-3">Description</h2>
              <p className="text-sm leading-relaxed text-[#475569]">{p.description}</p>
            </div>

            {/* Features */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <h2 className="text-lg font-bold text-[#0f172a] mb-3">Features</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 rounded-lg bg-[#f8fafc] px-3 py-2 text-sm text-[#475569]">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#059669]" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#0f172a]">Title Documents</h2>
                <Link href={`/verify/${p.id}`} className="text-sm font-semibold text-[#155eef] hover:underline flex items-center gap-1">
                  Full Verification Report <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {p.documents.map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-[#155eef]" />
                      <div>
                        <div className="text-sm font-medium text-[#0f172a]">{doc.name}</div>
                        <div className="text-xs" style={{ color: doc.status === "verified" ? "#059669" : "#d97706" }}>
                          {doc.status === "verified" ? "Verified" : "Pending verification"}
                        </div>
                      </div>
                    </div>
                    <button className="rounded-lg border border-[#e2e8f0] p-2 text-[#64748b] hover:bg-white">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="sticky top-24 space-y-5">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#155eef]/10 font-bold text-[#155eef]">
                    {p.agent.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#0f172a]">{p.agent.name}</span>
                      {p.agent.verified && <BadgeCheck className="h-4 w-4 text-[#059669]" />}
                    </div>
                    <div className="text-xs text-[#64748b]">{p.agent.listings} listings &middot; ★ {p.agent.rating}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full rounded-xl bg-[#155eef] py-3 text-sm font-bold text-white transition-colors hover:bg-[#1249d1] flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Send Enquiry
                  </button>
                  <button className="w-full rounded-xl border border-[#e2e8f0] py-3 text-sm font-semibold text-[#0f172a] transition-colors hover:bg-[#f8fafc] flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" /> Call Agent
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[#64748b]">
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {p.agent.phone}</div>
                  <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {p.agent.email}</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
                <h3 className="text-sm font-bold text-[#0f172a] mb-3">Listing Activity</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748b] flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Views</span>
                    <span className="font-semibold text-[#0f172a]">{p.views}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748b] flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Enquiries</span>
                    <span className="font-semibold text-[#0f172a]">{p.enquiries}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/verify/${p.id}`}
                className="block rounded-2xl border border-[#059669]/20 bg-[#f0fdf4] p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-[#059669] mb-2">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-bold">Verification Centre</span>
                </div>
                <p className="text-xs text-[#475569]">View the full title verification report, document history, and fraud risk assessment.</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  )
}
