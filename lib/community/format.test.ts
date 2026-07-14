import { describe, expect, it } from "vitest"
import { timeAgo } from "./format"

describe("timeAgo", () => {
  const now = new Date("2026-07-14T12:00:00Z").getTime()

  it("shows minutes for recent times, flooring to at least 1m", () => {
    expect(timeAgo(new Date(now - 30 * 1000).toISOString(), now)).toBe("1m ago")
    expect(timeAgo(new Date(now - 5 * 60 * 1000).toISOString(), now)).toBe("5m ago")
    expect(timeAgo(new Date(now - 59 * 60 * 1000).toISOString(), now)).toBe("59m ago")
  })

  it("shows hours under a day", () => {
    expect(timeAgo(new Date(now - 2 * 60 * 60 * 1000).toISOString(), now)).toBe("2h ago")
    expect(timeAgo(new Date(now - 23 * 60 * 60 * 1000).toISOString(), now)).toBe("23h ago")
  })

  it("shows days under a month", () => {
    expect(timeAgo(new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(), now)).toBe("3d ago")
  })

  it("falls back to a calendar date beyond a month", () => {
    const result = timeAgo(new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString(), now)
    expect(result).not.toMatch(/ago$/)
    expect(result.length).toBeGreaterThan(0)
  })

  it("never returns a negative/future duration for clock skew", () => {
    expect(timeAgo(new Date(now + 60 * 1000).toISOString(), now)).toBe("1m ago")
  })

  it("returns an empty string for an unparseable date", () => {
    expect(timeAgo("not-a-date", now)).toBe("")
  })
})
