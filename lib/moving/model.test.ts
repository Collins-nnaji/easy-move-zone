import { describe, expect, it } from "vitest";
import { today, validateMove, type MoveInput } from "./model";
export const input: MoveInput = {
  service: "home",
  inventory: "Sofa, fridge, bed and 12 boxes",
  size: "Two bedrooms",
  pickup: "10 Example Street, Yaba, Lagos",
  destination: "20 Example Road, Lekki, Lagos",
  date: today(),
  pickupFloor: 0,
  destinationFloor: 2,
  access: "Stairs, no lift",
  extras: ["Loading crew", "Packing"],
  name: "Test Customer",
  email: "test@example.com",
  phone: "+2348000000000",
  photos: [],
};
describe("moving quote validation", () => {
  it("accepts all three moving services and same-city moves", () => {
    for (const service of ["home", "office", "item"])
      expect(validateMove({ ...input, service })).toBe(true);
  });
  it("rejects identical addresses, invalid dates and past moves", () => {
    expect(
      validateMove({ ...input, destination: input.pickup.toUpperCase() }),
    ).toBe(false);
    expect(validateMove({ ...input, date: "2026-02-30" })).toBe(false);
    expect(validateMove({ ...input, date: "2020-01-01" })).toBe(false);
  });
  it("rejects unsafe photos and invalid access or contact details", () => {
    for (const patch of [
      { photos: ["data:image/svg+xml;base64,AAA="] },
      { photos: Array(4).fill("data:image/png;base64,AAA=") },
      { pickupFloor: -1 },
      { destinationFloor: 1.5 },
      { phone: "hello" },
      { email: "invalid" },
      { extras: ["Unknown"] },
    ])
      expect(validateMove({ ...input, ...patch })).toBe(false);
  });
});
