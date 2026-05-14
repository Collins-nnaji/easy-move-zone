"use client"

import { useState } from "react"
import Link from "next/link"
import { BrandLogoLink } from "@/components/platform/BrandLogoLink"
import { useReloMobileNav } from "@/hooks/useReloMobileNav"
import {
  Home, MapPin, Users, Bot, User,
  Search, ChevronRight, Star, Wifi, Car, Trees,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home",      icon: Home,   active: false },
  { href: "/explore",   label: "Explore",   icon: MapPin, active: true  },
  { href: "/community", label: "Community", icon: Users,  active: false },
  { href: "/ai",        label: "AI",        icon: Bot,    active: false },
  { href: "/profile",   label: "Profile",   icon: User,   active: false },
]

const areas = [
  { name: "Chorlton",     score: 92, price: "£950",  commute: "18m", safety: 4, cafes: 18, vibe: "leafy",    transport: "tram", green: "high",  noise: "low"  },
  { name: "Didsbury",     score: 88, price: "£1,100", commute: "22m", safety: 5, cafes: 12, vibe: "family",   transport: "bus",  green: "high",  noise: "low"  },
  { name: "Levenshulme",  score: 84, price: "£780",  commute: "15m", safety: 3, cafes: 24, vibe: "eclectic", transport: "tram", green: "mid",   noise: "mid"  },
  { name: "Stretford",    score: 78, price: "£820",  commute: "25m", safety: 4, cafes: 8,  vibe: "quiet",    transport: "tram", green: "mid",   noise: "low"  },
  { name: "Withington",   score: 75, price: "£890",  commute: "20m", safety: 3, cafes: 15, vibe: "student",  transport: "bus",  green: "mid",   noise: "mid"  },
  { name: "Hulme",        score: 72, price: "£700",  commute: "8m",  safety: 3, cafes: 10, vibe: "urban",    transport: "bus",  green: "low",   noise: "high" },
]

const vibeColors: Record<string, string> = {
  leafy: "#4A7C59",
  family: "#0033A1",
  eclectic: "#7C3AED",
  quiet: "#6B6460",
  student: "#D97706",
  urban: "#E85C2D",
}

type ViewMode = "list" | "compare"

const compareRows = [
  { label: "Fit score",     key: "score" as keyof typeof areas[0],    format: (v: unknown) => `${v}/100` },
  { label: "Avg rent 1B",   key: "price" as keyof typeof areas[0],    format: (v: unknown) => `${v}/mo` },
  { label: "Commute → NQ",  key: "commute" as keyof typeof areas[0],  format: (v: unknown) => `${v}` },
  { label: "Safety",        key: "safety" as keyof typeof areas[0],   format: (v: unknown) => "★".repeat(Number(v)) + "☆".repeat(5 - Number(v)) },
  { label: "Cafés / km²",   key: "cafes" as keyof typeof areas[0],    format: (v: unknown) => `${v}` },
  { label: "Green space",   key: "green" as keyof typeof areas[0],    format: (v: unknown) => `${v}` },
  { label: "Noise",         key: "noise" as keyof typeof areas[0],    format: (v: unknown) => `${v}` },
  { label: "Vibe",          key: "vibe" as keyof typeof areas[0],     format: (v: unknown) => `${v}` },
]

