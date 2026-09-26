import type { CostLine } from "./types"

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
})

export function formatGbp(amount: number): string {
  if (!Number.isFinite(amount)) return "£0"
  return gbp.format(amount)
}

export const COST_LABELS: { key: keyof CostLine; label: string }[] = [
  { key: "visa", label: "Visa" },
  { key: "flight", label: "Flight" },
  { key: "deposit", label: "Deposit" },
  { key: "rent", label: "First month rent" },
  { key: "emergency", label: "Emergency fund" },
  { key: "documents", label: "Documents" },
  { key: "other", label: "Other" },
]
