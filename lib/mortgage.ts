/* ─────────────────────────────────────────────────────────────
   EasyMoveZone Mortgage Hub — Core Calculation Engine
   All calculations in Nigerian Naira (₦). Rates as percentages (9 = 9%).
───────────────────────────────────────────────────────────── */

/* ─── Types ─── */

export interface AmortizationRow {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
  cumulativeInterest: number
}

export interface DTIResult {
  frontEnd: number
  backEnd: number
  decision: "approved" | "review" | "declined"
  frontEndStatus: "pass" | "warn" | "fail"
  backEndStatus: "pass" | "warn" | "fail"
  maxAffordablePayment: number
}

export interface EarlyPayoffResult {
  originalMonths: number
  newMonths: number
  monthsSaved: number
  interestSaved: number
  totalInterestWithExtra: number
  totalInterestOriginal: number
  freedomDate: string
  originalPayoffDate: string
}

export interface ProductMatch {
  productId: string
  productName: string
  bank: string
  type: LoanProduct["type"]
  matchScore: number
  eligible: boolean
  rate: number
  maxLoan: number
  minDownPaymentPct: number
  maxTenureYears: number
  reasons: string[]
  keyFeatures: string[]
}

export interface NHFResult {
  eligible: boolean
  maxLoanAmount: number
  monthlyContribution: number
  reasons: string[]
  nextSteps: string[]
}

export interface LoanProduct {
  id: string
  name: string
  bank: string
  type: "nhf" | "rsa" | "diaspora" | "commercial"
  minRate: number
  maxRate: number
  maxLoan: number
  minDownPaymentPct: number
  maxTenureYears: number
  maxDTI: number
  cities: string[]
  keyFeatures: string[]
  processingWeeks: string
  minIncome: number
}

/* ─── Loan Products Data ─── */

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: "nhf-fmbn",
    name: "NHF Mortgage",
    bank: "Federal Mortgage Bank (FMBN)",
    type: "nhf",
    minRate: 6,
    maxRate: 9,
    maxLoan: 15_000_000,
    minDownPaymentPct: 0,
    maxTenureYears: 30,
    maxDTI: 33,
    cities: ["Lagos", "Abuja", "Port Harcourt", "Enugu", "Ibadan", "Kano"],
    keyFeatures: [
      "Lowest rate in Nigeria (6-9%)",
      "Up to ₦15M loan amount",
      "Government-backed, no PMI",
      "30-year maximum tenure",
      "0% down payment possible",
    ],
    processingWeeks: "6-12 weeks",
    minIncome: 30_000,
  },
  {
    id: "rsa-stanbic",
    name: "RSA Pension-Backed Mortgage",
    bank: "Stanbic IBTC",
    type: "rsa",
    minRate: 14,
    maxRate: 18,
    maxLoan: 70_000_000,
    minDownPaymentPct: 5,
    maxTenureYears: 20,
    maxDTI: 40,
    cities: ["Lagos", "Abuja", "Port Harcourt"],
    keyFeatures: [
      "Use 25% of RSA as down payment",
      "PENCOM-approved product",
      "No separate collateral required",
      "Up to ₦70M loan amount",
    ],
    processingWeeks: "4-8 weeks",
    minIncome: 150_000,
  },
  {
    id: "rsa-arm",
    name: "RSA-Backed Home Finance",
    bank: "ARM Pension / ARM Mortgage",
    type: "rsa",
    minRate: 15,
    maxRate: 19,
    maxLoan: 50_000_000,
    minDownPaymentPct: 10,
    maxTenureYears: 20,
    maxDTI: 40,
    cities: ["Lagos", "Abuja"],
    keyFeatures: [
      "ARM Pension RSA integration",
      "No additional collateral",
      "Flexible repayment structure",
    ],
    processingWeeks: "4-10 weeks",
    minIncome: 200_000,
  },
  {
    id: "diaspora-uba",
    name: "DiasporaHome Mortgage",
    bank: "UBA",
    type: "diaspora",
    minRate: 12,
    maxRate: 16,
    maxLoan: 150_000_000,
    minDownPaymentPct: 20,
    maxTenureYears: 15,
    maxDTI: 43,
    cities: ["Lagos", "Abuja"],
    keyFeatures: [
      "Foreign income accepted (GBP/USD/EUR)",
      "Video KYC from abroad",
      "Dedicated diaspora relationship manager",
      "Up to ₦150M loan",
    ],
    processingWeeks: "6-10 weeks",
    minIncome: 500_000,
  },
  {
    id: "diaspora-access",
    name: "DiasporaHub Mortgage",
    bank: "Access Bank",
    type: "diaspora",
    minRate: 13,
    maxRate: 17,
    maxLoan: 200_000_000,
    minDownPaymentPct: 20,
    maxTenureYears: 20,
    maxDTI: 43,
    cities: ["Lagos", "Abuja", "Port Harcourt"],
    keyFeatures: [
      "Multi-currency income considered",
      "Partner with leading Nigerian developers",
      "Digital-first application",
      "Up to ₦200M loan",
    ],
    processingWeeks: "6-12 weeks",
    minIncome: 500_000,
  },
  {
    id: "commercial-access",
    name: "HomeBase Mortgage",
    bank: "Access Bank",
    type: "commercial",
    minRate: 15,
    maxRate: 22,
    maxLoan: 500_000_000,
    minDownPaymentPct: 20,
    maxTenureYears: 20,
    maxDTI: 43,
    cities: ["Lagos", "Abuja", "Port Harcourt", "Enugu"],
    keyFeatures: [
      "Highest loan amounts (up to ₦500M)",
      "Fast approval for salaried employees",
      "Refinancing available",
      "Flexible tenure options",
    ],
    processingWeeks: "3-6 weeks",
    minIncome: 300_000,
  },
  {
    id: "commercial-stanbic",
    name: "Home Loan",
    bank: "Stanbic IBTC Bank",
    type: "commercial",
    minRate: 17,
    maxRate: 22,
    maxLoan: 300_000_000,
    minDownPaymentPct: 15,
    maxTenureYears: 20,
    maxDTI: 43,
    cities: ["Lagos", "Abuja"],
    keyFeatures: [
      "15% minimum down payment",
      "Competitive market rates",
      "Online application portal",
      "Quick disbursement",
    ],
    processingWeeks: "3-8 weeks",
    minIncome: 250_000,
  },
  {
    id: "commercial-firstbank",
    name: "HomeLoan Plus",
    bank: "FirstBank Nigeria",
    type: "commercial",
    minRate: 16,
    maxRate: 25,
    maxLoan: 250_000_000,
    minDownPaymentPct: 20,
    maxTenureYears: 15,
    maxDTI: 40,
    cities: ["Lagos", "Abuja", "Port Harcourt", "Enugu", "Ibadan"],
    keyFeatures: [
      "Nationwide branch coverage",
      "Top-up loans available",
      "Salary account preferred",
      "Refinancing available",
    ],
    processingWeeks: "4-8 weeks",
    minIncome: 200_000,
  },
]

