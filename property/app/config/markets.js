/**
 * Markets: everything that changes from one country to the next. Same codes
 * and numbers as server/markets.js — change both together.
 *
 * EasyMoveZone is Nigeria-first. Nigeria is the default and, today, the only live
 * market, so every price is in naira and forms show a fixed "₦ Nigerian naira"
 * field instead of a currency picker. Code reads the market from here rather
 * than hard-coding naira, VAT, a +234 phone format or Nigerian states, so a
 * new country is a new entry (plus its title documents), not a rewrite.
 */
import { NIGERIAN_STATES } from './nigeria';

export const MARKETS = {
  NG: {
    code: 'NG',
    name: 'Nigeria',
    live: true,
    currency: 'NGN',
    currencyLabel: '₦ Nigerian naira',
    locale: 'en-NG',
    timezone: 'Africa/Lagos',
    phone: { countryCode: '234', trunkPrefix: '0', example: '0803 123 4567' },
    tax: { name: 'VAT', percent: 7.5 },
    regionLabel: 'State',
    regions: NIGERIAN_STATES,
    payments: { provider: 'Paystack', currencies: ['NGN'] },
    law: {
      governing: 'the laws of the Federal Republic of Nigeria',
      courts: 'the courts of Lagos State, Nigeria',
      dataProtection: 'the Nigeria Data Protection Act 2023 (NDPA)',
      regulator: 'the Nigeria Data Protection Commission (NDPC)',
    },
  },
};

export const DEFAULT_MARKET = 'NG';
export const MARKET = MARKETS[DEFAULT_MARKET];
export const LIVE_MARKETS = Object.values(MARKETS).filter((m) => m.live);

export const CURRENCY = MARKET.currency;
export const CURRENCY_LABEL = MARKET.currencyLabel;
export const CURRENCY_OPTIONS = LIVE_MARKETS.map((m) => ({ value: m.currency, label: `${m.currency} · ${m.currencyLabel.replace(/^\S+\s/, '')}` }));
/** Where a property is assumed to be until the owner says otherwise. */
export const DEFAULT_COUNTRY = MARKET.name;
export const LOCALE = MARKET.locale;

const BY_NAME = Object.fromEntries(Object.values(MARKETS).map((m) => [m.name.toLowerCase(), m]));

/** The market for a country name or code; the default market when unknown. */
export function marketFor(country) {
  const key = String(country || '').trim();
  return MARKETS[key.toUpperCase()] || BY_NAME[key.toLowerCase()] || MARKET;
}

/** The states/regions to offer for a country, or null when we do not have a list. */
export function regionsFor(country) {
  const key = String(country || '').trim().toLowerCase();
  const m = Object.values(MARKETS).find((x) => x.name.toLowerCase() === key || x.code.toLowerCase() === key);
  return m ? m.regions : null;
}

/**
 * Countries suggested in the property-country fields: live markets first
 * (Nigeria), then places owners in the diaspora often hold property.
 */
export const COUNTRY_SUGGESTIONS = [
  'Nigeria',
  'United Kingdom',
  'Ghana',
  'Kenya',
  'South Africa',
  'United Arab Emirates',
  'United States',
  'Canada',
  'Australia',
];

