import { describe, expect, it } from "vitest"
import { groupSchools, groupJobs, groupTrips } from "./map-catalog"

describe("groupSchools", () => {
  it("groups by destination and carries the residency pathway through", () => {
    const grouped = groupSchools([
      {
        id: "lis-sch1",
        destination_id: "lisbon",
        institution: "Nova",
        program: "MSc",
        level: "Master's",
        tag: "D4 eligible",
        price: "€50",
        residency_pathway: "D4 can convert to a work permit.",
      },
      {
        id: "yyz-sch1",
        destination_id: "toronto",
        institution: "UofT",
        program: "MI",
        level: "Master's",
        tag: "Study permit",
        price: "CAD 156",
        residency_pathway: null,
      },
    ])

    expect(Object.keys(grouped).sort()).toEqual(["lisbon", "toronto"])
    expect(grouped.lisbon[0].residencyPathway).toBe("D4 can convert to a work permit.")
    // A null pathway from the DB should surface as undefined, not the string "null".
    expect(grouped.toronto[0].residencyPathway).toBeUndefined()
  })
})

describe("groupJobs", () => {
  it("keeps multiple rows for the same destination in insertion order", () => {
    const grouped = groupJobs([
      { id: "a", destination_id: "berlin", company: "A", role: "Eng", industry: "Tech", tag: "Blue Card", price: "€60k" },
      { id: "b", destination_id: "berlin", company: "B", role: "PM", industry: "Tech", tag: "Blue Card", price: "€70k" },
    ])
    expect(grouped.berlin.map((j) => j.id)).toEqual(["a", "b"])
  })
})

describe("groupTrips", () => {
  it("returns an empty object for no rows", () => {
    expect(groupTrips([])).toEqual({})
  })
})