/* ─── Core Calculations ─── */

/**
 * Standard amortization monthly payment formula:
 * P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calcMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0) return 0
  if (annualRate === 0) return principal / months
  const r = annualRate / 100 / 12
  const payment = principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  return Math.round(payment)
}

/**
 * Full amortization schedule for a loan.
 * Returns up to 360 rows (30 years).
 */
export function calcAmortizationSchedule(
  principal: number,
  annualRate: number,
  months: number
): AmortizationRow[] {
  const payment = calcMonthlyPayment(principal, annualRate, months)
  const r = annualRate / 100 / 12
  const rows: AmortizationRow[] = []
  let balance = principal
  let cumulativeInterest = 0

  for (let month = 1; month <= months; month++) {
    const interest = Math.round(balance * r)
    const principalPaid = Math.min(payment - interest, balance)
    balance = Math.max(0, balance - principalPaid)
    cumulativeInterest += interest

    rows.push({
      month,
      payment,
      principal: Math.round(principalPaid),
      interest,
      balance: Math.round(balance),
      cumulativeInterest: Math.round(cumulativeInterest),
    })
  }
  return rows
}

/**
 * DTI (Debt-to-Income) analysis.
 * Front-end: mortgage / gross income (28% guideline)
 * Back-end: (mortgage + other debt) / gross income (43% hard limit)
 */
export function calcDTI(
  mortgagePayment: number,
  otherDebt: number,
  grossIncome: number
): DTIResult {
  if (grossIncome <= 0) return {
    frontEnd: 0, backEnd: 0, decision: "declined",
    frontEndStatus: "fail", backEndStatus: "fail",
    maxAffordablePayment: 0,
  }

  const frontEnd = (mortgagePayment / grossIncome) * 100
  const backEnd = ((mortgagePayment + otherDebt) / grossIncome) * 100

  const frontEndStatus: DTIResult["frontEndStatus"] =
    frontEnd <= 28 ? "pass" : frontEnd <= 33 ? "warn" : "fail"
  const backEndStatus: DTIResult["backEndStatus"] =
    backEnd <= 43 ? "pass" : backEnd <= 50 ? "warn" : "fail"

  let decision: DTIResult["decision"]
  if (frontEndStatus === "fail" || backEndStatus === "fail") decision = "declined"
  else if (frontEndStatus === "warn" || backEndStatus === "warn") decision = "review"
  else decision = "approved"

  return {
    frontEnd: Math.round(frontEnd * 10) / 10,
    backEnd: Math.round(backEnd * 10) / 10,
    decision,
    frontEndStatus,
    backEndStatus,
    maxAffordablePayment: Math.round(grossIncome * 0.28),
  }
}

