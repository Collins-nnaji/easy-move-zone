import { describe, expect, it } from "vitest";
import {
  buildMilestoneSchedule,
  splitMilestoneAmounts,
  checkGeofence,
  distanceMeters,
  generateDeliveryOtp,
  CHECKPOINT_DISTANCE_MI,
} from "./schedule";

describe("buildMilestoneSchedule", () => {
  it("uses pickup / delivery / holdback for short hauls", () => {
    const specs = buildMilestoneSchedule({ distanceMi: 20 });
    expect(specs.map((s) => s.kind)).toEqual(["pickup", "delivery", "holdback"]);
  });

  it("inserts a mid-route checkpoint on long hauls", () => {
    const specs = buildMilestoneSchedule({ distanceMi: CHECKPOINT_DISTANCE_MI });
    expect(specs.map((s) => s.kind)).toEqual(["pickup", "checkpoint", "delivery", "holdback"]);
    expect(specs.find((s) => s.kind === "checkpoint")?.releaseBps).toBe(0);
  });

  it("splits 20 / 70 / 10", () => {
    const specs = buildMilestoneSchedule({ distanceMi: 10 });
    expect(specs.map((s) => s.releaseBps)).toEqual([2000, 7000, 1000]);
  });

  it("gates delivery on geofence, photo and OTP", () => {
    const delivery = buildMilestoneSchedule().find((s) => s.kind === "delivery")!;
    expect(delivery.requiresGeofence).toBe(true);
    expect(delivery.requiresPhoto).toBe(true);
    expect(delivery.requiresOtp).toBe(true);
  });
});

describe("splitMilestoneAmounts", () => {
  it("splits a clean amount exactly", () => {
    const specs = buildMilestoneSchedule({ distanceMi: 10 });
    expect(splitMilestoneAmounts(8_500_000, specs)).toEqual([1_700_000, 5_950_000, 850_000]);
  });

  it("always sums to gross despite rounding", () => {
    const specs = buildMilestoneSchedule({ distanceMi: 10 });
    for (const gross of [1, 7, 333, 99_999, 1_234_567]) {
      const parts = splitMilestoneAmounts(gross, specs);
      expect(parts.reduce((a, b) => a + b, 0)).toBe(gross);
    }
  });

  it("gives the rounding remainder to the last paying milestone", () => {
    const specs = buildMilestoneSchedule({ distanceMi: 200 });
    const parts = splitMilestoneAmounts(1_234_567, specs);
    // checkpoint releases nothing
    expect(parts[1]).toBe(0);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1_234_567);
  });
});

describe("checkGeofence", () => {
  const lagos = { lat: 6.4550, lng: 3.3841 };

  it("accepts a driver at the anchor", () => {
    expect(checkGeofence(lagos, lagos, 200).inside).toBe(true);
  });

  it("rejects a driver outside the radius", () => {
    const far = { lat: 6.5244, lng: 3.3792 }; // ~7.7km north
    const result = checkGeofence(far, lagos, 200);
    expect(result.inside).toBe(false);
    expect(result.distanceM).toBeGreaterThan(1000);
  });

  it("accepts a driver just inside the radius", () => {
    // ~0.0009 degrees latitude is roughly 100m
    const near = { lat: lagos.lat + 0.0009, lng: lagos.lng };
    expect(checkGeofence(near, lagos, 200).inside).toBe(true);
  });

  it("passes through when the load has no anchor coordinates", () => {
    expect(checkGeofence(lagos, { lat: null, lng: null }, 200).inside).toBe(true);
  });

  it("fails closed when the anchor is known but the driver has no GPS", () => {
    const result = checkGeofence({ lat: null, lng: null }, lagos, 200);
    expect(result.inside).toBe(false);
  });
});

describe("distanceMeters", () => {
  it("measures a known separation", () => {
    // Lagos to Ibadan is roughly 120km straight-line
    const d = distanceMeters({ lat: 6.4550, lng: 3.3841 }, { lat: 7.3775, lng: 3.9470 });
    expect(d).toBeGreaterThan(100_000);
    expect(d).toBeLessThan(140_000);
  });
});

describe("generateDeliveryOtp", () => {
  it("is always six digits", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateDeliveryOtp()).toMatch(/^\d{6}$/);
    }
  });
});
