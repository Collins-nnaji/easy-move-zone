// ─── Multi-country mortgage lender data ──────────────────────────────────────
// Each lender is suited to a specific country with local context.
// Rates are annual %. Loan amounts in LOCAL currency unless noted.

export type LenderType =
  | "government"   // NHF, NHFC, etc.
  | "pension"      // RSA/pension-backed
  | "diaspora"     // Foreign-income accepted
  | "commercial"   // Standard bank mortgage
  | "microfinance" // Low-income / smaller loans

export interface MortgageLender {
  id: string
  country: string
  countryCode: string        // ISO 2-letter
  currency: string           // e.g. "NGN", "KES", "GHS", "ZAR", "USD"
  currencySymbol: string
  name: string               // Institution name
  productName: string        // Product name
  type: LenderType
  minRate: number            // % p.a.
  maxRate: number
  maxLoanLocal: number       // in local currency
  maxLoanUsd: number         // rough USD equiv for comparison
  minDownPct: number         // % of property value
  maxTenureYears: number
  minMonthlyIncomeLocal: number
  keyFeatures: string[]
  processingWeeks: string
  cities: string[]
  phone?: string
  website?: string
  whoIsItFor: string         // plain-language summary
}

// ─── USD approximate rates (used for cross-country comparison) ──────────────
// NGN ~1600/USD | KES ~130/USD | GHS ~16/USD | ZAR ~19/USD | UGX ~3750/USD | TZS ~2600/USD

