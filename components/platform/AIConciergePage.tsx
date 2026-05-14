"use client"

import Link from "next/link"
import { BrandLogoLink } from "@/components/platform/BrandLogoLink"
import { useReloMobileNav } from "@/hooks/useReloMobileNav"
import { useState, useRef, useEffect } from "react"
import { Home, MapPin, Users, Bot, User, Sparkles, Send, ArrowRight, RefreshCw } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home",      icon: Home,   active: false },
  { href: "/explore",   label: "Explore",   icon: MapPin, active: false },
  { href: "/community", label: "Community", icon: Users,  active: false },
  { href: "/ai",        label: "AI",        icon: Bot,    active: true  },
  { href: "/profile",   label: "Profile",   icon: User,   active: false },
]

type Message = { role: "user" | "ai"; text: string; artifacts?: Artifact[] }
type Artifact = { type: "areas" | "costs" | "tasks"; data: unknown }

const suggestions = [
  "Where should I live in Manchester for £1,200/mo?",
  "Draft a message to a landlord for a viewing",
  "What documents do I need to move to the UK?",
  "How much should I budget for my relocation?",
  "What's the best area for no car + good cafés?",
  "Give me a moving checklist for 6 weeks out",
]

const initialMessages: Message[] = [
  {
    role: "ai",
    text: "Hi Amira! I'm your relocation concierge. I know your profile — London to Manchester, solo, £1,200/mo, moving late May.\n\nI can help with area recommendations, cost planning, landlord messages, documents, and anything else about your move. What's on your mind?",
  },
]

const aiResponses: Record<string, Message> = {
  default: {
    role: "ai",
    text: "Great question! Based on your profile (£1,200/mo, solo, Manchester, May '26, no car), here's what I'd recommend:\n\n**Chorlton** is your top match — £950–1,150/mo, tram to city in 18 min, loads of cafés and green space. 92/100 fit score.\n\n**Levenshulme** is a budget-friendly backup at £780–950/mo. A bit rougher around the edges but great community and only 15 min to the centre.\n\nWant me to show you available listings in either area, or draft some landlord inquiry messages?",
    artifacts: [
      {
        type: "areas",
        data: [
          { name: "Chorlton", score: 92, price: "£950–1,150" },
          { name: "Levenshulme", score: 84, price: "£780–950" },
          { name: "Didsbury", score: 88, price: "£1,100–1,400" },
        ],
      },
    ],
  },
  landlord: {
    role: "ai",
    text: "Here's a landlord inquiry message you can send — personalised to your situation:\n\n---\n\nHi,\n\nI'm interested in viewing [property address]. I'm relocating from London to Manchester for a new job at the Northern Quarter, moving late May. I'm a professional working in [industry], non-smoker, no pets, and I'm happy to provide payslips, references, and 5–6 weeks' deposit.\n\nWould you be available for a viewing this week or next?\n\nThanks, Amira\n\n---\n\nWant me to customise this further or send it to your saved listings?",
  },
  costs: {
    role: "ai",
    text: "Here's a projected relocation budget for your move:\n\n**Total estimated: £3,840** (vs your £4,200 budget — 8% under)\n\n- Deposit (5 weeks): ~£1,380\n- First month rent: ~£980\n- Moving truck/van: ~£600–850\n- Setup costs (bedding, kitchenware): ~£200–350\n- First week living costs: ~£150–200\n- Admin (bank, SIM, HMRC letter): ~£0–30\n\nYou're in good shape. Want me to generate a full cost timeline?",
    artifacts: [
      {
        type: "costs",
        data: {
          total: 3840,
          budget: 4200,
          items: [
            ["Deposit", 1380],
            ["First month rent", 980],
            ["Moving truck", 725],
            ["Setup costs", 275],
            ["First week", 175],
            ["Admin", 25],
          ],
        },
      },
    ],
  },
}

function getAIResponse(message: string): Message {
  const lower = message.toLowerCase()
  if (lower.includes("landlord") || lower.includes("message") || lower.includes("draft") || lower.includes("viewing")) {
    return aiResponses.landlord
  }
  if (lower.includes("cost") || lower.includes("budget") || lower.includes("money") || lower.includes("£")) {
    return aiResponses.costs
  }
  return aiResponses.default
}

