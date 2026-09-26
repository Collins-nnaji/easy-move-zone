import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL

/** EasyMoveZone database. Job tables live in the `skilledjobs` schema. */
export const careerSql = DATABASE_URL ? neon(DATABASE_URL) : null

export function isCareerDbConfigured(): boolean {
  return Boolean(careerSql)
}