export function CityExplorer() {
  const { close: closeMobileNav, asideClassName, backdrop, menuButton } = useReloMobileNav()
  const [view, setView] = useState<ViewMode>("list")
  const [selected, setSelected] = useState(0)
  const [maxRent, setMaxRent] = useState(1200)
  const [compareAreas, setCompareAreas] = useState([0, 1, 2, 3])

  const filtered = areas.filter((a) => parseInt(a.price.replace("£", "")) <= maxRent)

  return (
    <div className="relo-app-shell">
      {backdrop}
      {/* Sidebar */}
      <aside id="relo-app-sidebar" className={asideClassName}>
        <BrandLogoLink className="px-2 mb-6 sm:mb-8" />
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} onClick={closeMobileNav} className={`relo-sidebar-nav-item ${item.active ? "active" : ""}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Filters */}
        <div className="mt-8 pt-6 border-t border-[#E4DFDA]">
          <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-4">Filters</div>

          <div className="mb-5">
            <div className="text-xs font-semibold text-[#1A1612] mb-2">Max rent</div>
            <div className="text-lg font-display font-bold text-[#E85C2D] mb-2">£{maxRent}/mo</div>
            <input
              type="range" min={400} max={2000} step={50} value={maxRent}
              onChange={(e) => setMaxRent(Number(e.target.value))}
              className="w-full accent-[#E85C2D]"
            />
            <div className="flex justify-between text-[10px] text-[#A8A4A0] mt-1">
              <span>£400</span><span>£2,000</span>
            </div>
          </div>

          <div className="mb-5">
            <div className="text-xs font-semibold text-[#1A1612] mb-2">Commute</div>
            <div className="flex flex-wrap gap-1">
              {["<15min", "<30min", "any"].map((c) => (
                <button key={c} className="relo-chip text-[10px] cursor-pointer hover:bg-[rgba(232,92,45,0.1)] hover:text-[#C44520] transition-colors">
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#1A1612] mb-2">Vibe</div>
            <div className="flex flex-wrap gap-1">
              {["leafy", "quiet", "cafés", "family"].map((v) => (
                <button key={v} className="relo-chip text-[10px] cursor-pointer hover:bg-[rgba(232,92,45,0.1)] hover:text-[#C44520] transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="relo-main">
        {/* Top bar */}
        <div className="relo-topbar shrink-0 min-h-[56px] h-auto flex-wrap gap-y-2 py-2 sm:min-h-[60px] sm:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {menuButton}
            <div className="min-w-0">
            <div className="text-sm font-bold text-[#1A1612] sm:text-base">Explore Manchester</div>
            <div className="text-[11px] text-[#6B6460] sm:text-xs">{areas.length} areas matched · sorted by fit</div>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <div className="flex rounded-lg border border-[#E4DFDA] overflow-hidden">
              {(["list", "compare"] as ViewMode[]).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-2 text-[11px] font-semibold transition-colors sm:px-4 sm:text-xs ${view === v ? "bg-[#E85C2D] text-white" : "bg-white text-[#6B6460] hover:bg-[#F0EDE8]"}`}
                >
                  {v === "list" ? "List" : "Compare"}
                </button>
              ))}
            </div>
            <button type="button" className="relo-btn-secondary shrink-0 px-3 py-2 rounded-lg text-[11px] sm:px-4 sm:text-xs">
              Compare cities
            </button>
          </div>
        </div>

        {view === "list" ? (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            {/* Area list */}
            <div className="max-h-[38vh] w-full shrink-0 overflow-y-auto border-b border-[#E4DFDA] lg:max-h-none lg:w-80 lg:border-b-0 lg:border-r">
              {filtered.map((area, i) => (
                <button
                  key={area.name}
                  onClick={() => setSelected(i)}
                  className={`w-full flex items-start gap-3 p-4 border-b border-[#E4DFDA] text-left transition-colors ${selected === i ? "bg-[rgba(232,92,45,0.05)]" : "hover:bg-[#FAFAF8]"}`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E85C2D]/20 to-[#E85C2D]/5 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-[#E85C2D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-[#1A1612] text-sm">{area.name}</div>
                      <span className={`relo-chip text-[10px] ${selected === i ? "relo-chip-accent" : ""}`}>{area.score}</span>
                    </div>
                    <div className="text-[11px] text-[#6B6460] mt-0.5">{area.price}/mo · {area.commute}</div>
                    <span
                      className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${vibeColors[area.vibe]}15`, color: vibeColors[area.vibe] }}
                    >
                      {area.vibe}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Area detail / map placeholder */}
            <div className="relo-content min-h-0 min-w-0 flex-1 overflow-y-auto">
              {(() => {
                const area = areas[selected]
                return (
                  <div>
                    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h2 className="font-display text-xl font-bold text-[#1A1612] sm:text-2xl">{area.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="relo-chip relo-chip-accent text-xs">{area.score}/100 fit</span>
                          <span
                            className="relo-chip text-xs font-semibold"
                            style={{ background: `${vibeColors[area.vibe]}15`, color: vibeColors[area.vibe] }}
                          >
                            {area.vibe}
                          </span>
                        </div>
                      </div>
                      <button type="button" className="relo-btn-primary w-full shrink-0 rounded-xl px-4 py-2.5 text-sm sm:w-auto sm:self-start sm:px-5">
                        Save area
                      </button>
                    </div>

                    {/* Map placeholder */}
                    <div className="h-44 rounded-xl bg-gradient-to-br from-[#E4DFDA] to-[#D5D0CB] mb-4 flex items-center justify-center border border-[#E4DFDA] sm:h-56 sm:mb-6">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-[#C8C3BE] mx-auto mb-2" />
                        <div className="text-sm text-[#A8A4A0] font-medium">{area.name} map</div>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 mb-4 sm:mb-6">
                      {[
                        { label: "Average rent (1 bed)", value: `${area.price}/mo`, icon: Home },
                        { label: "Commute to city centre", value: area.commute, icon: Car },
                        { label: "Safety rating", value: "★".repeat(area.safety), icon: Star },
                        { label: "Cafés per km²", value: `${area.cafes}`, icon: Search },
                        { label: "Green space", value: area.green, icon: Trees },
                        { label: "Noise level", value: area.noise, icon: Wifi },
                      ].map((stat) => {
                        const Icon = stat.icon
                        return (
                          <div key={stat.label} className="relo-widget">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-4 w-4 text-[#6B6460]" />
                              <div className="text-[11px] text-[#6B6460]">{stat.label}</div>
                            </div>
                            <div className="text-base font-bold text-[#1A1612]">{stat.value}</div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Housing button */}
                    <Link href="/explore" className="relo-btn-primary flex items-center gap-2 rounded-xl px-5 py-3 text-sm w-fit">
                      View housing in {area.name} <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )
              })()}
            </div>
          </div>
        ) : (
          /* Compare view */
          <div className="relo-content min-h-0 flex-1 overflow-x-auto overflow-y-auto">
            <div className="min-w-[720px] sm:min-w-[800px]">
              {/* Header row */}
              <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `200px repeat(${compareAreas.length}, 1fr)` }}>
                <div />
                {compareAreas.map((idx) => (
                  <div key={idx} className="relo-widget text-center">
                    <div className="font-bold text-[#1A1612]">{areas[idx].name}</div>
                    <div className="relo-chip relo-chip-accent text-xs mt-1 mx-auto w-fit">{areas[idx].score}/100</div>
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {compareRows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-4 mb-2 items-center"
                  style={{ gridTemplateColumns: `200px repeat(${compareAreas.length}, 1fr)` }}
                >
                  <div className="text-xs font-semibold text-[#6B6460] py-3">{row.label}</div>
                  {compareAreas.map((idx) => {
                    const val = areas[idx][row.key]
                    return (
                      <div key={idx} className="bg-white border border-[#E4DFDA] rounded-lg px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-[#1A1612]">{row.format(val)}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
