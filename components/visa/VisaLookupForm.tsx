"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

const VISA_TYPES = [
  { value: "tourist", label: "Tourist / visitor" },
  { value: "student", label: "Student" },
  { value: "work", label: "Work" },
  { value: "skilled_worker", label: "Skilled worker" },
  { value: "family", label: "Family / spouse" },
  { value: "business", label: "Business" },
  { value: "digital_nomad", label: "Digital nomad" },
  { value: "transit", label: "Transit" },
]

export function VisaLookupForm({ initialNationality = "", initialDestination = "", initialVisaType = "" }: {
  initialNationality?: string
  initialDestination?: string
  initialVisaType?: string
}) {
  const router = useRouter()
  const [nationality, setNationality] = useState(initialNationality)
  const [destination, setDestination] = useState(initialDestination)
  const [visaType, setVisaType] = useState(initialVisaType || VISA_TYPES[0].value)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nationality.trim() || !destination.trim()) return
    const params = new URLSearchParams({
      nationality: nationality.trim(),
      destination: destination.trim(),
      visaType,
    })
    router.push(`/visa/requirements?${params}`)
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm sm:grid-cols-2">
      <label className="block text-sm">
        <span className="font-medium text-[#1b231e]">Your nationality</span>
        <input
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          placeholder="e.g. Nigeria"
          required
          className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm text-[#1b231e] outline-none focus:border-[#e0511f]"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-[#1b231e]">Destination country</span>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. United Kingdom"
          required
          className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm text-[#1b231e] outline-none focus:border-[#e0511f]"
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="font-medium text-[#1b231e]">Visa type</span>
        <select
          value={visaType}
          onChange={(e) => setVisaType(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm text-[#1b231e] outline-none focus:border-[#e0511f]"
        >
          {VISA_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e0511f] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#c8451a] sm:col-span-2"
      >
        <Search className="h-4 w-4" /> Look up requirements
      </button>
    </form>
  )
}

export { VISA_TYPES }
