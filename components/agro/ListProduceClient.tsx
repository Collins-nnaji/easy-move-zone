"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sprout, MapPin, Calendar, Package, Truck, Check, ChevronDown } from "lucide-react"

const CROP_TYPES = [
  "Maize", "Rice", "Cassava", "Yam", "Tomatoes", "Pepper",
  "Sorghum", "Millet", "Cowpea", "Soybean", "Groundnut",
  "Onions", "Sweet Potato", "Plantain", "Banana", "Other",
]

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

const UNITS = ["kg", "tonnes", "bags (50kg)", "bags (100kg)", "crates", "tubers", "bunches", "litres"]

type Step = 1 | 2 | 3

export function ListProduceClient() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    crop_type: "",
    variety: "",
    quantity: "",
    unit: "kg",
    price_per_unit: "",
    state: "",
    lga: "",
    harvest_date: "",
    pickup_from: "",
    pickup_to: "",
    needs_transport: false,
    cold_storage: false,
    notes: "",
    farmer_name: "",
    phone: "",
    whatsapp: true,
  })

  function update(field: string, value: string | boolean) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch("/api/produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_type: form.crop_type,
          variety: form.variety || null,
          quantity: parseFloat(form.quantity),
          unit: form.unit,
          price_per_unit: parseFloat(form.price_per_unit),
          notes: form.notes || null,
          state: form.state,
          lga: form.lga || null,
          harvest_date: form.harvest_date || null,
          pickup_from: form.pickup_from || null,
          pickup_to: form.pickup_to || null,
          needs_transport: form.needs_transport,
          cold_storage_required: form.cold_storage,
          contact_name: form.farmer_name,
          contact_phone: form.phone,
          contact_whatsapp: form.whatsapp,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to submit")
      }
      setDone(true)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Listing submitted!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your produce has been submitted for review. We&apos;ll verify and publish it within 2–4 hours.
            Buyers and transporters will be able to see and contact you directly.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => { setDone(false); setStep(1); setForm({ ...form, crop_type: "", variety: "", quantity: "" }) }}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-emerald-400 transition"
            >
              List another crop
            </button>
            <button
              onClick={() => router.push("/produce")}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition"
            >
              View market
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a2e0a] to-[#064e10] pt-12 pb-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-52 w-52 rounded-full bg-lime-500/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
            <Sprout className="h-3.5 w-3.5" />
            List Produce
          </span>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Post your harvest</h1>
          <p className="mt-1 text-sm text-emerald-200/70">Free to list. Buyers and transporters find you directly.</p>

          {/* Step indicator */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                  step > s ? "bg-emerald-400 text-slate-900" : step === s ? "bg-white text-slate-900" : "bg-white/20 text-white/60"
                }`}>
                  {step > s ? <Check className="h-3.5 w-3.5" /> : s}
                </div>
                <span className={`text-xs font-medium ${step === s ? "text-white" : "text-white/50"}`}>
                  {s === 1 ? "Crop details" : s === 2 ? "Location & timing" : "Your info"}
                </span>
                {s < 3 && <div className="h-px w-6 bg-white/20" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">

          {/* Step 1: Crop Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">Crop details</h2>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Crop type *</label>
                <div className="relative">
                  <select
                    value={form.crop_type}
                    onChange={(e) => update("crop_type", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Select crop…</option>
                    {CROP_TYPES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Variety / description</label>
                <input
                  type="text"
                  placeholder="e.g. White maize, Roma tomatoes, Puna yam…"
                  value={form.variety}
                  onChange={(e) => update("variety", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={form.quantity}
                    onChange={(e) => update("quantity", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Unit *</label>
                  <div className="relative">
                    <select
                      value={form.unit}
                      onChange={(e) => update("unit", e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {UNITS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Price per unit (₦) *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 420"
                  value={form.price_per_unit}
                  onChange={(e) => update("price_per_unit", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Additional notes</label>
                <textarea
                  placeholder="Quality grade, moisture content, packaging, storage requirements…"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.crop_type || !form.quantity || !form.price_per_unit}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
              >
                Continue to location
              </button>
            </div>
          )}

          {/* Step 2: Location & Timing */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">Location & pickup timing</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">State *</label>
                  <div className="relative">
                    <select
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="">Select state…</option>
                      {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">LGA / town</label>
                  <input
                    type="text"
                    placeholder="e.g. Zaria, Makurdi…"
                    value={form.lga}
                    onChange={(e) => update("lga", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Harvest date *</label>
                <input
                  type="date"
                  value={form.harvest_date}
                  onChange={(e) => update("harvest_date", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Pickup window
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-[11px] text-slate-500">From</p>
                    <input
                      type="date"
                      value={form.pickup_from}
                      onChange={(e) => update("pickup_from", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] text-slate-500">To</p>
                    <input
                      type="date"
                      value={form.pickup_to}
                      onChange={(e) => update("pickup_to", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-700">Logistics requirements</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.needs_transport}
                    onChange={(e) => update("needs_transport", e.target.checked)}
                    className="rounded accent-emerald-600 h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-amber-500" />
                      I need a transporter
                    </p>
                    <p className="text-xs text-slate-500">Transporters will see this and can bid for the job</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.cold_storage}
                    onChange={(e) => update("cold_storage", e.target.checked)}
                    className="rounded accent-emerald-600 h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Cold storage required</p>
                    <p className="text-xs text-slate-500">We&apos;ll match you with cold chain partners near your farm</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-400"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.state || !form.harvest_date}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact info */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">Your contact details</h2>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full name / farm name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alhaji Musa Farms"
                  value={form.farmer_name}
                  onChange={(e) => update("farmer_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone number *</label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-slate-100 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.checked)}
                  className="rounded accent-emerald-600 h-4 w-4"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">WhatsApp enabled on this number</p>
                  <p className="text-xs text-slate-500">Buyers and transporters can reach you on WhatsApp</p>
                </div>
              </label>

              {/* Summary */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm space-y-1">
                <p className="font-semibold text-emerald-800 mb-2">Listing summary</p>
                <p className="text-slate-600"><span className="font-medium">Crop:</span> {form.variety || form.crop_type}</p>
                <p className="text-slate-600"><span className="font-medium">Quantity:</span> {form.quantity} {form.unit}</p>
                <p className="text-slate-600"><span className="font-medium">Price:</span> ₦{form.price_per_unit}/{form.unit}</p>
                <p className="text-slate-600"><span className="font-medium">Location:</span> {form.lga ? `${form.lga}, ` : ""}{form.state}</p>
                <p className="text-slate-600"><span className="font-medium">Harvest:</span> {form.harvest_date}</p>
                {form.needs_transport && <p className="text-amber-700 font-medium">Transporter needed ✓</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-400"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.farmer_name || !form.phone || submitting}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
                >
                  {submitting ? "Submitting…" : "Submit listing"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
