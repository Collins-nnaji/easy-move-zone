// ─── Mortgage brokers (onboardable partners) ─────────────────────────────────
// Used alongside lender search; chat can suggest brokers and we surface them in results.

export interface MortgageBroker {
  id: string
  name: string
  company: string
  countries: string[]        // e.g. ["Nigeria", "Kenya"]
  email?: string
  phone?: string
  website?: string
  specialisms: string[]     // e.g. ["NHF", "Diaspora", "First-time buyer"]
  verified: boolean
}

export const BROKERS: MortgageBroker[] = [
  {
    id: "broker-ng-1",
    name: "Lagos Home Finance Advisors",
    company: "LHFA",
    countries: ["Nigeria"],
    email: "enquiries@lhfa.ng",
    phone: "+234 700 000 0000",
    website: "https://example.com",
    specialisms: ["NHF", "RSA pension", "First-time buyer"],
    verified: true,
  },
  {
    id: "broker-ng-2",
    name: "Diaspora Mortgage Partners",
    company: "DMP",
    countries: ["Nigeria", "Kenya"],
    email: "hello@diasporamortgage.com",
    specialisms: ["Diaspora", "Foreign income"],
    verified: true,
  },
  {
    id: "broker-ke-1",
    name: "Nairobi Mortgage Hub",
    company: "NMH",
    countries: ["Kenya"],
    phone: "+254 700 000 000",
    specialisms: ["KCB", "Equity", "NHC", "First-time buyer"],
    verified: true,
  },
  {
    id: "broker-za-1",
    name: "Cape Town Home Loans",
    company: "CTHL",
    countries: ["South Africa"],
    email: "info@cthomeloans.co.za",
    specialisms: ["FLISP", "Absa", "First-time buyer"],
    verified: true,
  },
]

export function getBrokersByCountry(country: string): MortgageBroker[] {
  const c = country?.trim().toLowerCase()
  if (!c) return []
  return BROKERS.filter((b) =>
    b.countries.some((co) => co.toLowerCase() === c)
  )
}

export function getAllBrokers(): MortgageBroker[] {
  return BROKERS
}
