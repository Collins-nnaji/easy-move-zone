"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Check, MapPin, Ship, Star } from "lucide-react"
import {
  carTitle,
  formatGbp,
  formatMiles,
  listingOf,
  SHIPPING_LABELS,
  similarCars,
  STOCK_LABELS,
  type Car,
} from "@/lib/cars/catalog"
import { GARAGES } from "@/lib/cars/garages"
import { PARTS } from "@/lib/cars/parts"
import { pushRecentId } from "@/lib/cars/saved"
import { SaveButton } from "./SaveButton"
import { ListingCard } from "./ListingCard"
import { CarsMoneyTools } from "./CarsMoneyTools"
import { FilterGroup } from "./FilterGroup"

export function CarDetailsClient({ car }: { car: Car }) {
  const [photo, setPhoto] = useState(0)
  const [open, setOpen] = useState({ overview: false, features: false, history: false })
  const importCar = car.stockType !== "uk_stock"
  const meta = listingOf(car)
  const similar = similarCars(car)
  const nearby = GARAGES.filter((g) => meta.location.includes(g.city) || g.services.includes("Servicing")).slice(0, 2)
  const relatedParts = PARTS.filter(
    (p) => p.fitment.toLowerCase().includes(car.make.toLowerCase()) || p.fitment.toLowerCase().includes(car.model.toLowerCase()),
  ).slice(0, 3)

  useEffect(() => {
    pushRecentId(car.id)
  }, [car.id])

  const overview = [
    ["Year", String(car.year)],
    ["Mileage", formatMiles(car.mileage)],
    ["Fuel", car.fuel],
    ["Gearbox", car.transmission],
    ["Engine", car.engine],
    ["Body", car.body],
    ["Colour", car.colour],
    ["Doors", String(car.doors)],
    ["Seats", String(car.seats)],
  ]

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-3 sm:px-6 lg:px-8">
      <p className="shrink-0 text-[11px] font-semibold text-[#6e746b]">
        <Link href="/cars" className="hover:text-[#e0511f]">
          Cars
        </Link>{" "}
        / {car.make} / {carTitle(car)}
      </p>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:items-start">
        <aside className="flex w-full shrink-0 flex-col gap-2 md:w-[272px]">
          <div className="rounded-xl border border-[#e4dfd5] bg-white px-2.5 py-2">
            <p className="text-lg font-extrabold leading-none">{formatGbp(car.price)}</p>
            <p className="mt-0.5 text-[12px] font-semibold text-[#e0511f]">or £{car.monthlyFrom}/month</p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#6e746b]">
              <MapPin className="h-3 w-3" />
              {meta.location}
            </p>
            <div className="mt-2 grid gap-1.5">
              <Link href={`/enquire?car=${car.id}&intent=ask`} className={primaryBtn}>
                Message seller
              </Link>
              <Link href={`/enquire?car=${car.id}&intent=testdrive`} className={secondaryBtn}>
                Book a viewing
              </Link>
              <SaveButton carId={car.id} variant="label" />
            </div>
          </div>

          <CarsMoneyTools defaultPrice={car.price} layout="sidebar" />

          <div className="rounded-xl border border-[#e4dfd5] bg-white p-2">
            <p className="px-1 pb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#9aa097]">Details</p>
            <div className="space-y-0.5">
              <FilterGroup title="Overview" open={open.overview} onToggle={() => setOpen((s) => ({ ...s, overview: !s.overview }))}>
                {overview.map(([k, v]) => (
                  <Row key={k} label={k} value={v} />
                ))}
              </FilterGroup>
              <FilterGroup title="Features" open={open.features} onToggle={() => setOpen((s) => ({ ...s, features: !s.features }))}>
                {car.features.map((f) => (
                  <p key={f} className="flex items-center gap-1.5 text-[12px] font-semibold">
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#e0511f]" />
                    {f}
                  </p>
                ))}
              </FilterGroup>
              <FilterGroup title="History" open={open.history} onToggle={() => setOpen((s) => ({ ...s, history: !s.history }))}>
                <Row label="HPI" value={car.history.hpi} />
                <Row label="MOT" value={car.history.mot} />
                <Row label="Service" value={car.history.service} />
                <Row label="Owners" value={String(car.history.owners)} />
              </FilterGroup>
            </div>
            <div className="mt-2 rounded-lg bg-[#faf8f3] px-2.5 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#9aa097]">{meta.sellerType}</p>
              <p className="text-[13px] font-extrabold">{meta.seller}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {meta.rating} · {meta.reviewCount}
              </p>
            </div>
          </div>
        </aside>

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          <div className="overflow-hidden rounded-xl bg-[#1b231e]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={car.photos[photo] || "/Najville 1.png"} alt={carTitle(car)} className="aspect-[16/9] w-full object-cover" />
          </div>
          {car.photos.length > 1 && (
            <div className="scrollbar-none mt-2 flex gap-2 overflow-x-auto">
              {car.photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setPhoto(i)}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-md ring-2 ${i === photo ? "ring-[#e0511f]" : "ring-transparent"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {meta.priceRating && (
              <span className="rounded bg-[#12833b] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                {meta.priceRating}
              </span>
            )}
            <span className="rounded bg-[#1b231e] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              {STOCK_LABELS[car.stockType]}
            </span>
            {importCar && (
              <span className="inline-flex items-center gap-1 rounded bg-[#fbeae0] px-2 py-0.5 text-[10px] font-bold text-[#e0511f]">
                <Ship className="h-3 w-3" />
                {SHIPPING_LABELS[car.shippingStatus]}
                {car.incoterm ? ` · ${car.incoterm}` : ""}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{carTitle(car)}</h1>
          <p className="mt-1 text-[13px] text-[#5f655c]">
            {formatMiles(car.mileage)} · {car.transmission} · {car.fuel} · {car.body}
          </p>

          {importCar && (
            <div className="mt-4 rounded-xl border border-[#e4dfd5] bg-white p-4">
              <h2 className="font-extrabold">Import & shipping</h2>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                <Row label="Origin" value={car.originCountry} />
                <Row label="Incoterm" value={car.incoterm ?? "—"} />
                <Row label="From" value={car.originPort ?? "—"} />
                <Row label="To" value={car.destinationPort ?? "—"} />
                <Row label="Status" value={SHIPPING_LABELS[car.shippingStatus]} />
                <Row label="ETA" value={car.eta ?? "—"} />
              </dl>
              {car.trackingRef && (
                <Link href={`/track?ref=${car.trackingRef}`} className="mt-2 inline-flex text-sm font-bold text-[#e0511f]">
                  Track this shipment
                </Link>
              )}
            </div>
          )}

          <section className="mt-5">
            <h2 className="text-lg font-extrabold">Seller description</h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#5f655c]">{car.description}</p>
          </section>

          {relatedParts.length > 0 && (
            <section className="mt-5">
              <h2 className="text-lg font-extrabold">Parts that fit</h2>
              <ul className="mt-3 space-y-2">
                {relatedParts.map((p) => (
                  <li key={p.id}>
                    <Link href={`/parts/${p.id}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-sm font-semibold">
                      {p.name}
                      <span className="text-[#e0511f]">£{p.price}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-5">
            <h2 className="text-lg font-extrabold">Book a garage</h2>
            <p className="text-[13px] text-[#6e746b]">MOT, tyres or a health check after you buy.</p>
            <div className="mt-3 grid gap-2">
              {nearby.map((g) => (
                <Link key={g.id} href={`/garages/${g.id}`} className="flex items-center justify-between rounded-lg border border-[#e4dfd5] bg-white px-3 py-3">
                  <span>
                    <span className="block text-sm font-extrabold">{g.name}</span>
                    <span className="text-[12px] text-[#6e746b]">
                      {g.area}, {g.city} · {g.services.slice(0, 3).join(", ")}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {g.rating}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {similar.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-extrabold">Similar cars</h2>
              <div className="mt-3 space-y-3">
                {similar.map((c) => (
                  <ListingCard key={c.id} car={c} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[11px] text-[#6e746b]">{label}</dt>
      <dd className="text-right text-[11px] font-bold">{value}</dd>
    </div>
  )
}

const primaryBtn = "inline-flex items-center justify-center rounded-md bg-[#e0511f] px-3 py-1.5 text-[12px] font-bold text-white"
const secondaryBtn =
  "inline-flex items-center justify-center rounded-md border border-[#d8d2c6] bg-white px-3 py-1.5 text-[12px] font-semibold"
