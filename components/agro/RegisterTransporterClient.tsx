"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Truck, MapPin, Phone, Shield, Check, ChevronDown } from "lucide-react"

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

const TRUCK_TYPES = [
  "Flatbed (open)", "Closed van", "Refrigerated van", "Tanker",
  "Pickup truck", "Articulated truck", "Tipper", "Motorcycle courier",
]

const SPECIALTIES = [
  "Grains", "Perishables", "Tubers", "Fruits", "Vegetables",
  "Livestock", "Poultry", "Dried produce", "Processed food",
]

const easeOut = [0.16, 1, 0.3, 1] as const

const TESTIMONIALS = [
  {
    name: "Amina Yusuf",
    company: "Amina Haulage",
    quote: "We filled our weekly routes within two weeks of joining. The leads are high quality.",
  },
  {
    name: "Sadiq Musa",
    company: "North Star Logistics",
    quote: "The booking flow is smooth and the farmers are verified. It feels like premium work.",
  },
  {
    name: "Tersoo Aondona",
    company: "Benue Fresh Movers",
    quote: "We now run consistent Benue → Abuja loads without downtime.",
  },
]

const FLEET_FEATURES = [
  {
    name: "Musa Logistics",
    base: "Kaduna · Zaria",
    fleet: "12 trucks",
    highlight: "Cold chain + GPS",
  },
  {
    name: "Benue Fresh Movers",
    base: "Benue · Makurdi",
    fleet: "7 trucks",
    highlight: "Insured cargo",
  },
  {
    name: "North Star Haulage",
    base: "Kano · Nassarawa",
    fleet: "5 trucks",
    highlight: "Grain specialists",
  },
]

