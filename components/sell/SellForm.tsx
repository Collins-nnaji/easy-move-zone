"use client"

import { useCallback, useRef, useState } from "react"
import Link from "next/link"
import {
  ShieldCheck, HardHat, Banknote, KeyRound, Home, Building2,
  TreePine, Store, Layers, BedDouble, Bath, Ruler,
  UploadCloud, X, ChevronRight, ChevronLeft, CheckCircle2,
  Loader2, Info, Phone, Mail, ArrowLeft, Sparkles,
  Video, Image as ImageIcon, Send, Wand2, AlertCircle,
  RefreshCw, Check, User, Zap,
} from "lucide-react"
import { clsx } from "clsx"

/* ── Listing types ───────────────────────────── */
const LISTING_TYPES = [
  {
    value: "outright-purchase",
    label: "Outright Purchase",
    sub: "Buyer pays full price upfront — verified title transfer",
    icon: ShieldCheck,
    color: "#bf6a3c",
    pageName: "Purchase listings",
  },
  {
    value: "rent-to-own",
    label: "Rent to Own",
    sub: "Buyer rents monthly, portion builds toward ownership",
    icon: KeyRound,
    color: "#7C3AED",
    pageName: "Rent-to-Own listings",
  },
  {
    value: "build",
    label: "Land for Build",
    sub: "Sell land — buyer builds with our managed team",
    icon: HardHat,
    color: "#D97706",
    pageName: "Build listings",
  },
  {
    value: "mortgage-eligible",
    label: "Mortgage-Eligible",
    sub: "Listed for buyers using NHF or bank mortgage",
    icon: Banknote,
    color: "#059669",
    pageName: "Finance listings",
  },
] as const

type ListingTypeValue = (typeof LISTING_TYPES)[number]["value"]

/* ── Property types ──────────────────────────── */
const PROPERTY_TYPES = [
  { value: "land",       label: "Land",       icon: TreePine  },
  { value: "house",      label: "House",      icon: Home      },
  { value: "apartment",  label: "Apartment",  icon: Building2 },
  { value: "commercial", label: "Commercial", icon: Store     },
  { value: "mixed-use",  label: "Mixed Use",  icon: Layers    },
] as const

type PropertyTypeValue = (typeof PROPERTY_TYPES)[number]["value"]

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano", "Benin City", "Kaduna", "Ilorin", "Owerri"]

/* ── Steps ───────────────────────────────────── */
type Step = "type" | "details" | "media" | "contact"
const STEPS: { key: Step; label: string }[] = [
  { key: "type",    label: "Listing type"   },
  { key: "details", label: "Property info"  },
  { key: "media",   label: "Photos & video" },
  { key: "contact", label: "Your details"   },
]

/* ── Uploaded file ───────────────────────────── */
type MediaFile = {
  file: File
  preview: string
  type: "image" | "video"
  uploading: boolean
  url: string | null
  error: string | null
}

/* ── Helpers ─────────────────────────────────── */
function fmtNgn(v: string) {
  const n = Number(v.replace(/,/g, ""))
  if (!n) return ""
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  return `₦${n.toLocaleString()}`
}

/* ── Inline AI button ────────────────────────── */
function AiBtn({
  label,
  loading,
  onClick,
  variant = "default",
}: {
  label: string
  loading: boolean
  onClick: () => void
  variant?: "default" | "refine"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={clsx(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all disabled:opacity-50",
        variant === "refine"
          ? "border border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
          : "border border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
      )}
    >
      {loading
        ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
        : variant === "refine"
          ? <RefreshCw className="h-2.5 w-2.5" />
          : <Sparkles className="h-2.5 w-2.5" />
      }
      {label}
    </button>
  )
}

/* ── Title suggestion pills ──────────────────── */
function TitleSuggestions({
  suggestions,
  onSelect,
  onClose,
}: {
  suggestions: string[]
  onSelect: (v: string) => void
  onClose: () => void
}) {
  return (
    <div className="mt-2 rounded-xl border border-orange-500/20 bg-[#0a1628] p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">AI suggestions — click to use</span>
        <button type="button" onClick={onClose} className="text-slate-600 hover:text-slate-400">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => { onSelect(s); onClose() }}
          className="w-full text-left rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-slate-300 hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-white transition-all flex items-center justify-between gap-2 group"
        >
          <span>{s}</span>
          <Check className="h-3.5 w-3.5 text-orange-400 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
        </button>
      ))}
    </div>
  )
}

