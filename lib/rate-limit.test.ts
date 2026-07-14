import { describe, expect, it } from "vitest"
import { rateLimit } from "./rate-limit"

/**
 * Minimal in-memory stand-in for the Neon sql client, understanding just the
 * three statements rateLimit issues (prune / count / insert).
 */
function fakeSql() {
  const rows: { auth_user_id: string; action: string; created_at: string }[] = []
  const client = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: async (text: string, params: any[] = []) => {
      if (/^\s*delete/i.test(text)) {
        const [userId, action, before] = params
        for (let i = rows.length - 1; i >= 0; i--) {
          if (rows[i].auth_user_id === userId && rows[i].action === action && rows[i].created_at < before) {
            rows.splice(i, 1)
          }
        }
        return []
      }
      if (/select\s+count/i.test(text)) {
        const [userId, action] = params
        const matching = rows.filter((r) => r.auth_user_id === userId && r.action === action)
        const oldest = matching.length ? matching.map((r) => r.created_at).sort()[0] : null
        return [{ count: matching.length, oldest }]
      }
      if (/^\s*insert/i.test(text)) {
        const [userId, action] = params
        rows.push({ auth_user_id: userId, action, created_at: new Date().toISOString() })
        return []
      }
      throw new Error(`unexpected query: ${text}`)
    },
  }
  return { client, rows }
}

describe("rateLimit", () => {
  it("allows up to the limit, then blocks", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { client } = fakeSql() as any

    const results = []
    for (let i = 0; i < 4; i++) {
      results.push(await rateLimit(client, "user-1", "test", 3, 600))
    }

    expect(results.map((r) => r.ok)).toEqual([true, true, true, false])
    expect(results[0].remaining).toBe(2)
    expect(results[2].remaining).toBe(0)
    expect(results[3].retryAfter).toBeGreaterThan(0)
  })

  it("does not record the blocked attempt (no runaway growth)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { client, rows } = fakeSql() as any
    for (let i = 0; i < 5; i++) await rateLimit(client, "user-1", "test", 2, 600)
    // Only the 2 allowed inserts should be stored.
    expect(rows.filter((r: { action: string }) => r.action === "test").length).toBe(2)
  })

  it("scopes limits per user and per action", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { client } = fakeSql() as any
    await rateLimit(client, "user-1", "a", 1, 600)
    const otherUser = await rateLimit(client, "user-2", "a", 1, 600)
    const otherAction = await rateLimit(client, "user-1", "b", 1, 600)
    expect(otherUser.ok).toBe(true)
    expect(otherAction.ok).toBe(true)
  })
})
