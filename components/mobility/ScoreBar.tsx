export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-[#1b231e]">{label}</span>
        <span className="tabular-nums font-bold text-[#e0511f]">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#efe6da]">
        <div className="h-full rounded-full bg-[#e0511f]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

export function PlanningNote() {
  return (
    <p className="text-xs leading-relaxed text-[#7c827a]">
      Planning estimates from your profile. They are not an immigration decision or a fee quote.
    </p>
  )
}
