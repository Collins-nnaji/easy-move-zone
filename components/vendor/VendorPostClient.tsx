"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft, Truck, Package, Home, Wrench, Globe, Star, CheckCircle2,
  Loader2, ChevronRight, ChevronLeft, UploadCloud, X, Info, Camera,
  FileText, Tag, Clock, MapPin, Phone, Mail,
} from "lucide-react"
import { clsx } from "clsx"

const SERVICE_TYPES = [
  { value: "removals",       label: "Removals",        icon: Truck   },
  { value: "packing",        label: "Packing",          icon: Package },
  { value: "cleaning",       label: "Cleaning",         icon: Home    },
  { value: "handyman",       label: "Handyman",         icon: Wrench  },
  { value: "international",  label: "International",    icon: Globe   },
  { value: "other",          label: "Other",            icon: Star    },
] as const

const COVERAGE = ["Local only", "Nationwide", "International", "Europe", "West Africa", "UK", "Nigeria", "USA"]
const FEATURES = [
  "Insured", "Licensed", "Weekend availability", "Same-day service",
  "Free quote", "Eco-friendly", "Storage included", "Piano specialist",
  "Fragile items", "Heavy lifting", "Vehicle transport", "Pet transport",
]

type Step = "basics" | "details" | "photos" | "preview"
const steps: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "basics",  label: "Basics",  icon: FileText },
  { key: "details", label: "Details", icon: Tag      },
  { key: "photos",  label: "Photos",  icon: Camera   },
  { key: "preview", label: "Preview", icon: Star     },
]

const empty = {
  business_name: "",
  service_type: "removals" as (typeof SERVICE_TYPES)[number]["value"],
  tagline: "",
  description: "",
  base_price: "",
  currency: "GBP" as "GBP" | "NGN" | "USD",
  price_type: "from" as "from" | "fixed" | "quote",
  city: "",
  state: "",
  coverage: [] as string[],
  features: [] as string[],
  years_experience: "",
  contact_email: "",
  contact_phone: "",
  website: "",
}

