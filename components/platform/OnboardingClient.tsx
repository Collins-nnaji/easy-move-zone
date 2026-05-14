"use client"

import { useState } from "react"
import { BrandLogoLink } from "@/components/platform/BrandLogoLink"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, Sparkles, MapPin, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const steps = [
  { id: "from",     title: "Where are you moving from?",  subtitle: "We'll use this to understand your starting point." },
  { id: "to",       title: "Where do you want to move?",  subtitle: "Type a city or country — we support 180+ destinations." },
  { id: "why",      title: "Why are you moving?",         subtitle: "This helps us prioritise what matters most." },
  { id: "budget",   title: "What's your monthly budget?", subtitle: "For rent — we'll find areas that fit." },
  { id: "timeline", title: "When are you planning to move?", subtitle: "Even a rough timeline helps." },
  { id: "living",   title: "Who are you moving with?",    subtitle: "We'll size recommendations accordingly." },
]

const whyOptions = [
  { value: "work",        label: "💼 Work or career" },
  { value: "study",       label: "🎓 Study" },
  { value: "fresh-start", label: "🌱 Fresh start" },
  { value: "family",      label: "👨‍👩‍👧 Family" },
  { value: "retirement",  label: "🌅 Retirement" },
  { value: "other",       label: "✨ Other" },
]

const timelineOptions = [
  { value: "lt1",  label: "Less than 1 month" },
  { value: "1-3",  label: "1–3 months" },
  { value: "3-6",  label: "3–6 months" },
  { value: "6-12", label: "6–12 months" },
  { value: "12+",  label: "Over a year" },
]

const livingOptions = [
  { value: "solo",     label: "Solo" },
  { value: "partner",  label: "With a partner" },
  { value: "family",   label: "With family" },
  { value: "flatmates", label: "With flatmates" },
]

const popularDestinations = ["Manchester", "Berlin", "Lisbon", "Toronto", "Dubai", "Amsterdam", "Barcelona"]
const popularOrigins = ["London", "Lagos", "New York", "Mumbai", "Sydney", "Nairobi"]

