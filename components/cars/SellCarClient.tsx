"use client"

import { FormEvent, useState } from "react"
import { formatGbp } from "@/lib/cars/catalog"
import { savePartExchange } from "@/lib/cars/saved"

export function SellCarClient() {
  const [reg, setReg] = useState("")
  const [mileage, setMileage] = useState("")
  const [step, setStep] = useState<"lookup" | "details" | "done">("lookup")
  const [condition, setCondition] = useState("Good")
  const [service, setService] = useState("Full")
  const [financeLeft, setFinanceLeft] = useState("No")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [estimate, setEstimate] = useState(0)

  function valueCar(e: FormEvent) {
    e.preventDefault()
    const miles = Number(mileage) || 40000
    const base = Math.max(2500, 14500 - Math.round(miles / 12))
    setEstimate(base)
    setStep("details")
  }

  function finish(e: FormEvent) {
    e.preventDefault()
    savePartExchange({
      registration: reg.toUpperCase(),
      mileage,
      condition,
      createdAt: new Date().toISOString(),
      estimate,
    })
    setStep("done")
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">What’s Your Car Worth?</h1>
      <p className="mt-2 text-[#5f655c]">
        Get an estimated valuation and use your current car towards your next one — including against UK stock or a CFR
        import.
      </p>

      {step === "lookup" && (
        <form onSubmit={valueCar} className="mt-8 space-y-4 rounded-[28px] border border-[#e4dfd5] bg-white p-5">
          <label className="block">
            <span className="text-[13px] font-bold">Registration number</span>
            <input
              required
              className={field}
              placeholder="Enter registration"
              value={reg}
              onChange={(e) => setReg(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-bold">Mileage</span>
            <input
              required
              className={field}
              placeholder="Enter mileage"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
            />
          </label>
          <button type="submit" className={cta}>
            Value My Car
          </button>
        </form>
      )}

      {step === "details" && (
        <form onSubmit={finish} className="mt-8 space-y-4 rounded-[28px] border border-[#e4dfd5] bg-white p-5">
          <p className="rounded-2xl bg-[#faf8f3] px-4 py-4 text-lg font-extrabold">
            Estimated value: {formatGbp(estimate)}
          </p>
          <label className="block">
            <span className="text-[13px] font-bold">Condition</span>
            <select className={field} value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Needs work</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[13px] font-bold">Service history</span>
            <select className={field} value={service} onChange={(e) => setService(e.target.value)}>
              <option>Full</option>
              <option>Partial</option>
              <option>None</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[13px] font-bold">Finance remaining</span>
            <select className={field} value={financeLeft} onChange={(e) => setFinanceLeft(e.target.value)}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[13px] font-bold">Name</span>
            <input required className={field} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[13px] font-bold">Email</span>
            <input required type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[13px] font-bold">Phone</span>
            <input required className={field} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <button type="submit" className={cta}>
            Get My Valuation
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="mt-8 rounded-[28px] border border-[#e4dfd5] bg-white p-6">
          <h2 className="text-xl font-extrabold">Valuation received</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#5f655c]">
            Thanks{name ? `, ${name.split(" ")[0]}` : ""}. We’ve logged {reg.toUpperCase()} at about {formatGbp(estimate)}.
            A member of the EasyMoveZone team will confirm the figure and how it can go towards your next car.
          </p>
        </div>
      )}
    </div>
  )
}

const field =
  "mt-1.5 h-12 w-full rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] px-4 text-sm outline-none focus:border-[#e0511f]/50"
const cta = "inline-flex rounded-2xl bg-[#e0511f] px-5 py-3 text-sm font-bold text-white"
