"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Loader2, Stethoscope, Landmark, GraduationCap, FileText, CheckCircle2,
  Plane, Home, MapPin,
} from "lucide-react"
import { fetchGuides } from "@/lib/relocate/client"
import type { RelocationCountryGuide } from "@/lib/relocate/types"

export function SettleClient() {
  const [guides, setGuides] = useState<RelocationCountryGuide[]>([])
  const [state, setState] = useState<"loading" | "ok" | "error">("loading")
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    let on = true
    ;(async () => {
      try {
        const rows = await fetchGuides()
        if (!on) return
        setGuides(rows)
        setActive(rows[0]?.country ?? "")
        setState("ok")
      } catch {
        if (on) setState("error")
      }
    })()
    return () => { on = false }
  }, [])

  const guide = useMemo(
    () => guides.find((g) => g.country === active) ?? guides[0],
    [guides, active],
  )

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-[#6e746b]">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        <p className="mt-3 text-sm">Loading settle guides…</p>
      </div>
    )
  }
  if (state === "error" || !guide) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-[#6e746b]">
        Settle guides aren’t available right now. <Link href="/move" className="font-semibold text-[#e0511f] underline">Start in the Move Spectrum</Link> instead.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Country selector */}
      <div className="mb-8 flex flex-wrap gap-2">
        {guides.map((g) => {
          const on = g.country === active
          return (
            <button
              key={g.country}
              onClick={() => setActive(g.country)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                on ? "border-[#e0511f] bg-[#e0511f] text-white" : "border-[#e4dfd5] bg-white text-[#4a5047] hover:border-[#e0511f]/40"
              }`}
            >
              {g.country}
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-[#e4dfd5] bg-white p-7">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#9aa097]">Settle in</div>
            <h2 className="mt-2 font-display text-3xl font-bold text-[#1b231e]">{guide.country}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#5f655c]">{guide.visaSummary}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f6e9df] px-3 py-1.5 text-xs font-semibold text-[#bf6a3c]">
              ~{guide.estimatedSetupDays} days to settle in
            </div>
          </div>

          {/* First-week & pre-move steps */}
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { title: "Before you go", icon: Plane, steps: guide.preMoveSteps },
              { title: "Your first week", icon: MapPin, steps: guide.firstWeekSteps },
            ].map((col) => (
              <div key={col.title} className="rounded-2xl border border-[#e4dfd5] bg-white p-6">
                <div className="flex items-center gap-2">
                  <col.icon className="h-4 w-4 text-[#e0511f]" />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[#1b231e]">{col.title}</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {col.steps.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-sm text-[#4a5047]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#e0511f]" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Essentials */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Stethoscope, label: "Healthcare", body: guide.healthcareTip },
              { icon: Landmark, label: "Banking", body: guide.bankingTip },
              { icon: GraduationCap, label: "Schooling", body: guide.schoolingTip },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-[#e4dfd5] bg-white p-5">
                <c.icon className="h-5 w-5 text-[#e0511f]" />
                <div className="mt-3 text-sm font-bold text-[#1b231e]">{c.label}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#5f655c]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {guide.requiredDocuments.length > 0 && (
            <div className="rounded-2xl border border-[#e4dfd5] bg-white p-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#9aa097]">
                <FileText className="h-3.5 w-3.5" /> Documents to prepare
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {guide.requiredDocuments.map((d) => (
                  <span key={d} className="rounded-full bg-[#f0ede4] px-2.5 py-1 text-xs text-[#4a5047]">{d}</span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[#e4dfd5] bg-white p-6">
            <h3 className="text-sm font-bold text-[#1b231e]">Keep going</h3>
            <div className="mt-3 space-y-2">
              <Link href="/relocate/hub" className="flex items-center gap-2 rounded-xl border border-[#e4dfd5] px-3 py-3 text-sm font-medium text-[#4a5047] hover:border-[#e0511f]/30">
                <Plane className="h-4 w-4 text-[#e0511f]" /> Open my relocation plan
              </Link>
              <Link href="/purchase" className="flex items-center gap-2 rounded-xl border border-[#e4dfd5] px-3 py-3 text-sm font-medium text-[#4a5047] hover:border-[#e0511f]/30">
                <Home className="h-4 w-4 text-[#e0511f]" /> Find a home here
              </Link>
              <Link href="/vendor" className="flex items-center gap-2 rounded-xl border border-[#e4dfd5] px-3 py-3 text-sm font-medium text-[#4a5047] hover:border-[#e0511f]/30">
                <MapPin className="h-4 w-4 text-[#e0511f]" /> Find movers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
