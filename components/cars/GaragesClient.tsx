"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Star } from "lucide-react"
import {
  filterGarages,
  GARAGE_CITIES,
  GARAGE_SERVICES,
  GARAGES,
  getGarage,
  type Garage,
} from "@/lib/cars/garages"
import { FilterGroup } from "./FilterGroup"

function osmEmbed(garage: Garage, others: Garage[]) {
  const lats = [garage.lat, ...others.map((g) => g.lat)]
  const lngs = [garage.lng, ...others.map((g) => g.lng)]
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const padLat = Math.max((maxLat - minLat) * 0.35, 0.08)
  const padLng = Math.max((maxLng - minLng) * 0.35, 0.12)
  const bbox = `${minLng - padLng}%2C${minLat - padLat}%2C${maxLng + padLng}%2C${maxLat + padLat}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${garage.lat}%2C${garage.lng}`
}

export function GaragesBrowseClient() {
  const params = useSearchParams()
  const router = useRouter()
  const q = params.get("q") ?? ""
  const service = params.get("service") ?? ""
  const city = params.get("city") ?? ""
  const list = filterGarages({ q, service, city })
  const [selectedId, setSelectedId] = useState(list[0]?.id ?? "")
  const [open, setOpen] = useState({ search: true, place: false })
  const selected = list.find((g) => g.id === selectedId) ?? list[0] ?? null

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (!value) next.delete(key)
    else next.set(key, value)
    router.replace(`/garages?${next.toString()}`, { scroll: false })
  }

  const mapSrc = useMemo(() => {
    if (!selected) return ""
    return osmEmbed(selected, list)
  }, [selected, list])

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-3 sm:px-6 lg:px-8">
      <div className="shrink-0">
        <p className="text-[11px] font-semibold text-[#6e746b]">
          <Link href="/" className="hover:text-[#e0511f]">
            Home
          </Link>{" "}
          / Garages
        </p>
        <h1 className="text-xl font-extrabold">Find a garage on the map</h1>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:items-start">
        <aside className="flex w-full shrink-0 flex-col gap-2 md:w-[272px]">
          <div className="rounded-xl border border-[#e4dfd5] bg-white p-2">
            <p className="px-1 pb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#9aa097]">Filter</p>
            <div className="space-y-0.5">
              <FilterGroup title="Search" open={open.search} onToggle={() => setOpen((s) => ({ ...s, search: !s.search }))}>
                <input className={field} placeholder="Name or area" defaultValue={q} onChange={(e) => set("q", e.target.value)} />
              </FilterGroup>
              <FilterGroup title="Place & service" open={open.place} onToggle={() => setOpen((s) => ({ ...s, place: !s.place }))}>
                <select className={field} value={service} onChange={(e) => set("service", e.target.value)}>
                  <option value="">Any service</option>
                  {GARAGE_SERVICES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select className={field} value={city} onChange={(e) => set("city", e.target.value)}>
                  <option value="">Any city</option>
                  {GARAGE_CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </FilterGroup>
            </div>
          </div>
        </aside>

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          {selected && mapSrc ? (
            <div className="overflow-hidden rounded-xl border border-[#e4dfd5] bg-white">
              <iframe title="Garage map" src={mapSrc} className="h-[280px] w-full border-0 md:h-[360px]" loading="lazy" />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e4dfd5] p-3">
                <div>
                  <p className="font-extrabold">{selected.name}</p>
                  <p className="text-[12px] text-[#6e746b]">
                    {selected.area}, {selected.city} · {selected.open}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=14/${selected.lat}/${selected.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[#d8d2c6] px-3 py-2 text-[12px] font-bold"
                  >
                    Larger map
                  </a>
                  <Link href={`/garages/${selected.id}`} className="rounded-lg bg-[#e0511f] px-3 py-2 text-[12px] font-bold text-white">
                    Reviews & book
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d8d2c6] bg-white px-5 py-10 text-center text-sm text-[#6e746b]">
              No garages match those filters.
            </p>
          )}

          <ul className="mt-3 space-y-2">
            {list.map((g) => {
              const active = selected?.id === g.id
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(g.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      active ? "border-[#e0511f] bg-[#fbeae0]" : "border-[#e4dfd5] bg-white hover:border-[#e0511f]/40"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-extrabold">{g.name}</span>
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {g.rating}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[12px] text-[#6e746b]">
                      <MapPin className="h-3 w-3" />
                      {g.area}, {g.city} {g.postcode}
                    </span>
                    <span className="mt-1 block text-[11px] text-[#5f655c]">{g.services.join(" · ")}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function GarageDetailsClient({ id }: { id: string }) {
  const garage = getGarage(id)
  const [open, setOpen] = useState({ services: true, hours: false })
  if (!garage) return null
  const mapSrc = osmEmbed(garage, [garage])
  const nearby = GARAGES.filter((g) => g.id !== garage.id && g.city === garage.city).slice(0, 4)

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-3 sm:px-6 lg:px-8">
      <p className="shrink-0 text-[11px] font-semibold text-[#6e746b]">
        <Link href="/garages" className="hover:text-[#e0511f]">
          Garages
        </Link>{" "}
        / {garage.name}
      </p>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:items-start">
        <aside className="flex w-full shrink-0 flex-col gap-2 md:w-[272px]">
          <div className="rounded-xl border border-[#e4dfd5] bg-white px-2.5 py-2">
            <p className="text-[15px] font-extrabold leading-tight">{garage.name}</p>
            <p className="mt-0.5 text-[11px] text-[#6e746b]">
              {garage.area}, {garage.city} {garage.postcode}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {garage.rating} · {garage.reviewCount} reviews
            </p>
            <div className="mt-2 grid gap-1.5">
              <Link href={`/enquire?garage=${garage.id}&intent=repair`} className="inline-flex items-center justify-center rounded-md bg-[#e0511f] px-3 py-1.5 text-[12px] font-bold text-white">
                Book a job
              </Link>
              <a href={`tel:${garage.phone}`} className="inline-flex items-center justify-center rounded-md border border-[#d8d2c6] bg-white px-3 py-1.5 text-[12px] font-semibold">
                {garage.phone}
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-[#e4dfd5] bg-white p-2">
            <p className="px-1 pb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#9aa097]">Garage</p>
            <div className="space-y-0.5">
              <FilterGroup title="Services" open={open.services} onToggle={() => setOpen((s) => ({ ...s, services: !s.services }))}>
                {garage.services.map((s) => (
                  <p key={s} className="text-[12px] font-semibold">
                    {s}
                  </p>
                ))}
              </FilterGroup>
              <FilterGroup title="Hours & area" open={open.hours} onToggle={() => setOpen((s) => ({ ...s, hours: !s.hours }))}>
                <p className="text-[12px] font-semibold">{garage.open}</p>
                <p className="text-[12px] text-[#6e746b]">
                  {garage.area}, {garage.city}
                </p>
              </FilterGroup>
            </div>
          </div>
        </aside>

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          <div className="overflow-hidden rounded-xl border border-[#e4dfd5] bg-white">
            <iframe title={`${garage.name} map`} src={mapSrc} className="h-[280px] w-full border-0 md:h-[360px]" loading="lazy" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{garage.name}</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#5f655c]">{garage.about}</p>

          <h2 className="mt-6 text-lg font-extrabold">Reviews</h2>
          <ul className="mt-3 space-y-3">
            {garage.reviews.map((r) => (
              <li key={r.author + r.date} className="rounded-xl border border-[#e4dfd5] bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-extrabold">{r.author}</p>
                  <p className="text-[12px] text-[#9aa097]">{r.date}</p>
                </div>
                <p className="mt-1 text-[13px] font-bold">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
                <p className="mt-2 text-sm text-[#5f655c]">{r.text}</p>
              </li>
            ))}
          </ul>

          {nearby.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-extrabold">Nearby garages</h2>
              <ul className="mt-3 space-y-2">
                {nearby.map((g) => (
                  <li key={g.id}>
                    <Link href={`/garages/${g.id}`} className="flex items-center justify-between rounded-xl border border-[#e4dfd5] bg-white px-3 py-3">
                      <span>
                        <span className="block text-sm font-extrabold">{g.name}</span>
                        <span className="text-[12px] text-[#6e746b]">
                          {g.area} · {g.services.slice(0, 2).join(", ")}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {g.rating}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-6 text-sm">
            Need tyres first?{" "}
            <Link href="/parts?category=Tyres" className="font-bold text-[#e0511f]">
              Shop parts
            </Link>
            {" · "}
            <Link href="/cars" className="font-bold text-[#e0511f]">
              Back to cars
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const field =
  "h-8 w-full rounded-md border border-[#e4dfd5] bg-white px-2 text-[12px] font-semibold text-[#4a5047] outline-none focus:border-[#e0511f]/50"
