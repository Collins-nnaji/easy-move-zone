import Image from "next/image"
import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  ShieldCheck,
  Search,
  ArrowRight,
  MapPin,
  FileCheck,
  Eye,
  Handshake,
  Building2,
  BadgeCheck,
  Star,
  TrendingUp,
  Users,
  Landmark,
  Home,
  Sparkles,
  KeyRound,
  Scale,
} from "lucide-react"

/** Unsplash — editorial use; swap for your own photography anytime */
const heroBg =
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=2400&q=80"

const partnersSectionBg =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80"

const partnerPillars = [
  {
    title: "Government & agencies",
    description:
      "We align verification workflows with land registries, cadastral data, and planning authorities — so listings map to how public records actually work.",
    bullets: ["State & federal land agencies", "Urban planning & housing bodies", "Registry-aligned checks"],
    image:
      "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80",
    icon: Landmark,
  },
  {
    title: "Developers & estate partners",
    description:
      "Registered developers, estate companies, and master-plan communities use EasyMoveZone to surface title-backed inventory to buyers at home and abroad.",
    bullets: ["Licensed developers & PMCs", "Residential & mixed-use schemes", "Project marketing teams"],
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
    icon: Building2,
  },
  {
    title: "Professional & legal partners",
    description:
      "Surveyors, conveyancing firms, and compliance consultants plug into our pipeline — from document intake to fraud signals and buyer-ready reports.",
    bullets: ["Survey & geospatial firms", "Legal & conveyancing", "Title diligence specialists"],
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
    icon: Scale,
  },
] as const

const cities = [
  { name: "Lagos", state: "Lagos", listings: 842, grad: "home-city-gradient-1" as const, flag: "🇳🇬" },
  { name: "Abuja", state: "FCT", listings: 534, grad: "home-city-gradient-2" as const, flag: "🇳🇬" },
  { name: "Accra", state: "Greater Accra", listings: 312, grad: "home-city-gradient-3" as const, flag: "🇬🇭" },
  { name: "Nairobi", state: "Nairobi County", listings: 267, grad: "home-city-gradient-4" as const, flag: "🇰🇪" },
  { name: "Port Harcourt", state: "Rivers", listings: 198, grad: "home-city-gradient-5" as const, flag: "🇳🇬" },
  { name: "Ibadan", state: "Oyo", listings: 145, grad: "home-city-gradient-6" as const, flag: "🇳🇬" },
]

const trustStats = [
  { value: "2,400+", label: "Verified Listings", icon: BadgeCheck },
  { value: "98.7%", label: "Fraud Detection Rate", icon: ShieldCheck },
  { value: "₦45B+", label: "Property Value Secured", icon: TrendingUp },
  { value: "12,000+", label: "Happy Buyers", icon: Users },
]

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search & Discover",
    description: "Browse verified listings or describe what you want in plain language. Our AI finds the best matches across cities.",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Verify & Trust",
    description: "Every listing undergoes title verification, document scanning, and fraud detection before you see it. Check the full report.",
  },
  {
    number: "03",
    icon: Handshake,
    title: "Buy with Confidence",
    description: "Connect directly with verified agents. We guide your transaction end to end — from offer to title transfer.",
  },
]

const featuredListings = [
  {
    id: "1",
    title: "Verified 800sqm Plot — Lekki Phase 2",
    city: "Lagos",
    neighborhood: "Lekki Phase 2",
    price: "₦85,000,000",
    size: "800 sqm",
    type: "Land",
    status: "verified" as const,
    aiValue: "₦82M – ₦90M",
    gradient: "linear-gradient(135deg, #0a1628, #1a4a7a)",
  },
  {
    id: "2",
    title: "Title-Clear 3BR Detached — Maitama",
    city: "Abuja",
    neighborhood: "Maitama",
    price: "₦120,000,000",
    size: "450 sqm",
    type: "House",
    status: "verified" as const,
    aiValue: "₦115M – ₦128M",
    gradient: "linear-gradient(135deg, #0a2818, #1a6a4a)",
  },
  {
    id: "3",
    title: "600sqm C of O Land — East Legon",
    city: "Accra",
    neighborhood: "East Legon",
    price: "GH₵2,800,000",
    size: "600 sqm",
    type: "Land",
    status: "verified" as const,
    aiValue: "GH₵2.6M – GH₵3.0M",
    gradient: "linear-gradient(135deg, #281a08, #6a4a2a)",
  },
]