function StepIndicator({ current }: { current: Step }) {
  const idx = steps.findIndex((s) => s.key === current)
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => {
        const Icon = step.icon
        const done = i < idx
        const active = i === idx
        return (
          <div key={step.key} className="flex items-center">
            <div className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all",
              done   && "bg-[#4A7C59] text-white",
              active && "bg-[#E85C2D] text-white shadow-lg shadow-[#E85C2D]/30",
              !done && !active && "bg-[#F0EDE8] text-[#9B8F87]",
            )}>
              {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <span className={clsx("ml-2 text-xs font-semibold hidden sm:block",
              active ? "text-[#E85C2D]" : done ? "text-[#4A7C59]" : "text-[#9B8F87]"
            )}>{step.label}</span>
            {i < steps.length - 1 && (
              <div className={clsx("mx-3 h-px w-8 sm:w-16 transition-all",
                i < idx ? "bg-[#4A7C59]" : "bg-[#E4DFDA]"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function VendorPostClient() {
  const [step, setStep] = useState<Step>("basics")
  const [form, setForm] = useState(empty)
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof typeof empty>(key: K, val: (typeof empty)[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function toggle(field: "coverage" | "features", val: string) {
    setForm((f) => ({
      ...f,
      [field]: (f[field] as string[]).includes(val)
        ? (f[field] as string[]).filter((x) => x !== val)
        : [...(f[field] as string[]), val],
    }))
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) setImages((prev) => [...prev, e.target!.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1800))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="relo-app-shell">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#4A7C59] text-white shadow-lg mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1A1612] mb-3">Service submitted!</h1>
          <p className="text-[#6B6460] max-w-sm mb-8">Your service is under review. We'll notify you once it's live on the marketplace.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/vendor" className="rounded-xl bg-[#E85C2D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D44E22] transition-colors">
              Back to dashboard
            </Link>
            <button onClick={() => { setSubmitted(false); setForm(empty); setImages([]); setStep("basics") }}
              className="rounded-xl border border-[#E4DFDA] px-5 py-2.5 text-sm font-semibold text-[#1A1612] hover:bg-[#F7F5F0] transition-colors">
              Post another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relo-app-shell">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/vendor" className="flex items-center gap-2 text-sm font-semibold text-[#6B6460] hover:text-[#E85C2D] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-xs text-[#9B8F87]">Step {steps.findIndex(s => s.key === step) + 1} of {steps.length}</span>
        </div>

        <h1 className="font-display text-3xl font-bold text-[#1A1612] mb-2">List your service</h1>
        <p className="text-sm text-[#6B6460] mb-8">Reach movers and families relocating through EasyMoveZone.</p>

        <StepIndicator current={step} />

        {/* ── Step: Basics ── */}
        {step === "basics" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-3">Service type</label>
              <div className="grid grid-cols-3 gap-3">
                {SERVICE_TYPES.map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => set("service_type", value)}
                    className={clsx("flex flex-col items-center gap-2 rounded-2xl border-2 py-4 text-xs font-semibold transition-all",
                      form.service_type === value
                        ? "border-[#E85C2D] bg-[#E85C2D]/5 text-[#E85C2D]"
                        : "border-[#E4DFDA] text-[#6B6460] hover:border-[#E85C2D]/40"
                    )}>
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">Business / trading name</label>
              <input value={form.business_name} onChange={(e) => set("business_name", e.target.value)}
                placeholder="e.g. Swift Movers Manchester"
                className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">Tagline</label>
              <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)}
                placeholder="e.g. Fast, friendly, fully insured removals"
                className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">Pricing</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(["from", "fixed", "quote"] as const).map((t) => (
                  <button key={t} onClick={() => set("price_type", t)}
                    className={clsx("rounded-xl border-2 py-2.5 text-xs font-bold capitalize transition-all",
                      form.price_type === t
                        ? "border-[#E85C2D] bg-[#E85C2D]/5 text-[#E85C2D]"
                        : "border-[#E4DFDA] text-[#6B6460] hover:border-[#E85C2D]/40"
                    )}>
                    {t === "from" ? "From price" : t === "fixed" ? "Fixed price" : "Quote only"}
                  </button>
                ))}
              </div>
              {form.price_type !== "quote" && (
                <div className="flex gap-2">
                  <select value={form.currency} onChange={(e) => set("currency", e.target.value as typeof form.currency)}
                    className="rounded-2xl border border-[#E4DFDA] bg-white px-3 py-3 text-sm text-[#1A1612] focus:border-[#E85C2D] focus:outline-none">
                    <option value="GBP">£ GBP</option>
                    <option value="NGN">₦ NGN</option>
                    <option value="USD">$ USD</option>
                  </select>
                  <input type="number" value={form.base_price} onChange={(e) => set("base_price", e.target.value)}
                    placeholder="Starting price"
                    className="flex-1 rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />Base location
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.city} onChange={(e) => set("city", e.target.value)}
                  placeholder="City"
                  className="rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
                <input value={form.state} onChange={(e) => set("state", e.target.value)}
                  placeholder="State / Region"
                  className="rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Details ── */}
        {step === "details" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">About your service</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                rows={5} placeholder="What do you offer? What sets you apart? Include any specialisms or guarantees."
                className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                <Clock className="inline h-4 w-4 mr-1" />Years in business
              </label>
              <input type="number" min="0" value={form.years_experience} onChange={(e) => set("years_experience", e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-3">Coverage area</label>
              <div className="flex flex-wrap gap-2">
                {COVERAGE.map((c) => (
                  <button key={c} onClick={() => toggle("coverage", c)}
                    className={clsx("rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                      form.coverage.includes(c)
                        ? "border-[#E85C2D] bg-[#E85C2D]/10 text-[#E85C2D]"
                        : "border-[#E4DFDA] text-[#6B6460] hover:border-[#E85C2D]/40"
                    )}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-3">Service features</label>
              <div className="flex flex-wrap gap-2">
                {FEATURES.map((f) => (
                  <button key={f} onClick={() => toggle("features", f)}
                    className={clsx("rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                      form.features.includes(f)
                        ? "border-[#4A7C59] bg-[#4A7C59]/10 text-[#4A7C59]"
                        : "border-[#E4DFDA] text-[#6B6460] hover:border-[#4A7C59]/40"
                    )}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />Email
                </label>
                <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />Phone
                </label>
                <input type="tel" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)}
                  placeholder="+44 7000 000000"
                  className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1612] mb-2">Website</label>
                <input type="url" value={form.website} onChange={(e) => set("website", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Photos ── */}
        {step === "photos" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">Business photos</label>
              <p className="text-xs text-[#9B8F87] mb-4">Vehicles, team, completed jobs. First photo is your cover image.</p>
              <button onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#E4DFDA] py-12 text-center hover:border-[#E85C2D]/60 hover:bg-[#E85C2D]/[0.02] transition-all">
                <UploadCloud className="h-10 w-10 text-[#9B8F87]" />
                <span className="text-sm font-semibold text-[#6B6460]">Click to upload photos</span>
                <span className="text-xs text-[#9B8F87]">JPG, PNG, WEBP up to 10MB each</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {images.map((src, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-[#F0EDE8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-[#E85C2D] px-2 py-0.5 text-[10px] font-bold text-white">Cover</span>
                    )}
                    <button onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white group-hover:flex">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step: Preview ── */}
        {step === "preview" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#E4DFDA] bg-white overflow-hidden">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt="Cover" className="h-52 w-full object-cover" />
              ) : (
                <div className="h-52 w-full bg-[#F0EDE8] flex items-center justify-center text-[#9B8F87] text-sm">No cover photo</div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h2 className="font-display text-xl font-bold text-[#1A1612]">{form.business_name || "Business name"}</h2>
                  <span className="shrink-0 rounded-full bg-[#E85C2D]/10 px-3 py-1 text-sm font-bold text-[#E85C2D]">
                    {form.price_type === "quote" ? "Get a quote" :
                      `${form.currency === "GBP" ? "£" : form.currency === "NGN" ? "₦" : "$"}${form.base_price ? Number(form.base_price).toLocaleString() : "—"}${form.price_type === "from" ? "+" : ""}`}
                  </span>
                </div>
                {form.tagline && <p className="text-sm text-[#6B6460] mb-3">{form.tagline}</p>}
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-[#6B6460]">
                    <MapPin className="h-3 w-3 text-[#E85C2D]" />
                    {[form.city, form.state].filter(Boolean).join(", ") || "Location not set"}
                  </span>
                  {form.years_experience && (
                    <span className="rounded-full bg-[#F0EDE8] px-2.5 py-1 text-xs font-semibold text-[#1A1612]">
                      {form.years_experience} yrs experience
                    </span>
                  )}
                </div>
                {form.description && <p className="text-sm text-[#6B6460] line-clamp-3 mb-4">{form.description}</p>}
                {form.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.features.map((f) => (
                      <span key={f} className="rounded-full bg-[#4A7C59]/10 px-2.5 py-1 text-[11px] font-semibold text-[#4A7C59]">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7F5F0] p-5 flex gap-3">
              <Info className="h-4 w-4 text-[#6B6460] shrink-0 mt-0.5" />
              <p className="text-xs text-[#6B6460]">
                Once submitted, your service will be reviewed before appearing on the marketplace.
                You can update it from your vendor dashboard at any time.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => {
              const idx = steps.findIndex(s => s.key === step)
              if (idx > 0) setStep(steps[idx - 1].key)
            }}
            disabled={step === "basics"}
            className="flex items-center gap-2 rounded-xl border border-[#E4DFDA] px-5 py-2.5 text-sm font-semibold text-[#6B6460] hover:bg-[#F7F5F0] disabled:opacity-40 disabled:pointer-events-none transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {step !== "preview" ? (
            <button
              onClick={() => {
                const idx = steps.findIndex(s => s.key === step)
                setStep(steps[idx + 1].key)
              }}
              className="flex items-center gap-2 rounded-xl bg-[#E85C2D] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#D44E22] transition-colors">
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#E85C2D] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#D44E22] disabled:opacity-70 transition-colors">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</> : <><CheckCircle2 className="h-4 w-4" />Submit service</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