export function RegisterTransporterClient() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const testimonialRef = useRef<HTMLDivElement>(null)
  const fleetsRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    company_name: "",
    owner_name: "",
    phone: "",
    whatsapp: true,
    base_state: "",
    base_lga: "",
    fleet_size: "1",
    truck_types: [] as string[],
    specialties: [] as string[],
    routes: "",
    has_insurance: false,
    has_gps: false,
    has_cold_chain: false,
    years_experience: "",
    notes: "",
  })

  function scrollTestimonials(direction: "left" | "right") {
    if (!testimonialRef.current) return
    const amount = direction === "left" ? -280 : 280
    testimonialRef.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  function scrollFleets(direction: "left" | "right") {
    if (!fleetsRef.current) return
    const amount = direction === "left" ? -280 : 280
    fleetsRef.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  function update(field: string, value: string | boolean) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function toggleArr(field: "truck_types" | "specialties", val: string) {
    setForm((p) => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter((v) => v !== val) : [...p[field], val],
    }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch("/api/transporters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: form.company_name,
          owner_name: form.owner_name,
          phone: form.phone,
          whatsapp: form.whatsapp,
          base_state: form.base_state,
          base_lga: form.base_lga || null,
          fleet_size: parseInt(form.fleet_size),
          truck_types: form.truck_types,
          specialties: form.specialties,
          routes: form.routes || null,
          years_experience: form.years_experience ? parseInt(form.years_experience) : null,
          has_insurance: form.has_insurance,
          has_gps: form.has_gps,
          has_cold_chain: form.has_cold_chain,
          notes: form.notes || null,
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Check className="h-8 w-8 text-amber-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Registration submitted!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your transporter profile is under review. We&apos;ll verify your details and add you to the network within 24 hours.
            Farmers with cargo near your routes will be able to contact you directly.
          </p>
          <button
            onClick={() => router.push("/transporters")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-400"
          >
            View transporter listings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/40">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a00] to-[#3d2e00] pt-12 pb-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="relative mx-auto max-w-2xl px-4 sm:px-6"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300">
            <Truck className="h-3.5 w-3.5" />
            Transporter Registration
          </span>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Register your fleet</h1>
          <p className="mt-1 text-sm text-amber-200/70">Join the verified network. Get matched with farm pickups near you.</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {([1, 2] as const).map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step > s ? "bg-amber-400 text-slate-900" : step === s ? "bg-white text-slate-900" : "bg-white/20 text-white/60"}`}>
                  {step > s ? <Check className="h-3.5 w-3.5" /> : s}
                </div>
                <span className={`text-xs font-medium ${step === s ? "text-white" : "text-white/50"}`}>
                  {s === 1 ? "Fleet details" : "Contact & verify"}
                </span>
                {s < 2 && <div className="h-px w-6 bg-white/20" />}
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Verified network", desc: "Trusted by farmers", icon: Shield },
              { label: "Fast matching", desc: "New leads daily", icon: Truck },
              { label: "Nationwide routes", desc: "30+ states covered", icon: MapPin },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white/80 backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <item.icon className="h-4 w-4 text-amber-300" />
                  {item.label}
                </div>
                <p className="mt-1 text-[11px] text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <section className="mb-8 rounded-3xl border border-amber-100/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">
                Verified stories
              </span>
              <h2 className="mt-2 text-lg font-bold text-slate-900">Top transporter testimonials</h2>
              <p className="text-xs text-slate-500">Trusted logistics partners across Nigeria.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTestimonials("left")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-amber-300 hover:text-amber-700"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => scrollTestimonials("right")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-amber-300 hover:text-amber-700"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
            </div>
          </div>

          <div
            ref={testimonialRef}
            className="mt-4 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: easeOut }}
                className="min-w-[240px] snap-start"
              >
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg">
                  <p className="text-sm text-slate-600">“{t.quote}”</p>
                  <div className="mt-4 text-xs font-semibold text-slate-800">{t.name}</div>
                  <div className="text-[11px] text-slate-500">{t.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
          className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8 space-y-5"
        >

          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-900">Fleet & route details</h2>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Company / fleet name *</label>
                <input
                  type="text"
                  placeholder="e.g. Musa Logistics"
                  value={form.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Base state *</label>
                  <div className="relative">
                    <select
                      value={form.base_state}
                      onChange={(e) => update("base_state", e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">Select state…</option>
                      {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Fleet size *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.fleet_size}
                    onChange={(e) => update("fleet_size", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Truck types (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {TRUCK_TYPES.map((tt) => (
                    <button
                      key={tt}
                      type="button"
                      onClick={() => toggleArr("truck_types", tt)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${form.truck_types.includes(tt) ? "bg-amber-500 text-white" : "border border-slate-200 text-slate-600 hover:border-amber-400"}`}
                    >
                      {tt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Cargo specialties</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleArr("specialties", s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${form.specialties.includes(s) ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600 hover:border-emerald-400"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Main routes (describe your coverage)</label>
                <textarea
                  placeholder="e.g. Kano → Lagos, North-West corridor, any route…"
                  value={form.routes}
                  onChange={(e) => update("routes", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-700">Capabilities</p>
                {[
                  { field: "has_insurance", label: "Cargo insurance", desc: "Covered for goods in transit" },
                  { field: "has_gps", label: "GPS tracking", desc: "Real-time location sharing" },
                  { field: "has_cold_chain", label: "Cold chain", desc: "Refrigerated capacity available" },
                ].map(({ field, label, desc }) => (
                  <label key={field} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[field as keyof typeof form] as boolean}
                      onChange={(e) => update(field, e.target.checked)}
                      className="rounded accent-amber-500 h-4 w-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                        {field === "has_insurance" && <Shield className="h-3.5 w-3.5 text-emerald-500" />}
                        {label}
                      </p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.company_name || !form.base_state || form.truck_types.length === 0}
                className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-40"
              >
                Continue to contact info
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-900">Contact & verification</h2>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Owner / manager name *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.owner_name}
                  onChange={(e) => update("owner_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone number *</label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Years of experience</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={form.years_experience}
                  onChange={(e) => update("years_experience", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-slate-100 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.checked)}
                  className="rounded accent-amber-500 h-4 w-4"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">WhatsApp on this number</p>
                  <p className="text-xs text-slate-500">Farmers can reach you quickly on WhatsApp</p>
                </div>
              </label>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Anything else buyers should know?</label>
                <textarea
                  placeholder="Rates, availability, special equipment…"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm space-y-1">
                <p className="font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  Profile summary
                </p>
                <p className="text-slate-600"><span className="font-medium">Fleet:</span> {form.company_name}</p>
                <p className="text-slate-600"><span className="font-medium">Base:</span> {form.base_state}</p>
                <p className="text-slate-600"><span className="font-medium">Trucks:</span> {form.fleet_size} × {form.truck_types.join(", ") || "—"}</p>
                <p className="text-slate-600"><span className="font-medium">Specialties:</span> {form.specialties.join(", ") || "—"}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-400"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.owner_name || !form.phone || submitting}
                  className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-40"
                >
                  {submitting ? "Submitting…" : "Register fleet"}
                </button>
              </div>
            </>
          )}
        </motion.div>

        <section className="mt-8 rounded-3xl border border-amber-100/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">
                Verified fleets
              </span>
              <h2 className="mt-2 text-lg font-bold text-slate-900">Top operators on EasyMoveZone</h2>
              <p className="text-xs text-slate-500">Real partners already booking loads weekly.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollFleets("left")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-amber-300 hover:text-amber-700"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => scrollFleets("right")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-amber-300 hover:text-amber-700"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
            </div>
          </div>

          <div
            ref={fleetsRef}
            className="mt-4 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {FLEET_FEATURES.map((fleet, i) => (
              <motion.div
                key={fleet.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: easeOut }}
                className="min-w-[240px] snap-start"
              >
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{fleet.name}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      Verified
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{fleet.base}</p>
                  <div className="mt-3 rounded-xl bg-amber-50/70 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Fleet size</p>
                    <p className="text-lg font-bold text-amber-700">{fleet.fleet}</p>
                  </div>
                  <div className="mt-3 text-xs font-semibold text-slate-700">{fleet.highlight}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