/* ── AI Sidebar ───────────────────────────────── */
function AiSidebar({
  context,
  onApply,
}: {
  context: Record<string, string>
  onApply: (field: string, value: string) => void
}) {
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string; applyField?: string; applyValue?: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [quickLoading, setQuickLoading] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  async function callAI(field: string, value?: string) {
    const res = await fetch("/api/sell/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value: value ?? context[field] ?? "", context }),
    })
    const data = await res.json()
    return (data.result as string) ?? ""
  }

  async function handleQuick(field: string, label: string, applyField?: string) {
    setQuickLoading(field)
    try {
      const result = await callAI(field)
      if (result) {
        setChat(prev => [...prev, {
          role: "ai",
          text: result,
          applyField,
          applyValue: result,
        }])
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
      }
    } finally {
      setQuickLoading(null)
    }
  }

  async function handleChat() {
    if (!input.trim()) return
    const msg = input.trim()
    setInput("")
    setChat(prev => [...prev, { role: "user", text: msg }])
    setLoading(true)
    try {
      const result = await callAI("chat", msg)
      setChat(prev => [...prev, { role: "ai", text: result ?? "I couldn't help with that right now." }])
    } finally {
      setLoading(false)
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/10">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-[#bf6a3c] shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <div className="text-[12px] font-bold text-white">AI Listing Assistant</div>
          <div className="text-[10px] text-slate-500">Ask anything about your listing</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-3 py-3 border-b border-white/10 space-y-1.5">
        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-2">Quick actions</div>
        {[
          { label: "Suggest titles",      field: "title_suggestions", applyField: "title"       },
          { label: "Write description",   field: "description",       applyField: "description"  },
          { label: "Price estimate",      field: "price",             applyField: undefined      },
        ].map(({ label, field, applyField }) => (
          <button
            key={field}
            type="button"
            onClick={() => handleQuick(field, label, applyField)}
            disabled={quickLoading === field}
            className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all text-left"
          >
            {quickLoading === field
              ? <Loader2 className="h-3 w-3 animate-spin shrink-0" />
              : <Wand2 className="h-3 w-3 shrink-0 text-orange-400" />
            }
            {label}
          </button>
        ))}
      </div>

      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {chat.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="h-6 w-6 text-slate-700 mx-auto mb-2" />
            <p className="text-[11px] text-slate-600 leading-relaxed">Ask about pricing, description tips, market info, or use the quick actions above.</p>
          </div>
        )}
        {chat.map((msg, i) => (
          <div key={i} className={clsx("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
            <div className={clsx(
              "max-w-[90%] rounded-xl px-3 py-2.5 text-[11px] leading-relaxed whitespace-pre-wrap",
              msg.role === "user"
                ? "bg-[#bf6a3c] text-white rounded-br-sm"
                : "bg-white/[0.08] text-slate-200 rounded-bl-sm"
            )}>
              {msg.text}
            </div>
            {msg.role === "ai" && msg.applyField && (
              <button
                type="button"
                onClick={() => onApply(msg.applyField!, msg.applyValue!)}
                className="mt-1 flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Check className="h-2.5 w-2.5" /> Apply to form
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.08] rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-orange-400" />
              <span className="text-[10px] text-slate-500">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleChat() } }}
            placeholder="Ask about pricing, location, deeds…"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white placeholder:text-slate-600 focus:border-orange-500/40 focus:outline-none transition"
          />
          <button
            type="button"
            onClick={() => void handleChat()}
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#bf6a3c] text-white hover:bg-[#c8451a] disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ───────────────────────────── */
export function SellForm() {
  const [step, setStep] = useState<Step>("type")
  const [listingType, setListingType] = useState<ListingTypeValue | "">("")
  const [propertyType, setPropertyType] = useState<PropertyTypeValue>("house")
  const [form, setForm] = useState({
    title: "", description: "",
    city: "", state: "", address: "", neighborhood: "",
    price_ngn: "",
    bedrooms: "", bathrooms: "", land_size_sqm: "", building_size_sqm: "",
  })
  const [seller, setSeller] = useState({ name: "", phone: "", email: "" })
  const [media, setMedia] = useState<MediaFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAI, setShowAI] = useState(false)

  // Per-field AI loading states
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
  // Title suggestions popup
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  // Prefill loading
  const [prefilling, setPrefilling] = useState(false)

  const imgRef = useRef<HTMLInputElement>(null)
  const vidRef = useRef<HTMLInputElement>(null)
  const draftId = useRef(`draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`)

  const stepIndex = STEPS.findIndex(s => s.key === step)
  const selectedType = LISTING_TYPES.find(t => t.value === listingType)

  function setF(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })) }
  function setS(k: keyof typeof seller, v: string) { setSeller(s => ({ ...s, [k]: v })) }

  const aiContext = {
    listingType, propertyType,
    city: form.city, state: form.state, neighborhood: form.neighborhood,
    price_ngn: form.price_ngn, bedrooms: form.bedrooms, bathrooms: form.bathrooms,
    land_size_sqm: form.land_size_sqm, building_size_sqm: form.building_size_sqm,
    title: form.title, description: form.description,
  }

  async function callAI(field: string, value?: string): Promise<string> {
    const res = await fetch("/api/sell/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value: value ?? "", context: aiContext }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "AI error")
    return data.result as string
  }

  async function handleAIField(field: string, action: string, applyFn: (v: string) => void) {
    const key = `${field}_${action}`
    setAiLoading(p => ({ ...p, [key]: true }))
    try {
      const result = await callAI(action, form[field as keyof typeof form] as string)
      applyFn(typeof result === "string" ? result.trim() : "")
    } catch {
      // silently ignore inline AI errors
    } finally {
      setAiLoading(p => ({ ...p, [key]: false }))
    }
  }

  async function handleTitleSuggestions() {
    setAiLoading(p => ({ ...p, title_suggestions: true }))
    setTitleSuggestions([])
    try {
      const result = await callAI("title_suggestions", form.title)
      const lines = result.split("\n").map(l => l.trim()).filter(Boolean)
      setTitleSuggestions(lines)
    } finally {
      setAiLoading(p => ({ ...p, title_suggestions: false }))
    }
  }

  async function handlePrefill() {
    setPrefilling(true)
    try {
      const res = await fetch("/api/sell/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "prefill", value: "", context: aiContext }),
      })
      const data = await res.json()
      const result = data.result as { title?: string; description?: string; price_ngn?: string }
      if (result.title) setF("title", result.title)
      if (result.description) setF("description", result.description)
      if (result.price_ngn) setF("price_ngn", result.price_ngn)
    } catch {
      // ignore
    } finally {
      setPrefilling(false)
    }
  }

  function handleAIApply(field: string, value: string) {
    if (field === "title") setF("title", value)
    else if (field === "description") setF("description", value)
  }

  /* ── Upload ───────────────────────────────── */
  async function uploadFile(file: File, type: "image" | "video", index: number) {
    setMedia(prev => prev.map((m, i) => i === index ? { ...m, uploading: true, error: null } : m))
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("propertyId", draftId.current)
      fd.append("fileType", type)
      const res = await fetch("/api/sell/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")
      setMedia(prev => prev.map((m, i) => i === index ? { ...m, uploading: false, url: data.url } : m))
    } catch (err) {
      setMedia(prev => prev.map((m, i) => i === index
        ? { ...m, uploading: false, error: err instanceof Error ? err.message : "Upload failed" }
        : m
      ))
    }
  }

  function addFiles(files: FileList | null, type: "image" | "video") {
    if (!files) return
    const toAdd = Array.from(files).slice(0, 20 - media.length)
    const newItems: MediaFile[] = toAdd.map(file => ({
      file, type,
      preview: URL.createObjectURL(file),
      uploading: false, url: null, error: null,
    }))
    setMedia(prev => {
      const next = [...prev, ...newItems]
      newItems.forEach((_, relIdx) => {
        const absIdx = prev.length + relIdx
        setTimeout(() => void uploadFile(toAdd[relIdx], type, absIdx), 0)
      })
      return next
    })
  }

  function removeFile(i: number) {
    setMedia(prev => {
      URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, j) => j !== i)
    })
  }

  /* ── Submit ───────────────────────────────── */
  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      if (media.some(m => m.uploading)) {
        await new Promise(r => setTimeout(r, 1500))
      }
      const uploadedUrls = media.filter(m => m.url).map(m => m.url as string)
      const res = await fetch("/api/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          listing_type: listingType,
          property_type: propertyType,
          price_ngn: form.price_ngn.replace(/,/g, "") || null,
          images: uploadedUrls,
          seller_name: seller.name,
          seller_phone: seller.phone,
          seller_email: seller.email,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Submission failed")
      setSubmittedId(data.id)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setSubmitted(false); setStep("type"); setListingType(""); setPropertyType("house")
    setForm({ title:"", description:"", city:"", state:"", address:"", neighborhood:"", price_ngn:"", bedrooms:"", bathrooms:"", land_size_sqm:"", building_size_sqm:"" })
    setSeller({ name:"", phone:"", email:"" }); setMedia([]); setError(null)
    draftId.current = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  }

  /* ── Input class helpers ─────────────────── */
  const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition"
  const selectCls = "rounded-xl border border-white/10 bg-[#0a1628] px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none transition"
  const labelCls = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"

  /* ── Success screen ─────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/25">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Listing submitted!</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            Your property is under review. Our team will verify the details and contact you within <strong className="text-white">24–48 hours</strong>.
          </p>
          <p className="text-slate-500 text-xs mb-8">
            Once approved it goes live on the{" "}
            <span className="text-orange-300 font-semibold">{selectedType?.pageName ?? "platform"}</span>
            {submittedId && <> · Ref: <code className="text-slate-400">{submittedId.slice(0, 8)}</code></>}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="rounded-xl bg-[#bf6a3c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c8451a] transition-colors">
              Back to home
            </Link>
            <button onClick={resetForm} className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors">
              Submit another
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Shell ──────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">

      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#020617]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> EasyMoveZone
          </Link>

          {/* Steps */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                  i < stepIndex   ? "bg-emerald-500 text-white" :
                  i === stepIndex ? "bg-[#bf6a3c] text-white ring-2 ring-[#bf6a3c]/30" :
                                    "bg-white/10 text-slate-600"
                )}>
                  {i < stepIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={clsx("hidden sm:block text-xs font-semibold",
                  i === stepIndex ? "text-white" : "text-slate-600"
                )}>{s.label}</span>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-white/10 hidden sm:block" />}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAI(p => !p)}
            className={clsx(
              "hidden sm:flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
              showAI
                ? "border-orange-500/50 bg-orange-500/15 text-orange-300"
                : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Assistant
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Form area */}
        <div className={clsx("flex-1 overflow-y-auto", showAI ? "lg:max-w-[calc(100%-320px)]" : "")}>
          <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">

            {/* ══ STEP 1: Type ══════════════════════════════ */}
            {step === "type" && (
              <div>
                <p className="text-[10px] font-bold tracking-widest text-orange-400 uppercase mb-2">Step 1 of 4</p>
                <h1 className="text-3xl font-bold text-white mb-2">List your property</h1>
                <p className="text-slate-400 text-sm mb-8">Choose how you want to sell. Your approved listing will appear on the matching section of the platform.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {LISTING_TYPES.map(type => {
                    const Icon = type.icon
                    const active = listingType === type.value
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setListingType(type.value)}
                        className={clsx(
                          "group relative text-left rounded-2xl border-2 p-6 transition-all duration-200",
                          active ? "border-white/30 bg-white/[0.07]" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                        )}
                        style={active ? { borderColor: `${type.color}60`, boxShadow: `0 0 24px ${type.color}18` } : {}}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-4" style={{ background: `${type.color}22` }}>
                          <Icon className="h-6 w-6" style={{ color: type.color }} />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">{type.label}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">{type.sub}</p>
                        <div className="text-[10px] font-bold tracking-wider" style={{ color: type.color }}>→ {type.pageName}</div>
                        {active && <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-emerald-400" />}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex gap-3">
                  <Info className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    All submissions are reviewed before going live. We verify title, pricing, and property details within <strong className="text-white">24–48 hours</strong>. You&apos;ll be contacted by phone or email.
                  </p>
                </div>

                <div className="mt-8 flex justify-end">
                  <button type="button" disabled={!listingType} onClick={() => setStep("details")}
                    className="flex items-center gap-2 rounded-xl bg-[#bf6a3c] px-6 py-3 text-sm font-bold text-white hover:bg-[#c8451a] disabled:opacity-40 disabled:pointer-events-none transition-colors">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 2: Details ════════════════════════════ */}
            {step === "details" && (
              <div>
                {/* Header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {selectedType && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: `${selectedType.color}22` }}>
                        <selectedType.icon className="h-5 w-5" style={{ color: selectedType.color }} />
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-orange-400 uppercase mb-0.5">Step 2 of 4 · {selectedType?.label}</p>
                      <h2 className="text-2xl font-bold text-white">Property details</h2>
                    </div>
                  </div>

                  {/* Prefill all with AI */}
                  <button
                    type="button"
                    onClick={() => void handlePrefill()}
                    disabled={prefilling || (!form.city && !listingType)}
                    className="flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-300 hover:bg-orange-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0"
                  >
                    {prefilling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                    AI Prefill
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Property type */}
                  <div>
                    <label className={labelCls}>Property type</label>
                    <div className="grid grid-cols-5 gap-2">
                      {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
                        <button key={value} type="button" onClick={() => setPropertyType(value)}
                          className={clsx(
                            "flex flex-col items-center gap-1.5 rounded-xl border-2 py-3.5 text-[11px] font-semibold transition-all",
                            propertyType === value
                              ? "border-orange-500/60 bg-orange-500/10 text-orange-300"
                              : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
                          )}>
                          <Icon className="h-4 w-4" />{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location first — needed for AI context */}
                  <div>
                    <label className={labelCls}>Location</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <select value={form.city} onChange={e => setF("city", e.target.value)}
                        className={clsx(selectCls, "w-full")}>
                        <option value="" className="bg-[#0a1628]">Select city</option>
                        {CITIES.map(c => <option key={c} value={c} className="bg-[#0a1628]">{c}</option>)}
                      </select>
                      <input value={form.state} onChange={e => setF("state", e.target.value)}
                        placeholder="State"
                        className={inputCls} />
                    </div>
                    <input value={form.neighborhood} onChange={e => setF("neighborhood", e.target.value)}
                      placeholder="Neighborhood / area (e.g. Lekki Phase 1)"
                      className={clsx(inputCls, "mb-3")} />
                    <input value={form.address} onChange={e => setF("address", e.target.value)}
                      placeholder="Street address (optional — shown only after approval)"
                      className={inputCls} />
                  </div>

                  {/* Title with AI */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls} style={{ marginBottom: 0 }}>Listing title</label>
                      <div className="flex items-center gap-1.5">
                        <AiBtn
                          label="Suggest"
                          loading={!!aiLoading.title_suggestions}
                          onClick={() => void handleTitleSuggestions()}
                        />
                        {form.title && (
                          <AiBtn
                            label="Refine"
                            loading={!!aiLoading.title_title_refine}
                            onClick={() => void handleAIField("title", "title_refine", v => setF("title", v))}
                            variant="refine"
                          />
                        )}
                      </div>
                    </div>
                    <input
                      value={form.title}
                      onChange={e => setF("title", e.target.value)}
                      placeholder="e.g. 4-bed detached duplex in Lekki Phase 1"
                      className={inputCls}
                    />
                    {titleSuggestions.length > 0 && (
                      <TitleSuggestions
                        suggestions={titleSuggestions}
                        onSelect={v => setF("title", v)}
                        onClose={() => setTitleSuggestions([])}
                      />
                    )}
                  </div>

                  {/* Description with AI */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls} style={{ marginBottom: 0 }}>Description</label>
                      <div className="flex items-center gap-1.5">
                        <AiBtn
                          label="Generate"
                          loading={!!aiLoading.description_description}
                          onClick={() => void handleAIField("description", "description", v => setF("description", v))}
                        />
                        {form.description && (
                          <AiBtn
                            label="Refine"
                            loading={!!aiLoading.description_description_refine}
                            onClick={() => void handleAIField("description", "description_refine", v => setF("description", v))}
                            variant="refine"
                          />
                        )}
                      </div>
                    </div>
                    <textarea
                      value={form.description}
                      onChange={e => setF("description", e.target.value)}
                      rows={5}
                      placeholder="Key features, title status, access roads, nearby landmarks…"
                      className={clsx(inputCls, "resize-none")}
                    />
                    <p className="mt-1 text-[10px] text-slate-600">{form.description.length} chars · aim for 80–200</p>
                  </div>

                  {/* Price with AI hint */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls} style={{ marginBottom: 0 }}>
                        Asking price (₦)
                        {form.price_ngn && <span className="ml-2 font-normal normal-case text-orange-400">{fmtNgn(form.price_ngn)}</span>}
                      </label>
                      <AiBtn
                        label="Estimate"
                        loading={!!aiLoading.price_price}
                        onClick={() => void handleAIField("price_ngn", "price", v => {
                          // extract first number from the suggestion
                          const match = v.match(/[\d,]+/)
                          if (match) setF("price_ngn", match[0].replace(/,/g, ""))
                        })}
                      />
                    </div>
                    <input
                      type="number"
                      value={form.price_ngn}
                      onChange={e => setF("price_ngn", e.target.value)}
                      placeholder="e.g. 85000000"
                      className={inputCls}
                    />
                  </div>

                  {/* Beds / Baths */}
                  {propertyType !== "land" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}><BedDouble className="inline h-3.5 w-3.5 mr-1" />Bedrooms</label>
                        <input type="number" min="0" value={form.bedrooms} onChange={e => setF("bedrooms", e.target.value)}
                          placeholder="e.g. 4" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}><Bath className="inline h-3.5 w-3.5 mr-1" />Bathrooms</label>
                        <input type="number" min="0" value={form.bathrooms} onChange={e => setF("bathrooms", e.target.value)}
                          placeholder="e.g. 3" className={inputCls} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}><Ruler className="inline h-3.5 w-3.5 mr-1" />Land size (sqm)</label>
                      <input type="number" value={form.land_size_sqm} onChange={e => setF("land_size_sqm", e.target.value)}
                        placeholder="e.g. 600" className={inputCls} />
                    </div>
                    {propertyType !== "land" && (
                      <div>
                        <label className={labelCls}><Ruler className="inline h-3.5 w-3.5 mr-1" />Build size (sqm)</label>
                        <input type="number" value={form.building_size_sqm} onChange={e => setF("building_size_sqm", e.target.value)}
                          placeholder="e.g. 320" className={inputCls} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button type="button" onClick={() => setStep("type")} className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" disabled={!form.title || !form.city} onClick={() => setStep("media")}
                    className="flex items-center gap-2 rounded-xl bg-[#bf6a3c] px-6 py-3 text-sm font-bold text-white hover:bg-[#c8451a] disabled:opacity-40 disabled:pointer-events-none transition-colors">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 3: Media ══════════════════════════════ */}
            {step === "media" && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold tracking-widest text-orange-400 uppercase mb-0.5">Step 3 of 4</p>
                  <h2 className="text-2xl font-bold text-white mb-2">Photos & video</h2>
                  <p className="text-sm text-slate-400">Upload clear photos and optionally a walkthrough video. Files upload to secure Azure storage as you add them.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  <button type="button" onClick={() => imgRef.current?.click()}
                    className="flex flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed border-white/15 py-10 hover:border-orange-500/40 hover:bg-white/[0.02] transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                      <ImageIcon className="h-6 w-6 text-slate-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300">Upload photos</span>
                    <span className="text-xs text-slate-600">JPG, PNG, WEBP · max 10 MB each</span>
                  </button>
                  <button type="button" onClick={() => vidRef.current?.click()}
                    className="flex flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed border-white/15 py-10 hover:border-orange-500/40 hover:bg-white/[0.02] transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                      <Video className="h-6 w-6 text-slate-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300">Upload video</span>
                    <span className="text-xs text-slate-600">MP4, MOV · max 200 MB</span>
                  </button>
                </div>
                <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files, "image")} />
                <input ref={vidRef} type="file" accept="video/*" className="hidden" onChange={e => addFiles(e.target.files, "video")} />

                {media.length > 0 && (
                  <>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {media.map((m, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-white/5">
                          {m.type === "image"
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={m.preview} alt="" className="h-full w-full object-cover" />
                            : <div className="h-full w-full flex items-center justify-center bg-slate-800/80">
                                <Video className="h-8 w-8 text-slate-500" />
                              </div>
                          }
                          {m.uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                              <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                            </div>
                          )}
                          {m.url && !m.uploading && (
                            <div className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/90">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {m.error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 p-2">
                              <AlertCircle className="h-5 w-5 text-red-300 mb-1" />
                              <span className="text-[9px] text-red-300 text-center leading-tight">{m.error}</span>
                            </div>
                          )}
                          {i === 0 && m.type === "image" && (
                            <span className="absolute left-1.5 top-1.5 rounded-md bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">Cover</span>
                          )}
                          <button type="button" onClick={() => removeFile(i)}
                            className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white group-hover:flex hover:bg-red-600/80 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span>{media.filter(m => m.url).length} / {media.length} uploaded to Azure</span>
                      {media.some(m => m.uploading) && <span className="flex items-center gap-1 text-orange-400"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</span>}
                      {media.some(m => m.error) && <span className="flex items-center gap-1 text-red-400"><AlertCircle className="h-3 w-3" /> Some failed — remove and retry</span>}
                    </div>
                  </>
                )}

                <div className="mt-8 flex justify-between">
                  <button type="button" onClick={() => setStep("details")} className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={() => setStep("contact")}
                    className="flex items-center gap-2 rounded-xl bg-[#bf6a3c] px-6 py-3 text-sm font-bold text-white hover:bg-[#c8451a] transition-colors">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 4: Contact + Submit ════════════════════ */}
            {step === "contact" && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold tracking-widest text-orange-400 uppercase mb-0.5">Step 4 of 4</p>
                  <h2 className="text-2xl font-bold text-white mb-2">Your contact details</h2>
                  <p className="text-sm text-slate-400">Used during verification only — not shown publicly on your listing.</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className={labelCls}><User className="inline h-3.5 w-3.5 mr-1" />Full name</label>
                    <input value={seller.name} onChange={e => setS("name", e.target.value)} placeholder="Your name"
                      className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}><Phone className="inline h-3.5 w-3.5 mr-1" />Phone</label>
                      <input type="tel" value={seller.phone} onChange={e => setS("phone", e.target.value)} placeholder="+234 800 000 0000"
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}><Mail className="inline h-3.5 w-3.5 mr-1" />Email</label>
                      <input type="email" value={seller.email} onChange={e => setS("email", e.target.value)} placeholder="you@email.com"
                        className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6 space-y-2.5 text-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Submission summary</div>
                  {[
                    ["Listing type",  selectedType?.label],
                    ["Property type", propertyType],
                    ["Title",         form.title || "—"],
                    ["Location",      [form.neighborhood, form.city].filter(Boolean).join(", ") || "—"],
                    ["Price",         form.price_ngn ? fmtNgn(form.price_ngn) : "—"],
                    ["Media",         `${media.filter(m => m.url).length} files uploaded`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <span className="text-slate-500 shrink-0">{k}</span>
                      <span className="text-white font-semibold text-right capitalize truncate">{v}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
                  </div>
                )}

                <div className="flex justify-between">
                  <button type="button" onClick={() => setStep("media")} className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={() => void handleSubmit()} disabled={submitting || !seller.name || !seller.phone}
                    className="flex items-center gap-2 rounded-xl bg-[#bf6a3c] px-7 py-3 text-sm font-bold text-white hover:bg-[#c8451a] disabled:opacity-50 disabled:pointer-events-none transition-colors">
                    {submitting
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
                      : <><CheckCircle2 className="h-4 w-4" />Submit for review</>
                    }
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── AI Sidebar (desktop) ─────────────────────── */}
        {showAI && (
          <div className="hidden lg:flex flex-col w-80 shrink-0 border-l border-white/10 bg-[#060d1f] sticky top-[53px] h-[calc(100vh-53px)]">
            <AiSidebar context={aiContext} onApply={handleAIApply} />
          </div>
        )}
      </div>

      {/* Mobile AI button */}
      <button
        type="button"
        onClick={() => setShowAI(p => !p)}
        className={clsx(
          "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold shadow-xl transition-all sm:hidden",
          showAI ? "bg-orange-600 text-white" : "bg-[#bf6a3c] text-white"
        )}
      >
        <Sparkles className="h-4 w-4" />
        {showAI ? "Hide AI" : "AI Help"}
      </button>

      {/* Mobile AI drawer */}
      {showAI && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden" onClick={() => setShowAI(false)}>
          <div className="absolute bottom-0 left-0 right-0 h-[72vh] rounded-t-2xl bg-[#060d1f] border-t border-white/10 flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20 mb-1" />
            <AiSidebar context={aiContext} onApply={handleAIApply} />
          </div>
        </div>
      )}
    </div>
  )
}
