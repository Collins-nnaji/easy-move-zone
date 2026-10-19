/**
 * Markets: everything that changes from one country to the next, in one place.
 *
 * EasyMoveZone is Nigeria-first: Nigeria is the default and, today, the only
 * live market. Nothing else in the code should hard-code naira, 7.5% VAT, a
 * +234 phone format, Nigerian states or Paystack — it asks this module. To
 * open a new country, add an entry here and in src/config/markets.js (same
 * codes and numbers — change both), give it its title documents in
 * titleDocuments.js, and set `live: true`.
 *
 * Rows store the country by name ("Nigeria"); marketFor() maps a name, a
 * code or nothing at all to a market, falling back to the default.
 */

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

const MARKETS = {
  NG: {
    code: 'NG',
    name: 'Nigeria',
    live: true,
    currency: 'NGN',
    locale: 'en-NG',
    timezone: 'Africa/Lagos',
    /** +234; a local number is 0 + 10 digits (0803 123 4567). */
    phone: { countryCode: '234', trunkPrefix: '0', nationalLength: 10 },
    tax: { name: 'VAT', percent: 7.5 },
    regionLabel: 'State',
    regions: NIGERIAN_STATES,
    /** Online payment provider and the currencies it can charge for this market. */
    payments: { provider: 'paystack', currencies: ['NGN'] },
    sms: { provider: 'termii' },
  },
};

const DEFAULT_MARKET = 'NG';
const DEFAULT_CURRENCY = MARKETS[DEFAULT_MARKET].currency;

const BY_NAME = Object.fromEntries(Object.values(MARKETS).map((m) => [m.name.toLowerCase(), m]));

/** The market for a country name or code; the default market when unknown. */
function marketFor(country) {
  const key = String(country || '').trim();
  return MARKETS[key.toUpperCase()] || BY_NAME[key.toLowerCase()] || MARKETS[DEFAULT_MARKET];
}

/** The market for a country only if we know it (no fallback) — e.g. to tell Nigeria from the UK. */
function knownMarket(country) {
  const key = String(country || '').trim();
  return MARKETS[key.toUpperCase()] || BY_NAME[key.toLowerCase()] || null;
}

/** The market whose currency this is (NGN → Nigeria). */
function marketForCurrency(currency) {
  const code = String(currency || '').toUpperCase();
  return Object.values(MARKETS).find((m) => m.currency === code) || MARKETS[DEFAULT_MARKET];
}

/** A valid ISO currency code, or the default market's. */
function currencyCode(value, fallback = DEFAULT_CURRENCY) {
  const code = String(value || '').trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : fallback;
}

/** Money as people in that market read it: ₦4,500,000. */
function formatMoney(amount, currency = DEFAULT_CURRENCY) {
  const code = currencyCode(currency);
  const n = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  try {
    return new Intl.NumberFormat(marketForCurrency(code).locale, {
      style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${code} ${Math.round(n).toLocaleString()}`;
  }
}

/** The sales tax charged on our fees in a market (Nigeria: VAT 7.5%). */
function taxPercentFor(country) {
  return marketFor(country).tax.percent;
}

/**
 * A phone number in international form without the plus (2348031234567), as
 * SMS providers want it. Numbers already carrying a country code are kept;
 * local ones get the market's code. Returns '' when it cannot be a number.
 */
function normalisePhone(phone, country) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  const { phone: p } = marketFor(country);
  if (String(phone).trim().startsWith('+') || digits.startsWith('00')) {
    const intl = digits.replace(/^00/, '');
    return intl.length >= 10 ? intl : '';
  }
  if (digits.startsWith(p.countryCode) && digits.length === p.countryCode.length + p.nationalLength) return digits;
  if (p.trunkPrefix && digits.startsWith(p.trunkPrefix) && digits.length === p.nationalLength + p.trunkPrefix.length) {
    return `${p.countryCode}${digits.slice(p.trunkPrefix.length)}`;
  }
  if (digits.length === p.nationalLength) return `${p.countryCode}${digits}`;
  return digits.length >= 10 ? digits : '';
}

/** Whether online payment can take this currency (Paystack: naira, for Nigeria). */
function canPayOnline(currency) {
  const code = currencyCode(currency);
  return marketForCurrency(code).payments.currencies.includes(code);
}

const LIVE_MARKETS = Object.values(MARKETS).filter((m) => m.live);

module.exports = {
  MARKETS, DEFAULT_MARKET, DEFAULT_CURRENCY, LIVE_MARKETS, NIGERIAN_STATES,
  marketFor, knownMarket, marketForCurrency, currencyCode, formatMoney, taxPercentFor, normalisePhone, canPayOnline,
};