const budgetMarks = [400, 600, 800, 1000, 1200, 1500, 2000, 3000]

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export function OnboardingClient() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState({
    from: "",
    to: "",
    why: "",
    budget: 1200,
    timeline: "",
    living: "",
  })

  const progress = ((step + 1) / steps.length) * 100

  async function next() {
    if (step < steps.length - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    } else {
      // Save to DB then go to dashboard
      try {
        await fetch("/api/relocate/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originCity: form.from,
            destinationCity: form.to,
            moveReason: form.why,
            budgetHousingUsd: form.budget,
            planName: `${form.from} → ${form.to}`,
          }),
        })
      } catch {
        // Non-fatal — still navigate
      }
      router.push("/dashboard")
    }
  }

  function back() {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const current = steps[step]
  const canNext = (() => {
    if (step === 0) return form.from.trim().length > 0
    if (step === 1) return form.to.trim().length > 0
    if (step === 2) return form.why.length > 0
    if (step === 3) return form.budget > 0
    if (step === 4) return form.timeline.length > 0
    if (step === 5) return form.living.length > 0
    return true
  })()

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-[#E4DFDA] bg-white px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-2">
        <BrandLogoLink size="nav" className="min-w-0" />
        <div className="text-xs text-[#6B6460] font-medium sm:text-sm shrink-0">Step {step + 1} of {steps.length}</div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#E4DFDA]">
        <motion.div
          className="h-full bg-[#E85C2D] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-[10px] font-bold tracking-widest text-[#E85C2D] uppercase mb-3">
                {step + 1} / {steps.length}
              </div>
              <h1 className="font-display text-2xl font-bold text-[#1A1612] tracking-tight mb-2 sm:text-3xl">
                {current.title}
              </h1>
              <p className="text-[#6B6460] mb-8">{current.subtitle}</p>

              {/* Step content */}
              {step === 0 && (
                <div>
                  <div className="flex items-center gap-3 bg-white border border-[#E4DFDA] rounded-xl px-4 py-3.5 mb-4 focus-within:border-[#E85C2D] focus-within:ring-2 focus-within:ring-[rgba(232,92,45,0.1)] transition-all">
                    <MapPin className="h-4 w-4 text-[#E85C2D] shrink-0" />
                    <input
                      type="text"
                      value={form.from}
                      onChange={(e) => setForm({ ...form, from: e.target.value })}
                      placeholder="e.g. London, UK"
                      className="flex-1 bg-transparent text-[15px] text-[#1A1612] placeholder:text-[#A8A4A0] outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#A8A4A0] font-medium">Quick pick:</span>
                    {popularOrigins.map((city) => (
                      <button key={city} onClick={() => setForm({ ...form, from: city })}
                        className={`relo-chip text-xs cursor-pointer hover:bg-[rgba(232,92,45,0.1)] hover:text-[#C44520] transition-colors ${form.from === city ? "relo-chip-accent" : ""}`}>
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <div className="flex items-center gap-3 bg-white border border-[#E4DFDA] rounded-xl px-4 py-3.5 mb-4 focus-within:border-[#E85C2D] focus-within:ring-2 focus-within:ring-[rgba(232,92,45,0.1)] transition-all">
                    <MapPin className="h-4 w-4 text-[#E85C2D] shrink-0" />
                    <input
                      type="text"
                      value={form.to}
                      onChange={(e) => setForm({ ...form, to: e.target.value })}
                      placeholder="e.g. Manchester, UK"
                      className="flex-1 bg-transparent text-[15px] text-[#1A1612] placeholder:text-[#A8A4A0] outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#A8A4A0] font-medium">Popular:</span>
                    {popularDestinations.map((city) => (
                      <button key={city} onClick={() => setForm({ ...form, to: city })}
                        className={`relo-chip text-xs cursor-pointer hover:bg-[rgba(232,92,45,0.1)] hover:text-[#C44520] transition-colors ${form.to === city ? "relo-chip-accent" : ""}`}>
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  {whyOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm({ ...form, why: opt.value })}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                        form.why === opt.value
                          ? "border-[#E85C2D] bg-[rgba(232,92,45,0.08)] text-[#1A1612]"
                          : "border-[#E4DFDA] bg-white text-[#6B6460] hover:border-[#C8C3BE] hover:text-[#1A1612]"
                      }`}
                    >
                      <span className="text-lg">{opt.label.split(" ")[0]}</span>
                      <span className="text-sm font-semibold">{opt.label.split(" ").slice(1).join(" ")}</span>
                      {form.why === opt.value && <Check className="h-4 w-4 text-[#E85C2D] ml-auto" />}
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="text-4xl font-display font-bold text-[#E85C2D] mb-2">
                    £{form.budget.toLocaleString()}<span className="text-lg text-[#6B6460] font-medium">/mo</span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={5000}
                    step={100}
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    className="w-full mt-4 mb-2 accent-[#E85C2D]"
                  />
                  <div className="flex justify-between text-xs text-[#A8A4A0] font-medium mb-6">
                    <span>£400</span><span>£5,000+</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#A8A4A0] font-medium">Quick:</span>
                    {budgetMarks.map((b) => (
                      <button key={b} onClick={() => setForm({ ...form, budget: b })}
                        className={`relo-chip text-xs cursor-pointer transition-colors ${form.budget === b ? "relo-chip-accent" : "hover:bg-[rgba(232,92,45,0.1)] hover:text-[#C44520]"}`}>
                        £{b.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-3">
                  {timelineOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm({ ...form, timeline: opt.value })}
                      className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        form.timeline === opt.value
                          ? "border-[#E85C2D] bg-[rgba(232,92,45,0.08)]"
                          : "border-[#E4DFDA] bg-white hover:border-[#C8C3BE]"
                      }`}
                    >
                      <span className={`text-[15px] font-semibold ${form.timeline === opt.value ? "text-[#1A1612]" : "text-[#6B6460]"}`}>
                        {opt.label}
                      </span>
                      {form.timeline === opt.value && <Check className="h-4 w-4 text-[#E85C2D]" />}
                    </button>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="grid grid-cols-2 gap-3">
                  {livingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm({ ...form, living: opt.value })}
                      className={`p-5 rounded-xl border text-center transition-all ${
                        form.living === opt.value
                          ? "border-[#E85C2D] bg-[rgba(232,92,45,0.08)]"
                          : "border-[#E4DFDA] bg-white hover:border-[#C8C3BE]"
                      }`}
                    >
                      <div className={`text-[15px] font-semibold ${form.living === opt.value ? "text-[#1A1612]" : "text-[#6B6460]"}`}>
                        {opt.label}
                      </div>
                      {form.living === opt.value && (
                        <div className="mt-1 flex justify-center">
                          <Check className="h-4 w-4 text-[#E85C2D]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={back}
              className={`flex items-center gap-2 text-sm font-semibold text-[#6B6460] transition hover:text-[#1A1612] ${step === 0 ? "invisible" : ""}`}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <button
              onClick={next}
              disabled={!canNext}
              className={`flex items-center gap-2 relo-btn-primary px-6 py-3 rounded-xl text-[15px] disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {step === steps.length - 1 ? (
                <>Build my dashboard <Sparkles className="h-4 w-4" /></>
              ) : (
                <>Continue <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
