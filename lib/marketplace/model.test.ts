import { describe, it, expect } from "vitest";
import {
  estimateMove,
  DEFAULT_PRICING,
  validPricing,
  due,
  canChangeMove,
  validPhotos,
} from "./model";
const input = {
  service: "home",
  size: "Two bedrooms",
  extras: ["Packing"],
  pickup: "Yaba",
  destination: "Lekki",
  pickupFloor: 0,
  destinationFloor: 0,
};
import type { Move } from "@/lib/moving/model";
describe("marketplace rules", () => {
  it("increases ranges with distance, city, floors, truck and area fees", () => {
    const base = estimateMove({
      ...input,
      pickupFloor: 0,
      destinationFloor: 0,
    });
    for (const patch of [
      { distanceKm: 40 },
      { city: "Port Harcourt" },
      { pickupFloor: 3 },
      { truckSize: "10-tonne truck" },
    ])
      expect(
        estimateMove({
          ...input,
          pickupFloor: 0,
          destinationFloor: 0,
          ...patch,
        }).low,
      ).toBeGreaterThan(base.low);
    expect(
      estimateMove(
        { ...input, pickupFloor: 0, destinationFloor: 0 },
        { ...DEFAULT_PRICING, areaFees: { Lekki: 10000 } },
      ).low,
    ).toBeGreaterThan(base.low);
  });
  it("rejects malformed or out-of-bounds pricing", () => {
    expect(validPricing(DEFAULT_PRICING)).toBe(true);
    for (const patch of [
      { commissionPercent: 30 },
      { depositPercent: 0 },
      { perKm: -1 },
      { floorMultiplier: Infinity },
      { cityMultipliers: { Lagos: 1 } },
      { truckFees: { Auto: 0 } },
    ])
      expect(validPricing({ ...DEFAULT_PRICING, ...patch })).toBe(false);
  });
  it("charges only the unpaid deposit and balance", () => {
    const m = {
      status: "quoted",
      quote: 100000,
      paidAmount: 10000,
      depositPercent: 30,
    } as Move;
    expect(due(m, "deposit")).toBe(20000);
    expect(due(m, "balance")).toBe(90000);
    expect(due({ ...m, status: "requested" }, "deposit")).toBe(0);
    expect(due({ ...m, status: "cancelled" }, "balance")).toBe(0);
    expect(due({ ...m, paidAmount: 100000 }, "balance")).toBe(0);
  });
  it("enforces the 48-hour change boundary and rejects changes in transit", () => {
    const m = { status: "scheduled", date: "2026-10-13" } as Move;
    expect(canChangeMove(m, new Date("2026-10-10T12:00:00Z"))).toBe(true);
    expect(canChangeMove(m, new Date("2026-10-12T00:00:00Z"))).toBe(false);
    expect(
      canChangeMove(
        { ...m, status: "transit" },
        new Date("2026-10-10T12:00:00Z"),
      ),
    ).toBe(false);
  });
  it("rejects SVG, oversized and excessive evidence uploads", () => {
    expect(validPhotos(["data:image/png;base64,AAA="])).toBe(true);
    expect(validPhotos(["data:image/svg+xml;base64,AAA="])).toBe(false);
    expect(validPhotos(Array(4).fill("data:image/png;base64,AAA="))).toBe(
      false,
    );
    expect(validPhotos(["data:image/png;base64," + "A".repeat(2800001)])).toBe(
      false,
    );
  });
});
