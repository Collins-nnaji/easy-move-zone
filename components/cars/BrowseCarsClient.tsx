"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { FilterGroup } from "./FilterGroup"
import {
  BODIES,
  CARS,
  COLOURS,
  filterCars,
  FUELS,
  MAKES,
  MARKETS,
  TRANSMISSIONS,
  type Car,
  type Market,
  type SortKey,
  type StockType,
} from "@/lib/cars/catalog"
import { ListingCard } from "./ListingCard"
import { CarsMoneyTools } from "./CarsMoneyTools"

const SORTS: { id: SortKey; label: string }[] = [
  { id: "recommended", label: "Relevance" },
  { id: "newest", label: "Newest year" },
  { id: "price_asc", label: "Price (low)" },
  { id: "price_desc", label: "Price (high)" },
  { id: "mileage_asc", label: "Mileage (low)" },
]

export function BrowseCarsClient({ marketplace = [] }: { marketplace?: Car[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const queryKey = params.toString()
  const [open, setOpen] = useState({ market: true, price: false, vehicle: false })

  const filters = useMemo(
    () => ({
      q: params.get("q") ?? "",
      make: params.get("make") ?? "",
      model: params.get("model") ?? "",
      minPrice: num(params.get("minPrice")),
      maxPrice: num(params.get("maxPrice")),
      maxMonthly: num(params.get("maxMonthly")),
      minYear: num(params.get("minYear")),
      maxMileage: num(params.get("maxMileage")),
      fuel: params.get("fuel") ?? "",
      transmission: params.get("transmission") ?? "",
      body: params.get("body") ?? "",
      engine: params.get("engine") ?? "",
      colour: params.get("colour") ?? "",
      stockType: (params.get("stockType") as StockType | "all" | null) ?? "all",
      origin: params.get("origin") ?? "",
      market: (params.get("market") as Market | "all" | null) ?? "all",
    }),
    [queryKey],
  )
  const sort = (params.get("sort") as SortKey) || "recommended"
  const cars = useMemo(
    () => filterCars(filters, sort, [...marketplace, ...CARS]),
    [queryKey, sort, marketplace],
  )

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (!value) next.delete(key)
    else next.set(key, value)
    router.replace(`/cars?${next.toString()}`, { scroll: false })
  }

  const filterFields = (
    <>
      <FilterGroup title="Market & stock" open={open.market} onToggle={() => setOpen((s) => ({ ...s, market: !s.market }))}>
        <div className="flex flex-wrap gap-1">
          {[{ id: "all", label: "All" }, ...MARKETS.map((m) => ({ id: m.id, label: m.short }))].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => set("market", m.id === "all" ? "" : m.id)}
              className={chip((filters.market || "all") === m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {[
            ["all", "Any stock"],
            ["uk_stock", "Local"],
            ["import", "Import"],
            ["cfr", "CFR"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => set("stockType", id === "all" ? "" : id)} className={chip((filters.stockType || "all") === id)}>
              {label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price" open={open.price} onToggle={() => setOpen((s) => ({ ...s, price: !s.price }))}>
        <select className={field} value={params.get("minPrice") ?? ""} onChange={(e) => set("minPrice", e.target.value)}>
          <option value="">Min price</option>
          <option value="5000">£5,000 / $5,000</option>
          <option value="10000">£10,000 / $10,000</option>
          <option value="20000">£20,000 / $20,000</option>
        </select>
        <select className={field} value={params.get("maxPrice") ?? ""} onChange={(e) => set("maxPrice", e.target.value)}>
          <option value="">Max price</option>
          <option value="5000">£5,000 / $5,000</option>
          <option value="10000">£10,000 / $10,000</option>
          <option value="20000">£20,000 / $20,000</option>
          <option value="35000">£35,000 / $35,000</option>
        </select>
        <select className={field} value={params.get("maxMonthly") ?? ""} onChange={(e) => set("maxMonthly", e.target.value)}>
          <option value="">Max monthly</option>
          <option value="200">£200</option>
          <option value="350">£350</option>
          <option value="500">£500</option>
          <option value="800">£800</option>
        </select>
      </FilterGroup>

      <FilterGroup title="Vehicle" open={open.vehicle} onToggle={() => setOpen((s) => ({ ...s, vehicle: !s.vehicle }))}>
        <select className={field} value={filters.make} onChange={(e) => set("make", e.target.value)}>
          <option value="">Make</option>
          {MAKES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <input className={field} placeholder="Model" value={filters.model} onChange={(e) => set("model", e.target.value)} />
        <select className={field} value={params.get("minYear") ?? ""} onChange={(e) => set("minYear", e.target.value)}>
          <option value="">Min year</option>
          <option value="2023">2023</option>
          <option value="2020">2020</option>
          <option value="2018">2018</option>
        </select>
        <select className={field} value={params.get("maxMileage") ?? ""} onChange={(e) => set("maxMileage", e.target.value)}>
          <option value="">Max mileage</option>
          <option value="20000">20,000</option>
          <option value="40000">40,000</option>
          <option value="60000">60,000</option>
        </select>
        <select className={field} value={filters.fuel} onChange={(e) => set("fuel", e.target.value)}>
          <option value="">Fuel</option>
          {FUELS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select className={field} value={filters.transmission} onChange={(e) => set("transmission", e.target.value)}>
          <option value="">Gearbox</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className={field} value={filters.body} onChange={(e) => set("body", e.target.value)}>
          <option value="">Body</option>
          {BODIES.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <select className={field} value={filters.colour} onChange={(e) => set("colour", e.target.value)}>
          <option value="">Colour</option>
          {COLOURS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input className={field} placeholder="Engine" value={filters.engine} onChange={(e) => set("engine", e.target.value)} />
        <input className={field} placeholder="Origin country" value={filters.origin} onChange={(e) => set("origin", e.target.value)} />
      </FilterGroup>
    </>
  )

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-[#6e746b]">
            <Link href="/" className="hover:text-[#e0511f]">
              Home
            </Link>{" "}
            / Cars for sale
          </p>
          <h1 className="text-xl font-extrabold tracking-tight">
            We found <span className="text-[#e0511f]">{cars.length}</span> cars
          </h1>
        </div>
        <label className="flex items-center gap-2 text-[12px] font-bold text-[#6e746b]">
          Sort
          <select className={`${field} w-auto`} value={sort} onChange={(e) => set("sort", e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:items-start">
        <aside className="flex w-full shrink-0 flex-col gap-2 md:w-[272px]">
          <CarsMoneyTools layout="sidebar" />
          <div className="rounded-xl border border-[#e4dfd5] bg-white p-2">
            <p className="px-1 pb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#9aa097]">Filter</p>
            <div className="space-y-0.5">{filterFields}</div>
          </div>
        </aside>

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          <div className="space-y-3">
            {cars.map((car) => (
              <ListingCard key={car.id} car={car} />
            ))}
            {cars.length === 0 && (
              <p className="rounded-xl border border-dashed border-[#d8d2c6] bg-white px-5 py-10 text-center text-sm text-[#6e746b]">
                No cars match. Clear a filter or try Parts and Garages.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function num(v: string | null) {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function chip(active: boolean) {
  return `rounded-md px-2 py-1 text-[11px] font-bold ${
    active ? "bg-[#e0511f] text-white" : "bg-white text-[#4a5047] ring-1 ring-[#e4dfd5]"
  }`
}

const field =
  "h-8 w-full rounded-md border border-[#e4dfd5] bg-white px-2 text-[12px] font-semibold text-[#4a5047] outline-none focus:border-[#e0511f]/50"
