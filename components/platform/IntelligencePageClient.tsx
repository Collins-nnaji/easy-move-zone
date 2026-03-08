"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { IntelligenceChatbot } from "@/components/platform/IntelligenceChatbot"
import { NewsletterSignupForm } from "@/components/platform/NewsletterSignupForm"
import type { Market, Report } from "@/lib/platform/types"

interface IntelligencePageClientProps {
  markets: Market[]
  reports: Report[]
}

export function IntelligencePageClient({ markets, reports }: IntelligencePageClientProps) {
  const [marketId, setMarketId] = useState("all")
  const [sector, setSector] = useState("all")
  const [direction, setDirection] = useState("all")
  const [previewId, setPreviewId] = useState<string | null>(null)

  const marketMap = useMemo(() => new Map(markets.map((market) => [market.id, market])), [markets])
  const sectors = useMemo(() => Array.from(new Set(reports.map((report) => report.sector))), [reports])

  const filteredReports = useMemo(
    () =>
      reports
        .filter((report) => (marketId === "all" ? true : report.marketId === marketId))
        .filter((report) => (sector === "all" ? true : report.sector === sector))
        .filter((report) => (direction === "all" ? true : report.direction === direction)),
    [reports, marketId, sector, direction]
  )

  const preview = filteredReports.find((report) => report.id === previewId)

  return (
    <>
      <section className="border-b border-black/10 bg-[#ede8de]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-[var(--font-playfair)] text-6xl font-black leading-[0.95] text-[#0d0d0d]">
            Know your terrain before you move.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#6b6560]">
            Use clear market intelligence before spending on expansion.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#reports" className="rounded-full bg-[#0d0d0d] px-5 py-2.5 text-sm text-[#f5f0e8]">Browse Reports</a>
            <a href="#commission" className="rounded-full border border-black/15 px-5 py-2.5 text-sm text-[#0d0d0d]">Commission Custom Report</a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">Search & Filter</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <select value={marketId} onChange={(event) => setMarketId(event.target.value)} className="rounded-xl border border-black/15 bg-[#f5f0e8] px-3 py-2 text-sm">
                <option value="all">All markets</option>
                {markets.map((market) => (
                  <option key={market.id} value={market.id}>{market.name}</option>
                ))}
              </select>
              <select value={sector} onChange={(event) => setSector(event.target.value)} className="rounded-xl border border-black/15 bg-[#f5f0e8] px-3 py-2 text-sm">
                <option value="all">All sectors</option>
                {sectors.map((sectorValue) => (
                  <option key={sectorValue} value={sectorValue}>{sectorValue}</option>
                ))}
              </select>
              <select value={direction} onChange={(event) => setDirection(event.target.value)} className="rounded-xl border border-black/15 bg-[#f5f0e8] px-3 py-2 text-sm">
                <option value="all">All report types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="regulatory">Regulatory</option>
                <option value="sector_deep_dive">Sector Deep-Dive</option>
              </select>
              <div className="rounded-xl border border-black/10 bg-[#ede8de] px-3 py-2 text-sm text-[#6b6560]">
                {filteredReports.length} report{filteredReports.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div id="reports" className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredReports.map((report) => {
              const market = marketMap.get(report.marketId)
              return (
                <article key={report.id} className="rounded-2xl border border-black/10 bg-white p-4">
                  <p className="text-3xl">{market?.flagEmoji ?? "🌍"}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-[#c9a84c]">{market?.name ?? "Market"} · {report.direction}</p>
                  <h3 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">{report.title}</h3>
                  <p className="mt-2 text-sm text-[#6b6560]">{report.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {report.tags.map((tag) => <span key={`${report.id}-${tag}`} className="rounded-full bg-[#ede8de] px-2 py-1 text-[11px] text-[#6b6560]">{tag}</span>)}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-[#6b6560]">Updated {report.lastUpdatedDate}</span>
                    <strong>${report.price.toLocaleString()}</strong>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => setPreviewId(report.id)} className="rounded-full border border-black/15 px-3 py-1.5 text-sm">Preview</button>
                    <Link href="/contact?direction=Commissioning%20a%20report" className="rounded-full bg-[#0d0d0d] px-3 py-1.5 text-sm text-[#f5f0e8]">Purchase</Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <IntelligenceChatbot />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Free sample download</h3>
          <p className="mt-2 text-sm text-[#6b6560]">
            Get one free report excerpt in exchange for your email.
          </p>
          <div className="mt-4 max-w-xl">
            <NewsletterSignupForm />
          </div>
        </div>
      </section>

      {preview ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-6 shadow-xl">
            <h4 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">{preview.title}</h4>
            <p className="mt-2 text-sm text-[#6b6560]">{preview.previewExcerpt}</p>
            <p className="mt-4 text-sm text-[#6b6560]">{preview.summary}</p>
            <div className="mt-5 flex items-center gap-2">
              <button type="button" onClick={() => setPreviewId(null)} className="rounded-full border border-black/15 px-3 py-2 text-sm">Close</button>
              <Link href="/contact?direction=Commissioning%20a%20report" className="rounded-full bg-[#0d0d0d] px-3 py-2 text-sm text-[#f5f0e8]">Purchase report</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