/**
 * Simulates early payoff with extra monthly payments.
 * Uses while-loop (dynamic termination) per the Python reference engine.
 */
export function calcEarlyPayoff(
  principal: number,
  annualRate: number,
  months: number,
  extraPayment: number
): EarlyPayoffResult {
  const r = annualRate / 100 / 12
  const basePayment = calcMonthlyPayment(principal, annualRate, months)
  const totalPayment = basePayment + extraPayment

  // Original total interest (fixed loop)
  const originalSchedule = calcAmortizationSchedule(principal, annualRate, months)
  const totalInterestOriginal = originalSchedule.reduce((sum, row) => sum + row.interest, 0)

  // Early payoff (while loop)
  let balance = principal
  let newMonths = 0
  let totalInterestWithExtra = 0

  while (balance > 0 && newMonths < months * 2) {
    newMonths++
    const interest = Math.round(balance * r)
    const principalPaid = Math.min(totalPayment - interest, balance)
    totalInterestWithExtra += interest
    balance -= principalPaid
  }

  const monthsSaved = Math.max(0, months - newMonths)

  const now = new Date()
  const newPayoffDate = new Date(now)
  newPayoffDate.setMonth(newPayoffDate.getMonth() + newMonths)
  const originalPayoffDate = new Date(now)
  originalPayoffDate.setMonth(originalPayoffDate.getMonth() + months)

  const fmt = (d: Date) => d.toLocaleDateString("en-NG", { month: "long", year: "numeric" })

  return {
    originalMonths: months,
    newMonths,
    monthsSaved,
    interestSaved: Math.max(0, totalInterestOriginal - totalInterestWithExtra),
    totalInterestWithExtra: Math.round(totalInterestWithExtra),
    totalInterestOriginal: Math.round(totalInterestOriginal),
    freedomDate: fmt(newPayoffDate),
    originalPayoffDate: fmt(originalPayoffDate),
  }
}

/**
 * PENCOM rule: 25% of RSA balance for housing down payment.
 */
export function calcRSAUnlock(rsaBalance: number): number {
  return Math.round(rsaBalance * 0.25)
}

/**
 * NHF eligibility check based on FMBN rules.
 * - Formal employment only (not self-employed)
 * - Minimum 6 months contribution
 * - Max loan: 60x monthly basic salary, hard cap ₦15M
 */
export function calcNHFEligibility(
  monthlySalary: number,
  yearsContributed: number,
  employmentType: "government" | "private" | "self" | "diaspora"
): NHFResult {
  const eligible = yearsContributed >= 0.5 && employmentType !== "self" && employmentType !== "diaspora"
  const maxLoanAmount = eligible ? Math.min(monthlySalary * 60, 15_000_000) : 0
  const monthlyContribution = Math.round(monthlySalary * 0.025) // 2.5% of basic salary

  const reasons: string[] = []
  const nextSteps: string[] = []

  if (!eligible) {
    if (employmentType === "self") reasons.push("NHF is only for formal employment (government or private sector employees)")
    if (employmentType === "diaspora") reasons.push("Diaspora applicants are not eligible for NHF")
    if (yearsContributed < 0.5) reasons.push("Minimum 6 months NHF contribution required")
    nextSteps.push("Consider RSA-backed or Commercial mortgage options")
    nextSteps.push("If employed formally, register for NHF through your employer")
  } else {
    reasons.push("Formal employment confirmed")
    reasons.push(`${yearsContributed} year${yearsContributed !== 1 ? "s" : ""} of NHF contribution`)
    reasons.push("Eligible for FMBN NHF mortgage")
    nextSteps.push("Visit nearest FMBN office with your NHF statement")
    nextSteps.push("Provide employer confirmation letter")
    nextSteps.push("Submit property documents for valuation")
    nextSteps.push("Apply via EMZ for faster processing")
  }

  return { eligible, maxLoanAmount, monthlyContribution, reasons, nextSteps }
}

/**
 * Rule-based product matching engine.
 * Returns all products with a match score (0-100), sorted by score descending.
 */
