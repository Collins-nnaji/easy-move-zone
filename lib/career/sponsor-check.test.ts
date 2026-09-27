import { describe, expect, it } from "vitest"
import { companyKey } from "./company-match"
import { matchRegister, ukSponsorJobPlacement } from "./sponsor-check"

function index(names: string[]) {
  const byKey = new Map(names.map((name) => [companyKey(name), name]))
  return { at: Date.now(), byKey, sortedKeys: [...byKey.keys()].sort() }
}

const register = index(["Deloitte LLP", "Google (UK) Limited", "Unilever UK Limited", "Roblox B.V.", "Admiral Care Solutions Ltd"])

describe("matchRegister", () => {
  it("treats an exact collapsed name as on the register", () => {
    expect(matchRegister("Deloitte", register)).toEqual({ status: "licensed", name: "Deloitte LLP" })
    expect(matchRegister("Roblox", register)).toEqual({ status: "licensed", name: "Roblox B.V." })
  })

  it("flags a shared leading name as likely, for review", () => {
    expect(matchRegister("Unilever Ventures", register)?.status).toBe("likely")
    expect(matchRegister("Admiral", register)?.status).toBe("likely")
  })

  it("returns nothing when the company is not listed", () => {
    expect(matchRegister("Elevenlabs", register)).toBeNull()
  })
})

describe("ukSponsorJobPlacement", () => {
  it("tags UK roles and roles with no clear location", () => {
    expect(ukSponsorJobPlacement({ country: "United Kingdom", location: "Leeds" })).toEqual({ tag: true, country: "United Kingdom" })
    expect(ukSponsorJobPlacement({ country: "Other", location: "London, UK" })).toEqual({ tag: true, country: "United Kingdom" })
    expect(ukSponsorJobPlacement({ country: "Other", location: "Hybrid" }).tag).toBe(true)
  })

  it("leaves roles that are plainly in another country", () => {
    expect(ukSponsorJobPlacement({ country: "United States", location: "Austin" }).tag).toBe(false)
    expect(ukSponsorJobPlacement({ country: "Other", location: "San Francisco, CA" }).tag).toBe(false)
    expect(ukSponsorJobPlacement({ country: "Other", location: "Belfast, Northern Ireland" }).tag).toBe(true)
  })
})
