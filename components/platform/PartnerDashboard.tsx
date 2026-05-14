"use client"

import Link from "next/link"
import { useState } from "react"
import { useReloMobileNav } from "@/hooks/useReloMobileNav"
import {
  Home, User, Sparkles, Briefcase, ArrowRight, ArrowUpRight, Star, CheckCircle2,
} from "lucide-react"

const navItems = [
  { href: "/partner",   label: "Pipeline",    icon: Briefcase, active: true  },
  { href: "/dashboard", label: "Overview",    icon: Home,      active: false },
  { href: "/profile",   label: "Profile",     icon: User,      active: false },
]

type View = "cases" | "marketplace"

const cases = [
  { initials: "AK", name: "Amira K.",  route: "LDN → MAN", stage: "Housing",   daysLeft: 12, score: 92, hot: true  },
  { initials: "TL", name: "Tom L.",    route: "BER → AMS", stage: "Discovery",  daysLeft: 28, score: 78, hot: false },
  { initials: "MW", name: "Mei W.",    route: "NYC → LON", stage: "Documents",  daysLeft: 6,  score: 88, hot: true  },
  { initials: "YS", name: "Yara S.",   route: "SFO → LIS", stage: "Arrival",   daysLeft: 0,  score: 95, hot: false },
  { initials: "OA", name: "Olu A.",    route: "NAI → MAN", stage: "Housing",   daysLeft: 18, score: 71, hot: false },
  { initials: "PR", name: "Priya R.",  route: "BLR → BER", stage: "Discovery",  daysLeft: 40, score: 66, hot: false },
]

const opportunities = [
  { from: "London",    to: "Manchester", budget: "£1,200", why: "new job",  urgency: "hot",  fee: "£420", match: 96, bids: 3 },
  { from: "Berlin",    to: "Amsterdam",  budget: "€1,400", why: "partner",  urgency: "warm", fee: "€520", match: 88, bids: 5 },
  { from: "Bangalore", to: "Berlin",     budget: "€1,100", why: "work visa",urgency: "hot",  fee: "€680", match: 82, bids: 1 },
  { from: "New York",  to: "Lisbon",     budget: "€2,200", why: "D7 visa",  urgency: "warm", fee: "€880", match: 79, bids: 4 },
]

const journeySteps = ["Explore", "Housing", "Documents", "Arrival", "Settled"]

