"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react"

const PRIMARY = "#e0511f"
const fieldClass =
  "h-11 w-full rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm text-[#1b231e] outline-none focus:border-[#e0511f]"
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c827a]"

const GOALS = [
  { id: "work", label: "Work / sponsorship" },
  { id: "study", label: "Study" },
  { id: "family", label: "Family / partner" },
  { id: "business", label: "Business / entrepreneur" },
  { id: "asylum_humanitarian", label: "Asylum / humanitarian" },
  { id: "other", label: "Other" },
] as const

const CHALLENGES = [
  "Finding a licensed sponsor",
  "Skills / experience gap",
  "English language proof",
  "Qualification recognition",
  "Savings / funds",
  "Family dependents",
  "Visa refusal history",
  "Unsure which country fits",
  "CV / interview prep",
  "Timeline pressure",
] as const

const DESTINATIONS = [
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "Netherlands",
  "New Zealand",
  "United Arab Emirates",
  "United States",
  "Other",
]

type FormState = {
  fullName: string
  email: string
  phone: string
  nationality: string
  currentCountry: string
  destinationCountries: string[]
  primaryGoal: string
  timeline: string
  currentOccupation: string
  targetOccupation: string
  yearsExperience: string
  educationLevel: string
  englishLevel: string
  visaStatus: string
  alreadyAbroad: boolean
  dependents: string
  budgetRange: string
  challenges: string[]
  preferredContact: string
  message: string
  consent: boolean
}

