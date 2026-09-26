import { describe, expect, it } from "vitest"
import { EXAMPLE_PROFILE } from "./profile"
import { assessOne, assessAll } from "./score"
import { scoreJob, loadSponsorshipJobs } from "./jobs"

describe("move score", () => {
  const canada = assessOne(EXAMPLE_PROFILE, "canada")
  const germany = assessOne(EXAMPLE_PROFILE, "germany")
  const uk = assessOne(EXAMPLE_PROFILE, "united-kingdom")

  it("reads the Nigeria cybersecurity example the way the product describes it", () => {
    expect(canada?.primary.label).toBe("Likely eligible")
    expect(canada?.documents).toBe(12)
    expect(canada?.scores.visa).toBe(80)
    expect(canada?.scores.career).toBe(90)
    expect(canada?.scores.affordability).toBe(60)
    expect(canada?.scores.lifestyle).toBe(84)
    expect(canada?.scores.settlement).toBe(80)
    expect(canada?.readiness).toBeGreaterThanOrEqual(64)
    expect(canada?.readiness).toBeLessThanOrEqual(72)
    expect(canada?.jobLabel).toBe("Strong")

    expect(germany?.primary.name).toBe("Opportunity Card")
    expect(germany?.primary.label).toBe("Potentially eligible")
    expect(germany?.languageCallout).toMatch(/German/)
    expect(germany?.totalCostGbp).toBe(9500)
    expect(germany?.readiness).toBeGreaterThan(canada!.readiness)

    expect(uk?.primary.name).toBe("Skilled Worker")
    expect(uk?.primary.label).toBe("Requires employer sponsorship")
    expect(uk?.jobCount).toBe(43)
    expect(uk?.readiness).toBeLessThan(60)
  })

  it("ranks every destination and explains the match", () => {
    const ranked = assessAll(EXAMPLE_PROFILE)
    expect(ranked).toHaveLength(8)
    expect(ranked[0].scores.match).toBeGreaterThanOrEqual(ranked[1].scores.match)
    expect(canada?.why.toLowerCase()).toContain("english")
    expect(canada?.why.toLowerCase()).toContain("savings")
  })

  it("marks a family route unavailable for a single applicant", () => {
    const family = uk?.routes.find((route) => route.name === "Family")
    expect(family?.status).toBe("unavailable")
    expect(family?.label).toBe("Not currently applicable")
  })

  it("scores a Berlin role as 7 of 8 for the example profile", () => {
    const berlin = loadSponsorshipJobs().find((job) => job.id === "ber-dev")
    const scored = scoreJob(EXAMPLE_PROFILE, berlin!)
    expect(scored.met).toBe(7)
    expect(scored.total).toBe(8)
  })
})
