"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  LENDERS, SUPPORTED_COUNTRIES, getCountryInfo, formatLocalCurrency,
  type MortgageLender,
} from "@/lib/mortgage/lenders"
import {
  CheckCircle, Loader2, AlertCircle, Building2, Sparkles, Send,
  Phone, Globe, Star, Info, RotateCcw, ChevronDown, ChevronUp,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtractedProfile {
  country?: string
  city?: string
  propertyPriceUsd?: number
  downPaymentUsd?: number
  tenureYears?: number
  monthlyIncomeUsd?: number
  otherDebtUsd?: number
  employmentType?: string
  isNhf?: boolean
  isRsa?: boolean
  isDiaspora?: boolean
  creditScoreBand?: string
}

interface AiAssessment {
  score: number
  scoreLabel: string
  summary: string
  strengths: string[]
  concerns: string[]
  recommendation: string
  nextSteps: string[]
  extractedProfile?: ExtractedProfile
  matchedLenders?: { lender: MortgageLender; score: number }[]
  readyForResults?: boolean
}

interface Message {
  role: "user" | "assistant"
  content: string
  assessment?: AiAssessment
  showingResults?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchScore(lender: MortgageLender, profile: ExtractedProfile): number {
  const price = profile.propertyPriceUsd ?? 0
  const down = profile.downPaymentUsd ?? 0
  const income = profile.monthlyIncomeUsd ?? 0
  const tenure = profile.tenureYears ?? 20
  const loanUsd = price - down
  const downPct = price > 0 ? (down / price) * 100 : 0
  const monthlyPaymentUsd = loanUsd > 0 && tenure > 0 ? loanUsd / (tenure * 12) : 0
  const dti = income > 0 ? (monthlyPaymentUsd / income) * 100 : 100

  if (lender.country !== profile.country) return 0
  if (lender.maxLoanUsd < loanUsd) return 0
  if (lender.minDownPct > downPct) return 0
  if (lender.type === "government" && lender.id.includes("nhf") && !profile.isNhf) return 0
  if (lender.type === "pension" && !profile.isRsa) return 0
  if (lender.type === "diaspora" && !profile.isDiaspora) return 0

  let score = 50
  if (downPct >= lender.minDownPct + 10) score += 15
  if (loanUsd <= lender.maxLoanUsd * 0.7) score += 10
  if (dti <= 33) score += 15
  if (profile.creditScoreBand === "excellent") score += 20
  else if (profile.creditScoreBand === "good") score += 10
  else if (profile.creditScoreBand === "poor") score -= 20
  if (lender.type === "government") score += 10
  if (lender.type === "diaspora" && profile.isDiaspora) score += 15
  if (tenure <= lender.maxTenureYears) score += 5

  return Math.min(100, Math.max(0, Math.round(score)))
}

function scoreColor(score: number) {
  if (score >= 70) return { bar: "bg-green-500", text: "text-green-700", border: "border-green-200", bg: "bg-green-50" }
  if (score >= 50) return { bar: "bg-amber-400", text: "text-amber-700", border: "border-amber-200", bg: "bg-amber-50" }
  return { bar: "bg-red-400", text: "text-red-700", border: "border-red-200", bg: "bg-red-50" }
}

const STARTER_PROMPTS = [
  "I'm looking to buy a house in Lagos, Nigeria. I earn about $2,500/month.",
  "I live in the UK but want to buy property in Nairobi. Budget around $80,000.",
  "Looking for a mortgage in Accra. First-time buyer, government employee.",
  "I want to buy in Cape Town, South Africa. Property is about $120,000.",
]

// ─── Contact form (after lender is selected) ──────────────────────────────────

function ContactForm({
  lenderName,
  profile,
  assessment,
  lenderId,
}: {
  lenderName: string
  profile: ExtractedProfile
  assessment: AiAssessment
  lenderId: string
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function submit() {
    if (!name || !email || !phone) { setError("Please fill in all fields."); return }
    setSubmitting(true); setError("")
    try {
      const loanUsd = (profile.propertyPriceUsd ?? 0) - (profile.downPaymentUsd ?? 0)
      const res = await fetch("/api/mortgage/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: profile.country ?? "",
          city: profile.city ?? "",
          propertyPriceUsd: profile.propertyPriceUsd ?? 0,
          downPaymentUsd: profile.downPaymentUsd ?? 0,
          loanAmountUsd: loanUsd,
          monthlyIncomeUsd: profile.monthlyIncomeUsd ?? 0,
          otherDebtUsd: profile.otherDebtUsd ?? 0,
          tenureYears: profile.tenureYears ?? 20,
          employmentType: profile.employmentType ?? "private",
          isNhf: profile.isNhf ?? false,
          isRsa: profile.isRsa ?? false,
          isDiaspora: profile.isDiaspora ?? false,
          creditScoreBand: profile.creditScoreBand ?? "unknown",
          fullName: name,
          email,
          phone,
          lenderId,
          aiAssessment: assessment.summary,
          aiScore: assessment.score,
          aiRecommendation: assessment.recommendation,
        }),
      })
      if (res.ok) setSuccess(true)
      else {
        const d = (await res.json()) as { error?: string }
        setError(d.error ?? "Submission failed.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-500" />
        <p className="font-bold text-[#0f172a]">Application submitted!</p>
        <p className="mt-1 text-sm text-[#64748b]">
          A representative from <strong>{lenderName}</strong> will contact you within 2–3 business days.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/listings" className="emz-pill-cta rounded-full px-4 py-2 text-xs font-semibold">Browse properties →</Link>
          <Link href="/cities" className="rounded-full border border-[#dbe4f0] px-4 py-2 text-xs font-semibold text-[#475569]">Explore cities</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-2xl border border-[#dbe4f0] bg-white p-5">
      <p className="mb-3 text-sm font-bold text-[#0f172a]">Connect with {lenderName}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-[#475569]">
          Full name <span className="text-red-500">*</span>
          <input value={name} onChange={e => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#c8d8f0] px-3 py-2 text-sm"
            placeholder="As on your ID" />
        </label>
        <label className="text-xs text-[#475569]">
          Email <span className="text-red-500">*</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#c8d8f0] px-3 py-2 text-sm"
            placeholder="you@example.com" />
        </label>
        <label className="text-xs text-[#475569] sm:col-span-2">
          Phone (with country code) <span className="text-red-500">*</span>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#c8d8f0] px-3 py-2 text-sm"
            placeholder="+234 800 000 0000" />
        </label>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}
      <button type="button" onClick={() => void submit()} disabled={submitting}
        className="emz-pill-cta mt-3 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-40">
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" /> Submit application</>}
      </button>
      <p className="mt-2 text-[11px] text-[#94a3b8]">
        We&apos;ll share your profile with this lender. No hidden fees. EasyMoveZone facilitates introductions only.
      </p>
    </div>
  )
}

// ─── Results card ─────────────────────────────────────────────────────────────

function ResultsCard({ assessment, profile }: { assessment: AiAssessment; profile: ExtractedProfile }) {
  const [selectedLenderId, setSelectedLenderId] = useState<string | null>(null)
  const [showContact, setShowContact] = useState(false)
  const [expandedLender, setExpandedLender] = useState<string | null>(null)

  const rankedLenders = useMemo(() => {
    return LENDERS
      .map(l => ({ lender: l, score: matchScore(l, profile) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
  }, [profile])

  const selectedLender = rankedLenders.find(r => r.lender.id === selectedLenderId)

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="rounded-2xl border border-[#dbe4f0] bg-gradient-to-br from-[#f8fbff] to-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#155eef]">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="font-bold text-[#0f172a]">AI Eligibility Assessment</p>
            <p className="text-xs text-[#64748b]">{profile.country}{profile.city ? ` · ${profile.city}` : ""}</p>
          </div>
          <div className="ml-auto text-right">
            <p className={`text-3xl font-black ${assessment.score >= 75 ? "text-green-600" : assessment.score >= 55 ? "text-amber-600" : "text-red-500"}`}>
              {assessment.score}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">{assessment.scoreLabel}</p>
          </div>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e8edf6]">
          <div
            className={`h-full rounded-full transition-all ${assessment.score >= 75 ? "bg-green-500" : assessment.score >= 55 ? "bg-amber-400" : "bg-red-400"}`}
            style={{ width: `${assessment.score}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-[#475569]">{assessment.summary}</p>

        {(assessment.strengths.length > 0 || assessment.concerns.length > 0) && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {assessment.strengths.length > 0 && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-green-700">Strengths</p>
                <ul className="space-y-0.5">
                  {assessment.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-green-800">
                      <CheckCircle className="mt-0.5 h-3 w-3 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {assessment.concerns.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">Watch out for</p>
                <ul className="space-y-0.5">
                  {assessment.concerns.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-amber-800">
                      <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {assessment.recommendation && (
          <div className="mt-3 rounded-xl border border-[#c8d8f0] bg-[#eef4ff] p-3">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#155eef]">Recommendation</p>
            <p className="text-sm text-[#0f172a]">{assessment.recommendation}</p>
          </div>
        )}
      </div>

      {/* Lender matches */}
      {rankedLenders.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-bold text-[#0f172a]">{rankedLenders.length} matched lenders</p>
          <div className="space-y-2">
            {rankedLenders.map(({ lender, score }, i) => {
              const sc = scoreColor(score)
              const isSelected = selectedLenderId === lender.id
              const isExpanded = expandedLender === lender.id

              return (
                <div key={lender.id} className={`rounded-2xl border-2 transition-all ${isSelected ? "border-[#155eef]" : "border-[#dbe4f0]"}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLenderId(isSelected ? null : lender.id)
                      setShowContact(false)
                      if (!isSelected) setExpandedLender(lender.id)
                      else setExpandedLender(null)
                    }}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f4fa]">
                        <Building2 className="h-5 w-5 text-[#475569]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {i === 0 && (
                              <span className="mb-0.5 inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                <Star className="h-3 w-3" /> Best match
                              </span>
                            )}
                            <p className="text-sm font-bold text-[#0f172a]">{lender.productName}</p>
                            <p className="text-xs text-[#64748b]">{lender.name}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <div className="text-right">
                              <p className={`text-lg font-black ${sc.text}`}>{score}%</p>
                              <p className="text-[10px] text-[#94a3b8]">match</p>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-[#94a3b8]" /> : <ChevronDown className="h-4 w-4 text-[#94a3b8]" />}
                          </div>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e8edf6]">
                          <div className={`h-full rounded-full ${sc.bar}`} style={{ width: `${score}%` }} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#64748b]">
                          <span>{lender.minRate}–{lender.maxRate}% p.a.</span>
                          <span>Up to {lender.maxTenureYears} yrs</span>
                          <span>Min {lender.minDownPct}% down</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#dbe4f0] px-4 pb-4 pt-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {lender.keyFeatures.map(f => (
                          <span key={f} className="rounded-full border border-[#dbe4f0] bg-[#f8fbff] px-2 py-0.5 text-[11px] text-[#475569]">{f}</span>
                        ))}
                      </div>
                      <p className="text-xs text-[#64748b] italic mb-3">{lender.whoIsItFor}</p>
                      <div className="flex flex-wrap gap-3 mb-3">
                        {lender.phone && (
                          <a href={`tel:${lender.phone}`}
                            className="flex items-center gap-1 text-xs font-semibold text-[#155eef] hover:underline">
                            <Phone className="h-3 w-3" /> {lender.phone}
                          </a>
                        )}
                        {lender.website && (
                          <a href={lender.website} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-[#155eef] hover:underline">
                            <Globe className="h-3 w-3" /> Website
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowContact(v => !v)}
                        className="emz-pill-cta flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                      >
                        <Send className="h-3.5 w-3.5" /> Connect with this lender
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-4 text-sm text-[#64748b]">
          No lenders matched your current profile. Try increasing your down payment or adjusting your loan amount.
        </div>
      )}

      {/* Contact form */}
      {showContact && selectedLender && (
        <ContactForm
          lenderName={selectedLender.lender.name}
          profile={profile}
          assessment={assessment}
          lenderId={selectedLender.lender.id}
        />
      )}

      {/* Advisor link */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/contact"
          className="flex items-center gap-1.5 rounded-full border border-[#dbe4f0] px-4 py-2 text-xs font-semibold text-[#475569] hover:border-[#c8d8f0]">
          Talk to a human advisor
        </Link>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#94a3b8]" />
        <p className="text-[11px] text-[#94a3b8]">
          Match scores are indicative. Actual approval depends on lender credit policy. EasyMoveZone facilitates introductions only — we are not a licensed mortgage broker.
        </p>
      </div>
    </div>
  )
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ msg, profile }: { msg: Message; profile: ExtractedProfile }) {
  const isUser = msg.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#155eef]">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] space-y-3 ${isUser ? "" : ""}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#155eef] text-white rounded-tr-sm"
            : "bg-white border border-[#dbe4f0] text-[#1e293b] rounded-tl-sm shadow-sm"
        }`}>
          {msg.content}
        </div>
        {msg.assessment && msg.showingResults && (
          <ResultsCard assessment={msg.assessment} profile={profile} />
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MortgageFinder() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI mortgage advisor. Tell me about your situation — where you're looking to buy, your rough budget, and your income — and I'll find the best lenders for you. You can speak naturally, like you're talking to a friend.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<ExtractedProfile>({})
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  function reset() {
    setMessages([{
      role: "assistant",
      content: "Hi! I'm your AI mortgage advisor. Tell me about your situation — where you're looking to buy, your rough budget, and your income — and I'll find the best lenders for you. You can speak naturally, like you're talking to a friend.",
    }])
    setInput("")
    setProfile({})
    setConversationHistory([])
  }

  async function sendMessage(text?: string) {
    const userText = (text ?? input).trim()
    if (!userText || loading) return

    const newUserMsg: Message = { role: "user", content: userText }
    const updatedMessages = [...messages, newUserMsg]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    const newHistory = [...conversationHistory, { role: "user", content: userText }]

    try {
      const res = await fetch("/api/ai/mortgage-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          currentProfile: profile,
          supportedCountries: SUPPORTED_COUNTRIES.map(c => c.name),
        }),
      })

      const data = (await res.json()) as {
        reply: string
        profile?: ExtractedProfile
        assessment?: AiAssessment
        readyForResults?: boolean
      }

      // Merge profile updates
      if (data.profile) {
        setProfile(prev => ({ ...prev, ...data.profile }))
      }

      const mergedProfile = data.profile ? { ...profile, ...data.profile } : profile
      const showResults = data.readyForResults && !!data.assessment

      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply,
        assessment: data.assessment,
        showingResults: showResults,
      }

      setMessages(prev => [...prev, assistantMsg])
      setConversationHistory(prev => [
        ...prev,
        { role: "user", content: userText },
        { role: "assistant", content: data.reply },
      ])

      if (data.profile) setProfile(mergedProfile)
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I ran into an issue. Please try again.",
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const hasProfile = Object.keys(profile).length > 0

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
      {/* Profile pill strip */}
      {hasProfile && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2 sm:px-6">
          {profile.country && (
            <span className="inline-flex items-center rounded-full border border-[#dbe4f0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#475569]">
              📍 {profile.country}{profile.city ? `, ${profile.city}` : ""}
            </span>
          )}
          {profile.propertyPriceUsd && (
            <span className="inline-flex items-center rounded-full border border-[#dbe4f0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#475569]">
              🏠 ${profile.propertyPriceUsd.toLocaleString()}
            </span>
          )}
          {profile.monthlyIncomeUsd && (
            <span className="inline-flex items-center rounded-full border border-[#dbe4f0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#475569]">
              💰 ${profile.monthlyIncomeUsd.toLocaleString()}/mo
            </span>
          )}
          {profile.employmentType && (
            <span className="inline-flex items-center rounded-full border border-[#dbe4f0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#475569]">
              💼 {profile.employmentType}
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        <div className="space-y-4 py-4">
          {/* Starter prompts — only when at beginning */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pl-9">
              {STARTER_PROMPTS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => void sendMessage(p)}
                  className="rounded-full border border-[#dbe4f0] bg-white px-3 py-1.5 text-left text-xs text-[#475569] transition hover:border-[#155eef] hover:text-[#155eef]"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} profile={profile} />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#155eef]">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-[#dbe4f0] bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin text-[#155eef]" />
                  <span className="text-xs text-[#64748b]">Analysing…</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-[#e8edf6] bg-white px-4 py-3 sm:px-6">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Describe your situation… (e.g. I earn $3k/month, looking to buy in Nairobi for $90k)"
            className="flex-1 resize-none rounded-2xl border border-[#c8d8f0] bg-[#f8fbff] px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20"
            style={{ maxHeight: "120px" }}
            onInput={e => {
              const t = e.currentTarget
              t.style.height = "auto"
              t.style.height = `${t.scrollHeight}px`
            }}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#155eef] text-white transition hover:bg-[#1347c8] disabled:opacity-40"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
          {messages.length > 1 && (
            <button
              type="button"
              onClick={reset}
              title="Start over"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#dbe4f0] text-[#94a3b8] transition hover:text-[#475569]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-[#94a3b8]">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
