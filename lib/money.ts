/** Marketplace money — Nigeria (NGN). Amounts in DB are kobo (cents of ₦1). */

export const MONEY = {
  code: "NGN",
  symbol: "₦",
  locale: "en-NG",
  /** Stripe / ISO currency code */
  stripe: "ngn",
} as const;

const formatter = new Intl.NumberFormat(MONEY.locale, {
  style: "currency",
  currency: MONEY.code,
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

const formatterExact = new Intl.NumberFormat(MONEY.locale, {
  style: "currency",
  currency: MONEY.code,
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format major units (e.g. 45000 → ₦45,000). */
export function formatMoney(amount: number, opts?: { exact?: boolean }): string {
  if (!Number.isFinite(amount)) return `${MONEY.symbol}0`;
  const fmt = opts?.exact || Math.abs(amount % 1) > 0 ? formatterExact : formatter;
  return fmt.format(amount);
}

/** Format kobo/cents (e.g. 4500000 → ₦45,000). */
export function formatMoneyFromCents(cents: number, opts?: { exact?: boolean }): string {
  return formatMoney(cents / 100, opts);
}

export function formatPayoutRate(amount: number, payoutType: "day" | "hour"): string {
  return payoutType === "day" ? `${formatMoney(amount)}/day` : `${formatMoney(amount)}/hr`;
}

/** Parse a user-entered amount string into major units. */
export function parseMoneyInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