export function PartnerDashboard() {
  const [view, setView] = useState<View>("cases")
  const [selectedCase, setSelectedCase] = useState(0)
  const { close: closeMobileNav, asideClassName, backdrop, menuButton } = useReloMobileNav()

  const activeCase = cases[selectedCase]

  return (
    <div className="relo-app-shell">
      {backdrop}
      {/* Sidebar */}
      <aside id="relo-app-sidebar" className={asideClassName}>
        <div className="flex items-center gap-2 px-2 mb-6 sm:mb-8">
          <div className="w-7 h-7 rounded-lg bg-[#4A7C59] flex items-center justify-center shrink-0">
            <Briefcase className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-[15px] text-[#1A1612]">partner</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} onClick={closeMobileNav}
                className={`relo-sidebar-nav-item ${item.active ? "!bg-[rgba(74,124,89,0.1)] !text-[#4A7C59] !font-semibold" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Earnings snapshot */}
        <div className="mt-8 pt-6 border-t border-[#E4DFDA]">
          <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-3">Earnings · May</div>
          <div className="text-3xl font-display font-bold text-[#4A7C59]">£4,180</div>
          <div className="text-xs text-[#6B6460] mt-1">5 closed · £42k ytd</div>

          <div className="mt-4">
            <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-2">Reputation</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#1A1612]">4.8</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => <Star key={s} className={`h-3 w-3 ${s <= 4 ? "fill-[#E85C2D] text-[#E85C2D]" : "text-[#E4DFDA]"}`} />)}
              </div>
              <span className="text-[10px] text-[#6B6460]">47 reviews</span>
            </div>
            <div className="text-[10px] text-[#6B6460] mt-0.5">top 8% UK</div>
          </div>

          <div className="mt-4 p-3 border border-[#4A7C59] rounded-xl bg-[rgba(74,124,89,0.05)]">
            <div className="text-[10px] font-bold text-[#4A7C59] mb-1">NEXT TIER</div>
            <div className="text-xs text-[#6B6460] mb-2">2 more closes → Elite badge + 10% lower fee</div>
            <div className="relo-progress-bar">
              <div className="h-full bg-[#4A7C59] rounded-full" style={{ width: "60%" }} />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Link href="/" onClick={closeMobileNav} className="relo-sidebar-nav-item text-[#6B6460]">
            <Sparkles className="h-4 w-4" />
            Switch to mover
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="relo-main">
        <div className="relo-topbar shrink-0 min-h-[56px] h-auto flex-wrap gap-y-2 py-2 sm:min-h-[60px] sm:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {menuButton}
            <div className="min-w-0">
            <div className="text-sm font-bold text-[#1A1612] sm:text-base">
              {view === "cases" ? "Pipeline · May" : "Marketplace"}
            </div>
            <div className="text-[11px] text-[#6B6460] sm:text-xs line-clamp-2">
              {view === "cases" ? "14 active cases · £42k commission projected" : "bid on cases that match your specialties"}
            </div>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <div className="flex rounded-lg border border-[#E4DFDA] overflow-hidden">
              {(["cases", "marketplace"] as View[]).map((v) => (
                <button type="button" key={v} onClick={() => setView(v)}
                  className={`px-3 py-2 text-[11px] font-semibold transition-colors capitalize sm:px-4 sm:text-xs ${view === v ? "bg-[#4A7C59] text-white" : "bg-white text-[#6B6460] hover:bg-[#F0EDE8]"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            {view === "marketplace" && (
              <button type="button" className="flex shrink-0 items-center gap-2 bg-[#4A7C59] text-white font-semibold text-xs px-3 py-2 rounded-lg hover:bg-[#3D6B4A] transition-colors sm:text-sm sm:px-4">
                Auto-bid rules
              </button>
            )}
          </div>
        </div>

        {view === "cases" ? (
          <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
            {/* KPI strip + case list */}
            <div className="relo-content min-h-0 flex-1 overflow-y-auto">
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
                {[
                  ["ACTIVE CASES", "14"],
                  ["CLOSING THIS MO", "5"],
                  ["AVG NPS", "4.8 ★"],
                  ["MARKETPLACE LEADS", "23"],
                ].map(([k, v]) => (
                  <div key={k} className="relo-widget">
                    <div className="text-[9px] text-[#A8A4A0] font-bold tracking-wide">{k}</div>
                    <div className="text-2xl font-display font-bold text-[#1A1612] mt-1">{v}</div>
                  </div>
                ))}
              </div>

              {/* Cases table */}
              <div className="bg-white border border-[#E4DFDA] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-[#E4DFDA] bg-[#FAFAF8] px-4 py-3 sm:px-5">
                  <div className="text-[10px] font-bold text-[#A8A4A0] uppercase tracking-wide shrink-0">CASES</div>
                  <div className="flex gap-2">
                    {["All", "Discovery", "Housing", "Docs", "Arrival"].map((t, i) => (
                      <span key={t} className={`relo-chip text-[10px] ${i === 0 ? "relo-chip-accent" : ""}`}>{t}</span>
                    ))}
                  </div>
                </div>
                {cases.map((c, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setSelectedCase(i)}
                    className={`w-full flex flex-wrap items-center gap-3 px-4 py-4 border-b border-[#F0EDE8] last:border-0 text-left transition-colors sm:flex-nowrap sm:gap-4 sm:px-5 ${selectedCase === i ? "bg-[rgba(74,124,89,0.04)]" : "hover:bg-[#FAFAF8]"} ${c.hot ? "border-l-2 border-l-[#E85C2D]" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[rgba(74,124,89,0.1)] flex items-center justify-center text-sm font-bold text-[#4A7C59] shrink-0">
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1A1612] text-sm">{c.name}</span>
                        {c.hot && <span className="text-[9px] font-bold text-[#E85C2D]">· needs attention</span>}
                      </div>
                      <div className="text-[11px] text-[#6B6460]">{c.route}</div>
                    </div>
                    <div className="text-sm text-[#6B6460]">{c.stage} · {c.daysLeft > 0 ? `${c.daysLeft}d` : "today"}</div>
                    <span className={`relo-chip text-[10px] ${c.score >= 85 ? "relo-chip-accent" : ""}`}>{c.score}</span>
                    <ArrowUpRight className="h-4 w-4 text-[#A8A4A0]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Selected case detail */}
            <div className="max-h-[48vh] w-full shrink-0 overflow-y-auto border-t border-[#E4DFDA] bg-white p-4 sm:p-5 xl:max-h-none xl:w-80 xl:border-l xl:border-t-0">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-[#4A7C59] flex items-center justify-center text-white font-bold">
                  {activeCase.initials}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#1A1612]">{activeCase.name}</div>
                  <div className="text-xs text-[#6B6460]">{activeCase.route}</div>
                </div>
                <span className="relo-chip relo-chip-accent text-xs">{activeCase.score} fit</span>
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-2">Journey</div>
                <div className="flex gap-1">
                  {journeySteps.map((s, i) => {
                    const stageIdx = journeySteps.indexOf(activeCase.stage)
                    return (
                      <div key={s} className="flex-1">
                        <div className={`h-1.5 rounded-full ${i < stageIdx ? "bg-[#4A7C59]" : i === stageIdx ? "bg-[#E85C2D]" : "bg-[#E4DFDA]"}`} />
                        <div className={`text-[8px] mt-1 ${i === stageIdx ? "text-[#E85C2D] font-bold" : "text-[#C8C3BE]"}`}>{s}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[["BUDGET", "£3,840 / £4,200"], ["DEADLINE", `${activeCase.daysLeft > 0 ? activeCase.daysLeft + " days" : "Today"}`], ["SAVED LISTINGS", "4"], ["BLOCKERS", "1 (refs)"]].map(([k, v]) => (
                  <div key={k} className="bg-[#F7F5F0] rounded-lg p-3">
                    <div className="text-[9px] font-bold text-[#A8A4A0] uppercase tracking-wide">{k}</div>
                    <div className="text-sm font-bold text-[#1A1612] mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E4DFDA] pt-4 mb-4">
                <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-3">Shared with client</div>
                <div className="flex flex-col gap-2">
                  {["3-area shortlist (Chorlton tops)", "Drafted landlord messages", "Reference pack template"].map((t, i) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-[#6B6460]">
                      {i < 2 ? <CheckCircle2 className="h-4 w-4 text-[#4A7C59] shrink-0" /> : <div className="w-4 h-4 rounded border-2 border-[#E4DFDA] shrink-0" />}
                      <span className={i < 2 ? "text-[#1A1612]" : ""}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button type="button" className="relo-btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
                  Open case <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" className="relo-btn-secondary rounded-xl px-4 py-2.5 text-sm">
                  Message client
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Marketplace */
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div className="relo-content min-h-0 flex-1 overflow-y-auto">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {["All 23", "Hot · 7", "UK 12", "EU 9", "US 2"].map((t, i) => (
                  <span key={t} className={`relo-chip cursor-pointer ${i === 1 ? "relo-chip-accent" : "hover:bg-[rgba(74,124,89,0.1)] hover:text-[#4A7C59] transition-colors"}`}>{t}</span>
                ))}
                <div className="ml-auto text-xs text-[#6B6460]">matched to your profile</div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {opportunities.map((opp, i) => (
                  <div key={i} className={`bg-white border rounded-xl p-5 ${opp.urgency === "hot" ? "border-[#E85C2D] shadow-sm shadow-[rgba(232,92,45,0.1)]" : "border-[#E4DFDA]"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`relo-chip text-[10px] ${opp.urgency === "hot" ? "relo-chip-accent" : ""}`}>{opp.urgency}</span>
                      <span className="text-sm font-bold text-[#4A7C59]">{opp.fee}</span>
                    </div>
                    <div className="text-xl font-display font-bold text-[#1A1612] mb-1">{opp.from} → {opp.to}</div>
                    <div className="text-xs text-[#6B6460] mb-4">budget {opp.budget}/mo · reason: {opp.why}</div>
                    <div className="border-t border-[#E4DFDA] pt-3 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] text-[#A8A4A0] font-bold uppercase">Your match</div>
                        <div className="text-lg font-bold text-[#4A7C59]">{opp.match}/100</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-[#A8A4A0] font-bold uppercase">Bids</div>
                        <div className="text-sm text-[#1A1612]">{opp.bids} so far</div>
                      </div>
                      <button type="button" className="bg-[#4A7C59] text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#3D6B4A] transition-colors">
                        Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings sidebar */}
            <div className="w-full shrink-0 overflow-y-auto border-t border-[#E4DFDA] bg-white p-4 sm:p-5 lg:w-72 lg:border-l lg:border-t-0">
              <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-2">Earnings · May</div>
              <div className="text-3xl font-display font-bold text-[#4A7C59]">£4,180</div>
              <div className="text-xs text-[#6B6460] mb-4">5 closed · £42k projected ytd</div>

              <div className="border-t border-[#E4DFDA] pt-4 mb-4">
                <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-3">Your specialties</div>
                <div className="flex flex-wrap gap-2">
                  {["UK movers", "visa: T2", "family relo", "remote work"].map((s) => (
                    <span key={s} className="relo-chip relo-chip-accent text-xs">{s}</span>
                  ))}
                  <button type="button" className="relo-chip text-xs hover:bg-[rgba(74,124,89,0.1)] hover:text-[#4A7C59] transition-colors">+ add</button>
                </div>
              </div>

              <div className="border-t border-[#E4DFDA] pt-4">
                <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-2">Reputation</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#1A1612]">4.8</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => <Star key={s} className={`h-3.5 w-3.5 ${s <= 4 ? "fill-[#E85C2D] text-[#E85C2D]" : "text-[#E4DFDA]"}`} />)}
                  </div>
                </div>
                <div className="text-xs text-[#6B6460]">47 reviews · top 8% UK</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
