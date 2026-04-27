"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Truck,
  MapPin,
  Package,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Calendar,
  Shield,
  User,
  Mail,
  Phone,
  Loader2,
} from "lucide-react"
import { clsx } from "clsx"
import { LogisticsMap } from "./LogisticsMap"

const CITIES = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu",
  "Kano", "Kaduna", "Benin City", "Warri", "Calabar",
  "Uyo", "Asaba", "Abeokuta", "Jos", "Other"
]

const MOVE_SCALES = [
  { id: "1bed", label: "1-2 Bedroom Home", desc: "Ideal for apartments", icon: Package },
  { id: "3bed", label: "3-4 Bedroom Home", desc: "Standard family move", icon: Package },
  { id: "mansion", label: "5+ Bed / Mansion", desc: "Large scale residential", icon: Package },
  { id: "office", label: "Office / Commercial", desc: "Corporate relocations", icon: Truck },
  { id: "industrial", label: "Industrial / Warehouse", desc: "Heavy equipment & logistics", icon: Truck },
]

const SERVICE_LEVELS = [
  { id: "standard", label: "Standard Move", desc: "Loading, transport, and unloading." },
  { id: "premium", label: "Full Pack & Move", desc: "We pack your items, transport, and unpack." },
  { id: "whiteglove", label: "White Glove", desc: "Includes storage setup, cleaning, and installation." },
]

type FormData = {
  moveType: string
  originCity: string
  originAddress: string
  destCity: string
  destAddress: string
  moveScale: string
  serviceLevel: string
  moveDate: string
  propertyId: string
  name: string
  email: string
  phone: string
}