const statusColor = { verified: "#059669", pending: "#d97706", unverified: "#94a3b8" }

export default function HomePage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-14 md:pb-24 lg:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={heroBg}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/88 via-[#0f172a]/72 to-[#f0f4fa] sm:via-[#0f172a]/65"
            aria-hidden
          />
          <div className="home-hero-grid absolute inset-0 opacity-[0.2]" aria-hidden />
        </div>
        <div className="home-glow-a hidden opacity-40 md:block" aria-hidden />
        <div className="home-glow-b hidden opacity-40 md:block" aria-hidden />
        <div className="home-glow-c hidden opacity-30 lg:block" aria-hidden />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 shadow-sm backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-[#6ee7b7]" />
                <span className="text-xs font-semibold tracking-wide text-white/95">Every listing title-verified</span>
                <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline" />
                <span className="hidden items-center gap-1 text-xs font-semibold text-[#93c5fd] sm:inline-flex">
                  <Sparkles className="h-3 w-3" /> AI search
                </span>
              </div>
              <h1 className="font-[var(--font-playfair)] text-[2.65rem] font-bold leading-[1.05] tracking-tight text-white drop-shadow-sm sm:text-6xl lg:text-[3.5rem]">
                Buy land in Africa.
                <br />
                <span className="bg-gradient-to-r from-[#93c5fd] via-white to-[#6ee7b7] bg-clip-text text-transparent">
                  Without the risk.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-200 lg:mx-0 lg:max-w-lg">
                The trusted property platform for professionals, diaspora, and returnees. Verified titles, guided
                transactions, and support built for buying from abroad.
              </p>

              <div className="mx-auto mt-10 max-w-2xl lg:mx-0">
                <form action="/search" method="get" className="emz-hero-bento relative p-1.5 sm:p-2">
                  <Search className="pointer-events-none absolute left-7 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[#94a3b8] sm:left-8" />
                  <input
                    type="text"
                    name="q"
                    placeholder='Try "verified land in Lekki under ₦50M"'
                    className="w-full rounded-[1.05rem] border border-[#e2e8f0]/80 bg-white/90 py-4 pl-12 pr-[7.5rem] text-[15px] text-[#0f172a] shadow-inner shadow-black/[0.03] placeholder:text-[#94a3b8] backdrop-blur-sm focus:border-[#155eef]/40 focus:outline-none focus:ring-2 focus:ring-[#155eef]/15 sm:pl-14"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#155eef] to-[#1249d1] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#155eef]/25 transition hover:brightness-105"
                  >
                    Search
                    <ArrowRight className="h-3.5 w-3.5 opacity-90" />
                  </button>
                </form>
                <p className="mt-3 text-center text-xs text-slate-300 lg:text-left">
                  Popular:{" "}
                  <Link href="/search?city=lagos" className="font-medium text-white hover:text-[#93c5fd] hover:underline">
                    Lagos
                  </Link>
                  {" · "}
                  <Link href="/search?city=abuja" className="font-medium text-white hover:text-[#93c5fd] hover:underline">
                    Abuja
                  </Link>
                  {" · "}
                  <Link href="/search?city=accra" className="font-medium text-white hover:text-[#93c5fd] hover:underline">
                    Accra
                  </Link>
                </p>
              </div>
            </div>

            {/* Decorative bento — desktop */}
            <div className="relative mx-auto hidden h-[400px] w-full max-w-md lg:mx-0 lg:block lg:max-w-none">
              <div className="home-float-card-a emz-hero-bento absolute right-4 top-4 w-[260px] p-4 shadow-2xl shadow-black/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Live listing</p>
                    <p className="mt-1 font-[var(--font-playfair)] text-lg font-bold text-[#0f172a]">Lekki Phase 2</p>
                  </div>
                  <span className="rounded-full bg-[#f0fdf4] px-2 py-0.5 text-[10px] font-bold text-[#059669]">Verified</span>
                </div>
                <div className="mt-3 h-24 rounded-xl bg-gradient-to-br from-[#0a1628] to-[#1a4a7a]" />
                <p className="mt-2 text-sm font-semibold text-[#155eef]">₦85M · 800 sqm</p>
              </div>
              <div className="home-float-card-b emz-hero-bento absolute left-0 top-[38%] w-[220px] p-4 shadow-2xl shadow-black/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#155eef]/10 text-[#155eef]">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">Title check</p>
                    <p className="text-[11px] text-[#64748b]">Registry matched</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#059669] to-[#155eef]" />
                </div>
                <p className="mt-2 text-[10px] font-semibold text-[#059669]">4 of 5 checks complete</p>
              </div>
              <div className="home-float-card-c emz-hero-bento absolute bottom-6 right-0 w-[200px] p-4 shadow-2xl shadow-black/20">
                <div className="flex items-center gap-2 text-[#0f172a]">
                  <Building2 className="h-5 w-5 text-[#155eef]" />
                  <span className="text-sm font-bold">2,400+ listings</span>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-[#64748b]">Across Lagos, Abuja, Accra &amp; Nairobi</p>
              </div>
            </div>
          </div>

          {/* Trust Stats */}
          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-4 sm:mt-20 sm:grid-cols-4 lg:max-w-none">
            {trustStats.map((stat) => (
              <div key={stat.label} className="emz-rich-card group p-5 text-center sm:p-6">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#155eef]/12 to-[#0f766e]/10 text-[#155eef] ring-1 ring-[#155eef]/10 transition group-hover:scale-105">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a] sm:text-[1.65rem]">{stat.value}</div>
                <div className="mt-1 text-xs font-semibold text-[#64748b]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we work with — photo-backed */}
      <section className="relative overflow-hidden border-y border-[#e2e8f0]/80 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={partnersSectionBg}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc]/97 via-white/92 to-[#f0f4fc]/95" aria-hidden />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="emz-section-eyebrow mx-auto">
              <Handshake className="h-3.5 w-3.5" />
              Ecosystem
            </span>
            <h2 className="mt-4 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a] md:text-[2.75rem]">
              Built with government, developers &amp; agencies
            </h2>
            <p className="mt-3 text-lg text-[#475569]">
              EasyMoveZone sits between public land data, professional verification, and developer inventory — one place
              for diaspora and local buyers to trust what they see.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {partnerPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-[1.35rem] border border-[#e2e8f0]/90 bg-[#0f172a] shadow-xl shadow-black/15"
              >
                <div className="absolute inset-0">
                  <Image
                    src={pillar.image}
                    alt=""
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0f172a]/88 to-[#0f172a]/35"
                    aria-hidden
                  />
                </div>
                <div className="relative mt-auto flex flex-1 flex-col justify-end p-7 pt-32 text-white">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-[#93c5fd] ring-1 ring-white/20 backdrop-blur-sm">
                    <pillar.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="font-[var(--font-playfair)] text-2xl font-bold leading-tight">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200">{pillar.description}</p>
                  <ul className="mt-5 space-y-2 border-t border-white/15 pt-5 text-xs font-semibold text-slate-300">
                    {pillar.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6ee7b7]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-[#64748b]">
            Partnership models vary by country and project. We integrate with official registries and accredited
            professionals where available — and never replace independent legal advice for your transaction.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {["Registry-aligned checks", "Developer onboarding", "Agency & bulk listings"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-[#155eef]/15 bg-white/80 px-4 py-2 text-xs font-semibold text-[#155eef] shadow-sm backdrop-blur-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="section-flow-bg relative border-y border-[#e2e8f0]/80 bg-gradient-to-b from-white via-[#fafcfe] to-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="emz-section-eyebrow">
              <MapPin className="h-3.5 w-3.5 text-[#0f766e]" />
              Markets
            </span>
            <h2 className="mt-4 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a] md:text-[2.75rem]">
              Browse by city
            </h2>
            <p className="mt-3 text-lg text-[#475569]">Verified inventory across Africa&apos;s fastest-growing cities.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {cities.map((city) => (
              <Link
                key={city.name}
                href={`/search?city=${city.name.toLowerCase()}`}
                className={`home-city-card group ${city.grad}`}
              >
                <span className="home-city-icon" aria-hidden>
                  {city.flag}
                </span>
                <div className="home-city-country">{city.state}</div>
                <div className="home-city-name">{city.name}</div>
                <div className="home-city-count">{city.listings}+ listings</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="emz-section-eyebrow">
              <Handshake className="h-3.5 w-3.5" />
              Process
            </span>
            <h2 className="mt-4 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a] md:text-[2.75rem]">
              How EasyMoveZone works
            </h2>
            <p className="mt-3 text-lg text-[#475569]">Three calm steps from discovery to keys in hand.</p>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-[52px] hidden h-0.5 bg-gradient-to-r from-[#155eef]/0 via-[#155eef]/25 to-[#155eef]/0 md:block" aria-hidden />
            {steps.map((step) => (
              <div
                key={step.number}
                className="emz-rich-card relative overflow-hidden p-8 text-left before:absolute before:left-0 before:top-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-[#155eef] before:to-[#0f766e]"
              >
                <span className="font-[var(--font-playfair)] text-5xl font-bold text-[#155eef]/[0.12]">{step.number}</span>
                <div className="mt-2 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#155eef]/12 to-[#0f766e]/10 text-[#155eef] ring-1 ring-[#155eef]/10">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Verified Listings */}
      <section className="border-y border-[#e2e8f0]/80 bg-gradient-to-b from-[#f0f4fc] via-[#f8fafc] to-[#f0f4fc] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="emz-section-eyebrow">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Curated
              </span>
              <h2 className="mt-4 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a] md:text-[2.75rem]">
                Featured verified listings
              </h2>
              <p className="mt-2 max-w-xl text-lg text-[#475569]">Clean titles, full documentation trail, and AI-backed pricing context.</p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#155eef]/20 bg-white px-4 py-2 text-sm font-semibold text-[#155eef] shadow-sm transition hover:bg-[#155eef]/5"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredListings.map((listing) => (
              <Link key={listing.id} href={`/properties/${listing.id}`} className="emz-rich-card group block overflow-hidden p-0">
                <div className="relative h-52 overflow-hidden">
                  <div
                    className="absolute inset-0 transition duration-700 group-hover:scale-105"
                    style={{ background: listing.gradient }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/85 via-[#0f172a]/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 shadow-sm">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor[listing.status] }} />
                    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: statusColor[listing.status] }}>
                      {listing.status}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {listing.type}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="font-[var(--font-playfair)] text-lg font-bold text-white drop-shadow-sm">{listing.city}</p>
                    <p className="text-xs font-medium text-white/80">{listing.neighborhood}</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold leading-snug text-[#0f172a] transition-colors group-hover:text-[#155eef]">{listing.title}</h3>
                  <div className="mt-3 flex items-center justify-between border-t border-[#e2e8f0]/80 pt-3">
                    <div className="font-[var(--font-playfair)] text-xl font-bold text-[#0f172a]">{listing.price}</div>
                    <div className="rounded-lg bg-[#f1f5f9] px-2 py-1 text-xs font-semibold text-[#64748b]">{listing.size}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-[#bbf7d0]/60 bg-[#f0fdf4] px-3 py-2 text-xs">
                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[#059669]" />
                    <span className="font-semibold text-[#059669]">AI range: {listing.aiValue}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/search" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#155eef]">
              View all listings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="emz-section-eyebrow">
              <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
              Trust stack
            </span>
            <h2 className="mt-4 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a] md:text-[2.75rem]">
              Why buyers choose EasyMoveZone
            </h2>
            <p className="mt-3 text-lg text-[#475569]">Verification, intelligence, and human support — not just another listings site.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileCheck, title: "Title verified", desc: "Registry cross-checks and document authenticity before a listing goes live." },
              { icon: Eye, title: "Fraud detection", desc: "Models flag mismatches and suspicious patterns early in the review pipeline." },
              { icon: Star, title: "AI valuations", desc: "Contextual price ranges from comps, location quality, and market momentum." },
              { icon: Landmark, title: "Guided deals", desc: "Offer-to-close support with escrow options and legal review partners." },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0]/90 bg-white p-7 text-center shadow-sm shadow-black/[0.03] transition hover:-translate-y-1 hover:border-[#059669]/25 hover:shadow-lg"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#059669]/[0.06] transition group-hover:scale-150" />
                <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669]/12 to-[#155eef]/10 text-[#059669] ring-1 ring-[#059669]/15">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="relative font-bold text-[#0f172a]">{item.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-[#475569]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#0b1220] py-20 text-white md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(21,94,239,0.35),transparent)]" />
        <div className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#0f766e]/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#155eef] to-[#0f4ec4] shadow-lg shadow-[#155eef]/30">
            <Home className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-[var(--font-playfair)] text-4xl font-bold md:text-5xl">Ready to find your property?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#94a3b8]">
            Join thousands of buyers and agents who use EasyMoveZone to verify, compare, and close with confidence.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-[#0f172a] shadow-lg shadow-black/20 transition hover:bg-[#f1f5f9]"
            >
              <Search className="h-4 w-4" />
              Browse verified listings
            </Link>
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
