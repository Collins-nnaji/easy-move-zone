import { describe, expect, it } from "vitest"
import {
  fallbackCustomDestination,
  resolveRequestDestination,
  sanitizeDestination,
  slugifyPlace,
} from "./custom-destination"
import { DESTINATIONS } from "../../app/move/data"

describe("slugifyPlace", () => {
  it("builds url-safe ids from city + country", () => {
    expect(slugifyPlace("Accra", "Ghana")).toBe("accra-ghana")
    expect(slugifyPlace("São Paulo", "Brazil")).toBe("sao-paulo-brazil")
    expect(slugifyPlace("  Kuala   Lumpur ", "Malaysia")).toBe("kuala-lumpur-malaysia")
  })
})

describe("fallbackCustomDestination", () => {
  it("produces a complete destination for any typed city", () => {
    const d = fallbackCustomDestination("Nairobi", "Kenya")
    expect(d.id).toBe("nairobi-kenya")
    expect(d.city).toBe("Nairobi")
    expect(d.country).toBe("Kenya")
    for (const m of ["trip", "nomad", "move"] as const) {
      expect(d.match[m]).toBeGreaterThan(0)
      expect(d.honest[m].length).toBeGreaterThan(10)
      expect(d.stats[m].length).toBe(3)
      expect(d.visa[m].headline.length).toBeGreaterThan(0)
    }
  })
})

describe("sanitizeDestination", () => {
  const fallback = fallbackCustomDestination("Accra", "Ghana")

  it("keeps valid AI output", () => {
    const d = sanitizeDestination(
      {
        city: "Accra",
        country: "Ghana",
        region: "Africa",
        match: { trip: 84, nomad: 76, move: 71 },
        honest: { trip: "Great energy.", nomad: "Growing scene.", move: "Plannable." },
        stats: { trip: [["Cost", "$60/day"]], nomad: [["Wifi", "35 Mbps"]], move: [["Rent", "$500/mo"]] },
        visa: {
          trip: { headline: "Visa on arrival for many", body: "Check your passport.", tag: "VOA" },
          nomad: { headline: "Tourist entry", body: "Covers short stints.", tag: "Tourist" },
          move: { headline: "Work/residence permit", body: "Employer sponsored.", tag: "Permit" },
        },
      },
      fallback,
    )
    expect(d.id).toBe("accra-ghana")
    expect(d.region).toBe("Africa")
    expect(d.match.trip).toBe(84)
    expect(d.visa.move.tag).toBe("Permit")
  })

  it("falls back field-by-field on junk", () => {
    const d = sanitizeDestination({ city: "Accra", country: "Ghana", region: "Mars", match: { trip: 9999 } }, fallback)
    expect(d.region).toBe(fallback.region)
    expect(d.match.trip).toBe(99) // clamped
    expect(d.match.nomad).toBe(fallback.match.nomad)
    expect(d.stats.move.length).toBeGreaterThan(0)
  })
})

describe("resolveRequestDestination", () => {
  it("uses the catalog entry for a known id with no payload", () => {
    const d = resolveRequestDestination("lisbon", DESTINATIONS, null)
    expect(d?.city).toBe("Lisbon")
  })

  it("prefers the client-supplied profile, sanitized against the catalog copy", () => {
    const d = resolveRequestDestination("lisbon", DESTINATIONS, {
      city: "Lisbon",
      country: "Portugal",
      honest: { move: "Fresh AI take." },
    })
    expect(d?.honest.move).toBe("Fresh AI take.")
    // Missing fields fall back to the catalog copy, not generic filler.
    expect(d?.visa.move.headline).toBe(DESTINATIONS.find((x) => x.id === "lisbon")!.visa.move.headline)
  })

  it("sanitizes a client-supplied custom destination when id is unknown", () => {
    const d = resolveRequestDestination("accra-ghana", DESTINATIONS, { city: "Accra", country: "Ghana", region: "Africa" })
    expect(d?.city).toBe("Accra")
    expect(d?.region).toBe("Africa")
  })

  it("returns null when the id is unknown and no usable payload is sent", () => {
    expect(resolveRequestDestination("nope", DESTINATIONS, null)).toBeNull()
    expect(resolveRequestDestination("nope", DESTINATIONS, { country: "Ghana" })).toBeNull()
  })
})
