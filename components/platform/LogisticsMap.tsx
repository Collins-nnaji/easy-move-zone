"use client"

import { useState } from "react"
import { MapPin, Compass } from "lucide-react"
import { clsx } from "clsx"

type City = {
  name: string
  x: number
  y: number
}

const CITIES: City[] = [
  { name: "Lagos", x: 100, y: 320 },
  { name: "Abuja", x: 300, y: 200 },
  { name: "Port Harcourt", x: 280, y: 350 },
  { name: "Ibadan", x: 130, y: 300 },
  { name: "Enugu", x: 320, y: 310 },
  { name: "Kano", x: 340, y: 80 },
  { name: "Kaduna", x: 290, y: 140 },
  { name: "Benin City", x: 200, y: 330 },
  { name: "Warri", x: 210, y: 350 },
  { name: "Calabar", x: 350, y: 360 },
  { name: "Uyo", x: 330, y: 350 },
  { name: "Asaba", x: 250, y: 330 },
  { name: "Abeokuta", x: 90, y: 290 },
  { name: "Jos", x: 380, y: 160 },
]

interface LogisticsMapProps {
  originCity: string
  destCity: string
  onSelectOrigin: (city: string) => void
  onSelectDest: (city: string) => void
}

export function LogisticsMap({
  originCity,
  destCity,
  onSelectOrigin,
  onSelectDest,
}: LogisticsMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [selectionMode, setSelectionMode] = useState<"origin" | "dest">("origin")

  const handleCityClick = (cityName: string) => {
    if (selectionMode === "origin") {
      onSelectOrigin(cityName)
      setSelectionMode("dest")
    } else {
      onSelectDest(cityName)
      setSelectionMode("origin")
    }
  }

  const origin = CITIES.find((c) => c.name === originCity)
  const dest = CITIES.find((c) => c.name === destCity)

  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-950 p-4 ring-1 ring-white/5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-rose-400 animate-spin-slow" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Route Selection Map
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelectionMode("origin")}
            className={clsx(
              "rounded-lg px-3 py-1 text-xs font-semibold transition",
              selectionMode === "origin"
                ? "bg-rose-500 text-white"
                : "bg-white/5 text-slate-400 hover:text-white",
            )}
          >
            Set Pickup
          </button>
          <button
            type="button"
            onClick={() => setSelectionMode("dest")}
            className={clsx(
              "rounded-lg px-3 py-1 text-xs font-semibold transition",
              selectionMode === "dest"
                ? "bg-rose-500 text-white"
                : "bg-white/5 text-slate-400 hover:text-white",
            )}
          >
            Set Dropoff
          </button>
        </div>
      </div>

      <div className="relative aspect-[4/3] w-full rounded-xl bg-[#070c1b] overflow-hidden border border-white/5">
        {/* Grid lines for aesthetic */}
        <svg className="absolute inset-0 h-full w-full stroke-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" aria-hidden="true">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg
          viewBox="0 0 600 400"
          className="absolute inset-0 h-full w-full"
        >
          {/* Connecting route line */}
          {origin && dest && (
            <line
              x1={origin.x}
              y1={origin.y}
              x2={dest.x}
              y2={dest.y}
              stroke="url(#routeGrad)"
              strokeWidth="3"
              strokeDasharray="6,6"
              className="animate-dash"
            />
          )}

          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* City nodes */}
          {CITIES.map((city) => {
            const isOrigin = city.name === originCity
            const isDest = city.name === destCity
            const isHovered = hoveredCity === city.name

            return (
              <g
                key={city.name}
                className="cursor-pointer"
                onClick={() => handleCityClick(city.name)}
                onMouseEnter={() => setHoveredCity(city.name)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* Glow pulse for selected */}
                {(isOrigin || isDest || isHovered) && (
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r="14"
                    className={clsx(
                      "opacity-30 animate-ping",
                      isOrigin ? "fill-rose-500" : isDest ? "fill-pink-500" : "fill-white",
                    )}
                  />
                )}

                {/* Main node */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isOrigin || isDest ? "7" : "5"}
                  className={clsx(
                    "transition-all duration-200",
                    isOrigin
                      ? "fill-rose-500 stroke-white stroke-2"
                      : isDest
                        ? "fill-pink-500 stroke-white stroke-2"
                        : "fill-slate-600 stroke-white/30 stroke hover:fill-white",
                  )}
                />

                {/* Text Label */}
                <text
                  x={city.x + 10}
                  y={city.y + 4}
                  className={clsx(
                    "text-[10px] font-bold transition-all pointer-events-none",
                    isOrigin || isDest
                      ? "fill-white text-xs"
                      : "fill-slate-500 hover:fill-slate-300",
                  )}
                >
                  {city.name}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Instructions overlay */}
        <div className="absolute bottom-2 left-2 rounded-lg bg-slate-950/80 px-2 py-1 text-[9px] text-slate-400 backdrop-blur-sm border border-white/5">
          {originCity ? `From: ${originCity}` : "Click origin city"}
          {destCity ? ` to ${destCity}` : originCity ? " then click destination" : ""}
        </div>
      </div>
    </div>
  )
}
