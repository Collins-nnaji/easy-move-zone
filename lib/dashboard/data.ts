import { neon } from "@neondatabase/serverless"
import { formatNgnPrice } from "@/lib/property/db-row"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export interface DashboardSaved {
  id: string
  title: string
  city: string
  price: string
  verified: boolean
}
export interface DashboardTx {
  id: string
  title: string
  date: string
  amount: string
  status: string
}
export interface DashboardEnquiry {
  id: string
  title: string
  message: string
  status: string
  date: string
}
export interface DashboardDoc {
  name: string
  type: string
  date: string
}
export interface BuyerDashboard {
  saved: DashboardSaved[]
  transactions: DashboardTx[]
  enquiries: DashboardEnquiry[]
  documents: DashboardDoc[]
}

const EMPTY: BuyerDashboard = { saved: [], transactions: [], enquiries: [], documents: [] }

function fmtDate(value: unknown): string {
  try {
    return new Date(String(value)).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return ""
  }
}

/** Load a buyer's saved listings, transactions, enquiries and documents. */
export async function getBuyerDashboard(userId: string): Promise<BuyerDashboard> {
  if (!sql || !userId) return EMPTY
  try {
    const [savedRows, txRows, enqRows] = (await Promise.all([
      sql`
        SELECT p.id, p.title, p.city, p.price_ngn, p.verification_status
        FROM saved_properties sp JOIN properties p ON p.id = sp.property_id
        WHERE sp.user_id = ${userId}
        ORDER BY sp.created_at DESC LIMIT 20
      `,
      sql`
        SELECT t.id, t.status, t.agreed_amount_ngn, t.offer_amount_ngn, t.created_at, p.title
        FROM transactions t JOIN properties p ON p.id = t.property_id
        WHERE t.buyer_id = ${userId}
        ORDER BY t.created_at DESC LIMIT 20
      `,
      sql`
        SELECT e.id, e.message, e.status, e.created_at, p.title
        FROM enquiries e JOIN properties p ON p.id = e.property_id
        WHERE e.user_id = ${userId}
        ORDER BY e.created_at DESC LIMIT 20
      `,
    ])) as unknown as [
      Array<{ id: string; title: string; city: string; price_ngn: number | null; verification_status: string }>,
      Array<{ id: string; status: string; agreed_amount_ngn: number | null; offer_amount_ngn: number | null; created_at: string; title: string }>,
      Array<{ id: string; message: string; status: string; created_at: string; title: string }>,
    ]

    const saved: DashboardSaved[] = savedRows.map((r) => ({
      id: r.id,
      title: r.title,
      city: r.city,
      price: formatNgnPrice(r.price_ngn),
      verified: r.verification_status === "verified",
    }))

    const transactions: DashboardTx[] = txRows.map((r) => ({
      id: r.id,
      title: r.title,
      date: fmtDate(r.created_at),
      amount: formatNgnPrice(r.agreed_amount_ngn ?? r.offer_amount_ngn),
      status: r.status,
    }))

    const enquiries: DashboardEnquiry[] = enqRows.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      status: r.status,
      date: fmtDate(r.created_at),
    }))

    return { saved, transactions, enquiries, documents: [] }
  } catch {
    return EMPTY
  }
}
