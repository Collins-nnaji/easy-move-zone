"use client"

import type { CourseFit, CourseWithUniversity } from "@/lib/education/types"

export const PRIMARY = "#2f5d50"
export const ACCENT = "#e0511f"
export const INK = "#1b231e"

export const COUNTRY_FLAGS: Record<string, string> = {
  "United Kingdom": "🇬🇧",
  Ireland: "🇮🇪",
  Netherlands: "🇳🇱",
  Germany: "🇩🇪",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  "United States": "🇺🇸",
  "New Zealand": "🇳🇿",
  France: "🇫🇷",
  Sweden: "🇸🇪",
  Denmark: "🇩🇰",
}

export function formatTuition(course: Pick<CourseWithUniversity, "tuitionMin" | "tuitionMax" | "currency">) {
  const { tuitionMin: min, tuitionMax: max, currency } = course
  if (min == null && max == null) return "Fees on request"
  const fmt = (value: number) => {
    try {
      return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(value)
    } catch {
      return `${currency} ${value.toLocaleString()}`
    }
  }
  if (max === 0 && (min ?? 0) === 0) return "No tuition fees"
  if (min != null && max != null && min !== max) return `${fmt(min)} – ${fmt(max)}`
  return fmt((max ?? min) as number)
}

export function FitIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`} aria-hidden>
      <path d="M4.5 16.5a8 8 0 1115 0" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" />
      <path d="M7.2 16.5a5.2 5.2 0 019.6 0" stroke={PRIMARY} strokeWidth="1.6" strokeLinecap="round" opacity=".35" />
      <path d="M12 16.5l3.6-5.4" stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.9" fill={INK} />
    </svg>
  )
}

export function StatementIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`} aria-hidden>
      <path d="M6 3.5h7.5L18 8v5" stroke="#b5532c" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13.5 3.5V8H18" stroke="#b5532c" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 3.5a1.5 1.5 0 00-1.5 1.5v14A1.5 1.5 0 006 20.5h5" stroke="#b5532c" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 10h6M7.5 13.5h4" stroke="#b5532c" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13.5 20.5l.6-2.6 5.2-5.2a1.4 1.4 0 012 2l-5.2 5.2z" fill={ACCENT} />
    </svg>
  )
}

export function CapIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`} aria-hidden>
      <path d="M2.5 9L12 4.5 21.5 9 12 13.5z" fill={PRIMARY} />
      <path d="M6.5 11v4.2c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11" stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21.5 9v5" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="21.5" cy="15" r="1.4" fill={ACCENT} />
    </svg>
  )
}

const VERDICT_STYLE: Record<CourseFit["verdict"], { label: string; hint: string; steps: number; className: string; bar: string }> = {
  strong: { label: "Strong fit", hint: "You look ready to apply", steps: 3, className: "bg-emerald-100 text-emerald-900", bar: "bg-emerald-600" },
  possible: { label: "Possible fit", hint: "Apply once you confirm the gaps below", steps: 2, className: "bg-amber-100 text-amber-900", bar: "bg-amber-500" },
  stretch: { label: "Stretch", hint: "Close the gaps first or pick a closer course", steps: 1, className: "bg-rose-100 text-rose-900", bar: "bg-rose-500" },
}

export function FitSummary({ fit, compact = false }: { fit: CourseFit; compact?: boolean }) {
  const verdict = VERDICT_STYLE[fit.verdict]
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${verdict.className}`}>{verdict.label}</span>
        <span className="flex gap-1" aria-hidden>
          {[1, 2, 3].map((step) => <span key={step} className={`h-1.5 w-6 rounded-full ${step <= verdict.steps ? verdict.bar : "bg-[#e4dfd5]"}`} />)}
        </span>
        {!compact && <span className="text-xs font-semibold text-[#5f655c]">{verdict.hint}</span>}
      </div>
      {!compact && (
        <div className="grid gap-3 sm:grid-cols-3">
          <FitList title="You meet" items={fit.meets} tone="good" />
          <FitList title="To confirm or close" items={fit.gaps} tone="gap" />
          <FitList title="Next steps" items={fit.advice} tone="plain" />
        </div>
      )}
    </div>
  )
}

function FitList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "gap" | "plain" }) {
  if (!items.length) return null
  const dot = tone === "good" ? PRIMARY : tone === "gap" ? ACCENT : "#8a9086"
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#6b716a]">{title}</p>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs leading-relaxed text-[#3f463f]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
