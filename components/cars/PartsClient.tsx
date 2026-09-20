"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Star } from "lucide-react"
import { formatGbp } from "@/lib/cars/catalog"
import { filterParts, getPart, PART_CATEGORIES, PARTS } from "@/lib/cars/parts"

export function PartsBrowseClient() {
  const params = useSearchParams()
  const router = useRouter()
  const q = params.get("q") ?? ""
  const category = params.get("category") ?? ""
  const parts = filterParts({ q, category })

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (!value) next.delete(key)
    else next.set(key, value)
    router.replace(`/parts?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <p className="text-[12px] font-semibold text-[#6e746b]">
        <Link href="/" className="hover:text-[#e0511f]">
          Home
        </Link>{" "}
        / Parts & tyres
      </p>
      <h1 className="mt-2 text-2xl font-extrabold">Car parts, tyres and consumables</h1>
      <p className="mt-1 text-sm text-[#5f655c]">Order the part, then book a garage to fit it.</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => set("category", "")}
          className={`rounded-md px-3 py-1.5 text-[12px] font-bold ${!category ? "bg-[#e0511f] text-white" : "bg-white ring-1 ring-[#e4dfd5]"}`}
        >
          All
        </button>
        {PART_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => set("category", c)}
            className={`rounded-md px-3 py-1.5 text-[12px] font-bold ${
              category === c ? "bg-[#e0511f] text-white" : "bg-white ring-1 ring-[#e4dfd5]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <input
        className="mt-4 h-11 w-full max-w-md rounded-lg border border-[#e4dfd5] bg-white px-3 text-sm"
        placeholder="Search tyres, brakes, batteries…"
        defaultValue={q}
        onChange={(e) => set("q", e.target.value)}
      />

      <p className="mt-3 text-[13px] font-semibold text-[#6e746b]">{parts.length} products</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {parts.map((p) => (
          <Link key={p.id} href={`/parts/${p.id}`} className="overflow-hidden rounded-xl border border-[#e4dfd5] bg-white hover:shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photo} alt={p.name} className="h-36 w-full object-cover" />
            <div className="p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa097]">{p.category}</p>
              <h2 className="mt-0.5 text-[14px] font-extrabold leading-snug">{p.name}</h2>
              <p className="mt-1 text-[12px] text-[#6e746b]">{p.fitment}</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-lg font-extrabold">{formatGbp(p.price)}</p>
                <p className="inline-flex items-center gap-1 text-[12px] font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {p.rating}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function PartDetailsClient({ id }: { id: string }) {
  const part = getPart(id)
  if (!part) return null
  const others = PARTS.filter((p) => p.category === part.category && p.id !== part.id).slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
      <p className="text-[12px] font-semibold text-[#6e746b]">
        <Link href="/parts">Parts</Link> / {part.category} / {part.name}
      </p>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={part.photo} alt={part.name} className="aspect-[4/3] w-full rounded-xl object-cover" />
        <div>
          <p className="text-[11px] font-bold uppercase text-[#9aa097]">{part.brand}</p>
          <h1 className="mt-1 text-2xl font-extrabold">{part.name}</h1>
          <p className="mt-2 text-2xl font-extrabold">{formatGbp(part.price)}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[13px] font-bold">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {part.rating} · {part.reviewCount} reviews
          </p>
          <p className="mt-3 text-sm text-[#5f655c]">{part.description}</p>
          <p className="mt-2 text-[13px] font-semibold">Fits: {part.fitment}</p>
          <p className="text-[13px] text-[#6e746b]">{part.inStock} in stock</p>
          <ul className="mt-3 list-disc pl-4 text-sm text-[#5f655c]">
            {part.specs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/enquire?part=${part.id}&intent=ask`} className="rounded-lg bg-[#e0511f] px-4 py-2.5 text-sm font-bold text-white">
              Buy / enquire
            </Link>
            <Link
              href={part.category === "Tyres" ? "/garages?service=Tyres" : "/garages?service=Servicing"}
              className="rounded-lg border border-[#d8d2c6] bg-white px-4 py-2.5 text-sm font-semibold"
            >
              Book fitting
            </Link>
          </div>
        </div>
      </div>
      {others.length > 0 && (
        <div className="mt-8">
          <h2 className="font-extrabold">More in {part.category}</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {others.map((p) => (
              <Link key={p.id} href={`/parts/${p.id}`} className="rounded-lg bg-white px-3 py-3 text-sm font-semibold">
                {p.name}
                <span className="mt-1 block text-[#e0511f]">{formatGbp(p.price)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
