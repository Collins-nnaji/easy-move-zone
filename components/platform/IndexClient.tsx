"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"

const topCities = [
  { rank: 1, name: "Singapore", country: "Singapore", score: 92, trend: "+2", category: "Global Hubs" },
  { rank: 2, name: "Dubai", country: "United Arab Emirates", score: 90, trend: "+1", category: "Global Hubs" },
  { rank: 3, name: "London", country: "United Kingdom", score: 88, trend: "-1", category: "Global Hubs" },
  { rank: 4, name: "Zurich", country: "Switzerland", score: 87, trend: "--", category: "Quality of Life" },
  { rank: 5, name: "Austin", country: "United States", score: 85, trend: "+4", category: "Tech & Innovation" },
]

export function IndexClient() {
  const [activeCity, setActiveCity] = useState(topCities[0])

  const mapQuery = encodeURIComponent(`${activeCity.name}, ${activeCity.country}`)
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&z=12&output=embed`

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8 mt-12">
      {/* Left: Table */}
      <div className="bg-slate-900/50 rounded-3xl border border-white/10 overflow-hidden h-fit">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-sm">
              <th className="py-4 px-6 font-medium">Rank</th>
              <th className="py-4 px-6 font-medium">City</th>
              <th className="py-4 px-6 font-medium">Move Score™</th>
              <th className="py-4 px-6 font-medium hidden sm:table-cell">Category</th>
              <th className="py-4 px-6 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {topCities.map((city) => {
              const isActive = activeCity.name === city.name
              return (
                <tr 
                  key={city.rank} 
                  onClick={() => setActiveCity(city)}
                  className={`cursor-pointer transition-colors ${isActive ? "bg-white/10" : "hover:bg-white/5"}`}
                >
                  <td className="py-4 px-6 text-2xl font-[var(--font-playfair)] text-slate-500">#{city.rank}</td>
                  <td className="py-4 px-6 font-bold text-lg flex items-center gap-2">
                     {city.name}
                     {isActive && <MapPin className="h-4 w-4 text-[#f3aa79]" />}
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-[#f3aa79]/20 text-[#f3aa79] py-1 px-3 rounded-md font-bold text-sm">
                      {city.score}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-sm hidden sm:table-cell">{city.category}</td>
                  <td className="py-4 px-6 text-sm">
                    <span className={`${city.trend.startsWith('+') ? 'text-green-400' : city.trend.startsWith('-') && city.trend !== '--' ? 'text-red-400' : 'text-slate-400'}`}>
                      {city.trend}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Right: Map */}
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-sm" style={{ height: 400 }}>
          <iframe
            key={activeCity.name}
            src={mapSrc}
            className="h-full w-full border-0 grayscale invert opacity-80 mix-blend-screen"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${activeCity.name}`}
            allowFullScreen
          />
          <div className="pointer-events-none absolute left-4 bottom-4 flex items-center gap-2 rounded-xl border border-white/20 bg-[#0A0F1E]/90 px-4 py-3 shadow-lg backdrop-blur-md">
            <MapPin className="h-5 w-5 text-[#f3aa79]" />
            <div>
              <p className="text-sm font-bold text-white">{activeCity.name}</p>
              <p className="text-[10px] text-slate-400">{activeCity.country}</p>
            </div>
            <div className="ml-4 pl-4 border-l border-white/20">
              <p className="text-2xl font-[var(--font-playfair)] font-bold text-[#f3aa79]">{activeCity.score}</p>
            </div>
          </div>
        </div>
        
        <Link href="/auth?type=individual" className="flex w-full justify-center py-4 px-8 rounded-xl bg-[#f3aa79] text-slate-900 font-bold hover:bg-[#f3aa79]/90 transition-colors">
          Get Your Personalised Index
        </Link>
      </div>
    </div>
  )
}
