"use client"

import Link from "next/link"
import { BrandLogoLink } from "@/components/platform/BrandLogoLink"
import { useState, useEffect } from "react"
import {
  MapPin, Home, CheckCircle2, Circle, Sparkles, Bot, Users,
  X, Send, ChevronRight, Bell, Search, User,
} from "lucide-react"
import type { RelocationPlan, RelocationTask } from "@/lib/relocate/types"
import { useReloMobileNav } from "@/hooks/useReloMobileNav"

const navItems = [
  { href: "/dashboard", label: "Home",       icon: Home,        active: true },
  { href: "/explore",   label: "Explore",    icon: MapPin,      active: false },
  { href: "/community", label: "Community",  icon: Users,       active: false },
  { href: "/ai",        label: "AI",         icon: Bot,         active: false },
  { href: "/profile",   label: "Profile",    icon: User,        active: false },
]

const journeySteps = ["Explore", "Housing", "Documents", "Arrival", "Settled"]

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

  return (
    <div className="relo-app-shell">
      {backdrop}
      {/* Sidebar */}
      <aside id="relo-app-sidebar" className={asideClassName}>
        {/* Logo */}
        <BrandLogoLink className="px-2 mb-6 sm:mb-8" />

        {/* Nav */}
        <nav className="flex flex-col gap-1">
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

        <div className="mt-auto pt-4 border-t border-[#E4DFDA]">
          {/* AI concierge quick button */}
          <button
            type="button"
            onClick={() => {
              closeMobileNav()
              setAiOpen(true)
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[rgba(232,92,45,0.08)] text-[#E85C2D] text-sm font-semibold hover:bg-[rgba(232,92,45,0.14)] transition-colors"
          >
            <Bot className="h-4 w-4" />
            AI Concierge
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="relo-main">
        {/* Top bar */}
        <div className="relo-topbar shrink-0 min-h-[56px] h-auto flex-wrap gap-y-2 py-2 sm:min-h-[60px] sm:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {menuButton}
            <div className="min-w-0">
            <div className="text-sm font-bold text-[#1A1612] sm:text-base truncate">
              {loading ? "Loading…" : plan ? `Hi ${user.name?.split(" ")[0] ?? "there"} ✦` : `Hi ${user.name?.split(" ")[0] ?? "there"} ✦`}
            </div>
            <div className="text-[11px] text-[#6B6460] sm:text-xs line-clamp-2">
              {plan ? `${plan.originCity || "—"} → ${plan.destinationCity || "—"} · ${plan.moveReason || "relocation"}` : "Set up your relocation plan to get started"}
            </div>
            </div>
          </div>
          <div className="flex w-full shrink-0 items-center justify-end gap-1.5 sm:w-auto sm:gap-2">
            <button className="w-9 h-9 rounded-lg border border-[#E4DFDA] flex items-center justify-center text-[#6B6460] hover:bg-[#F0EDE8] transition-colors">
              <Search className="h-4 w-4" />
            </button>
            <button className="w-9 h-9 rounded-lg border border-[#E4DFDA] flex items-center justify-center text-[#6B6460] hover:bg-[#F0EDE8] transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#E85C2D] rounded-full text-white text-[8px] font-bold flex items-center justify-center">3</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#E85C2D] text-white flex items-center justify-center text-sm font-bold">A</div>
          </div>
        </div>

        {/* Content */}
        <div className="relo-content">
          {/* Journey progress */}
          <div className="relo-widget mb-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-semibold text-[#1A1612] text-sm sm:text-base">Your relocation journey</div>
              <span className="text-[11px] text-[#6B6460] sm:text-xs shrink-0">step 2 of 5 — housing</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
              {journeySteps.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                    i < 1 ? "text-[#4A7C59]" : i === 1 ? "text-[#E85C2D]" : "text-[#C8C3BE]"
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i < 1 ? "bg-[#4A7C59] text-white" : i === 1 ? "bg-[#E85C2D] text-white" : "bg-[#EDE9E4] text-[#A8A4A0]"
                    }`}>
                      {i < 1 ? "✓" : i + 1}
                    </div>
                    {step}
                  </div>
                  {i < journeySteps.length - 1 && (
                    <div className={`h-px flex-1 w-8 ${i < 1 ? "bg-[#4A7C59]" : "bg-[#E4DFDA]"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main widget grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 mb-5">
            {/* Recommended areas */}
            <div className="relo-widget">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-[#1A1612] text-sm">Recommended areas</div>
                <Link href="/explore" className="text-xs text-[#E85C2D] font-semibold flex items-center gap-1">
                  3 of 12 <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {plan?.destinationCity ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E85C2D]/20 to-[#E85C2D]/5 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-[#E85C2D]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1A1612]">{plan.destinationCity}</div>
                      <div className="text-[10px] text-[#6B6460]">Your destination · explore areas</div>
                    </div>
                    <Link href="/explore" className="relo-chip relo-chip-accent text-[10px] shrink-0">Explore</Link>
                  </div>
                ) : (
                  <div className="text-sm text-[#A8A4A0]">Complete onboarding to get area recommendations</div>
                )}
              </div>
            </div>

            {/* Housing matches */}
            <div className="relo-widget">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-[#1A1612] text-sm">Housing matches</div>
                <span className="relo-chip relo-chip-accent text-[10px]">4 new</span>
              </div>
              <div className="flex items-center justify-center h-24 text-sm text-[#A8A4A0] text-center">
                Housing matches coming soon.<br />
                <Link href="/explore" className="text-[#E85C2D] font-semibold ml-1">Browse areas →</Link>
              </div>
            </div>

            {/* This week tasks */}
            <div className="relo-widget">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-[#1A1612] text-sm">This week</div>
                <span className="text-xs text-[#6B6460]">{doneCount}/{dbTasks.length} done</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {dbTasks.length === 0 ? (
                  <div className="text-sm text-[#A8A4A0]">No tasks yet — complete onboarding to generate your checklist.</div>
                ) : (
                  dbTasks.slice(0, 6).map((task) => {
                    const done = tasksDone.includes(task.id)
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="flex items-center gap-2.5 text-left group"
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
                  <div className="text-xs text-[#E85C2D] font-semibold">See all {dbTasks.length} tasks →</div>
                </div>
              )}
            </div>
          </div>

          {/* Lower row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {/* Cost tracker */}
            <div className="relo-widget">
              <div className="font-semibold text-[#1A1612] text-sm mb-3">Projected costs</div>
              <div className="text-3xl font-display font-bold text-[#E85C2D]">£3,840</div>
              <div className="text-xs text-[#6B6460] mb-3">vs £4,200 budget · 8% under</div>
              <div className="relo-progress-bar">
                <div className="relo-progress-bar-fill" style={{ width: "91%" }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-[#A8A4A0]">
                <span>allocated</span>
                <span>£360 remaining</span>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {[["Deposit", "£1,800"], ["Moving truck", "£850"], ["Setup & SIM", "£280"], ["First week", "£910"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-xs text-[#6B6460]">{k}</span>
                    <span className="text-xs font-semibold text-[#1A1612]">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community */}
            <div className="relo-widget">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-[#1A1612] text-sm">Community</div>
                <span className="text-xs text-[#6B6460]">17 nearby</span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { initial: "S", name: "Sara", status: "moving in 3 weeks" },
                  { initial: "J", name: "Jamie", status: "just arrived" },
                  { initial: "P", name: "Priya", status: "veteran (2 yrs)" },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EDE9E4] flex items-center justify-center text-sm font-bold text-[#6B6460]">
                      {p.initial}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1A1612]">{p.name}</div>
                      <div className="text-[10px] text-[#6B6460]">{p.status}</div>
                    </div>
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
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#E85C2D] flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-bold text-[#E85C2D]">Concierge</span>
              </div>
              <p className="text-sm text-[#1A1612] mb-4">
                You've saved 3 Chorlton listings but haven't booked viewings. Want me to draft 3 messages to landlords?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setAiOpen(true)}
                  className="relo-btn-primary text-xs px-4 py-2 rounded-lg"
                >
                  Draft them
                </button>
                <button className="relo-btn-secondary text-xs px-4 py-2 rounded-lg">
                  Not yet
                </button>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E4DFDA]">
                <div className="flex items-center gap-2 bg-[#F7F5F0] rounded-lg px-3 py-2 text-xs text-[#A8A4A0]">
                  <Search className="h-3 w-3" />
                  Ask anything about your move...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Concierge slide-over */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setAiOpen(false)} />
          <div className="relative z-10 ml-auto flex h-full w-full max-w-full flex-col border-l border-[#E4DFDA] bg-white shadow-2xl sm:max-w-[420px]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E4DFDA]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E85C2D] flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-[#1A1612] text-sm">AI Concierge</div>
                  <div className="text-[10px] text-[#4A7C59] font-semibold">● Online</div>
                </div>
              </div>
              <button onClick={() => setAiOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[#F0EDE8] flex items-center justify-center transition-colors">
                <X className="h-4 w-4 text-[#6B6460]" />
              </button>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {aiChat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
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
              <div className="flex items-center gap-2 bg-[#F7F5F0] rounded-xl px-4 py-3">
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
                  className="w-7 h-7 rounded-lg bg-[#E85C2D] flex items-center justify-center hover:bg-[#D44E22] transition-colors"
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
