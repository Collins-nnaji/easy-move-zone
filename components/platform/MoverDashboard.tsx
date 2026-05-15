"use client"

import Link from "next/link"
import { BrandLogoLink } from "@/components/platform/BrandLogoLink"
import { useState, useEffect } from "react"
import {
  MapPin, Home, CheckCircle2, Circle, Sparkles, Bot, Users,
  X, Send, ChevronRight, Bell, Search, User, Calendar,
  TrendingDown, ArrowRight, FileText, BarChart3, Star,
  DollarSign, MessageCircle, Settings, LogOut,
} from "lucide-react"
import type { RelocationPlan, RelocationTask } from "@/lib/relocate/types"
import { useReloMobileNav } from "@/hooks/useReloMobileNav"

const navItems = [
  { href: "/dashboard", label: "Home",      icon: Home,    active: true  },
  { href: "/explore",   label: "Explore",   icon: MapPin,  active: false },
  { href: "/community", label: "Community", icon: Users,   active: false },
  { href: "/ai",        label: "AI",        icon: Bot,     active: false },
  { href: "/profile",   label: "Profile",   icon: User,    active: false },
]

const journeySteps = ["Explore", "Housing", "Documents", "Arrival", "Settled"]

const quickActions = [
  { icon: Search,      label: "Search areas",   href: "/explore",   color: "#E85C2D" },
  { icon: FileText,    label: "Docs checklist", href: "/dashboard", color: "#0033A1" },
  { icon: DollarSign,  label: "Mortgage",       href: "/mortgage",  color: "#4A7C59" },
  { icon: MessageCircle, label: "AI chat",      href: "/ai",        color: "#E85C2D" },
  { icon: Users,       label: "Community",      href: "/community", color: "#0033A1" },
  { icon: BarChart3,   label: "Finances",       href: "/finance",   color: "#4A7C59" },
]

interface UserSession {
  id: string
  name?: string | null
  email?: string | null
}

