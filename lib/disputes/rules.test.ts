import { describe, expect, it } from "vitest";
import {
  evaluateDispute,
  reliabilityPenalty,
  MANUAL_REVIEW_THRESHOLD_CENTS,
  type DisputeFacts,
} from "./rules";

const base: DisputeFacts = {
  category: "other",
  payoutCents: 1_000_000, // ₦10,000
  pickupConfirmed: false,
  deliveryConfirmed: false,
  hasPickupPhoto: false,
  hasDeliveryPhoto: false,
  hasValidOtp: false,
  respondentReplied: false,
  windowClosed: false,
  repeatOffender: false,
};

const facts = (over: Partial<DisputeFacts>): DisputeFacts => ({ ...base, ...over });

describe("safety incidents", () => {
  it("never auto-resolves", () => {
    const out = evaluateDispute(facts({ category: "safety_incident", deliveryConfirmed: true }));
    expect(out.status).toBe("escalated");
    expect(out.autoResolved).toBe(false);
  });
});

describe("manual review thresholds", () => {
  it("escalates high-value loads", () => {
    const out = evaluateDispute(
      facts({ category: "no_show", payoutCents: MANUAL_REVIEW_THRESHOLD_CENTS }),
    );
    expect(out.status).toBe("escalated");
  });

  it("escalates repeat offenders", () => {
    const out = evaluateDispute(facts({ category: "no_show", repeatOffender: true }));
    expect(out.status).toBe("escalated");
    expect(out.reason).toMatch(/repeat/i);
  });
});

describe("no-show", () => {
  it("refunds the operator when pickup was never confirmed", () => {
    const out = evaluateDispute(facts({ category: "no_show" }));
    expect(out.status).toBe("resolved");
    expect(out.resolution).toBe("refund_to_fleet");
    expect(out.driverShare).toBe(0);
    expect(out.autoResolved).toBe(true);
  });

  it("sends it to review when pickup did happen", () => {
    const out = evaluateDispute(facts({ category: "no_show", pickupConfirmed: true }));
    expect(out.status).toBe("review");
  });
});

describe("non-payment", () => {
  const proven = {
    category: "non_payment" as const,
    deliveryConfirmed: true,
    hasDeliveryPhoto: true,
    hasValidOtp: true,
  };

  it("pays the driver when delivery is proven and the operator stays silent", () => {
    const out = evaluateDispute(facts({ ...proven, windowClosed: true }));
    expect(out.resolution).toBe("release_to_driver");
    expect(out.driverShare).toBe(1);
    expect(out.autoResolved).toBe(true);
  });

  it("waits while the window is still open", () => {
    const out = evaluateDispute(facts({ ...proven, windowClosed: false }));
    expect(out.status).toBe("review");
  });

  it("reviews when the operator responded", () => {
    const out = evaluateDispute(
      facts({ ...proven, windowClosed: true, respondentReplied: true }),
    );
    expect(out.status).toBe("review");
    expect(out.autoResolved).toBe(false);
  });

  it("reviews when delivery evidence is incomplete", () => {
    const out = evaluateDispute(
      facts({ ...proven, hasValidOtp: false, windowClosed: true }),
    );
    expect(out.status).toBe("review");
    expect(out.reason).toMatch(/incomplete/i);
  });
});

describe("cargo damage and shortage", () => {
  it("never auto-resolves — a human compares the photos", () => {
    for (const category of ["cargo_damage", "shortage"] as const) {
      const out = evaluateDispute(
        facts({ category, hasPickupPhoto: true, hasDeliveryPhoto: true, windowClosed: true }),
      );
      expect(out.status).toBe("review");
      expect(out.autoResolved).toBe(false);
    }
  });

  it("flags missing baseline photos", () => {
    const out = evaluateDispute(facts({ category: "cargo_damage", hasDeliveryPhoto: true }));
    expect(out.reason).toMatch(/photo/i);
  });
});

describe("route deviation", () => {
  it("does not move money when the cargo still arrived", () => {
    const out = evaluateDispute(facts({ category: "route_deviation", deliveryConfirmed: true }));
    expect(out.resolution).toBe("no_action");
    expect(out.driverShare).toBe(1);
  });

  it("reviews a deviation with no delivery", () => {
    expect(evaluateDispute(facts({ category: "route_deviation" })).status).toBe("review");
  });
});

describe("uncategorised fallback", () => {
  it("follows the delivery evidence once the window closes unchallenged", () => {
    expect(
      evaluateDispute(facts({ windowClosed: true, deliveryConfirmed: true })).resolution,
    ).toBe("release_to_driver");
    expect(evaluateDispute(facts({ windowClosed: true })).resolution).toBe("refund_to_fleet");
  });

  it("holds while the window is open", () => {
    expect(evaluateDispute(facts({})).status).toBe("review");
  });
});

describe("reliabilityPenalty", () => {
  it("hits safety and no-shows hardest", () => {
    expect(reliabilityPenalty("safety_incident")).toBeGreaterThan(reliabilityPenalty("no_show"));
    expect(reliabilityPenalty("no_show")).toBeGreaterThan(reliabilityPenalty("route_deviation"));
  });
});
