"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CARS, carTitle, formatGbp, getCar } from "@/lib/cars/catalog"
import { getEnquiries, getPartExchange, getRecentIds, getSavedIds } from "@/lib/cars/saved"

export function AccountClient() {
  const [name, setName] = useState("there")
  const [saved, setSaved] = useState(0)
  const [enquiries, setEnquiries] = useState(0)
  const [px, setPx] = useState<string | null>(null)
  const [recent, setRecent] = useState<typeof CARS>([])

  useEffect(() => {
    setSaved(getSavedIds().length)
    setEnquiries(getEnquiries().length)
    const v = getPartExchange()
    setPx(v ? `${v.registration} · ${formatGbp(v.estimate)}` : null)
    setRecent(getRecentIds().map((id) => getCar(id)).filter(Boolean) as typeof CARS)
    const stored = window.localStorage.getItem("emz.displayName")
    if (stored) setName(stored)
  }, [])

  const tiles = [
    { href: "/saved", title: "My Saved Cars", text: saved ? `${saved} shortlisted` : "Cars you've shortlisted." },
    { href: "/enquire", title: "My Enquiries", text: enquiries ? `${enquiries} sent` : "See cars you've contacted EasyMoveZone about." },
    { href: "/finance", title: "My Finance Applications", text: "View the status of your applications." },
    { href: "/enquire?intent=testdrive", title: "My Test Drives", text: "View or manage upcoming bookings." },
    { href: "/sell", title: "My Part Exchange", text: px ?? "See your vehicle valuation." },
  ]

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {name}</h1>
      <p className="mt-2 text-sm text-[#5f655c]">Your car-buying hub — saved cars, enquiries, finance, and part exchange.</p>

      <div className="mt-8 grid gap-3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-3xl border border-[#e4dfd5] bg-white px-5 py-4 transition hover:border-[#e0511f]/40">
            <span className="block font-extrabold">{t.title}</span>
            <span className="text-sm text-[#6e746b]">{t.text}</span>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-extrabold">Recently Viewed</h2>
      <p className="text-sm text-[#6e746b]">Quickly return to vehicles you&apos;ve looked at.</p>
      <ul className="mt-4 space-y-2">
        {recent.length === 0 && <li className="text-sm text-[#9aa097]">Nothing viewed yet.</li>}
        {recent.map((car) => (
          <li key={car.id}>
            <Link href={`/cars/${car.id}`} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold">
              {carTitle(car)}
              <span className="text-[#e0511f]">{formatGbp(car.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
