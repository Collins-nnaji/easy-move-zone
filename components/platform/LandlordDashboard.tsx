"use client"

import Link from "next/link"
import { useState } from "react"
import { useReloMobileNav } from "@/hooks/useReloMobileNav"
import {
  Home, MapPin, Users, Bot, User, Sparkles, Building2,
  Plus, MoreHorizontal, CheckCircle2, Clock, ArrowRight,
} from "lucide-react"

const navItems = [
  { href: "/landlord",  label: "Listings",  icon: Building2, active: true  },
  { href: "/dashboard", label: "Overview",  icon: Home,      active: false },
  { href: "/profile",   label: "Profile",   icon: User,      active: false },
]

type View = "listings" | "pipeline"

const listings = [
  { id: 1, name: "Chorlton Mews, Flat 4",   status: "live",  rent: "£950",  inquiries: 5, score: 92, note: "1 bed · 32 sqm" },
  { id: 2, name: "Beech Rd, 22B",            status: "live",  rent: "£980",  inquiries: 4, score: 88, note: "1 bed · 28 sqm" },
  { id: 3, name: "Wilbraham Rd, GF",         status: "live",  rent: "£1,100", inquiries: 3, score: 84, note: "2 bed · 55 sqm" },
  { id: 4, name: "Manchester Sq, 12",        status: "draft", rent: "—",     inquiries: 0, score: 0,  note: "1 bed · 30 sqm" },
]

const inquiries = [
  { name: "Amira K.",  property: "Chorlton Mews", verified: true,  note: "score 92 · 5wk deposit ok",   status: "new" },
  { name: "Sam P.",    property: "Beech Rd 22B",  verified: true,  note: "ref from current landlord",     status: "replied" },
  { name: "Mei W.",    property: "Chorlton Mews", verified: false, note: "pending payslips",              status: "waiting" },
]

const pipelineCols = [
  { name: "New inquiry",    cards: [["Amira K.", "Chorlton Mews", "✓ verified"], ["Tom L.", "Beech Rd", "✓ verified"], ["Mei W.", "Chorlton Mews", "⚠ unverified"]] },
  { name: "Viewing booked", cards: [["Sara P.", "Wilbraham", "Thu 7pm"], ["Olu A.", "Chorlton Mews", "Sat 11am"]] },
  { name: "References",     cards: [["Priya R.", "Beech Rd", "2 of 3 in"]] },
  { name: "Offer / signed", cards: [["James B.", "Wilbraham", "offered"], ["Yara S.", "Chorlton Mews", "signed"]] },
  { name: "Moved in",       cards: [["Linh + 1", "Chorlton Mews 2", "2 wks in"]] },
]

