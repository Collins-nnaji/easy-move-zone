import { describe, expect, it } from "vitest"
import { normalizeSections, sectionsFromParsed } from "./cv-sections"

describe("sectionsFromParsed", () => {
  it("turns parsed extras into editable sections and skips empty lists", () => {
    const sections = sectionsFromParsed({
      certifications: [{ name: "AWS Solutions Architect", issuer: "Amazon", date: "2023" }],
      languages: [{ language: "English", proficiency: "Native" }, { language: "French" }],
      projects: [{ name: "Churn model", description: "Predicted churn", technologies: ["Python", "SQL"] }],
      awards: [],
    }, (index) => `s${index}`)
    expect(sections).toEqual([
      { id: "s0", title: "Certifications", bullets: true, content: "• AWS Solutions Architect — Amazon, 2023" },
      { id: "s1", title: "Languages", bullets: false, content: "English — Native\nFrench" },
      { id: "s2", title: "Projects", bullets: true, content: "• Churn model: Predicted churn (Python, SQL)" },
    ])
  })

  it("tolerates malformed saved data", () => {
    const parsed = { certifications: [null, { name: 42 }, { name: "PRINCE2" }], languages: "English" } as never
    expect(sectionsFromParsed(parsed, () => "x")).toEqual([{ id: "x", title: "Certifications", bullets: true, content: "• PRINCE2" }])
  })
})

describe("normalizeSections", () => {
  it("keeps valid sections and fills missing fields", () => {
    expect(normalizeSections([{ id: "a", title: "Interests", content: "Running", bullets: false }, { title: "Custom" }, "junk"]))
      .toEqual([{ id: "a", title: "Interests", content: "Running", bullets: false }, { id: "section-1", title: "Custom", content: "" }])
  })
})
