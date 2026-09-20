"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CARS, carTitle, formatGbp, formatMiles } from "@/lib/cars/catalog"
import { getSavedIds } from "@/lib/cars/saved"
import { ListingCard } from "./ListingCard"

export function SavedCarsClient() {
  const [ids, setIds] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setIds(getSavedIds())
    sync()
    window.addEventListener("emz-saved-cars", sync)
    return () => window.removeEventListener("emz-saved-cars", sync)
  }, [])

  const cars = useMemo(() => ids.map((id) => CARS.find((c) => c.id === id)).filter(Boolean), [ids])
  const compare = cars.filter((c) => c && selected.includes(c.id)) as typeof CARS

  function toggle(id: string) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 2 ? [cur[1], id] : [...cur, id]))
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Your Saved Cars</h1>
      <p className="mt-2 max-w-xl text-[#5f655c]">
        Keep track of the cars you&apos;re interested in and compare them before making your decision.
      </p>

      {cars.length === 0 ? (
        <p className="mt-10 text-sm text-[#6e746b]">
          No saved cars yet.{" "}
          <Link href="/cars" className="font-bold text-[#e0511f]">
            Browse cars
          </Link>
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={selected.length < 2}
              className="rounded-2xl bg-[#e0511f] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              Compare Cars
            </button>
            <p className="text-[12px] text-[#9aa097]">Select two cars to compare.</p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) =>
              car ? (
                <div key={car.id} className="relative">
                  <label className="absolute left-3 bottom-3 z-10 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold shadow-sm">
                    <input type="checkbox" checked={selected.includes(car.id)} onChange={() => toggle(car.id)} />
                    Compare
                  </label>
                  <ListingCard car={car} />
                </div>
              ) : null,
            )}
          </div>
        </>
      )}

      {compare.length === 2 && (
        <div className="mt-10 overflow-x-auto rounded-3xl border border-[#e4dfd5] bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#efe9dd] text-left">
                <th className="px-4 py-3" />
                {compare.map((c) => (
                  <th key={c.id} className="px-4 py-3 font-extrabold">
                    {carTitle(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Price", ...compare.map((c) => formatGbp(c.price))],
                ["Monthly", ...compare.map((c) => `${formatGbp(c.monthlyFrom)}`)],
                ["Year", ...compare.map((c) => String(c.year))],
                ["Mileage", ...compare.map((c) => formatMiles(c.mileage))],
                ["Fuel", ...compare.map((c) => c.fuel)],
                ["Transmission", ...compare.map((c) => c.transmission)],
                ["Origin", ...compare.map((c) => (c.stockType === "uk_stock" ? "UK stock" : `${c.incoterm ?? "Import"} · ${c.originCountry}`))],
              ].map(([label, a, b]) => (
                <tr key={String(label)} className="border-t border-[#f3eee4]">
                  <td className="px-4 py-3 font-semibold text-[#6e746b]">{label}</td>
                  <td className="px-4 py-3 font-bold">{a}</td>
                  <td className="px-4 py-3 font-bold">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
