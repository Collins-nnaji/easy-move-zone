"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createApplication } from "@/lib/visa/client"
import { VISA_TYPES } from "@/components/visa/VisaLookupForm"

export function NewApplicationClient({ initialNationality = "", initialDestination = "", initialVisaType = "" }: {
  initialNationality?: string
  initialDestination?: string
  initialVisaType?: string
}) {
  const router = useRouter()
  const [nationality, setNationality] = useState(initialNationality)
  const [destination, setDestination] = useState(initialDestination)
  const [visaType, setVisaType] = useState(initialVisaType || VISA_TYPES[0].value)
  const [targetTravelDate, setTargetTravelDate] = useState("")
  const [passportExpiryDate, setPassportExpiryDate] = useState("")
  const [purposeNotes, setPurposeNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nationality.trim() || !destination.trim() || saving) return
    setSaving(true)
    setError("")
    try {
      const application = await createApplication({
        applicantNationality: nationality.trim(),
        destinationCountry: destination.trim(),
        visaType,
        targetTravelDate: targetTravelDate || null,
        passportExpiryDate: passportExpiryDate || null,
        purposeNotes: purposeNotes.trim() || undefined,
      })
      router.push(`/visa/applications/${application.id}`)
    } catch {
      setError("Unable to create the application. Please try again.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-[#1b231e]">Your nationality</span>
          <input
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-[#1b231e]">Destination country</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-[#1b231e]">Visa type</span>
          <select
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
          >
            {VISA_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-[#1b231e]">Target travel date</span>
          <input
            type="date"
            value={targetTravelDate}
            onChange={(e) => setTargetTravelDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-[#1b231e]">Passport expiry date</span>
          <input
            type="date"
            value={passportExpiryDate}
            onChange={(e) => setPassportExpiryDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium text-[#1b231e]">Purpose notes (optional)</span>
        <textarea
          value={purposeNotes}
          onChange={(e) => setPurposeNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e0511f] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#c8451a] disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Create application
      </button>
    </form>
  )
}
