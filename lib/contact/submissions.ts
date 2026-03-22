import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export type ContactSubmissionInput = {
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  pageContext: string | null
}

export async function insertContactSubmission(input: ContactSubmissionInput): Promise<{ id: string } | null> {
  if (!sql) return null
  try {
    const rows = (await sql`
      INSERT INTO contact_submissions (name, email, phone, subject, message, page_context)
      VALUES (
        ${input.name.trim()},
        ${input.email.trim().toLowerCase()},
        ${input.phone?.trim() || null},
        ${input.subject?.trim() || null},
        ${input.message.trim()},
        ${input.pageContext?.trim() || null}
      )
      RETURNING id
    `) as { id: string }[]
    const row = rows[0]
    return row ? { id: row.id } : null
  } catch {
    return null
  }
}
