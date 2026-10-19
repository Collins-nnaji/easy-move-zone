import { CURRENCY, LOCALE } from '../config/markets';

const FALLBACK_SYMBOLS = { GBP: '£', NGN: '₦', USD: '$', EUR: '€' };

export function currencySymbol(currency = CURRENCY) {
  const code = String(currency || CURRENCY).toUpperCase();
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency', currency: code, currencyDisplay: 'narrowSymbol',
    }).formatToParts(0).find((part) => part.type === 'currency')?.value || code;
  } catch {
    return FALLBACK_SYMBOLS[code] || code;
  }
}

/** Compact money, e.g. £850k, $480m, NGN 480m. */
export function formatMoney(amount, currency = CURRENCY) {
  const n = Number(amount) || 0;
  const code = String(currency || CURRENCY).toUpperCase();
  const sym = currencySymbol(code);
  const abs = Math.abs(n);
  const space = sym.length > 2 ? '\u00a0' : '';
  if (abs >= 1_000_000_000) return `${sym}${space}${trim(n / 1_000_000_000)}bn`;
  if (abs >= 1_000_000) return `${sym}${space}${trim(n / 1_000_000)}m`;
  if (abs >= 1_000) return `${sym}${space}${trim(n / 1_000)}k`;
  return `${sym}${space}${n.toLocaleString(LOCALE)}`;
}

/** A date as people in the market read it: 18 Oct 2026. */
export function formatDate(value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(LOCALE, opts);
}

/** Full ISO-aware money with thousands separators. */
export function formatMoneyFull(amount, currency = CURRENCY) {
  const n = Number(amount) || 0;
  const code = String(currency || CURRENCY).toUpperCase();
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${code} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
}

function trim(v) {
  return Number(v.toFixed(v < 10 ? 1 : 0)).toString();
}

export function fundedPct(funded, goal) {
  const g = Number(goal) || 0;
  if (g <= 0) return 0;
  return Math.min(100, Math.round((Number(funded) / g) * 100));
}

export const PROPERTY_TYPE_LABELS = {
  residential: 'Residential',
  commercial: 'Commercial',
  development: 'Development',
  'buy-to-let': 'Buy-to-Let',
};
