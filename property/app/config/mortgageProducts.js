/**
 * Published Nigerian home-loan terms, used only as a comparison.
 * Each figure names the page it came from. Lenders change them;
 * nothing here is an EasyMoveZone rate or an offer of credit.
 *
 * NHF: FMBN, https://fmbn.gov.ng/products/nhf_mortgage_loan
 *   6% to the contributor, up to ₦50 million, up to 30 years.
 *   Equity: loans up to ₦5 million have been offered with none;
 *   above that, plan on at least 10% (FMBN / Renewed Hope guidance).
 * MREIF: Stanbic IBTC, their MREIF home-loan page.
 *   9.75%, ₦10–100 million, 10% equity, 20 years employed / 7 self-employed.
 * Access Bank mortgage FAQ: 18–23% floating, max 70% of value,
 *   ₦10–200 million, Lagos, Abuja and Port Harcourt, buildings only.
 */

export const PRODUCTS = [
  {
    id: 'nhf',
    name: 'National Housing Fund',
    lender: 'FMBN, through a primary mortgage bank',
    rate: 6,
    rateLabel: '6% a year',
    rateNote: 'Fixed policy rate to the contributor. FMBN lends to the mortgage bank at 4%.',
    min: 0,
    max: 50000000,
    years: 30,
    equityPct: 10,
    equityNote: 'Up to ₦5 million, FMBN has offered the loan with no equity. Above that, put aside at least 10% of the price.',
    who: 'People who already pay 2.5% of basic salary into the NHF. Employed applicants need about six continuous months of contributions. Self-employed applicants are asked for a longer history, often up to three years.',
    fees: 'Arranged by an accredited primary mortgage bank. The bank, not EasyMoveZone, confirms charges, insurance and the equity for your amount.',
    where: 'Anywhere a licensed primary mortgage bank will take the application.',
    source: 'https://fmbn.gov.ng/products/nhf_mortgage_loan',
    sourceLabel: 'FMBN: NHF mortgage loan',
    floating: false,
  },
  {
    id: 'mreif',
    name: 'MREIF home loan',
    lender: 'Stanbic IBTC',
    rate: 9.75,
    rateLabel: '9.75% a year',
    rateNote: 'The rate Stanbic IBTC publishes for this product.',
    min: 10000000,
    max: 100000000,
    minPrice: 12500000,
    years: 20,
    selfEmployedYears: 7,
    equityPct: 10,
    equityNote: 'At least 10% of the price from you. The home itself should be worth at least ₦12.5 million.',
    who: 'Salaried applicants, up to 20 years or until retirement, and self-employed applicants for up to 7 years. Open to Nigerians in the diaspora. A pension-backed version exists after 60 months of RSA contributions.',
    fees: 'Management fee 1% and advisory fee 1%. Valuation, legal search, title perfection, charting in Lagos, and life and property insurance are extra and set by the bank.',
    where: 'Stanbic IBTC. Confirm the branch or the online application with the bank.',
    source: 'https://www.stanbicibtcbank.com/nigeriabank/personal/products-and-services/all-loans/stanbic-ibtc-mreif-home-loans',
    sourceLabel: 'Stanbic IBTC: MREIF home loans',
    floating: false,
  },
  {
    id: 'access',
    name: 'Bank mortgage',
    lender: 'Access Bank',
    rate: 18,
    rateHigh: 23,
    rateLabel: '18–23% a year',
    rateNote: 'Floating, and tied to the monetary policy rate. Access Bank publishes this band. The estimate uses 18% unless you pick the top of the band.',
    min: 10000000,
    max: 200000000,
    years: 20,
    equityPct: 30,
    equityNote: 'The bank’s maximum loan is 70% of the property value, so you bring at least 30%.',
    who: 'Salaried staff, self-employed people and business owners. The bank finances buildings, not bare land: a purchase, a loan against a home you already own, renovation, or a home still under construction.',
    fees: 'Commitment and management fees once, up front. An advisory fee each year on what you still owe. Credit-life insurance and insurance on the building.',
    where: 'Lagos, Abuja and Port Harcourt.',
    source: 'https://www.accessbankplc.com/help/frequently-asked-questions/mortgage-loans',
    sourceLabel: 'Access Bank: mortgage FAQ',
    floating: true,
  },
];

export function productById(id) {
  return PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
}

export function monthlyPayment(principal, annualRate, years) {
  const n = Math.round(Number(years) * 12);
  const r = Number(annualRate) / 100 / 12;
  if (!principal || !n || n < 1) return 0;
  if (!r) return principal / n;
  return principal * (r * (1 + r) ** n) / ((1 + r) ** n - 1);
}

/** What a published product would ask for on this price. Not an approval. */
export function quote(product, price, years, { highRate = false } = {}) {
  const p = Math.max(0, Number(price) || 0);
  const y = Math.max(0, Number(years) || 0);
  const equityPct = product.id === 'nhf' && p > 0 && p <= 5000000 ? 0 : product.equityPct;
  let down = p * (equityPct / 100);
  let loan = Math.max(0, p - down);
  let capped = false;
  if (product.max && loan > product.max) {
    capped = true;
    loan = product.max;
    down = Math.max(down, p - loan);
  }
  const rate = highRate && product.rateHigh ? product.rateHigh : product.rate;
  const monthly = monthlyPayment(loan, rate, y);
  return {
    price: p,
    years: y,
    rate,
    equityPct,
    down,
    loan,
    monthly,
    total: monthly * y * 12,
    capped,
    belowMin: Boolean(product.min && loan > 0 && loan < product.min),
    priceLow: Boolean(product.minPrice && p > 0 && p < product.minPrice),
  };
}
