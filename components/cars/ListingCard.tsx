"use client"

import Link from "next/link"
import { MapPin, Star } from "lucide-react"
import {
  carTitle,
  formatGbp,
  formatMiles,
  listingOf,
  STOCK_LABELS,
  type Car,
} from "@/lib/cars/catalog"
import { SaveButton } from "./SaveButton"

export function ListingCard({ car }: { car: Car }) {
  const meta = listingOf(car)

  return (
    <article className="relative shrink-0 overflow-hidden rounded-xl border border-[#e4dfd5] bg-white shadow-[0_1px_2px_rgba(0,0,0,.04)] transition hover:shadow-md">
      <div className="absolute right-3 top-3 z-10">
        <SaveButton carId={car.id} />
      </div>
      <Link href={`/cars/${car.id}`} className="grid sm:grid-cols-[240px_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:h-[168px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={car.photos[0] || "/Najville 1.png"} alt={carTitle(car)} className="h-full w-full object-cover" />
          {meta.priceRating && (
            <span className="absolute left-2 top-2 rounded bg-[#12833b] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
              {meta.priceRating}
            </span>
          )}
        </div>
        <div className="relative flex flex-col p-3.5 sm:p-4">
          <h3 className="pr-12 text-[15px] font-extrabold leading-snug tracking-tight">{carTitle(car)}</h3>
          <p className="mt-1 text-[12px] text-[#5f655c]">
            {formatMiles(car.mileage)} · {car.transmission} · {car.fuel} · {car.body} · {car.engine}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-[#efece4] px-1.5 py-0.5 text-[10px] font-bold text-[#4a5047]">
              {STOCK_LABELS[car.stockType]}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#6e746b]">
              <MapPin className="h-3 w-3" />
              {meta.location}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#6e746b]">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {meta.rating} ({meta.reviewCount})
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold leading-none">{formatGbp(car.price)}</p>
              <p className="mt-1 text-[12px] font-semibold text-[#e0511f]">£{car.monthlyFrom}/mo</p>
            </div>
            <p className="text-right text-[11px] text-[#6e746b]">
              {meta.sellerType}
              <span className="block font-semibold text-[#1b231e]">{meta.seller}</span>
            </p>
          </div>
        </div>
      </Link>
    </article>
  )
}