const EMPTY: FormState = {
  fullName: "",
  email: "",
  phone: "",
  nationality: "",
  currentCountry: "",
  destinationCountries: [],
  primaryGoal: "work",
  timeline: "",
  currentOccupation: "",
  targetOccupation: "",
  yearsExperience: "",
  educationLevel: "",
  englishLevel: "",
  visaStatus: "",
  alreadyAbroad: false,
  dependents: "0",
  budgetRange: "",
  challenges: [],
  preferredContact: "email",
  message: "",
  consent: false,
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function SpecialistEnquiryForm() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [error, setError] = useState("")

  const canSubmit = useMemo(() => {
    return (
      form.fullName.trim().length >= 2 &&
      form.email.includes("@") &&
      form.destinationCountries.length > 0 &&
      form.message.trim().length >= 20 &&
      form.consent
    )
  }, [form])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleDestination(country: string) {
    setForm((prev) => {
      const has = prev.destinationCountries.includes(country)
      const destinationCountries = has
        ? prev.destinationCountries.filter((c) => c !== country)
        : [...prev.destinationCountries, country].slice(0, 8)
      return { ...prev, destinationCountries }
    })
  }

  function toggleChallenge(item: string) {
    setForm((prev) => {
      const has = prev.challenges.includes(item)
      const challenges = has
        ? prev.challenges.filter((c) => c !== item)
        : [...prev.challenges, item].slice(0, 12)
      return { ...prev, challenges }
    })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError("")
    setStatus("sending")
    try {
      const res = await fetch("/api/specialist-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          yearsExperience: form.yearsExperience === "" ? null : Number(form.yearsExperience),
          dependents: Number(form.dependents) || 0,
        }),
      })
      const data = (await res.json()) as { error?: string; ok?: boolean }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.")
        setStatus("error")
        return
      }
      setStatus("success")
      setForm(EMPTY)
    } catch {
      setError("Network error. Please try again or email us.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-[#e4dfd5] bg-white p-8 text-center shadow-sm sm:p-10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 text-2xl font-extrabold text-[#1b231e]">Enquiry received</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#5f655c]">
          Thanks — a specialist will review your details and reply using your preferred contact method.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/easymovescore"
            className="inline-flex rounded-xl px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: PRIMARY }}
          >
            Meanwhile, open EasyMove Score
          </Link>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="rounded-xl border border-[#ded7cb] px-5 py-2.5 text-sm font-bold text-[#1b231e]"
          >
            Submit another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
      <section className="rounded-3xl border border-[#e4dfd5] bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-extrabold text-[#1b231e]">1. About you</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName">
            <input
              id="fullName"
              required
              className={fieldClass}
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              className={fieldClass}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Phone / WhatsApp" htmlFor="phone">
            <input
              id="phone"
              className={fieldClass}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Preferred contact" htmlFor="preferredContact">
            <select
              id="preferredContact"
              className={fieldClass}
              value={form.preferredContact}
              onChange={(e) => set("preferredContact", e.target.value)}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </Field>
          <Field label="Nationality" htmlFor="nationality">
            <input
              id="nationality"
              className={fieldClass}
              value={form.nationality}
              onChange={(e) => set("nationality", e.target.value)}
              placeholder="e.g. Nigerian"
            />
          </Field>
          <Field label="Current country" htmlFor="currentCountry">
            <input
              id="currentCountry"
              className={fieldClass}
              value={form.currentCountry}
              onChange={(e) => set("currentCountry", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e4dfd5] bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-extrabold text-[#1b231e]">2. Where you want to go</h2>
        <p className="mt-1 text-sm text-[#6e746b]">Select one or more destinations.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {DESTINATIONS.map((country) => {
            const on = form.destinationCountries.includes(country)
            return (
              <button
                key={country}
                type="button"
                onClick={() => toggleDestination(country)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  on
                    ? "bg-[#e0511f] text-white"
                    : "border border-[#ded7cb] bg-[#faf8f3] text-[#1b231e] hover:border-[#e0511f]/50"
                }`}
              >
                {country}
              </button>
            )
          })}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Primary goal" htmlFor="primaryGoal">
            <select
              id="primaryGoal"
              className={fieldClass}
              value={form.primaryGoal}
              onChange={(e) => set("primaryGoal", e.target.value)}
            >
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Timeline" htmlFor="timeline">
            <select
              id="timeline"
              className={fieldClass}
              value={form.timeline}
              onChange={(e) => set("timeline", e.target.value)}
            >
              <option value="">Select</option>
              <option value="0-3 months">0–3 months</option>
              <option value="3-6 months">3–6 months</option>
              <option value="6-12 months">6–12 months</option>
              <option value="12+ months">12+ months</option>
              <option value="exploring">Just exploring</option>
            </select>
          </Field>
          <Field label="Current visa / status" htmlFor="visaStatus">
            <input
              id="visaStatus"
              className={fieldClass}
              value={form.visaStatus}
              onChange={(e) => set("visaStatus", e.target.value)}
              placeholder="e.g. visitor, student, none"
            />
          </Field>
          <div className="flex items-end pb-1">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b231e]">
              <input
                type="checkbox"
                checked={form.alreadyAbroad}
                onChange={(e) => set("alreadyAbroad", e.target.checked)}
                className="h-4 w-4 rounded border-[#ded7cb]"
              />
              Already living abroad
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e4dfd5] bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-extrabold text-[#1b231e]">3. Career & background</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Current occupation" htmlFor="currentOccupation">
            <input
              id="currentOccupation"
              className={fieldClass}
              value={form.currentOccupation}
              onChange={(e) => set("currentOccupation", e.target.value)}
            />
          </Field>
          <Field label="Target occupation abroad" htmlFor="targetOccupation">
            <input
              id="targetOccupation"
              className={fieldClass}
              value={form.targetOccupation}
              onChange={(e) => set("targetOccupation", e.target.value)}
            />
          </Field>
          <Field label="Years of experience" htmlFor="yearsExperience">
            <input
              id="yearsExperience"
              type="number"
              min={0}
              max={50}
              className={fieldClass}
              value={form.yearsExperience}
              onChange={(e) => set("yearsExperience", e.target.value)}
            />
          </Field>
          <Field label="Education" htmlFor="educationLevel">
            <select
              id="educationLevel"
              className={fieldClass}
              value={form.educationLevel}
              onChange={(e) => set("educationLevel", e.target.value)}
            >
              <option value="">Select</option>
              <option value="secondary">Secondary</option>
              <option value="diploma">Diploma / vocational</option>
              <option value="bachelor">Bachelor&apos;s</option>
              <option value="master">Master&apos;s</option>
              <option value="phd">Doctorate</option>
            </select>
          </Field>
          <Field label="English level" htmlFor="englishLevel">
            <select
              id="englishLevel"
              className={fieldClass}
              value={form.englishLevel}
              onChange={(e) => set("englishLevel", e.target.value)}
            >
              <option value="">Select</option>
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="fluent">Fluent</option>
              <option value="native">Native</option>
            </select>
          </Field>
          <Field label="Dependents moving with you" htmlFor="dependents">
            <input
              id="dependents"
              type="number"
              min={0}
              max={20}
              className={fieldClass}
              value={form.dependents}
              onChange={(e) => set("dependents", e.target.value)}
            />
          </Field>
          <Field label="Budget range (approx.)" htmlFor="budgetRange">
            <select
              id="budgetRange"
              className={fieldClass}
              value={form.budgetRange}
              onChange={(e) => set("budgetRange", e.target.value)}
            >
              <option value="">Select</option>
              <option value="under-5k">Under £5,000</option>
              <option value="5k-15k">£5,000–£15,000</option>
              <option value="15k-30k">£15,000–£30,000</option>
              <option value="30k+">£30,000+</option>
              <option value="unsure">Not sure yet</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e4dfd5] bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-extrabold text-[#1b231e]">4. What&apos;s blocking you</h2>
        <p className="mt-1 text-sm text-[#6e746b]">Pick everything that applies.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CHALLENGES.map((item) => {
            const on = form.challenges.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleChallenge(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  on
                    ? "bg-[#1b231e] text-white"
                    : "border border-[#ded7cb] bg-[#faf8f3] text-[#1b231e] hover:border-[#1b231e]/40"
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>
        <div className="mt-5">
          <Field label="Tell us your situation" htmlFor="message">
            <textarea
              id="message"
              required
              rows={5}
              className="w-full rounded-xl border border-[#e4dfd5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#e0511f]"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Where you are now, where you want to go, and what kind of specialist help you need…"
            />
          </Field>
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm text-[#4a5047]">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#ded7cb]"
          />
          <span>
            I consent to EasyMoveZone storing this enquiry and contacting me about relocation support. This is not legal
            advice.
          </span>
        </label>
      </section>

      {(error || status === "error") && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{error || "Could not submit."}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4a5047]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>
        <button
          type="submit"
          disabled={!canSubmit || status === "sending"}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
          style={{ background: PRIMARY }}
        >
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {status === "sending" ? "Sending…" : "Request specialist support"}
        </button>
      </div>
    </form>
  )
}
