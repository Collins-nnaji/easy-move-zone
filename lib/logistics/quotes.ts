import { neon } from "@neondatabase/serverless"
import { insertContactSubmission } from "@/lib/contact/submissions"
import type { FreightMode, ShipmentDirection } from "@/lib/logistics/catalog"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export type FreightQuoteInput = {
  name: string
  email: string
  phone: string | null
  company: string | null
  direction: ShipmentDirection
  originCountry: string
  destinationCountry: string
  mode: FreightMode | string
  cargoClass: string
  weightKg: string | null
  volumeCbm: string | null
  incoterm: string | null
  cargoDescription: string
  notes: string | null
}

export async function insertFreightQuote(input: FreightQuoteInput): Promise<{ id: string } | null> {
  const subject = `Freight quote · ${input.direction} · ${input.mode} · ${input.originCountry} → ${input.destinationCountry}`
  const message = [
    input.cargoDescription,
    input.company ? `Company: ${input.company}` : null,
    input.weightKg ? `Weight: ${input.weightKg} kg` : null,
    input.volumeCbm ? `Volume: ${input.volumeCbm} CBM` : null,
    input.incoterm ? `Incoterm: ${input.incoterm}` : null,
    input.notes ? `Notes: ${input.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  const pageContext = JSON.stringify({
    type: "freight_quote",
    direction: input.direction,
    originCountry: input.originCountry,
    destinationCountry: input.destinationCountry,
    mode: input.mode,
    cargoClass: input.cargoClass,
    weightKg: input.weightKg,
    volumeCbm: input.volumeCbm,
    incoterm: input.incoterm,
    company: input.company,
  })

  // Always persist via contact submissions so day-one works without a new migration.
  const contact = await insertContactSubmission({
    name: input.name,
    email: input.email,
    phone: input.phone,
    subject,
    message,
    pageContext,
  })

  if (sql) {
    try {
      await sql`
        INSERT INTO freight_quotes (
          name, email, phone, company, direction, origin_country, destination_country,
          mode, cargo_class, weight_kg, volume_cbm, incoterm, cargo_description, notes, status
        ) VALUES (
          ${input.name},
          ${input.email.toLowerCase()},
          ${input.phone},
          ${input.company},
          ${input.direction},
          ${input.originCountry},
          ${input.destinationCountry},
          ${input.mode},
          ${input.cargoClass},
          ${input.weightKg},
          ${input.volumeCbm},
          ${input.incoterm},
          ${input.cargoDescription},
          ${input.notes},
          'new'
        )
      `
    } catch {
      // Table may not exist yet — contact_submissions is the durable fallback.
    }
  }

  return contact
}
