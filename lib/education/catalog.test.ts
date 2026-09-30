import { describe, expect, it } from "vitest"
import { classifySubject, durationMonthsFromText, feeToGbp, formatDuration, GENERAL_SUBJECT, subjectFromAsced, subjectFromCah } from "./catalog"

describe("classifySubject", () => {
  it.each([
    ["MSc Data Science", "Computing & data"],
    ["Information & Communication Technology", "Computing & data"],
    ["Bachelor of Engineering in Automation and Robotics", "Engineering"],
    ["Health Informatics", "Health & medicine"],
    ["BCL International", "Law"],
    ["Political Science", "Social sciences"],
    ["Master in Letters in Hispanic Studies", "Humanities & languages"],
    ["Circular Economy", "Environment & agriculture"],
    ["Bachelor of Arts (Honours) in Accounting and Finance", "Business & management"],
    ["International Hospitality Management", "Hospitality & tourism"],
    ["Music Education", "Education & teaching"],
  ])("%s → %s", (title, subject) => {
    expect(classifySubject(title)).toBe(subject)
  })

  it("falls back to general studies", () => {
    expect(classifySubject("BA Joint Honours")).toBe(GENERAL_SUBJECT)
  })
})

describe("official subject codes", () => {
  it("maps UK CAH codes, with tourism split out of business", () => {
    expect(subjectFromCah("CAH11-01-01", "Computer Science")).toBe("Computing & data")
    expect(subjectFromCah("CAH17-01-06", "Tourism Management")).toBe("Hospitality & tourism")
    expect(subjectFromCah("CAH23-01-01", "Combined Honours in Law")).toBe("Law")
  })

  it("maps Australian ASCED fields", () => {
    expect(subjectFromAsced("09 - Society and Culture", "0909 - Law", "Juris Doctor")).toBe("Law")
    expect(subjectFromAsced("08 - Management and Commerce", "0803 - Business and Management", "Bachelor of Business")).toBe("Business & management")
  })
})

describe("durations and fees", () => {
  it("parses and formats durations", () => {
    expect(durationMonthsFromText("1 year full-time")).toBe(12)
    expect(durationMonthsFromText("18 months")).toBe(18)
    expect(durationMonthsFromText("156 weeks")).toBe(36)
    expect(formatDuration(36)).toBe("3 years full-time")
    expect(formatDuration(18)).toBe("1.5 years full-time")
    expect(formatDuration(6)).toBe("6 months full-time")
  })

  it("converts fees to approximate pounds", () => {
    expect(feeToGbp(30000, 40000, "AUD")).toBe(15600)
    expect(feeToGbp(null, null, "EUR")).toBeNull()
  })
})
