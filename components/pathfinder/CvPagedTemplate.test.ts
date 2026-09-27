import { describe, expect, it } from "vitest"
import { paginateBlocks } from "./CvPagedTemplate"
import { autoBullet, parseBulletText, toggleBullets } from "@/lib/documents/bullets"

const geometry = { pageHeight: 1000, marginTop: 50, marginBottom: 60, keepLine: 30 }

function lines(count: number, start = 50, height = 30) {
  return Array.from({ length: count }, (_, index) => ({ top: start + index * height, bottom: start + (index + 1) * height }))
}

describe("paginateBlocks", () => {
  it("keeps a short CV on one page without pushes", () => {
    const result = paginateBlocks(lines(10), geometry)
    expect(result.pageCount).toBe(1)
    expect(result.pushes.every((push) => push === 0)).toBe(true)
  })

  it("moves only the line that would enter the bottom margin", () => {
    const result = paginateBlocks(lines(40), geometry)
    const first = result.pushes.findIndex(Boolean)
    // Lines 0-28 end at or before 940 (page bottom minus margin); line 29 would cross it.
    expect(first).toBe(29)
    expect(result.pushes.filter(Boolean)).toHaveLength(1)
    expect(lines(40)[29].top + result.pushes[29]).toBe(1050)
    expect(result.pageCount).toBe(2)
  })

  it("keeps a heading with the line after it", () => {
    const blocks = lines(30)
    blocks[28] = { ...blocks[28], keepWithNext: true }
    const result = paginateBlocks(blocks, geometry)
    expect(result.pushes[28]).toBeGreaterThan(0)
    expect(result.pushes[29]).toBe(0)
  })
})

describe("bullets", () => {
  it("parses bullet markers and bullets plain text like Rekruuter", () => {
    expect(parseBulletText("• Led team\n- Cut costs")).toEqual({ lines: ["Led team", "Cut costs"], isBulleted: true })
    expect(autoBullet("Led the team. Cut costs by 10%.")).toBe("• Led the team.\n• Cut costs by 10%.")
    expect(toggleBullets("• One\n• Two")).toBe("One\nTwo")
  })
})
