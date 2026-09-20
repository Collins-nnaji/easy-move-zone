"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth/client"
import { CARS, carTitle, formatGbp, getCar } from "@/lib/cars/catalog"
import {
  getEnquiries,
  getMyVehicle,
  getRecentIds,
  getSavedIds,
  saveMyVehicle,
  type MyVehicle,
} from "@/lib/cars/saved"
import { ListingCard } from "./ListingCard"
import { SellListingForm } from "./SellListingForm"

const emptyCar: MyVehicle = {
  registration: "",
  make: "",
  model: "",
  year: "",
  mileage: "",
  fuel: "Petrol",
  colour: "",
  motDue: "",
  notes: "",
}

export function CarDashboardClient() {
  const { data, isPending } = authClient.useSession()
  const user = data?.user
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [recent, setRecent] = useState<typeof CARS>([])
  const [enquiryCount, setEnquiryCount] = useState(0)
  const [mine, setMine] = useState<MyVehicle>(emptyCar)
  const [editing, setEditing] = useState(false)
  const [savedNote, setSavedNote] = useState("")

  useEffect(() => {
    const sync = () => setSavedIds(getSavedIds())
    sync()
    window.addEventListener("emz-saved-cars", sync)
    setRecent(getRecentIds().map((id) => getCar(id)).filter(Boolean) as typeof CARS)
    setEnquiryCount(getEnquiries().length)
    const stored = getMyVehicle()
    if (stored) setMine(stored)
    else setEditing(true)
    return () => window.removeEventListener("emz-saved-cars", sync)
  }, [])

  const savedCars = savedIds.map((id) => getCar(id)).filter(Boolean) as typeof CARS
  const hasCar = Boolean(mine.registration || mine.make)

  function onSaveCar(e: FormEvent) {
    e.preventDefault()
    saveMyVehicle(mine)
    setEditing(false)
    setSavedNote("Your car is on the dashboard.")
  }

  if (isPending) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-[#6e746b]">Loading dashboard…</div>
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">Your car dashboard</h1>
        <p className="mt-3 text-sm text-[#5f655c]">
          Sign in to see saved cars and add the details of the car you drive now.
        </p>
        <Link
          href="/auth?redirect=/account"
          className="mt-6 inline-flex rounded-xl bg-[#e0511f] px-5 py-3 text-sm font-bold text-white"
        >
          Sign in
        </Link>
        <div className="mt-10 text-left">
          <SellListingForm />
        </div>
      </div>
    )
  }

  const first = user.name?.split(" ")[0] || user.email?.split("@")[0] || "there"

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#e0511f]">Garage</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Hi {first}</h1>
      <p className="mt-1 text-sm text-[#5f655c]">
        Your cars, shortlist and part-exchange in one dashboard.
      </p>

      <section className="mt-8 rounded-2xl border border-[#e4dfd5] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">Your car</h2>
            <p className="text-[13px] text-[#6e746b]">Keep the car you already own on file for MOT, finance and part-exchange.</p>
          </div>
          {hasCar && !editing && (
            <button type="button" onClick={() => setEditing(true)} className="text-[13px] font-bold text-[#e0511f]">
              Edit details
            </button>
          )}
        </div>

        {!editing && hasCar ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Fact label="Registration" value={mine.registration.toUpperCase() || "—"} />
            <Fact label="Vehicle" value={[mine.year, mine.make, mine.model].filter(Boolean).join(" ") || "—"} />
            <Fact label="Mileage" value={mine.mileage ? `${Number(mine.mileage).toLocaleString()} miles` : "—"} />
            <Fact label="Fuel" value={mine.fuel || "—"} />
            <Fact label="Colour" value={mine.colour || "—"} />
            <Fact label="MOT due" value={mine.motDue || "—"} />
            {mine.notes && <p className="sm:col-span-2 text-sm text-[#5f655c]">{mine.notes}</p>}
            <Link href="/cars#part-exchange" className="sm:col-span-2 inline-flex w-fit rounded-lg bg-[#1b231e] px-4 py-2 text-[13px] font-bold text-white">
              Use this car as part-exchange
            </Link>
          </div>
        ) : (
          <form onSubmit={onSaveCar} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className={field} placeholder="Registration" value={mine.registration} onChange={(e) => setMine({ ...mine, registration: e.target.value })} required />
            <input className={field} placeholder="Make" value={mine.make} onChange={(e) => setMine({ ...mine, make: e.target.value })} />
            <input className={field} placeholder="Model" value={mine.model} onChange={(e) => setMine({ ...mine, model: e.target.value })} />
            <input className={field} placeholder="Year" value={mine.year} onChange={(e) => setMine({ ...mine, year: e.target.value })} />
            <input className={field} placeholder="Mileage" value={mine.mileage} onChange={(e) => setMine({ ...mine, mileage: e.target.value })} />
            <select className={field} value={mine.fuel} onChange={(e) => setMine({ ...mine, fuel: e.target.value })}>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Hybrid</option>
              <option>Electric</option>
            </select>
            <input className={field} placeholder="Colour" value={mine.colour} onChange={(e) => setMine({ ...mine, colour: e.target.value })} />
            <input className={field} type="date" value={mine.motDue} onChange={(e) => setMine({ ...mine, motDue: e.target.value })} />
            <textarea className={`${field} min-h-[88px] sm:col-span-2`} placeholder="Notes — service history, finance remaining, issues…" value={mine.notes} onChange={(e) => setMine({ ...mine, notes: e.target.value })} />
            <button type="submit" className="rounded-lg bg-[#e0511f] px-4 py-2.5 text-sm font-bold text-white sm:col-span-2">
              Save my car
            </button>
            {savedNote && <p className="text-[13px] font-semibold text-[#12833b] sm:col-span-2">{savedNote}</p>}
          </form>
        )}
      </section>

      <section id="saved" className="mt-8 scroll-mt-16">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-extrabold">Saved cars</h2>
          <Link href="/cars" className="text-[13px] font-bold text-[#e0511f]">
            Browse
          </Link>
        </div>
        {savedCars.length === 0 ? (
          <p className="mt-3 text-sm text-[#6e746b]">Nothing shortlisted yet. Heart a car while you browse.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {savedCars.map((car) => (
              <ListingCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e4dfd5] bg-white p-4">
          <h2 className="font-extrabold">Enquiries</h2>
          <p className="mt-1 text-sm text-[#6e746b]">{enquiryCount ? `${enquiryCount} sent` : "None yet."}</p>
          <Link href="/enquire" className="mt-2 inline-block text-[13px] font-bold text-[#e0511f]">
            New enquiry
          </Link>
        </div>
        <div className="rounded-xl border border-[#e4dfd5] bg-white p-4">
          <h2 className="font-extrabold">Recently viewed</h2>
          <ul className="mt-2 space-y-1.5">
            {recent.length === 0 && <li className="text-sm text-[#9aa097]">Empty</li>}
            {recent.slice(0, 4).map((car) => (
              <li key={car.id}>
                <Link href={`/cars/${car.id}`} className="text-[13px] font-semibold hover:text-[#e0511f]">
                  {carTitle(car)} · {formatGbp(car.price)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <SellListingForm />
      </section>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#faf8f3] px-3 py-2.5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa097]">{label}</p>
      <p className="text-sm font-extrabold">{value}</p>
    </div>
  )
}

const field =
  "h-11 w-full rounded-lg border border-[#e4dfd5] bg-[#faf8f3] px-3 text-sm outline-none focus:border-[#e0511f]/50"
