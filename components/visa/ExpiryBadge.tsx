import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00Z`).getTime()
  const now = new Date()
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.round((target - todayUtc) / (1000 * 60 * 60 * 24))
}

export function ExpiryBadge({ expiryDate, label }: { expiryDate: string; label?: string }) {
  const days = daysUntil(expiryDate)
  const prefix = label ? `${label} ` : ""

  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
        <XCircle className="h-3 w-3" /> {prefix}expired {expiryDate}
      </span>
    )
  }
  if (days <= 90) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        <AlertTriangle className="h-3 w-3" /> {prefix}expires in {days}d ({expiryDate})
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
      <CheckCircle2 className="h-3 w-3" /> {prefix}valid until {expiryDate}
    </span>
  )
}
