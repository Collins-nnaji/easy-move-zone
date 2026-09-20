"use client"

import Link from "next/link"
import { Ship } from "lucide-react"
import {
  carTitle,
  formatGbp,
  formatMiles,
  SHIPPING_LABELS,
  STOCK_LABELS,
  type Car,
} from "@/lib/cars/catalog"
import { SaveButton } from "./SaveButton"

export function VehicleCard({ car }: { car: Car }) {
  const importCar = car.stockType !== "uk_stock"

  return (
    <article className="group overflow-hidden rounded-3xl border border-[#e4dfd5] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#efece4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={car.photos[0]}
          alt={carTitle(car)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#1b231e]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            {STOCK_LABELS[car.stockType]}
          </span>
          {importCar && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#4a5047]">
              <Ship className="h-3 w-3 text-[#e0511f]" />
              {SHIPPING_LABELS[car.shippingStatus]}
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <SaveButton carId={car.id} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-[15px] font-extrabold leading-snug tracking-tight">{carTitle(car)}</h3>
        <p className="mt-1 text-[12px] text-[#6e746b]">
          {formatMiles(car.mileage)} · {car.transmission} · {car.fuel}
          {importCar ? ` · ${car.originCountry}` : ""}
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-extrabold">{formatGbp(car.price)}</p>
            <p className="text-[12px] font-semibold text-[#e0511f]">From {formatGbp(car.monthlyFrom)}/month</p>
          </div>
          <Link
            href={`/cars/${car.id}`}
            className="inline-flex items-center rounded-full bg-[#e0511f] px-4 py-2 text-[12px] font-bold text-white transition hover:opacity-90"
          >
            View Car
          </Link>
        </div>
      </div>
    </article>
  )
}
