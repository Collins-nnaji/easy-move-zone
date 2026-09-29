import { describe, expect, it } from "vitest"
import { companyKey } from "./company-match"
import {
  buildSponsorSearchIndex,
  closeCandidates,
  confidentCloseMatch,
  fallbackVerdict,
  verdictFromAi,
} from "./sponsor-similarity"

function index(names: string[]) {
  const byKey = new Map<string, string>()
  for (const name of names) {
    const key = companyKey(name)
    if (key.length > 1 && !byKey.has(key)) byKey.set(key, name)
  }
  const sortedKeys = [...byKey.keys()].sort()
  return buildSponsorSearchIndex(byKey, sortedKeys)
}

const register = index([
  "JPMorgan Securities plc",
  "Deloitte LLP",
  "Ernst & Young LLP",
  "HSBC Bank PLC",
  "Unilever UK Limited",
  "Acme Solutions Ltd",
  "Acme Holdings Ltd",
])

describe("closeCandidates", () => {
  it("finds a name that only differs by spacing or an extra word", () => {
    const hit = closeCandidates("JP Morgan", register)[0]
    expect(hit?.name).toBe("JPMorgan Securities plc")
    expect(hit?.score).toBeGreaterThanOrEqual(0.84)
    expect(confidentCloseMatch(closeCandidates("JP Morgan", register))?.name).toBe("JPMorgan Securities plc")
  })

  it("finds a one-letter misspelling", () => {
    const hit = closeCandidates("Deloite LLP", register)[0]
    expect(hit?.name).toBe("Deloitte LLP")
    expect(confidentCloseMatch(closeCandidates("Deloite LLP", register))?.name).toBe("Deloitte LLP")
  })

  it("finds initials, and leaves a two-letter abbreviation for AI", () => {
    const hits = closeCandidates("EY", register)
    expect(hits[0]?.name).toBe("Ernst & Young LLP")
    expect(confidentCloseMatch(hits)).toBeNull()
  })

  it("finds a short brand in front of a legal name", () => {
    const hits = closeCandidates("HSBC", register)
    expect(hits[0]?.name).toBe("HSBC Bank PLC")
    expect(hits[0]?.score).toBeGreaterThanOrEqual(0.72)
  })

  it("does not treat a different company as close", () => {
    expect(closeCandidates("Elevenlabs", register)).toEqual([])
  })

  it("does not treat two companies that only share a generic word as the same", () => {
    const hits = closeCandidates("Acme Digital", register)
    expect(confidentCloseMatch(hits)).toBeNull()
    expect(hits.every((hit) => hit.score < 0.84)).toBe(true)
  })
})

describe("AI verdicts", () => {
  const candidates = closeCandidates("EY", register)

  it("accepts a verdict only when the name is one of the candidates", () => {
    expect(verdictFromAi("match", "Ernst & Young LLP", candidates)).toEqual({ status: "likely", name: "Ernst & Young LLP" })
    expect(verdictFromAi("match", "PricewaterhouseCoopers LLP", candidates)).toBeNull()
    expect(verdictFromAi("none", null, candidates)).toEqual({ status: "not_listed", name: null })
  })

  it("falls back to a strong score when the model is unavailable", () => {
    expect(fallbackVerdict(candidates)).toEqual({ status: "likely", name: "Ernst & Young LLP" })
    expect(fallbackVerdict([])).toEqual({ status: "not_listed", name: null })
  })
})
