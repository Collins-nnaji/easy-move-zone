"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth/client"
import type { CarListingRow } from "@/lib/cars/marketplace"

const field =
  "mt-1.5 h-11 w-full rounded-lg border border-[#e4dfd5] bg-[#faf8f3] px-3 text-sm outline-none focus:border-[#e0511f]/50"

type Photo = { id: string; url: string; uploading?: boolean }

export function SellListingForm() {
  const { data, isPending } = authClient.useSession()
  const user = data?.user
  const [mine, setMine] = useState<CarListingRow[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    year: "2019",
    make: "",
    model: "",
    trim: "",
    mileage: "",
    price: "",
    fuel: "Petrol",
    transmission: "Automatic",
    body: "Saloon",
    colour: "",
    engine: "",
    location: "",
    description: "",
    stockType: "uk_stock",
    originCountry: "United Kingdom",
  })

  function loadMine() {
    fetch("/api/listings")
      .then(async (res) => (res.ok ? ((await res.json()) as { items: CarListingRow[] }) : { items: [] }))
      .then((data) => setMine(data.items ?? []))
      .catch(() => setMine([]))
  }

  useEffect(() => {
    if (user) loadMine()
  }, [user])

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setError("")
    const remaining = 8 - photos.length
    const batch = Array.from(files).slice(0, remaining)
    for (const file of batch) {
      const id = crypto.randomUUID()
      const localUrl = URL.createObjectURL(file)
      setPhotos((prev) => [...prev, { id, url: localUrl, uploading: true }])
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/listings/photos", { method: "POST", body })
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !json.url) {
        setPhotos((prev) => prev.filter((p) => p.id !== id))
        setError(json.error || "Could not upload photo")
        continue
      }
      URL.revokeObjectURL(localUrl)
      setPhotos((prev) => prev.map((p) => (p.id === id ? { id, url: json.url! } : p)))
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const ready = photos.filter((p) => !p.uploading).map((p) => p.url)
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          mileage: Number(form.mileage),
          price: Number(form.price),
          photos: ready,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(json.error || "Could not submit listing")
      setDone(true)
      setPhotos([])
      loadMine()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit listing")
    } finally {
      setBusy(false)
    }
  }

  if (isPending) return <p className="text-sm text-[#6e746b]">Checking sign-in…</p>

  if (!user) {
    return (
      <div className="rounded-2xl border border-[#e4dfd5] bg-white p-5">
        <h2 className="text-lg font-extrabold">List your car for sale</h2>
        <p className="mt-1 text-sm text-[#5f655c]">Sign in, add photos, and we will review the listing before it goes live.</p>
        <Link href="/auth?redirect=/account#sell" className="mt-4 inline-flex rounded-xl bg-[#e0511f] px-4 py-2.5 text-sm font-bold text-white">
          Sign in to sell
        </Link>
      </div>
    )
  }

  return (
    <div id="sell" className="scroll-mt-20 space-y-4">
      {mine.length > 0 && (
        <div className="rounded-2xl border border-[#e4dfd5] bg-white p-5">
          <h3 className="text-sm font-extrabold">Your listings</h3>
          <ul className="mt-3 space-y-2">
            {mine.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-[#faf8f3] px-3 py-2 text-sm">
                <span className="font-semibold">
                  {item.year} {item.make} {item.model}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                    item.status === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : item.status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.status === "pending" ? "In review" : item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} className="rounded-2xl border border-[#e4dfd5] bg-white p-5">
        <h2 className="text-lg font-extrabold">Register a car to sell</h2>
        <p className="mt-1 text-[13px] text-[#6e746b]">
          Photos go to object storage. The listing stays hidden until an admin approves it.
        </p>

        <div className="mt-4">
          <span className="text-[13px] font-bold">Photos</span>
          <input
            className="mt-1.5 block w-full text-sm"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => onFiles(e.target.files)}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.url} alt="" className={`h-20 w-28 rounded-lg object-cover ${p.uploading ? "opacity-50" : ""}`} />
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-bold">
            Year
            <input className={field} required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </label>
          <label className="text-[13px] font-bold">
            Make
            <input className={field} required value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
          </label>
          <label className="text-[13px] font-bold">
            Model
            <input className={field} required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </label>
          <label className="text-[13px] font-bold">
            Trim
            <input className={field} value={form.trim} onChange={(e) => setForm({ ...form, trim: e.target.value })} />
          </label>
          <label className="text-[13px] font-bold">
            Mileage
            <input className={field} required type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
          </label>
          <label className="text-[13px] font-bold">
            Asking price (£)
            <input className={field} required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label className="text-[13px] font-bold">
            Fuel
            <select className={field} value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })}>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Hybrid</option>
              <option>Electric</option>
            </select>
          </label>
          <label className="text-[13px] font-bold">
            Gearbox
            <select className={field} value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
              <option>Automatic</option>
              <option>Manual</option>
            </select>
          </label>
          <label className="text-[13px] font-bold">
            Body
            <select className={field} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}>
              <option>Saloon</option>
              <option>Hatchback</option>
              <option>Estate</option>
              <option>SUV</option>
              <option>Coupe</option>
              <option>MPV</option>
            </select>
          </label>
          <label className="text-[13px] font-bold">
            Colour
            <input className={field} value={form.colour} onChange={(e) => setForm({ ...form, colour: e.target.value })} />
          </label>
          <label className="text-[13px] font-bold">
            Engine
            <input className={field} placeholder="2.0 TDI" value={form.engine} onChange={(e) => setForm({ ...form, engine: e.target.value })} />
          </label>
          <label className="text-[13px] font-bold">
            Location
            <input className={field} placeholder="Lagos" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
          <label className="text-[13px] font-bold">
            Stock
            <select className={field} value={form.stockType} onChange={(e) => setForm({ ...form, stockType: e.target.value })}>
              <option value="uk_stock">UK stock</option>
              <option value="import">Import</option>
              <option value="cfr">CFR</option>
            </select>
          </label>
          <label className="text-[13px] font-bold">
            Origin
            <input className={field} value={form.originCountry} onChange={(e) => setForm({ ...form, originCountry: e.target.value })} />
          </label>
          <label className="sm:col-span-2 text-[13px] font-bold">
            Description
            <textarea
              className={`${field} h-24 py-2`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        {done ? <p className="mt-3 text-sm font-semibold text-emerald-800">Submitted for review. It will go live after admin approval.</p> : null}

        <button type="submit" disabled={busy} className="mt-4 rounded-xl bg-[#e0511f] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
          {busy ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </div>
  )
}
