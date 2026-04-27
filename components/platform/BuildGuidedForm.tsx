"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  HardHat,
  MapPin,
  Home,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  Wallet,
  User,
  Mail,
  Phone,
  Loader2,
} from "lucide-react"
import { clsx } from "clsx"

const CITIES = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu",
  "Kano", "Kaduna", "Benin City", "Warri", "Calabar",
  "Uyo", "Asaba", "Abeokuta", "Jos", "Other"
]

const BUILD_TYPES = [
  { id: "bungalow", label: "Bungalow", desc: "Single-story living", icon: Home },
  { id: "storey", label: "Storey Building", desc: "Multi-level standalone home", icon: Home },
  { id: "duplex", label: "Duplex", desc: "Semi-detached or fully detached", icon: Home },
  { id: "terrace", label: "Terrace Duplex", desc: "Row housing / Townhouse", icon: Home },
  { id: "flats", label: "Block of Flats", desc: "Multi-unit rental property", icon: Home },
  { id: "custom", label: "Custom / Mixed Use", desc: "Tailored commercial or residential", icon: HardHat },
]

const FINISH_TIERS = [
  { id: "standard", label: "Standard", desc: "Quality basic finishes, durable materials" },
  { id: "premium", label: "Premium", desc: "Imported tiles, pop ceilings, smart fittings" },
  { id: "luxury", label: "Luxury", desc: "Fully custom, automation, premium marble" },
]

type FormData = {
  landStatus: string
  location: string
  buildType: string
  bedrooms: string
  finishTier: string
  timeline: string
  budget: string
  name: string
  email: string
  phone: string
}

export function BuildGuidedForm() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>({
    landStatus: "",
    location: "",
    buildType: "",
    bedrooms: "",
    finishTier: "",
    timeline: "",
    budget: "",
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
Guided Build Requirements:
- Land Status: ${data.landStatus}
- Location: ${data.location}
- Build Type: ${data.buildType}
- Bedrooms: ${data.bedrooms}
- Finish Tier: ${data.finishTier}
- Timeline: ${data.timeline}
- Target Budget: ${data.budget}
    `.trim()

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: "Build Project Guided Requirements",
          message: summary,
          pageContext: "Guided Build Form",
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
    if (step === 1) return !!data.landStatus && !!data.location
    if (step === 2) return !!data.buildType && !!data.bedrooms
    if (step === 3) return !!data.finishTier
    if (step === 4) return !!data.timeline && !!data.budget
    return !!data.name && !!data.email && !!data.phone
  }

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl shadow-2xl shadow-[#0033A1]/10 ring-1 ring-white/5 sm:p-8">
      {/* Progress Bar */}
      <div className="mb-8 flex items-center justify-between gap-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={clsx(
              "h-2 flex-1 rounded-full transition-all duration-300",
              s === step
                ? "bg-amber-500 shadow-md shadow-amber-500/30"
                : s < step
                  ? "bg-amber-500/50"
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
          <h3 className="text-2xl font-bold text-white">Requirements Received!</h3>
          <p className="mt-3 text-slate-300">
            Thank you, {data.name}. A build consultant will review your scope and reach out within 48 hours.
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
                  <h3 className="text-xl font-bold text-white">Where are we starting?</h3>
                  <p className="mt-1 text-sm text-slate-400">Tell us about your land status and location.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { id: "own-ready", label: "I own land (Title ready)" },
                    { id: "own-pending", label: "I own land (Title pending)" },
                    { id: "need-land", label: "I need to buy land" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateData({ landStatus: opt.label })}
                      className={clsx(
                        "rounded-2xl border p-4 text-left transition duration-200",
                        data.landStatus === opt.label
                          ? "border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]",
                      )}
                    >
                      <span className="text-sm font-semibold">{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <MapPin className="h-4 w-4 text-amber-400" /> Project Location
                  </label>
                  <select
                    value={data.location}
                    onChange={(e) => updateData({ location: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="" disabled>Select a city</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city} className="bg-slate-900">
                        {city}
                      </option>
                    ))}
                  </select>
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
                  <h3 className="text-xl font-bold text-white">What is your vision?</h3>
                  <p className="mt-1 text-sm text-slate-400">Select the type of property you want to build.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {BUILD_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => updateData({ buildType: type.label })}
                        className={clsx(
                          "flex items-start gap-4 rounded-2xl border p-5 text-left transition duration-200",
                          data.buildType === type.label
                            ? "border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]",
                        )}
                      >
                        <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", data.buildType === type.label ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-slate-400")}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-base font-semibold">{type.label}</p>
                          <p className="mt-1 text-xs text-slate-400">{type.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Number of Bedrooms</label>
                  <div className="flex flex-wrap gap-3">
                    {["1-2", "3", "4", "5+", "N/A (Commercial)"].map((beds) => (
                      <button
                        key={beds}
                        type="button"
                        onClick={() => updateData({ bedrooms: beds })}
                        className={clsx(
                          "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                          data.bedrooms === beds
                            ? "border-amber-500 bg-amber-500/20 text-white"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20",
                        )}
                      >
                        {beds}
                      </button>
                    ))}
                  </div>
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
                  <h3 className="text-xl font-bold text-white">Choose your finish level</h3>
                  <p className="mt-1 text-sm text-slate-400">This dictates the quality of interior fittings and materials.</p>
                </div>

                <div className="space-y-4">
                  {FINISH_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => updateData({ finishTier: tier.label })}
                      className={clsx(
                        "flex w-full items-center justify-between rounded-2xl border p-5 text-left transition duration-200",
                        data.finishTier === tier.label
                          ? "border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]",
                      )}
                    >
                      <div>
                        <p className="text-lg font-semibold">{tier.label}</p>
                        <p className="mt-1 text-sm text-slate-400">{tier.desc}</p>
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
                  <h3 className="text-xl font-bold text-white">Timeline & Budget</h3>
                  <p className="mt-1 text-sm text-slate-400">Help us gauge the project parameters.</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Clock className="h-4 w-4 text-amber-400" /> Target Timeline
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {["ASAP", "3 - 6 Months", "6+ Months"].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => updateData({ timeline: time })}
                        className={clsx(
                          "rounded-xl border p-4 text-center font-semibold transition",
                          data.timeline === time
                            ? "border-amber-500 bg-amber-500/20 text-white"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20",
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Wallet className="h-4 w-4 text-amber-400" /> Target Budget Range
                  </label>
                  <select
                    value={data.budget}
                    onChange={(e) => updateData({ budget: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="" disabled>Select a range</option>
                    <option value="Under ₦30M" className="bg-slate-900">Under ₦30M</option>
                    <option value="₦30M - ₦60M" className="bg-slate-900">₦30M - ₦60M</option>
                    <option value="₦60M - ₦100M" className="bg-slate-900">₦60M - ₦100M</option>
                    <option value="₦100M - ₦200M" className="bg-slate-900">₦100M - ₦200M</option>
                    <option value="₦200M+" className="bg-slate-900">₦200M+</option>
                  </select>
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
                  <h3 className="text-xl font-bold text-white">Contact Information</h3>
                  <p className="mt-1 text-sm text-slate-400">Where should we send your build breakdown?</p>
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
                      className="w-full rounded-xl border border-white/10 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                      className="w-full rounded-xl border border-white/10 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                      className="w-full rounded-xl border border-white/10 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid() || submitting}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Requirements <Sparkles className="h-4 w-4" />
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