export function LandlordDashboard() {
  const [view, setView] = useState<View>("listings")
  const { close: closeMobileNav, asideClassName, backdrop, menuButton } = useReloMobileNav()

  return (
    <div className="relo-app-shell">
      {backdrop}
      {/* Sidebar */}
      <aside id="relo-app-sidebar" className={asideClassName}>
        <div className="flex items-center gap-2 px-2 mb-6 sm:mb-8">
          <div className="w-7 h-7 rounded-lg bg-[#0033A1] flex items-center justify-center shrink-0">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-[15px] text-[#1A1612]">landlord</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} onClick={closeMobileNav}
                className={`relo-sidebar-nav-item ${item.active ? "!bg-[rgba(0,51,161,0.1)] !text-[#0033A1] !font-semibold" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* KPI summary */}
        <div className="mt-8 pt-6 border-t border-[#E4DFDA] flex flex-col gap-3">
          {[
            ["Active listings", "3"],
            ["Pending inquiries", "12"],
            ["Occupancy", "88%"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center">
              <span className="text-xs text-[#6B6460]">{k}</span>
              <span className="text-sm font-bold text-[#1A1612]">{v}</span>
            </div>
          ))}
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
              {view === "listings" ? "Listings" : "Tenant pipeline"}
            </div>
            <div className="text-[11px] text-[#6B6460] sm:text-xs line-clamp-2">
              {view === "listings" ? "3 active · 1 draft · 12 inquiries pending" : "drag to move · 17 in flight across 3 properties"}
            </div>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <div className="flex rounded-lg border border-[#E4DFDA] overflow-hidden">
              {(["listings", "pipeline"] as View[]).map((v) => (
                <button type="button" key={v} onClick={() => setView(v)}
                  className={`px-3 py-2 text-[11px] font-semibold transition-colors capitalize sm:px-4 sm:text-xs ${view === v ? "bg-[#0033A1] text-white" : "bg-white text-[#6B6460] hover:bg-[#F0EDE8]"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button type="button" className="flex shrink-0 items-center gap-2 bg-[#0033A1] text-white font-semibold text-xs px-3 py-2 rounded-lg hover:bg-[#002880] transition-colors sm:text-sm sm:px-4">
              <Plus className="h-4 w-4" /> New listing
            </button>
          </div>
        </div>

        {view === "listings" ? (
          <div className="relo-content">
            {/* KPI strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
              {[
                ["ACTIVE LISTINGS", "3", "+1 vs last mo"],
                ["INQUIRIES", "12", "↑ 4 today"],
                ["OCCUPANCY", "88%", "2 voids"],
                ["VERIFIED TENANTS", "5/5", "all green"],
              ].map(([k, v, d]) => (
                <div key={k} className="relo-widget">
                  <div className="text-[9px] text-[#A8A4A0] font-bold tracking-wide">{k}</div>
                  <div className="text-2xl font-display font-bold text-[#1A1612] mt-1">{v}</div>
                  <div className="text-[11px] text-[#6B6460] mt-0.5">{d}</div>
                </div>
              ))}
            </div>

            {/* Listings table */}
            <div className="mb-6 overflow-x-auto rounded-xl border border-[#E4DFDA] bg-white">
              <div className="min-w-[520px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-4 py-3 border-b border-[#E4DFDA] bg-[#FAFAF8] sm:px-5">
                {["Property", "Status", "Rent", "Inquiries", "Score", ""].map((h) => (
                  <div key={h} className="text-[10px] font-bold text-[#A8A4A0] uppercase tracking-wide">{h}</div>
                ))}
              </div>
              {listings.map((l, i) => (
                <div key={l.id} className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-4 py-4 items-center sm:px-5 ${i < listings.length - 1 ? "border-b border-[#F0EDE8]" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E4DFDA] to-[#D5D0CB] flex items-center justify-center shrink-0">
                      <Home className="h-4 w-4 text-[#A8A4A0]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1A1612]">{l.name}</div>
                      <div className="text-[10px] text-[#6B6460]">{l.note}</div>
                    </div>
                  </div>
                  <div>
                    <span className={`relo-chip text-[11px] ${l.status === "live" ? "!bg-[rgba(74,124,89,0.12)] !text-[#4A7C59]" : ""}`}>
                      {l.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#1A1612]">{l.rent}</div>
                  <div>
                    {l.inquiries > 0 ? (
                      <span className="relo-chip relo-chip-accent text-[11px]">{l.inquiries} new</span>
                    ) : <span className="text-[#A8A4A0]">—</span>}
                  </div>
                  <div>
                    {l.score > 0 ? (
                      <span className="relo-chip text-[11px]">{l.score}/100</span>
                    ) : <span className="text-[#A8A4A0]">—</span>}
                  </div>
                  <button type="button" className="text-[#A8A4A0] hover:text-[#1A1612] transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              ))}
              </div>
            </div>

            {/* Lower grid */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Recent inquiries */}
              <div className="relo-widget">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-[#1A1612] text-sm">Recent inquiries</div>
                  <span className="text-xs text-[#6B6460]">12 pending</span>
                </div>
                <div className="flex flex-col gap-3">
                  {inquiries.map((inq, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#F7F5F0] rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#EDE9E4] flex items-center justify-center text-sm font-bold text-[#6B6460] shrink-0">
                        {inq.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#1A1612]">{inq.name} → {inq.property}</div>
                        <div className="text-[10px] text-[#6B6460] flex items-center gap-1">
                          {inq.verified ? (
                            <><CheckCircle2 className="h-3 w-3 text-[#4A7C59]" /> {inq.note}</>
                          ) : (
                            <><Clock className="h-3 w-3 text-[#D97706]" /> {inq.note}</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`relo-chip text-[10px] ${inq.status === "new" ? "relo-chip-accent" : ""}`}>{inq.status}</span>
                        <button type="button" className="text-xs font-semibold text-[#0033A1] hover:underline">Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI concierge */}
              <div className="border border-[#0033A1] bg-white rounded-xl p-5" style={{ boxShadow: "0 0 0 3px rgba(0,51,161,0.05)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#0033A1] flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-bold text-[#0033A1]">AI Assistant</span>
                </div>
                <p className="text-sm text-[#1A1612] mb-4">
                  3 verified tenants saved your Chorlton Mews flat but haven't messaged. Want me to nudge them with a viewing slot?
                </p>
                <div className="border-t border-[#E4DFDA] pt-4">
                  <div className="text-[9px] font-bold tracking-wide text-[#A8A4A0] uppercase mb-3">Next actions</div>
                  <div className="flex flex-col gap-2">
                    {["Approve 2 verified tenants", "Renew Beech Rd photos", "Set May rent reminders"].map((a, i) => (
                      <div key={a} className="flex items-center gap-2 text-sm text-[#6B6460]">
                        {i === 2 ? <CheckCircle2 className="h-4 w-4 text-[#4A7C59]" /> : <div className="w-4 h-4 rounded border-2 border-[#E4DFDA]" />}
                        <span className={i === 2 ? "line-through text-[#A8A4A0]" : ""}>{a}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="mt-4 flex items-center gap-2 bg-[#0033A1] text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#002880] transition-colors">
                    Run assistant <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Pipeline / kanban view */
          <div className="relo-content overflow-x-auto">
            <div className="flex gap-4 min-w-[900px]">
              {pipelineCols.map((col, ci) => (
                <div key={ci} className="flex-1 min-w-[160px]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-[#1A1612]">{col.name}</span>
                    <span className={`relo-chip text-[10px] ${ci === 3 ? "!bg-[rgba(0,51,161,0.12)] !text-[#0033A1]" : ""}`}>
                      {col.cards.length}
                    </span>
                  </div>
                  <div className={`rounded-xl p-3 flex flex-col gap-3 min-h-[400px] ${ci === 3 ? "bg-[rgba(0,51,161,0.04)] border border-[rgba(0,51,161,0.1)]" : "bg-[#F7F5F0]"}`}>
                    {col.cards.map(([name, prop, note], ki) => (
                      <div key={ki} className="bg-white border border-[#E4DFDA] rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-[#EDE9E4] flex items-center justify-center text-xs font-bold text-[#6B6460]">
                            {name[0]}
                          </div>
                          <span className="text-sm font-semibold text-[#1A1612]">{name}</span>
                        </div>
                        <div className="text-[10px] text-[#6B6460] mb-2">{prop}</div>
                        <span className={`relo-chip text-[9px] ${note.startsWith("✓") ? "!bg-[rgba(74,124,89,0.12)] !text-[#4A7C59]" : note.startsWith("signed") ? "relo-chip-accent" : ""}`}>
                          {note}
                        </span>
                      </div>
                    ))}
                    <div className="border-2 border-dashed border-[#E4DFDA] rounded-xl p-3 text-center text-[10px] text-[#A8A4A0] hover:border-[#E85C2D] transition-colors cursor-pointer">
                      + drop card here
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
