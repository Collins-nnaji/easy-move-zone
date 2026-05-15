"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft, Building2, Home, TreePine, Store, Layers, MapPin,
  BedDouble, Bath, Ruler, Camera, CheckCircle2, Loader2, ChevronRight,
  ChevronLeft, UploadCloud, X, Star, Info, Tag, FileText,
} from "lucide-react"
import { clsx } from "clsx"

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", icon: Building2 },
  { value: "house",     label: "House",     icon: Home },
  { value: "land",      label: "Land",      icon: TreePine },
  { value: "commercial",label: "Commercial", icon: Store },
  { value: "mixed-use", label: "Mixed Use",  icon: Layers },
] as const

const AMENITIES = [
  "Parking", "Garden", "Gym", "Pool", "24/7 Security", "Generator",
  "Solar Power", "CCTV", "Intercom", "Elevator", "Serviced", "Furnished",
  "Pet Friendly", "Air Conditioning", "Fibre Internet",
]

type Step = "basics" | "details" | "photos" | "preview"

const steps: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "basics",  label: "Basics",  icon: FileText  },
  { key: "details", label: "Details", icon: Tag       },
  { key: "photos",  label: "Photos",  icon: Camera    },
  { key: "preview", label: "Preview", icon: Star      },
]

const empty = {
  title: "",
  description: "",
  property_type: "apartment" as (typeof PROPERTY_TYPES)[number]["value"],
  listing_type: "rent" as "rent" | "sale",
  price: "",
  currency: "GBP" as "GBP" | "NGN" | "USD",
  city: "",
  state: "",
  address: "",
  neighborhood: "",
  bedrooms: "",
  bathrooms: "",
  land_size_sqm: "",
  building_size_sqm: "",
  amenities: [] as string[],
  available_from: "",
  contact_email: "",
  contact_phone: "",
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

export function LandlordPostClient() {
  const [step, setStep] = useState<Step>("basics")
  const [form, setForm] = useState(empty)
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof typeof empty>(key: K, val: (typeof empty)[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function toggleAmenity(a: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
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
          <h1 className="font-display text-3xl font-bold text-[#1A1612] mb-3">Listing submitted!</h1>
          <p className="text-[#6B6460] max-w-sm mb-8">Your listing is under review. We'll notify you once it's live, usually within 24 hours.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/landlord" className="rounded-xl bg-[#E85C2D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D44E22] transition-colors">
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
          <Link href="/landlord" className="flex items-center gap-2 text-sm font-semibold text-[#6B6460] hover:text-[#E85C2D] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-xs text-[#9B8F87]">Step {steps.findIndex(s => s.key === step) + 1} of {steps.length}</span>
        </div>

        <h1 className="font-display text-3xl font-bold text-[#1A1612] mb-2">Post a listing</h1>
        <p className="text-sm text-[#6B6460] mb-8">Reach verified movers, tenants, and buyers on EasyMoveZone.</p>

        <StepIndicator current={step} />

        {/* ── Step: Basics ── */}
        {step === "basics" && (
          <div className="space-y-6">
            {/* Listing type */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-3">Listing type</label>
              <div className="grid grid-cols-2 gap-3">
                {(["rent", "sale"] as const).map((t) => (
                  <button key={t} onClick={() => set("listing_type", t)}
                    className={clsx("rounded-2xl border-2 py-4 text-sm font-bold capitalize transition-all",
                      form.listing_type === t
                        ? "border-[#E85C2D] bg-[#E85C2D]/5 text-[#E85C2D]"
                        : "border-[#E4DFDA] text-[#6B6460] hover:border-[#E85C2D]/40"
                    )}>
                    {t === "rent" ? "For rent" : "For sale"}
                  </button>
                ))}
              </div>
            </div>

            {/* Property type */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-3">Property type</label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => set("property_type", value)}
                    className={clsx("flex flex-col items-center gap-2 rounded-2xl border-2 py-4 text-xs font-semibold transition-all",
                      form.property_type === value
                        ? "border-[#E85C2D] bg-[#E85C2D]/5 text-[#E85C2D]"
                        : "border-[#E4DFDA] text-[#6B6460] hover:border-[#E85C2D]/40"
                    )}>
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">Listing title</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Bright 2-bed flat in Chorlton"
                className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                Price {form.listing_type === "rent" ? "(per month)" : ""}
              </label>
              <div className="flex gap-2">
                <select value={form.currency} onChange={(e) => set("currency", e.target.value as typeof form.currency)}
                  className="rounded-2xl border border-[#E4DFDA] bg-white px-3 py-3 text-sm text-[#1A1612] focus:border-[#E85C2D] focus:outline-none">
                  <option value="GBP">£ GBP</option>
                  <option value="NGN">₦ NGN</option>
                  <option value="USD">$ USD</option>
                </select>
                <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                  placeholder="0"
                  className="flex-1 rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">Location</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={form.city} onChange={(e) => set("city", e.target.value)}
                  placeholder="City"
                  className="rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
                <input value={form.state} onChange={(e) => set("state", e.target.value)}
                  placeholder="State / Region"
                  className="rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
              </div>
              <input value={form.address} onChange={(e) => set("address", e.target.value)}
                placeholder="Street address (optional)"
                className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
            </div>
          </div>
        )}

        {/* ── Step: Details ── */}
        {step === "details" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                rows={5} placeholder="Describe the property — what makes it great for movers?"
                className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition resize-none" />
            </div>

            {/* Bedrooms / Bathrooms */}
            {form.property_type !== "land" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                    <BedDouble className="inline h-4 w-4 mr-1" />Bedrooms
                  </label>
                  <input type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                    <Bath className="inline h-4 w-4 mr-1" />Bathrooms
                  </label>
                  <input type="number" min="0" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
                </div>
              </div>
            )}

            {/* Sizes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                  <Ruler className="inline h-4 w-4 mr-1" />Land size (sqm)
                </label>
                <input type="number" value={form.land_size_sqm} onChange={(e) => set("land_size_sqm", e.target.value)}
                  placeholder="e.g. 300"
                  className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1612] mb-2">
                  <Ruler className="inline h-4 w-4 mr-1" />Building size (sqm)
                </label>
                <input type="number" value={form.building_size_sqm} onChange={(e) => set("building_size_sqm", e.target.value)}
                  placeholder="e.g. 85"
                  className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
              </div>
            </div>

            {/* Available from */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">Available from</label>
              <input type="date" value={form.available_from} onChange={(e) => set("available_from", e.target.value)}
                className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-3">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <button key={a} onClick={() => toggleAmenity(a)}
                    className={clsx("rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                      form.amenities.includes(a)
                        ? "border-[#E85C2D] bg-[#E85C2D]/10 text-[#E85C2D]"
                        : "border-[#E4DFDA] text-[#6B6460] hover:border-[#E85C2D]/40"
                    )}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1612] mb-2">Contact email</label>
                <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1612] mb-2">Contact phone</label>
                <input type="tel" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)}
                  placeholder="+44 7000 000000"
                  className="w-full rounded-2xl border border-[#E4DFDA] bg-white px-4 py-3 text-sm text-[#1A1612] placeholder:text-[#9B8F87] focus:border-[#E85C2D] focus:outline-none focus:ring-2 focus:ring-[#E85C2D]/20 transition" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Photos ── */}
        {step === "photos" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1A1612] mb-2">Property photos</label>
              <p className="text-xs text-[#9B8F87] mb-4">Upload up to 20 photos. First photo becomes the cover image.</p>
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

            <div className="rounded-2xl bg-[#F7F5F0] p-4 flex gap-3">
              <Info className="h-4 w-4 text-[#E85C2D] shrink-0 mt-0.5" />
              <p className="text-xs text-[#6B6460]">
                High-quality photos get <strong className="text-[#1A1612]">3× more enquiries</strong>.
                Use natural light and include living areas, kitchen, and bathrooms.
              </p>
            </div>
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
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="font-display text-xl font-bold text-[#1A1612]">{form.title || "Untitled listing"}</h2>
                  <span className="shrink-0 rounded-full bg-[#E85C2D]/10 px-3 py-1 text-sm font-bold text-[#E85C2D]">
                    {form.currency === "GBP" ? "£" : form.currency === "NGN" ? "₦" : "$"}{form.price ? Number(form.price).toLocaleString() : "—"}
                    {form.listing_type === "rent" && <span className="font-normal text-xs">/mo</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#6B6460] mb-4">
                  <MapPin className="h-3.5 w-3.5 text-[#E85C2D]" />
                  {[form.city, form.state].filter(Boolean).join(", ") || "Location not set"}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {form.bedrooms && <span className="rounded-full bg-[#F0EDE8] px-3 py-1 text-xs font-semibold text-[#1A1612]"><BedDouble className="inline h-3 w-3 mr-1" />{form.bedrooms} bed</span>}
                  {form.bathrooms && <span className="rounded-full bg-[#F0EDE8] px-3 py-1 text-xs font-semibold text-[#1A1612]"><Bath className="inline h-3 w-3 mr-1" />{form.bathrooms} bath</span>}
                  {form.building_size_sqm && <span className="rounded-full bg-[#F0EDE8] px-3 py-1 text-xs font-semibold text-[#1A1612]">{form.building_size_sqm} sqm</span>}
                  <span className="rounded-full bg-[#F0EDE8] px-3 py-1 text-xs font-semibold text-[#1A1612] capitalize">{form.property_type}</span>
                </div>
                {form.description && <p className="text-sm text-[#6B6460] line-clamp-3">{form.description}</p>}
                {form.amenities.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {form.amenities.map((a) => (
                      <span key={a} className="rounded-full bg-[#4A7C59]/10 px-2.5 py-1 text-[11px] font-semibold text-[#4A7C59]">{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7F5F0] p-5 flex gap-3">
              <Info className="h-4 w-4 text-[#6B6460] shrink-0 mt-0.5" />
              <p className="text-xs text-[#6B6460]">
                Once submitted, your listing will be reviewed by our team before going live.
                You can edit it from your landlord dashboard at any time.
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
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</> : <><CheckCircle2 className="h-4 w-4" />Submit listing</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
