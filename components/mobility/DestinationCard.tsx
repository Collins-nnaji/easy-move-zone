import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { formatGbp } from "@/lib/mobility/format"
import type { DestinationAssessment } from "@/lib/mobility/types"

export function DestinationCard({ assessment }: { assessment: DestinationAssessment }) {
  const { destination: country, primary } = assessment
  const facts = [
    [primary.name, primary.label],
    ["Estimated move cost", formatGbp(assessment.totalCostGbp)],
    ["Preparation", `${assessment.prepMonths} months`],
    ["Documents", String(assessment.documents)],
    ["Job opportunities", assessment.jobLabel],
    ["Housing estimate", `${formatGbp(assessment.housingGbp)}/month`],
  ] as const

  return (
    <article className="flex h-full flex-col rounded-3xl border border-[#e4dfd5] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-2xl font-extrabold tracking-tight">
          <span className="mr-2" aria-hidden>{country.flag}</span>
          {country.name}
        </h3>
        <p className="text-right">
          <span className="block text-2xl font-extrabold tabular-nums text-[#e0511f]">{assessment.readiness}%</span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#7c827a]">Readiness</span>
        </p>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        {facts.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="text-[#7c827a]">{label}</dt>
            <dd className="text-right font-semibold text-[#1b231e]">{value}</dd>
          </div>
        ))}
      </dl>
      {assessment.languageCallout && (
        <p className="mt-3 text-sm font-semibold text-[#c0492a]">{assessment.languageCallout}</p>
      )}
      <Link
        href={`/destinations/${country.slug}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#e0511f]"
      >
        See my routes
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  )
}