export function LogisticsForm() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>({
    moveType: "Residential",
    originCity: "",
    originAddress: "",
    destCity: "",
    destAddress: "",
    moveScale: "",
    serviceLevel: "",
    moveDate: "",
    propertyId: "",
    name: "",
    email: "",
    phone: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const updateData = (fields: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...fields }))
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, 5))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    const summary = `
Logistics Booking Request:
- Move Type: ${data.moveType}
- Origin: ${data.originAddress}, ${data.originCity}
- Destination: ${data.destAddress}, ${data.destCity}
- Scale: ${data.moveScale}
- Service Level: ${data.serviceLevel}
- Target Date: ${data.moveDate}
- Linked Property ID: ${data.propertyId || "None"}
    `.trim()

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: `Logistics Booking [${data.moveType}]`,
          message: summary,
          pageContext: "Logistics Booking Engine",
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to submit")
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const isStepValid = () => {
    if (step === 1) return !!data.originCity && !!data.originAddress && !!data.destCity && !!data.destAddress
    if (step === 2) return !!data.moveScale
    if (step === 3) return !!data.serviceLevel
    if (step === 4) return !!data.moveDate
    return !!data.name && !!data.email && !!data.phone
  }

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl shadow-2xl shadow-[#0033A1]/10 ring-1 ring-white/5 sm:p-8">
      {/* Progress Bar */}
      <div className="mb-8 flex items-center justify-between gap-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={clsx(
              "h-2 flex-1 rounded-full transition-all duration-300",
              s === step
                ? "bg-rose-500 shadow-md shadow-rose-500/30"
                : s < step
                  ? "bg-rose-500/50"
                  : "bg-white/10",
            )}
          />
        ))}
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">Booking Received!</h3>
          <p className="mt-3 text-slate-300">
            Thank you, {data.name}. A logistics coordinator will generate your quotes and reach out within 24 hours.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">Route Mapping</h3>
                  <p className="mt-1 text-sm text-slate-400">Where are we moving from and to?</p>
                </div>

                <div className="flex gap-4 p-1 bg-white/[0.03] rounded-xl border border-white/5 max-w-xs">
                  {["Residential", "Commercial"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateData({ moveType: type })}
                      className={clsx(
                        "flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition",
                        data.moveType === type
                          ? "bg-rose-500 text-white shadow"
                          : "text-slate-400 hover:text-white",
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-1 mb-4">
                  <LogisticsMap
                    originCity={data.originCity}
                    destCity={data.destCity}
                    onSelectOrigin={(city) => updateData({ originCity: city })}
                    onSelectDest={(city) => updateData({ destCity: city })}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <MapPin className="h-4 w-4 text-rose-400" /> Pickup Location
                    </label>
                    <select
                      value={data.originCity}
                      onChange={(e) => updateData({ originCity: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-rose-500 focus:outline-none"
                    >
                      <option value="" disabled>Select City</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Full Pickup Address"
                      value={data.originAddress}
                      onChange={(e) => updateData({ originAddress: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-rose-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <MapPin className="h-4 w-4 text-rose-400" /> Destination
                    </label>
                    <select
                      value={data.destCity}
                      onChange={(e) => updateData({ destCity: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-rose-500 focus:outline-none"
                    >
                      <option value="" disabled>Select City</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Full Destination Address"
                      value={data.destAddress}
                      onChange={(e) => updateData({ destAddress: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-rose-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">Scale of the Move</h3>
                  <p className="mt-1 text-sm text-slate-400">Select the volume capacity required.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {MOVE_SCALES.map((scale) => {
                    const Icon = scale.icon
                    return (
                      <button
                        key={scale.id}
                        type="button"
                        onClick={() => updateData({ moveScale: scale.label })}
                        className={clsx(
                          "flex items-start gap-4 rounded-2xl border p-5 text-left transition duration-200",
                          data.moveScale === scale.label
                            ? "border-rose-500 bg-rose-500/10 text-white"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20",
                        )}
                      >
                        <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", data.moveScale === scale.label ? "bg-rose-500/20 text-rose-400" : "bg-white/10 text-slate-400")}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-base font-semibold">{scale.label}</p>
                          <p className="mt-1 text-xs text-slate-400">{scale.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">Service Tier</h3>
                  <p className="mt-1 text-sm text-slate-400">Choose how much lifting we do.</p>
                </div>

                <div className="space-y-4">
                  {SERVICE_LEVELS.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => updateData({ serviceLevel: tier.label })}
                      className={clsx(
                        "flex w-full items-center justify-between rounded-2xl border p-5 text-left transition duration-200",
                        data.serviceLevel === tier.label
                          ? "border-rose-500 bg-rose-500/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20",
                      )}
                    >
                      <div>
                        <p className="text-lg font-semibold">{tier.label}</p>
                        <p className="mt-1 text-sm text-slate-400">{tier.desc}</p>
                      </div>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20">
                        {data.serviceLevel === tier.label && <Check className="h-4 w-4 text-rose-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">Timing & Linkage</h3>
                  <p className="mt-1 text-sm text-slate-400">Final details before quotes.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <Calendar className="h-4 w-4 text-rose-400" /> Preferred Moving Date
                    </label>
                    <input
                      type="date"
                      value={data.moveDate}
                      onChange={(e) => updateData({ moveDate: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <Shield className="h-4 w-4 text-rose-400" /> Property Reference ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., EMZ-PROP-982"
                      value={data.propertyId}
                      onChange={(e) => updateData({ propertyId: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-rose-500 focus:outline-none placeholder:text-slate-600"
                    />
                    <p className="text-[10px] text-slate-500">Entering a valid Property ID links your inventory schedule to your lease/deed release for priority dispatch.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">Client Details</h3>
                  <p className="mt-1 text-sm text-slate-400">Who should receive the logistics contract?</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={data.name}
                      onChange={(e) => updateData({ name: e.target.value })}
                      placeholder="Your Full Name"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-12 pr-4 text-white focus:border-rose-500 focus:outline-none placeholder:text-slate-500"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={data.email}
                      onChange={(e) => updateData({ email: e.target.value })}
                      placeholder="Email Address"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-12 pr-4 text-white focus:border-rose-500 focus:outline-none placeholder:text-slate-500"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={data.phone}
                      onChange={(e) => updateData({ phone: e.target.value })}
                      placeholder="Phone Number"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-12 pr-4 text-white focus:border-rose-500 focus:outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-rose-400">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between border-t border-white/10 pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06]"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                disabled={!isStepValid()}
                onClick={nextStep}
                className="flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400 disabled:opacity-50"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid() || submitting}
                className="flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Securing Slots...
                  </>
                ) : (
                  <>
                    Book Move <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
