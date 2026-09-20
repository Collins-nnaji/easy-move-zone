"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { estimateMonthly, formatGbp } from "@/lib/cars/catalog"

const steps = [
  { n: "1", title: "Choose your car", text: "Find a vehicle you love — UK stock or an import." },
  { n: "2", title: "Tell us about yourself", text: "Complete a simple finance application." },
  { n: "3", title: "Review your options", text: "See the finance options available to you." },
  { n: "4", title: "Get your car", text: "Complete the purchase and arrange collection or delivery." },
]

export function FinanceClient() {
  const [price, setPrice] = useState(18995)
  const [deposit, setDeposit] = useState(2000)
  const [term, setTerm] = useState(48)
  const monthly = useMemo(() => estimateMonthly(price, deposit, term), [price, deposit, term])

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Car Finance Made Simple</h1>
      <p className="mt-2 text-[#5f655c]">Find a finance option that works with your budget.</p>

      <form className="mt-8 space-y-4 rounded-[28px] border border-[#e4dfd5] bg-white p-5 sm:p-6">
        <label className="block">
          <span className="text-[13px] font-bold">Car price</span>
          <input className={field} type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="text-[13px] font-bold">Deposit</span>
          <input className={field} type="number" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="text-[13px] font-bold">Term</span>
          <select className={field} value={term} onChange={(e) => setTerm(Number(e.target.value))}>
            <option value={24}>24 months</option>
            <option value={36}>36 months</option>
            <option value={48}>48 months</option>
            <option value={60}>60 months</option>
          </select>
        </label>
        <p className="rounded-2xl bg-[#faf8f3] px-4 py-4 text-lg font-extrabold">
          Estimated monthly payment: {formatGbp(Math.round(monthly))} / month
        </p>
        <p className="text-[12px] text-[#9aa097]">Representative example only. Subject to status. 9.9% APR illustration.</p>
        <Link href="/enquire?intent=finance" className="inline-flex rounded-2xl bg-[#e0511f] px-5 py-3 text-sm font-bold text-white">
          Check My Finance Options
        </Link>
      </form>

      <ol className="mt-10 space-y-4">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-4 rounded-3xl border border-[#e4dfd5] bg-white p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0511f] text-sm font-extrabold text-white">
              {s.n}
            </span>
            <span>
              <span className="block font-extrabold">{s.title}</span>
              <span className="text-sm text-[#5f655c]">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

const field =
  "mt-1.5 h-12 w-full rounded-2xl border border-[#e4dfd5] bg-[#faf8f3] px-4 text-sm outline-none focus:border-[#e0511f]/50"