export const LENDERS: MortgageLender[] = [

  // ── NIGERIA ────────────────────────────────────────────────────────────────

  {
    id: "ng-fmbn-nhf",
    country: "Nigeria", countryCode: "NG", currency: "NGN", currencySymbol: "₦",
    name: "Federal Mortgage Bank of Nigeria (FMBN)",
    productName: "NHF Mortgage",
    type: "government",
    minRate: 6, maxRate: 9,
    maxLoanLocal: 15_000_000, maxLoanUsd: 9_375,
    minDownPct: 0, maxTenureYears: 30,
    minMonthlyIncomeLocal: 30_000,
    keyFeatures: [
      "Lowest rate in Nigeria (6–9% p.a.)",
      "0% down payment possible",
      "Government-backed, no PMI",
      "Up to ₦15M loan",
      "30-year maximum tenure",
    ],
    processingWeeks: "6–12 weeks",
    cities: ["Lagos", "Abuja", "Port Harcourt", "Enugu", "Ibadan", "Kano"],
    phone: "+234 (0) 700 326 2672",
    website: "https://fmbn.gov.ng",
    whoIsItFor: "Formal sector employees (government or private) who have contributed to NHF for at least 6 months. Best for first-time buyers on modest incomes.",
  },
  {
    id: "ng-stanbic-rsa",
    country: "Nigeria", countryCode: "NG", currency: "NGN", currencySymbol: "₦",
    name: "Stanbic IBTC Bank",
    productName: "RSA Pension-Backed Mortgage",
    type: "pension",
    minRate: 14, maxRate: 18,
    maxLoanLocal: 70_000_000, maxLoanUsd: 43_750,
    minDownPct: 5, maxTenureYears: 20,
    minMonthlyIncomeLocal: 150_000,
    keyFeatures: [
      "Use 25% of RSA pension as down payment",
      "PENCOM-approved",
      "No separate collateral required",
      "Up to ₦70M loan",
    ],
    processingWeeks: "4–8 weeks",
    cities: ["Lagos", "Abuja", "Port Harcourt"],
    website: "https://www.stanbicibtcbank.com",
    whoIsItFor: "Employees with an active RSA pension account. Ideal if you have a good pension balance but limited liquid savings for a down payment.",
  },
  {
    id: "ng-uba-diaspora",
    country: "Nigeria", countryCode: "NG", currency: "NGN", currencySymbol: "₦",
    name: "United Bank for Africa (UBA)",
    productName: "DiasporaHome Mortgage",
    type: "diaspora",
    minRate: 12, maxRate: 16,
    maxLoanLocal: 150_000_000, maxLoanUsd: 93_750,
    minDownPct: 20, maxTenureYears: 15,
    minMonthlyIncomeLocal: 500_000,
    keyFeatures: [
      "Foreign income accepted (GBP/USD/EUR)",
      "Video KYC from abroad",
      "Dedicated diaspora relationship manager",
      "Up to ₦150M loan",
    ],
    processingWeeks: "6–10 weeks",
    cities: ["Lagos", "Abuja"],
    website: "https://www.ubagroup.com",
    whoIsItFor: "Nigerians living abroad who earn in foreign currency and want to buy property in Nigeria. No physical branch visit required.",
  },
  {
    id: "ng-access-diaspora",
    country: "Nigeria", countryCode: "NG", currency: "NGN", currencySymbol: "₦",
    name: "Access Bank",
    productName: "DiasporaHub Mortgage",
    type: "diaspora",
    minRate: 13, maxRate: 17,
    maxLoanLocal: 200_000_000, maxLoanUsd: 125_000,
    minDownPct: 20, maxTenureYears: 20,
    minMonthlyIncomeLocal: 500_000,
    keyFeatures: [
      "Multi-currency income accepted",
      "Digital-first application",
      "Partner developer pipeline",
      "Up to ₦200M loan",
    ],
    processingWeeks: "6–12 weeks",
    cities: ["Lagos", "Abuja", "Port Harcourt"],
    website: "https://www.accessbankplc.com",
    whoIsItFor: "Diaspora buyers who want the highest loan ceiling in Nigeria. Works best when buying from developer partners.",
  },
  {
    id: "ng-access-commercial",
    country: "Nigeria", countryCode: "NG", currency: "NGN", currencySymbol: "₦",
    name: "Access Bank",
    productName: "HomeBase Mortgage",
    type: "commercial",
    minRate: 15, maxRate: 22,
    maxLoanLocal: 500_000_000, maxLoanUsd: 312_500,
    minDownPct: 20, maxTenureYears: 20,
    minMonthlyIncomeLocal: 300_000,
    keyFeatures: [
      "Highest loan amounts (up to ₦500M)",
      "Fast approval for salaried employees",
      "Refinancing available",
      "Flexible tenure options",
    ],
    processingWeeks: "3–6 weeks",
    cities: ["Lagos", "Abuja", "Port Harcourt", "Enugu"],
    website: "https://www.accessbankplc.com",
    whoIsItFor: "High-income salaried or self-employed buyers who need large loans and want commercial bank speed and flexibility.",
  },
  {
    id: "ng-firstbank-commercial",
    country: "Nigeria", countryCode: "NG", currency: "NGN", currencySymbol: "₦",
    name: "FirstBank Nigeria",
    productName: "HomeLoan Plus",
    type: "commercial",
    minRate: 16, maxRate: 25,
    maxLoanLocal: 250_000_000, maxLoanUsd: 156_250,
    minDownPct: 20, maxTenureYears: 15,
    minMonthlyIncomeLocal: 200_000,
    keyFeatures: [
      "Nationwide branch coverage",
      "Top-up loans available",
      "Refinancing available",
      "Salary account preferred",
    ],
    processingWeeks: "4–8 weeks",
    cities: ["Lagos", "Abuja", "Port Harcourt", "Enugu", "Ibadan"],
    website: "https://www.firstbanknigeria.com",
    whoIsItFor: "Existing FirstBank customers or salaried workers who want nationwide support with a well-known lender.",
  },

  // ── KENYA ──────────────────────────────────────────────────────────────────

  {
    id: "ke-kcb-home",
    country: "Kenya", countryCode: "KE", currency: "KES", currencySymbol: "KSh",
    name: "KCB Bank Kenya",
    productName: "KCB Home Loan",
    type: "commercial",
    minRate: 12.5, maxRate: 15,
    maxLoanLocal: 50_000_000, maxLoanUsd: 384_615,
    minDownPct: 10, maxTenureYears: 25,
    minMonthlyIncomeLocal: 50_000,
    keyFeatures: [
      "Up to KSh 50M loan",
      "10% minimum deposit",
      "25-year maximum tenure",
      "Repayment holiday option",
      "Free valuation for new applicants",
    ],
    processingWeeks: "4–6 weeks",
    cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
    website: "https://ke.kcbgroup.com",
    whoIsItFor: "Salaried or self-employed Kenyan residents looking for a reliable mainstream bank mortgage with long tenures.",
  },
  {
    id: "ke-equity-home",
    country: "Kenya", countryCode: "KE", currency: "KES", currencySymbol: "KSh",
    name: "Equity Bank Kenya",
    productName: "Equity Home Loan",
    type: "commercial",
    minRate: 13, maxRate: 16,
    maxLoanLocal: 30_000_000, maxLoanUsd: 230_769,
    minDownPct: 10, maxTenureYears: 20,
    minMonthlyIncomeLocal: 40_000,
    keyFeatures: [
      "Accessible to informal sector workers",
      "Mobile-first application (Equity App)",
      "Community-based credit assessment",
      "Up to KSh 30M",
    ],
    processingWeeks: "3–6 weeks",
    cities: ["Nairobi", "Mombasa", "Eldoret", "Kisumu", "Nakuru"],
    website: "https://equitygroupholdings.com",
    whoIsItFor: "Middle-income buyers, especially those in the informal sector or with non-traditional income streams.",
  },
  {
    id: "ke-nhc-affordable",
    country: "Kenya", countryCode: "KE", currency: "KES", currencySymbol: "KSh",
    name: "National Housing Corporation (NHC)",
    productName: "Affordable Housing Mortgage",
    type: "government",
    minRate: 7, maxRate: 9,
    maxLoanLocal: 4_000_000, maxLoanUsd: 30_769,
    minDownPct: 0, maxTenureYears: 25,
    minMonthlyIncomeLocal: 20_000,
    keyFeatures: [
      "Government affordable housing scheme",
      "0% down payment for qualifying buyers",
      "Subsidised interest rate (7–9%)",
      "Linked to National Housing Fund contributions",
    ],
    processingWeeks: "8–14 weeks",
    cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
    website: "https://nhc.co.ke",
    whoIsItFor: "Low to middle-income Kenyans contributing to the National Housing Fund. Best for first-time buyers in affordable housing developments.",
  },
  {
    id: "ke-stanchart-premium",
    country: "Kenya", countryCode: "KE", currency: "KES", currencySymbol: "KSh",
    name: "Standard Chartered Kenya",
    productName: "MortgageSmart",
    type: "commercial",
    minRate: 12, maxRate: 14.5,
    maxLoanLocal: 100_000_000, maxLoanUsd: 769_231,
    minDownPct: 15, maxTenureYears: 25,
    minMonthlyIncomeLocal: 150_000,
    keyFeatures: [
      "Highest loan ceiling in Kenya (KSh 100M)",
      "Competitive rates for premium segment",
      "Digital application & approval",
      "Multi-currency income considered",
    ],
    processingWeeks: "3–5 weeks",
    cities: ["Nairobi", "Mombasa"],
    website: "https://www.sc.com/ke",
    whoIsItFor: "High-income buyers or those purchasing premium properties. Best for diaspora Kenyans or expats earning in foreign currency.",
  },

  // ── GHANA ──────────────────────────────────────────────────────────────────

  {
    id: "gh-ghb-home",
    country: "Ghana", countryCode: "GH", currency: "GHS", currencySymbol: "GH₵",
    name: "Ghana Home Loans (GHL)",
    productName: "Home Purchase Loan",
    type: "commercial",
    minRate: 28, maxRate: 35,
    maxLoanLocal: 2_000_000, maxLoanUsd: 125_000,
    minDownPct: 20, maxTenureYears: 20,
    minMonthlyIncomeLocal: 3_000,
    keyFeatures: [
      "Ghana's largest dedicated mortgage lender",
      "USD-denominated loans for stable payments",
      "20-year tenure",
      "Pre-approval in 5 business days",
    ],
    processingWeeks: "4–8 weeks",
    cities: ["Accra", "Kumasi", "Takoradi"],
    website: "https://ghanahomeloansghl.com",
    whoIsItFor: "Ghanaian residents or diaspora buyers wanting GHS or USD-based mortgage from Ghana's most experienced mortgage specialist.",
  },
  {
    id: "gh-republic-mortgage",
    country: "Ghana", countryCode: "GH", currency: "GHS", currencySymbol: "GH₵",
    name: "Republic Bank Ghana",
    productName: "Home Ownership Loan",
    type: "commercial",
    minRate: 26, maxRate: 32,
    maxLoanLocal: 1_500_000, maxLoanUsd: 93_750,
    minDownPct: 20, maxTenureYears: 15,
    minMonthlyIncomeLocal: 4_000,
    keyFeatures: [
      "Fast-track approval for salaried workers",
      "Flexible repayment schedules",
      "Insurance waiver available",
      "Up to GH₵1.5M",
    ],
    processingWeeks: "3–6 weeks",
    cities: ["Accra", "Kumasi"],
    website: "https://republicghana.com",
    whoIsItFor: "Salaried employees in Ghana looking for a reliable mainstream bank with branch support across Accra and Kumasi.",
  },
  {
    id: "gh-nhf-govt",
    country: "Ghana", countryCode: "GH", currency: "GHS", currencySymbol: "GH₵",
    name: "Mortgage Finance Company (MFC Ghana)",
    productName: "Affordable Home Loan",
    type: "government",
    minRate: 15, maxRate: 22,
    maxLoanLocal: 600_000, maxLoanUsd: 37_500,
    minDownPct: 10, maxTenureYears: 20,
    minMonthlyIncomeLocal: 1_500,
    keyFeatures: [
      "Lower rate via SSNIT-backed scheme",
      "10% down payment",
      "Government housing project preference",
      "Accessible to informal sector workers",
    ],
    processingWeeks: "6–10 weeks",
    cities: ["Accra", "Kumasi", "Takoradi", "Tamale"],
    whoIsItFor: "Low to middle-income Ghanaians, especially SSNIT contributors. Good for buyers of government affordable housing units.",
  },

  // ── SOUTH AFRICA ───────────────────────────────────────────────────────────

  {
    id: "za-sa-homeloans",
    country: "South Africa", countryCode: "ZA", currency: "ZAR", currencySymbol: "R",
    name: "SA Home Loans",
    productName: "Variable Rate Home Loan",
    type: "commercial",
    minRate: 11.25, maxRate: 13.5,
    maxLoanLocal: 10_000_000, maxLoanUsd: 526_315,
    minDownPct: 10, maxTenureYears: 30,
    minMonthlyIncomeLocal: 15_000,
    keyFeatures: [
      "South Africa's leading non-bank lender",
      "30-year repayment term",
      "Bond origination assistance",
      "Access Bond (revolving credit) feature",
      "No early settlement penalties",
    ],
    processingWeeks: "3–5 weeks",
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
    website: "https://www.sahomeloans.com",
    whoIsItFor: "South African residents who want a specialist mortgage lender with the most competitive rates and flexible access bond.",
  },
  {
    id: "za-absa-home",
    country: "South Africa", countryCode: "ZA", currency: "ZAR", currencySymbol: "R",
    name: "Absa Bank",
    productName: "Absa Home Loan",
    type: "commercial",
    minRate: 11.5, maxRate: 14,
    maxLoanLocal: 15_000_000, maxLoanUsd: 789_473,
    minDownPct: 10, maxTenureYears: 30,
    minMonthlyIncomeLocal: 20_000,
    keyFeatures: [
      "100% bonds available for qualifying buyers",
      "HomeOwner Insurance bundled",
      "Digital pre-qualification in minutes",
      "Dedicated home loan consultant",
    ],
    processingWeeks: "2–4 weeks",
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Bloemfontein"],
    website: "https://www.absa.co.za",
    whoIsItFor: "South African residents wanting a big-4 bank mortgage with the possibility of 100% financing and a full digital application process.",
  },
  {
    id: "za-nhfc-affordable",
    country: "South Africa", countryCode: "ZA", currency: "ZAR", currencySymbol: "R",
    name: "National Housing Finance Corporation (NHFC)",
    productName: "FLISP Subsidy + Linked Mortgage",
    type: "government",
    minRate: 8, maxRate: 11,
    maxLoanLocal: 1_500_000, maxLoanUsd: 78_947,
    minDownPct: 0, maxTenureYears: 30,
    minMonthlyIncomeLocal: 3_500,
    keyFeatures: [
      "FLISP housing subsidy (R10k–R121k) reduces loan",
      "0% down for qualifying buyers",
      "Subsidised rate for gap market (R3,500–R22,000/month income)",
      "Works alongside major bank mortgages",
    ],
    processingWeeks: "8–16 weeks",
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"],
    website: "https://nhfc.co.za",
    whoIsItFor: "South Africans earning R3,500–R22,000/month who qualify for the FLISP government housing subsidy. Ideal for first-time buyers.",
  },

  // ── KENYA — DIASPORA ───────────────────────────────────────────────────────

  {
    id: "ke-ncba-diaspora",
    country: "Kenya", countryCode: "KE", currency: "USD", currencySymbol: "$",
    name: "NCBA Bank Kenya",
    productName: "Diaspora Home Loan",
    type: "diaspora",
    minRate: 8.5, maxRate: 12,
    maxLoanLocal: 500_000, maxLoanUsd: 500_000,
    minDownPct: 20, maxTenureYears: 20,
    minMonthlyIncomeLocal: 2_000,
    keyFeatures: [
      "USD/GBP/EUR income accepted",
      "Remote application and KYC",
      "Up to $500K USD-denominated loan",
      "Dedicated diaspora banking team",
    ],
    processingWeeks: "6–10 weeks",
    cities: ["Nairobi", "Mombasa"],
    website: "https://ke.ncbagroup.com",
    whoIsItFor: "Kenyans living abroad who earn in foreign currency and want to buy property in Kenya without returning home.",
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getLendersByCountry(country: string): MortgageLender[] {
  return LENDERS.filter((l) => l.country.toLowerCase() === country.toLowerCase())
}

export function getLendersByCountryCode(code: string): MortgageLender[] {
  return LENDERS.filter((l) => l.countryCode.toLowerCase() === code.toLowerCase())
}

export const SUPPORTED_COUNTRIES = [
  { name: "Nigeria", code: "NG", flag: "🇳🇬", currency: "NGN", currencySymbol: "₦", usdRate: 1600 },
  { name: "Kenya", code: "KE", flag: "🇰🇪", currency: "KES", currencySymbol: "KSh", usdRate: 130 },
  { name: "Ghana", code: "GH", flag: "🇬🇭", currency: "GHS", currencySymbol: "GH₵", usdRate: 16 },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", currency: "ZAR", currencySymbol: "R", usdRate: 19 },
]

export function getCountryInfo(countryName: string) {
  return SUPPORTED_COUNTRIES.find((c) => c.name.toLowerCase() === countryName.toLowerCase())
}

export function formatLocalCurrency(amount: number, symbol: string): string {
  if (amount >= 1_000_000_000) return `${symbol}${(amount / 1_000_000_000).toFixed(2)}B`
  if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${symbol}${(amount / 1_000).toFixed(0)}K`
  return `${symbol}${amount.toLocaleString()}`
}