export function matchLoanProducts(
  creditScore: "excellent" | "good" | "fair" | "poor" | "unknown",
  dti: number,
  downPaymentPct: number,
  loanAmount: number,
  isNHF: boolean,
  isRSA: boolean,
  isDiaspora: boolean
): ProductMatch[] {
  return LOAN_PRODUCTS
    .map((product) => {
      const reasons: string[] = []
      let score = 50 // base
      let eligible = true

      // Type gating
      if (product.type === "nhf" && !isNHF) {
        eligible = false
        reasons.push("NHF requires formal employment and minimum 6 months contribution")
        return { ...baseMatch(product), matchScore: 0, eligible: false, reasons }
      }
      if (product.type === "rsa" && !isRSA) {
        eligible = false
        reasons.push("RSA-backed mortgage requires an active pension fund account")
        return { ...baseMatch(product), matchScore: 0, eligible: false, reasons }
      }
      if (product.type === "diaspora" && !isDiaspora) {
        eligible = false
        reasons.push("Diaspora mortgage requires Nigerian abroad status")
        return { ...baseMatch(product), matchScore: 0, eligible: false, reasons }
      }
      if (product.type === "commercial" && isDiaspora) {
        score -= 10
        reasons.push("Consider diaspora-specific products for better rates")
      }

      // Loan amount check
      if (loanAmount > product.maxLoan) {
        eligible = false
        reasons.push(`Loan amount exceeds this product's maximum (${fmtN(product.maxLoan)})`)
        return { ...baseMatch(product), matchScore: 0, eligible: false, reasons }
      } else {
        score += 15
        reasons.push(`Loan amount within limit (max ${fmtN(product.maxLoan)})`)
      }

      // Down payment check
      if (downPaymentPct < product.minDownPaymentPct) {
        eligible = false
        reasons.push(`Minimum ${product.minDownPaymentPct}% down payment required (you have ${downPaymentPct}%)`)
        return { ...baseMatch(product), matchScore: 0, eligible: false, reasons }
      } else {
        score += 10
        if (downPaymentPct >= product.minDownPaymentPct + 10) score += 10
      }

      // DTI check
      if (dti > product.maxDTI) {
        eligible = false
        reasons.push(`DTI ${dti.toFixed(1)}% exceeds this product's ${product.maxDTI}% limit`)
        return { ...baseMatch(product), matchScore: 0, eligible: false, reasons }
      } else {
        score += 15
        reasons.push(`DTI ratio acceptable for this product`)
      }

      // Credit score scoring
      const creditScoreMap = { excellent: 0, good: 10, fair: 20, poor: 30, unknown: 15 }
      const creditPenalty = creditScoreMap[creditScore]
      if (creditScore === "poor" && product.type === "commercial") {
        score -= 25
        reasons.push("Poor credit score may affect commercial mortgage eligibility")
      } else if (creditScore === "excellent") {
        score += 20
        reasons.push("Excellent credit score — strong eligibility")
      } else if (creditScore === "good") {
        score += 10
        reasons.push("Good credit score — solid eligibility")
      } else {
        score -= creditPenalty * 0.3
      }

      // Product-specific bonuses
      if (product.type === "nhf") { score += 15; reasons.push("Government-backed — most secure option") }
      if (product.type === "rsa") { score += 5; reasons.push("RSA down payment reduces cash needed upfront") }

      return {
        ...baseMatch(product),
        matchScore: Math.min(100, Math.max(0, Math.round(score))),
        eligible,
        reasons,
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

function baseMatch(product: LoanProduct): Omit<ProductMatch, "matchScore" | "eligible" | "reasons"> {
  return {
    productId: product.id,
    productName: product.name,
    bank: product.bank,
    type: product.type,
    rate: product.minRate,
    maxLoan: product.maxLoan,
    minDownPaymentPct: product.minDownPaymentPct,
    maxTenureYears: product.maxTenureYears,
    keyFeatures: product.keyFeatures.slice(0, 3),
  }
}

/* ─── Display Utilities ─── */

export function fmtN(n: number): string {
  if (n >= 1_000_000_000) return "₦" + (n / 1_000_000_000).toFixed(2) + "B"
  if (n >= 1_000_000) return "₦" + (n / 1_000_000).toFixed(1) + "M"
  return "₦" + n.toLocaleString("en-NG")
}

export function fmtRate(minRate: number, maxRate: number): string {
  return `${minRate}–${maxRate}%`
}

export const PRODUCT_TYPE_LABELS: Record<LoanProduct["type"], string> = {
  nhf: "NHF",
  rsa: "RSA-Backed",
  diaspora: "Diaspora",
  commercial: "Commercial",
}

export const PRODUCT_TYPE_COLORS: Record<LoanProduct["type"], { text: string; bg: string; border: string }> = {
  nhf: { text: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30" },
  rsa: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  diaspora: { text: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
  commercial: { text: "text-muted-foreground", bg: "bg-muted/50", border: "border-border" },
}
