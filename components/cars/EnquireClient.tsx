"use client"

import { FormEvent, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { carTitle, getCar } from "@/lib/cars/catalog"
import { getPart } from "@/lib/cars/parts"
import { getGarage } from "@/lib/cars/garages"
import { addEnquiry } from "@/lib/cars/saved"

const INTENTS = [
  { id: "testdrive", label: "Book a viewing / test drive" },
  { id: "ask", label: "Ask a question" },
  { id: "finance", label: "Discuss finance" },
  { id: "px", label: "Part exchange my car" },
  { id: "import", label: "Ask about this import / CFR" },
  { id: "fitting", label: "Book parts fitting" },
  { id: "repair", label: "Book a garage job" },
] as const

export function EnquireClient() {
  const params = useSearchParams()
  const car = getCar(params.get("car") ?? "")
  const part = getPart(params.get("part") ?? "")
  const garage = getGarage(params.get("garage") ?? "")
  const [intent, setIntent] = useState(
    params.get("intent") || (garage ? "repair" : part ? "fitting" : "ask"),
  )
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [method, setMethod] = useState("Phone")
  const [done, setDone] = useState(false)

  const heading = useMemo(() => {
    if (garage) return "Book this garage"
    if (part) return "Interested in this part?"
    if (car) return "Interested in this vehicle?"
    return "Send an enquiry"
  }, [car, part, garage])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    addEnquiry({
      id: crypto.randomUUID(),
      carId: car?.id,
      intent,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
    })
    setDone(true)
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">Thanks, {firstName}.</h1>
        <p className="mt-3 text-[#5f655c]">We&apos;ve received your enquiry.</p>
        <p className="mt-2 text-sm text-[#5f655c]">A member of the EasyMoveZone team will be in touch shortly.</p>
        <Link href="/cars" className="mt-6 inline-flex rounded-2xl bg-[#e0511f] px-5 py-3 text-sm font-bold text-white">
          Keep browsing
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{heading}</h1>
      {car && <p className="mt-2 font-semibold text-[#e0511f]">{carTitle(car)}</p>}
      {part && <p className="mt-2 font-semibold text-[#e0511f]">{part.name}</p>}
      {garage && <p className="mt-2 font-semibold text-[#e0511f]">{garage.name}</p>}
      <p className="mt-2 text-sm text-[#5f655c]">Choose what you&apos;d like to do:</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-2">
          {INTENTS.map((item) => (
            <label
              key={item.id}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                intent === item.id ? "border-[#e0511f] bg-[#fbeae0]" : "border-[#e4dfd5] bg-white"
              }`}
            >
              <input
                type="radio"
                name="intent"
                checked={intent === item.id}
                onChange={() => setIntent(item.id)}
              />
              {item.label}
            </label>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required className={field} placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input required className={field} placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <input required className={field} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input required type="email" className={field} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select className={field} value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>Phone</option>
          <option>Email</option>
          <option>WhatsApp</option>
        </select>
        <button type="submit" className="w-full rounded-2xl bg-[#e0511f] py-3 text-sm font-bold text-white">
          Send Enquiry
        </button>
      </form>
    </div>
  )
}

const field =
  "h-12 w-full rounded-2xl border border-[#e4dfd5] bg-white px-4 text-sm outline-none focus:border-[#e0511f]/50"
