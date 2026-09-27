import { describe, expect, it } from "vitest"
import { assessFit, employerSignalFor, fitLevelFor } from "./fit-check"

const job = { mustHave: ["SQL", "Python", "Tableau", "Stakeholder management", "Excel"], niceToHave: ["dbt", "AWS"] }

describe("fitLevelFor", () => {
  it("maps must-have coverage to fixed levels", () => {
    expect([5, 4, 3, 2, 1, 0].map((covered) => fitLevelFor(covered, 5))).toEqual(["strong", "strong", "good", "partial", "stretch", "stretch"])
    expect(fitLevelFor(0, 0)).toBe("unclear")
  })
})

describe("assessFit", () => {
  it("gives the same verdict regardless of skill order, duplicates or casing", () => {
    const a = assessFit({ ...job, userSkills: ["SQL", "python", "Excel", "AWS"], visaType: "UK Skilled Worker" })
    const b = assessFit({ ...job, userSkills: ["aws", "excel", "Python", "sql", "SQL"], visaType: "UK Skilled Worker" })
    expect(b).toEqual(a)
    expect(a.fitLevel).toBe("good")
    expect(a.applyAdvice).toBe("prepare")
    expect(a.mustHaveCovered).toBe(3)
    expect(a.missing).toEqual(["Tableau", "Stakeholder management"])
    expect(a.applyReasons[0]).toBe("You cover 3 of 5 must-have skills")
  })

  it("advises skipping a partial fit with no sponsorship mention", () => {
    expect(assessFit({ ...job, userSkills: ["SQL", "Excel"], visaType: null }).applyAdvice).toBe("skip")
    expect(assessFit({ ...job, userSkills: ["SQL", "Excel"], visaType: "UK Skilled Worker" }).applyAdvice).toBe("prepare")
  })
})

describe("employerSignalFor", () => {
  it("reads the visa tag", () => {
    expect(employerSignalFor("UK Skilled Worker")).toBe("strong")
    expect(employerSignalFor("Other")).toBe("none")
    expect(employerSignalFor("Graduate visa")).toBe("weak")
  })
})
