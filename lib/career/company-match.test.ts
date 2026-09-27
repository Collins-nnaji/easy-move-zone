import { describe, expect, it } from "vitest"
import { careerSiteFromJobUrl, companyKey, matchSponsorCompany, type CompanyIndexEntry } from "./company-match"

const index: CompanyIndexEntry[] = [
  { key: "google", name: "Google", jobCount: 12, latestUrl: "https://careers.google.com/jobs/1", savedCareerUrl: "https://careers.google.com" },
  { key: "royal", name: "Royal", jobCount: 2, latestUrl: "https://royal.example/jobs/1", savedCareerUrl: null },
  { key: "royal mail", name: "Royal Mail", jobCount: 8, latestUrl: "https://jobs.royalmail.com/1", savedCareerUrl: "https://jobs.royalmail.com" },
]

describe("companyKey", () => {
  it("strips legal suffixes so a sponsor licence matches a job employer", () => {
    expect(companyKey("GOOGLE UK LIMITED")).toBe("google")
    expect(companyKey("Amazon UK Services Ltd.")).toBe("amazon")
  })

  it("strips non-UK legal forms for other countries' registers", () => {
    expect(companyKey("Roblox B.V.")).toBe("roblox")
    expect(companyKey("Booking.com B.V.")).toBe(companyKey("Booking.com"))
    expect(companyKey("SAP SE")).toBe("sap")
    expect(companyKey("Siemens AG")).toBe("siemens")
    expect(companyKey("Zalando GmbH")).toBe("zalando")
    expect(companyKey("A.P. Møller - Mærsk A/S")).toBe(companyKey("A.P. Møller - Mærsk"))
  })
})

describe("matchSponsorCompany", () => {
  it("matches a licensed name to the jobs we hold", () => {
    expect(matchSponsorCompany("GOOGLE UK LIMITED", index)?.name).toBe("Google")
  })

  it("prefers the longer employer name", () => {
    expect(matchSponsorCompany("ROYAL MAIL GROUP LIMITED", index)?.name).toBe("Royal Mail")
  })
})

describe("careerSiteFromJobUrl", () => {
  it("uses the job link's origin as the careers site", () => {
    expect(careerSiteFromJobUrl("https://careers.google.com/jobs/123")).toBe("https://careers.google.com")
  })
})
