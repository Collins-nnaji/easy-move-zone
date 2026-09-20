"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { getSavedIds, toggleSavedId } from "@/lib/cars/saved"

export function SaveButton({
  carId,
  variant = "icon",
}: {
  carId: string
  variant?: "icon" | "label"
}) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const sync = () => setSaved(getSavedIds().includes(carId))
    sync()
    window.addEventListener("emz-saved-cars", sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener("emz-saved-cars", sync)
      window.removeEventListener("storage", sync)
    }
  }, [carId])

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setSaved(toggleSavedId(carId).includes(carId))
      }}
      className={
        variant === "label"
          ? "inline-flex items-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white px-4 py-3 text-sm font-semibold text-[#4a5047] transition hover:border-[#e0511f]/40"
          : "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#4a5047] shadow-sm ring-1 ring-black/5 transition hover:text-[#e0511f]"
      }
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save car"}
    >
      <Heart className={`h-4 w-4 ${saved ? "fill-[#e0511f] text-[#e0511f]" : ""}`} />
      {variant === "label" ? (saved ? "Saved" : "Save Car") : null}
    </button>
  )
}
