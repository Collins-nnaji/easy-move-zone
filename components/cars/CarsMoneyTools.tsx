"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { estimateMonthly, formatGbp } from "@/lib/cars/catalog"
import { savePartExchange } from "@/lib/cars/saved"

export function CarsMoneyTools({
  defaultPrice = 18995,
  layout = "wide",
}: {
  defaultPrice?: number
  layout?: "wide" | "sidebar"
}) {
  const [price, setPrice] = useState(defaultPrice)
  const [deposit, setDeposit] = useState(2000)
  const [term, setTerm] = useState(48)
  const monthly = useMemo(() => estimateMonthly(price, deposit, term), [price, deposit, term])

  const [reg, setReg] = useState("")
  const [mileage, setMileage] = useState("")
  const [pxDone, setPxDone] = useState<number | null>(null)

  function onPx(e: FormEvent) {
    e.preventDefault()
    const miles = Number(mileage) || 40000
    const estimate = Math.max(2500, 14500 - Math.round(miles / 12))
    savePartExchange({
      registration: reg.toUpperCase(),
      mileage,
      condition: "Good",
      createdAt: new Date().toISOString(),
      estimate,
    })
    setPxDone(estimate)
  }

  const compact = layout === "sidebar"

  return (
    <div className={compact ? "space-y-2" : "mt-5 grid gap-3 lg:grid-cols-2"}>
      <section id="finance" className={`scroll-mt-16 rounded-xl border border-[#e4dfd5] bg-white ${compact ? "px-2.5 py-2" : "p-4"}`}>
        <div className={`flex items-baseline justify-between gap-2 ${compact ? "" : "block"}`}>
          <h2 className={`font-extrabold ${compact ? "text-[12px]" : "text-sm"}`}>Finance</h2>
          <p className={`font-extrabold text-[#e0511f] ${compact ? "text-[13px]" : "mt-3 text-lg"}`}>
            {formatGbp(Math.round(monthly))}
            <span className="font-semibold text-[#6e746b]">/mo</span>
          </p>
        </div>
        {!compact && <p className="mt-0.5 text-[12px] text-[#6e746b]">Estimate a monthly figure without leaving the cars page.</p>}
        <div className={`grid grid-cols-3 gap-1.5 ${compact ? "mt-1.5" : "mt-3 gap-2"}`}>
          <label className="text-[10px] font-bold leading-tight">
            Price
            <input className={compact ? fieldSm : field} type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </label>
          <label className="text-[10px] font-bold leading-tight">
            Deposit
            <input className={compact ? fieldSm : field} type="number" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
          </label>
          <label className="text-[10px] font-bold leading-tight">
            Term
            <select className={compact ? fieldSm : field} value={term} onChange={(e) => setTerm(Number(e.target.value))}>
              <option value={24}>24</option>
              <option value={36}>36</option>
              <option value={48}>48</option>
              <option value={60}>60</option>
            </select>
          </label>
        </div>
        {!compact && <p className="text-[11px] text-[#9aa097]">Illustration at 9.9% APR. Subject to status.</p>}
        <div className={`flex flex-wrap gap-1.5 ${compact ? "mt-1.5" : "mt-3 gap-2"}`}>
          <Link
            href="/enquire?intent=finance"
            className={`inline-flex font-bold text-white ${compact ? "rounded-md bg-[#e0511f] px-2 py-1 text-[10px]" : "rounded-lg bg-[#e0511f] px-3 py-2 text-[12px]"}`}
          >
            Apply
          </Link>
          {!compact && (
            <Link href="/account#sell" className="inline-flex rounded-lg border border-[#e4dfd5] px-3 py-2 text-[12px] font-bold">
              List a car for sale
            </Link>
          )}
        </div>
      </section>

      <section id="part-exchange" className={`scroll-mt-16 rounded-xl border border-[#e4dfd5] bg-white ${compact ? "px-2.5 py-2" : "p-4"}`}>
        <h2 className={`font-extrabold ${compact ? "text-[12px]" : "text-sm"}`}>Part-exchange</h2>
        {!compact && <p className="mt-0.5 text-[12px] text-[#6e746b]">Put what you drive now towards one of the cars below.</p>}
        {pxDone == null ? (
          <form onSubmit={onPx} className={`grid grid-cols-2 ${compact ? "mt-1.5 gap-1.5" : "mt-3 gap-2"}`}>
            <input required className={compact ? fieldSm : field} placeholder="Reg" value={reg} onChange={(e) => setReg(e.target.value)} />
            <input required className={compact ? fieldSm : field} placeholder="Miles" value={mileage} onChange={(e) => setMileage(e.target.value)} />
            <button
              type="submit"
              className={`col-span-2 bg-[#1b231e] font-bold text-white ${compact ? "rounded-md py-1 text-[10px]" : "rounded-lg py-2 text-[12px]"}`}
            >
              Value my car
            </button>
          </form>
        ) : (
          <p className={`font-semibold ${compact ? "mt-1 text-[11px]" : "mt-3 text-sm"}`}>
            Estimate {formatGbp(pxDone)} for {reg.toUpperCase()}.
          </p>
        )}
      </section>
    </div>
  )
}

const field = "mt-1 h-10 w-full rounded-lg border border-[#e4dfd5] bg-[#faf8f3] px-3 text-[13px] font-semibold outline-none"
const fieldSm = "mt-0.5 h-8 w-full rounded-md border border-[#e4dfd5] bg-[#faf8f3] px-2 text-[12px] font-semibold outline-none"