export function AIConciergePage() {
  const { close: closeMobileNav, asideClassName, backdrop, menuButton } = useReloMobileNav()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    setMessages((m) => [...m, { role: "user", text: msg }])
    setInput("")
    setLoading(true)

    setTimeout(() => {
      setMessages((m) => [...m, getAIResponse(msg)])
      setLoading(false)
    }, 800)
  }

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

        {/* Conversation history */}
        <div className="mt-8 pt-6 border-t border-[#E4DFDA]">
          <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-3">Recent chats</div>
          <div className="flex flex-col gap-1">
            {["Where to live in Manchester?", "Landlord message draft", "Budget breakdown"].map((t) => (
              <button key={t} className="text-left text-xs text-[#6B6460] px-2 py-2 rounded-lg hover:bg-[#F0EDE8] transition-colors truncate">
                {t}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMessages(initialMessages)}
            className="mt-3 flex items-center gap-1.5 text-xs text-[#A8A4A0] hover:text-[#6B6460] transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> New chat
          </button>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="relo-main">
        <div className="relo-topbar shrink-0 min-h-[56px] h-auto flex-wrap gap-y-2 py-2 sm:min-h-[60px] sm:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {menuButton}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-[#E85C2D] flex items-center justify-center sm:w-9 sm:h-9">
              <Sparkles className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[#1A1612] text-xs sm:text-sm truncate">AI Relocation Concierge</div>
              <div className="text-[9px] text-[#4A7C59] font-semibold sm:text-[10px]">● Online · knows your profile</div>
            </div>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto sm:justify-end sm:gap-2">
            <div className="relo-chip max-w-[42%] truncate text-[10px] sm:max-w-none sm:text-xs">London → Manchester</div>
            <div className="relo-chip text-[10px] sm:text-xs">£1,200/mo</div>
            <div className="relo-chip text-[10px] sm:text-xs">May &apos;26</div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Chat */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {/* Messages */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 sm:gap-5 sm:p-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-[#E85C2D] flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[min(92vw,28rem)] sm:max-w-[70%] ${msg.role === "user" ? "order-first" : ""}`}>
                    <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#E85C2D] text-white rounded-br-sm"
                        : "bg-white border border-[#E4DFDA] text-[#1A1612] rounded-bl-sm shadow-sm"
                    }`}>
                      {msg.text}
                    </div>

                    {/* Artifacts */}
                    {msg.artifacts?.map((artifact, ai) => (
                      <div key={ai} className="mt-3">
                        {artifact.type === "areas" && (
                          <div className="flex flex-col gap-2">
                            {(artifact.data as Array<{ name: string; score: number; price: string }>).map((area) => (
                              <div key={area.name} className="flex items-center gap-3 bg-white border border-[#E4DFDA] rounded-xl px-4 py-3 shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-[rgba(232,92,45,0.1)] flex items-center justify-center">
                                  <MapPin className="h-4 w-4 text-[#E85C2D]" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-[#1A1612] text-sm">{area.name}</div>
                                  <div className="text-xs text-[#6B6460]">{area.price}/mo</div>
                                </div>
                                <span className="relo-chip relo-chip-accent text-xs">{area.score}/100</span>
                                <ArrowRight className="h-4 w-4 text-[#A8A4A0]" />
                              </div>
                            ))}
                          </div>
                        )}
                        {artifact.type === "costs" && (() => {
                          const d = artifact.data as { total: number; budget: number; items: [string, number][] }
                          return (
                            <div className="bg-white border border-[#E4DFDA] rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between mb-3">
                                <span className="text-xs font-bold text-[#6B6460]">PROJECTED TOTAL</span>
                                <span className="text-sm font-bold text-[#E85C2D]">£{d.total.toLocaleString()}</span>
                              </div>
                              <div className="relo-progress-bar mb-3">
                                <div className="relo-progress-bar-fill" style={{ width: `${(d.total / d.budget) * 100}%` }} />
                              </div>
                              {d.items.map(([label, val]) => (
                                <div key={label} className="flex justify-between py-1 text-xs">
                                  <span className="text-[#6B6460]">{label}</span>
                                  <span className="font-semibold text-[#1A1612]">£{val.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )
                        })()}
                      </div>
                    ))}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-[#E85C2D] text-white flex items-center justify-center text-sm font-bold shrink-0 mt-1">A</div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E85C2D] flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-[#E4DFDA] rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#E85C2D] animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#E4DFDA] bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
              <div className="flex items-center gap-3 bg-[#F7F5F0] rounded-xl px-4 py-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask anything about your move..."
                  className="flex-1 bg-transparent text-sm text-[#1A1612] placeholder:text-[#A8A4A0] outline-none"
                />
                <button
                  type="button"
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg bg-[#E85C2D] flex items-center justify-center hover:bg-[#D44E22] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions panel */}
          <div className="w-full shrink-0 overflow-y-auto border-t border-[#E4DFDA] bg-white p-3 lg:w-64 lg:border-l lg:border-t-0 lg:p-4">
            <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-4">Try asking</div>
            <div className="flex flex-col gap-2">
              {suggestions.map((s, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => send(s)}
                  className="text-left text-xs text-[#6B6460] bg-[#F7F5F0] rounded-lg px-3 py-3 hover:bg-[rgba(232,92,45,0.08)] hover:text-[#C44520] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4DFDA]">
              <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-3">Your context</div>
              <div className="flex flex-col gap-2 text-xs text-[#6B6460]">
                <div className="flex justify-between">
                  <span>From</span><span className="font-semibold text-[#1A1612]">London</span>
                </div>
                <div className="flex justify-between">
                  <span>To</span><span className="font-semibold text-[#1A1612]">Manchester</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget</span><span className="font-semibold text-[#1A1612]">£1,200/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeline</span><span className="font-semibold text-[#1A1612]">Late May</span>
                </div>
                <div className="flex justify-between">
                  <span>Living</span><span className="font-semibold text-[#1A1612]">Solo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
