"use server"

import { neon } from "@neondatabase/serverless"
import { redirect } from "next/navigation"
import { authServer } from "@/lib/auth/server"
import { randomUUID } from "crypto"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function saveIndividualProfile(formData: FormData) {
  const session = await authServer.getSession()
  if (!session?.data?.user) throw new Error("Unauthorized")
  const { user } = session.data

  const citizenship = formData.get("citizenship") as string
  const familySize = parseInt((formData.get("familySize") as string) || "1", 10)
  const riskAppetite = formData.get("riskAppetite") as string

  if (sql) {
    // Attempt to update the user to individual
    await sql`UPDATE users SET user_type = 'individual' WHERE id = ${user.id}`
    
    // Check if profile exists, if not, insert
    const existing = await sql`SELECT id FROM individual_profiles WHERE user_id = ${user.id}`
    if (existing.length === 0) {
      const newId = randomUUID()
      await sql`
        INSERT INTO individual_profiles (id, user_id, citizenship, family_size, risk_appetite, target_cities)
        VALUES (${newId}, ${user.id}, ${citizenship}, ${familySize}, ${riskAppetite}, '[]'::jsonb)
      `
    }
  }
  
  redirect("/app/dashboard")
}

export async function saveCorporateProfile(formData: FormData) {
  const session = await authServer.getSession()
  if (!session?.data?.user) throw new Error("Unauthorized")
  const { user } = session.data

  const companyName = formData.get("companyName") as string
  const employeeCount = formData.get("employeeCount") as string
  const industry = formData.get("industry") as string

  if (sql) {
    // Attempt to update the user to corporate
    await sql`UPDATE users SET user_type = 'corporate' WHERE id = ${user.id}`
    
    // Check if profile exists, if not, insert
    const existing = await sql`SELECT id FROM corporate_profiles WHERE user_id = ${user.id}`
    if (existing.length === 0) {
      const newId = randomUUID()
      await sql`
        INSERT INTO corporate_profiles (id, user_id, company_name, employee_count, industry, status)
        VALUES (${newId}, ${user.id}, ${companyName}, ${employeeCount}, ${industry}, 'active')
      `
    }
  }

  redirect("/corp/dashboard")
}
