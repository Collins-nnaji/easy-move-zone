"use client"

import { ExternalLink } from "lucide-react"
import type { StudyRoute } from "@/lib/education/study-routes"
import { PRIMARY } from "./shared"

const FAMILY_STYLE: Record<StudyRoute["familyShort"], string> = {
  Yes: "bg-emerald-50 text-emerald-800",
  Limited: "bg-amber-50 text-amber-800",
  Rarely: "bg-rose-50 text-rose-800",
}

export function RouteCompareTable({ routes }: { routes: StudyRoute[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e4dfd5] bg-white">
      <table className="w-full min-w-[720px] text-left text-[13px]">
        <thead className="bg-[#f6f3ec] text-[11px] font-bold uppercase tracking-wide text-[#6b716a]">
          <tr>
            <th className="px-4 py-2.5">Destination</th>
            <th className="px-4 py-2.5">Work while studying</th>
            <th className="px-4 py-2.5">Stay to work after</th>
            <th className="px-4 py-2.5">Family</th>
            <th className="px-4 py-2.5">Document you need</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#efe9dd]">
          {routes.map((route) => (
            <tr key={route.country} className="align-top">
              <td className="px-4 py-3">
                <span className="font-extrabold">{route.flag} {route.country}</span>
                <p className="mt-0.5 text-[11px] text-[#7c827a]">{route.visa}</p>
                <a href={route.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold hover:underline" style={{ color: PRIMARY }}>
                  Official guidance <ExternalLink className="h-3 w-3" />
                </a>
              </td>
              <td className="px-4 py-3 text-[#4a5047]">{route.workWhileStudying}</td>
              <td className="px-4 py-3">
                <p className="font-bold">{route.postStudyShort}</p>
                <p className="mt-0.5 text-[#5f655c]">{route.afterStudy}</p>
              </td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${FAMILY_STYLE[route.familyShort]}`} title={route.family}>{route.familyShort}</span></td>
              <td className="px-4 py-3 text-[#4a5047]">{route.keyDocument}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RouteFacts({ route }: { route: StudyRoute }) {
  const facts = [
    ["Visa", `${route.visa} — you'll need a ${route.keyDocument}.`],
    ["Work while studying", route.workWhileStudying],
    ["After you graduate", route.afterStudy],
    ["Then", route.nextStep],
    ["Family", route.family],
    ["Money to show", route.money],
  ]
  return (
    <section className="rounded-2xl border border-[#cfe0d8] bg-[#f3f8f5] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-extrabold tracking-tight">{route.flag} Studying in {route.country}: your route</h2>
        <a href={route.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: PRIMARY }}>
          Official guidance <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-[#5f7a70]">{label}</dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-[#2c3530]">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[11px] text-[#6b716a]">{route.tuition} Rules change often — always confirm on the official site.</p>
    </section>
  )
}