export function MoverDashboard({ user }: { user: UserSession }) {
  const { close: closeMobileNav, asideClassName, backdrop, menuButton } = useReloMobileNav()
  const [plan, setPlan] = useState<RelocationPlan | null>(null)
  const [dbTasks, setDbTasks] = useState<RelocationTask[]>([])
  const [loading, setLoading] = useState(true)
  const [tasksDone, setTasksDone] = useState<string[]>([])
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMessage, setAiMessage] = useState("")
  const [aiChat, setAiChat] = useState([
    { role: "ai", text: "Welcome! Tell me about your move and I'll help you get settled." },
  ])

  useEffect(() => {
    fetch("/api/relocate/plan")
      .then((r) => r.json())
      .then((data: { plan?: RelocationPlan; tasks?: RelocationTask[] }) => {
        if (data.plan) setPlan(data.plan)
        if (data.tasks) {
          setDbTasks(data.tasks)
          setTasksDone(data.tasks.filter((t) => t.status === "done").map((t) => t.id))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function toggleTask(id: string) {
    setTasksDone((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])
  }

  function sendAi() {
    if (!aiMessage.trim()) return
    const msg = aiMessage.trim()
    setAiChat((c) => [...c, { role: "user", text: msg }])
    setAiMessage("")
    setTimeout(() => {
      setAiChat((c) => [
        ...c,
        { role: "ai", text: "Great question! Based on your profile (£1,200/mo, solo, Manchester, May), I'd recommend focusing on Chorlton first. Shall I draft viewing request messages?" },
      ])
    }, 900)
  }

  const doneCount = dbTasks.filter((t) => tasksDone.includes(t.id)).length
  const totalTasks = dbTasks.length || 8
  const progressPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0
  const firstName = user.name?.split(" ")[0] ?? "there"
  const userInitial = (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()

  return (
    <div className="relo-app-shell">
      {backdrop}

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside id="relo-app-sidebar" className={asideClassName}>
        <BrandLogoLink className="px-2 mb-8" />

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileNav}
                className={`relo-sidebar-nav-item ${item.active ? "active" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-1 pt-4 border-t border-[#E4DFDA]">
          <button
            type="button"
            onClick={() => { closeMobileNav(); setAiOpen(true) }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[rgba(232,92,45,0.08)] text-[#E85C2D] text-sm font-semibold hover:bg-[rgba(232,92,45,0.15)] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            AI Concierge
          </button>

          {/* User snippet */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F0EDE8] transition-colors cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-[#E85C2D] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#1A1612] truncate">{user.name ?? user.email ?? "User"}</div>
              <Link href="/profile" onClick={closeMobileNav} className="text-[10px] text-[#E85C2D] font-medium hover:underline">Edit profile</Link>
            </div>
            <Settings className="h-3.5 w-3.5 text-[#A8A4A0] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────── */}
      <div className="relo-main">

        {/* Top bar */}
        <div className="relo-topbar shrink-0 min-h-[56px] h-auto flex-wrap gap-y-2 py-2 sm:min-h-[60px] sm:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {menuButton}
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#1A1612] sm:text-base truncate">
                {loading ? "Loading…" : `Hi ${firstName} ✦`}
              </div>
              <div className="text-[11px] text-[#6B6460] sm:text-xs line-clamp-1">
                {plan
                  ? `${plan.originCity || "—"} → ${plan.destinationCity || "—"} · ${plan.moveReason || "relocation"}`
                  : "Set up your relocation plan to get started"}
              </div>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center justify-end gap-1.5 sm:w-auto sm:gap-2">
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#E4DFDA] text-xs font-semibold text-[#6B6460] hover:bg-[#F0EDE8] transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </Link>
            <button className="w-9 h-9 rounded-lg border border-[#E4DFDA] flex items-center justify-center text-[#6B6460] hover:bg-[#F0EDE8] transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E85C2D] rounded-full text-white text-[8px] font-bold flex items-center justify-center">3</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#E85C2D] text-white flex items-center justify-center text-sm font-bold shrink-0 cursor-pointer">
              {userInitial}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relo-content pb-20 lg:pb-6">

          {/* ── Stats row ──────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
            {[
              {
                icon: Calendar, label: "Days to move", value: "42",
                sub: "May 28th", color: "#E85C2D", bg: "rgba(232,92,45,0.1)",
              },
              {
                icon: CheckCircle2, label: "Tasks done", value: `${doneCount}/${totalTasks}`,
                sub: `${progressPct}% complete`, color: "#4A7C59", bg: "rgba(74,124,89,0.1)",
              },
              {
                icon: TrendingDown, label: "Under budget", value: "8%",
                sub: "£360 remaining", color: "#0033A1", bg: "rgba(0,51,161,0.1)",
              },
              {
                icon: Star, label: "New matches", value: "4",
                sub: "housing listings", color: "#E85C2D", bg: "rgba(232,92,45,0.1)",
              },
            ].map(({ icon: Icon, label, value, sub, color, bg }) => (
              <div key={label} className="relo-widget hover:border-[rgba(232,92,45,0.2)] transition-colors p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <span className="text-[9px] font-bold text-[#6B6460] uppercase tracking-wide leading-tight">{label}</span>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-[#1A1612] leading-none">{value}</div>
                  <div className="text-[11px] text-[#6B6460] mt-1">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Journey progress ───────────────────────── */}
          <div className="relo-widget mb-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-semibold text-[#1A1612]">Relocation journey</div>
              <span className="text-xs text-[#6B6460] shrink-0">Step 2 of 5 — Housing</span>
            </div>
            {/* Thin progress bar */}
            <div className="relative mb-5">
              <div className="h-1.5 bg-[#EDE9E4] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#E85C2D] to-[#F07A52] rounded-full transition-all duration-700" style={{ width: "28%" }} />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {journeySteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-2 text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    i < 1
                      ? "bg-[#4A7C59] text-white shadow-sm"
                      : i === 1
                      ? "bg-[#E85C2D] text-white shadow-[0_0_0_4px_rgba(232,92,45,0.15)]"
                      : "bg-[#EDE9E4] text-[#A8A4A0]"
                  }`}>
                    {i < 1 ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-semibold leading-tight ${
                    i < 1 ? "text-[#4A7C59]" : i === 1 ? "text-[#E85C2D]" : "text-[#C8C3BE]"
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick actions ──────────────────────────── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-[#1A1612]">Quick actions</div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {quickActions.map(({ icon: Icon, label, href, color }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex flex-col items-center gap-2 bg-white border border-[#E4DFDA] rounded-xl p-3 hover:border-[rgba(232,92,45,0.3)] hover:shadow-sm transition-all"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${color}12` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#6B6460] text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Main widget grid ───────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-4">

            {/* Recommended areas */}
            <div className="relo-widget">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-[#1A1612] text-sm">Recommended areas</div>
                <Link href="/explore" className="text-xs text-[#E85C2D] font-semibold flex items-center gap-0.5">
                  See all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              {plan?.destinationCity ? (
                <div className="flex flex-col gap-2.5">
                  {[
                    { name: "Chorlton", rent: "£950–1,200/mo", score: 92, commute: "18 min" },
                    { name: "Didsbury", rent: "£800–1,050/mo", score: 85, commute: "22 min" },
                    { name: "Levenshulme", rent: "£700–900/mo", score: 78, commute: "26 min" },
                  ].map((area) => (
                    <div key={area.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7F5F0] hover:bg-[#F0EDE8] transition-colors cursor-pointer group">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E85C2D]/20 to-[#E85C2D]/5 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-[#E85C2D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#1A1612] group-hover:text-[#E85C2D] transition-colors">{area.name}</div>
                        <div className="text-[10px] text-[#6B6460]">{area.rent} · {area.commute}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-[#E85C2D]">{area.score}</div>
                        <div className="text-[9px] text-[#A8A4A0]">score</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-center">
                  <MapPin className="h-6 w-6 text-[#C8C3BE]" />
                  <div className="text-sm text-[#A8A4A0]">Complete onboarding for area recommendations</div>
                  <Link href="/onboarding" className="text-xs text-[#E85C2D] font-semibold">Start onboarding →</Link>
                </div>
              )}
            </div>

            {/* Housing matches */}
            <div className="relo-widget">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-[#1A1612] text-sm">Housing matches</div>
                <span className="relo-chip relo-chip-accent text-[10px]">4 new</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { title: "1-bed flat, Chorlton", price: "£1,100/mo", type: "Apartment", match: 94 },
                  { title: "Studio, Didsbury", price: "£875/mo", type: "Studio", match: 88 },
                  { title: "1-bed, Levenshulme", price: "£795/mo", type: "Apartment", match: 81 },
                ].map((prop) => (
                  <div key={prop.title} className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E4DFDA] hover:border-[rgba(232,92,45,0.3)] hover:shadow-sm transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0033A1]/10 to-[#0033A1]/5 flex items-center justify-center shrink-0">
                      <Home className="h-4 w-4 text-[#0033A1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#1A1612] truncate group-hover:text-[#E85C2D] transition-colors">{prop.title}</div>
                      <div className="text-[10px] text-[#6B6460]">{prop.price} · {prop.type}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-bold text-[#4A7C59]">{prop.match}%</div>
                      <div className="text-[9px] text-[#A8A4A0]">match</div>
                    </div>
                  </div>
                ))}
                <Link href="/explore" className="flex items-center justify-center gap-1 py-1.5 text-xs text-[#E85C2D] font-semibold hover:underline">
                  Browse all 23 listings <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* This week tasks */}
            <div className="relo-widget">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-[#1A1612] text-sm">This week</div>
                <span className="text-xs text-[#6B6460]">{doneCount}/{totalTasks} done</span>
              </div>
              <div className="mb-3">
                <div className="relo-progress-bar">
                  <div className="relo-progress-bar-fill" style={{ width: `${progressPct || 35}%` }} />
                </div>
                <div className="text-[10px] text-[#A8A4A0] mt-1">{progressPct || 35}% of your plan complete</div>
              </div>
              <div className="flex flex-col gap-2.5">
                {dbTasks.length === 0 ? (
                  <div className="text-sm text-[#A8A4A0]">No tasks yet — complete onboarding to generate your checklist.</div>
                ) : (
                  dbTasks.slice(0, 5).map((task) => {
                    const done = tasksDone.includes(task.id)
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="flex items-center gap-2.5 text-left group w-full"
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-[#4A7C59] shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-[#C8C3BE] shrink-0 group-hover:text-[#E85C2D] transition-colors" />
                        )}
                        <span className={`text-[13px] ${done ? "line-through text-[#A8A4A0]" : "text-[#1A1612]"}`}>
                          {task.title}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
              {dbTasks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#E4DFDA]">
                  <button className="text-xs text-[#E85C2D] font-semibold">See all {dbTasks.length} tasks →</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Lower row ──────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {/* Budget tracker */}
            <div className="relo-widget">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-[#1A1612] text-sm">Budget tracker</div>
                <span className="text-[10px] font-semibold text-[#4A7C59] bg-[rgba(74,124,89,0.1)] px-2 py-1 rounded-full">8% under</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-3xl font-display font-bold text-[#1A1612]">£3,840</div>
                <div className="text-sm text-[#6B6460]">/ £4,200</div>
              </div>
              <div className="text-xs text-[#6B6460] mb-3">£360 remaining in budget</div>
              <div className="relo-progress-bar mb-4">
                <div className="relo-progress-bar-fill bg-gradient-to-r from-[#E85C2D] to-[#F07A52]" style={{ width: "91%" }} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  ["Deposit", "£1,800", "#E85C2D"],
                  ["Moving truck", "£850", "#0033A1"],
                  ["Setup & SIM", "£280", "#4A7C59"],
                  ["First week", "£910", "#6B6460"],
                ].map(([k, v, c]) => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#6B6460] truncate">{k}</div>
                      <div className="text-xs font-bold text-[#1A1612]">{v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community */}
            <div className="relo-widget">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-[#1A1612] text-sm">Community</div>
                <span className="text-xs text-[#6B6460]">17 nearby</span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { initial: "S", name: "Sara", status: "moving in 3 weeks", online: true, color: "#E85C2D" },
                  { initial: "J", name: "Jamie", status: "just arrived", online: true, color: "#4A7C59" },
                  { initial: "P", name: "Priya", status: "veteran (2 yrs)", online: false, color: "#0033A1" },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: p.color }}>
                        {p.initial}
                      </div>
                      {p.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#4A7C59] rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1A1612]">{p.name}</div>
                      <div className="text-[10px] text-[#6B6460]">{p.status}</div>
                    </div>
                    <button className="shrink-0 text-[10px] text-[#E85C2D] font-semibold border border-[rgba(232,92,45,0.3)] px-2 py-1 rounded-lg hover:bg-[rgba(232,92,45,0.06)] transition-colors">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[#E4DFDA]">
                <Link href="/community" className="text-xs text-[#E85C2D] font-semibold">
                  Open group: LDN→MAN may '26 →
                </Link>
              </div>
            </div>

            {/* AI concierge nudge */}
            <div className="relo-ai-card">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E85C2D] to-[#C84420] flex items-center justify-center shadow-sm shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#E85C2D]">AI Concierge</div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] animate-pulse" />
                    <span className="text-[10px] text-[#4A7C59] font-semibold">Online</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F7F5F0] rounded-xl p-3 mb-4">
                <p className="text-sm text-[#1A1612] leading-relaxed">
                  You've saved 3 Chorlton listings but haven't booked viewings. Want me to draft 3 messages to landlords?
                </p>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAiOpen(true)}
                  className="relo-btn-primary text-xs px-4 py-2 rounded-lg flex-1"
                >
                  Draft them
                </button>
                <button className="relo-btn-secondary text-xs px-4 py-2 rounded-lg">
                  Not yet
                </button>
              </div>

              <button
                onClick={() => setAiOpen(true)}
                className="w-full flex items-center gap-2 bg-[#F7F5F0] hover:bg-[#EDE9E4] rounded-xl px-3 py-2.5 text-xs text-[#6B6460] transition-colors group"
              >
                <Search className="h-3.5 w-3.5 text-[#A8A4A0]" />
                <span className="flex-1 text-left">Ask anything about your move...</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#A8A4A0] group-hover:text-[#E85C2D] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom nav ──────────────────────── */}
      <nav className="relo-bottom-nav lg:hidden" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relo-bottom-nav-item ${item.active ? "active" : ""}`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── AI Concierge slide-over ─────────────────── */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setAiOpen(false)} />
          <div className="relative z-10 ml-auto flex h-full w-full max-w-full flex-col border-l border-[#E4DFDA] bg-white shadow-2xl sm:max-w-[420px]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4DFDA]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E85C2D] to-[#C84420] flex items-center justify-center shadow-sm">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-[#1A1612] text-sm">AI Concierge</div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] animate-pulse" />
                    <span className="text-[10px] text-[#4A7C59] font-semibold">Online — powered by AI</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAiOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-[#F0EDE8] flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-[#6B6460]" />
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {aiChat.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "ai" && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E85C2D] to-[#C84420] flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#E85C2D] text-white rounded-br-sm"
                      : "bg-[#F7F5F0] text-[#1A1612] rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#E4DFDA]">
              <div className="flex items-center gap-2 bg-[#F7F5F0] rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[rgba(232,92,45,0.15)] transition-shadow">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendAi()}
                  placeholder="Ask about your move..."
                  className="flex-1 bg-transparent text-sm text-[#1A1612] placeholder:text-[#A8A4A0] outline-none"
                />
                <button
                  onClick={sendAi}
                  disabled={!aiMessage.trim()}
                  className="w-8 h-8 rounded-lg bg-[#E85C2D] flex items-center justify-center hover:bg-[#D44E22] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
