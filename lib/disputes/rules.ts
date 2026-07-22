/**
 * Dispute auto-resolution rules.
 *
 * Cheap deterministic checks run first; only what they can't settle goes to a
 * human queue. Defaults are written down here (and should be mirrored in the
 * ToS) rather than improvised case by case.
 */

export type DisputeCategory =
  | "no_show"
  | "cargo_damage"
  | "shortage"
  | "non_payment"
  | "route_deviation"
  | "safety_incident"
  | "other";

export type DisputeResolution =
  | "release_to_driver"
  | "refund_to_fleet"
  | "split"
  | "no_action";

export type DisputeStatus = "open" | "evidence" | "review" | "escalated" | "resolved" | "withdrawn";

/** Hours each side gets to file evidence before auto-rules fire. */
export const EVIDENCE_WINDOW_HOURS = 48;

/** Above this value, never auto-resolve — a human reviews it. */
export const MANUAL_REVIEW_THRESHOLD_CENTS = 50_000_00; // ₦50,000

export interface DisputeFacts {
  category: DisputeCategory;
  /** Gross value of the load. */
  payoutCents: number;
  /** Driver reached the pickup geofence and confirmed. */
  pickupConfirmed: boolean;
  /** Driver reached the drop-off geofence, with photo + matching OTP. */
  deliveryConfirmed: boolean;
  /** Photo evidence exists at pickup and at delivery. */
  hasPickupPhoto: boolean;
  hasDeliveryPhoto: boolean;
  /** Receiver's OTP was entered and matched. */
  hasValidOtp: boolean;
  /** The party the dispute is against has responded within the window. */
  respondentReplied: boolean;
  /** The evidence window has closed. */
  windowClosed: boolean;
  /** Either party has prior upheld disputes. */
  repeatOffender: boolean;
}

export interface RuleOutcome {
  status: Extract<DisputeStatus, "review" | "escalated" | "resolved">;
  resolution: DisputeResolution | null;
  /** Fraction of the *held* balance awarded to the driver, 0–1. */
  driverShare: number;
  autoResolved: boolean;
  reason: string;
}

/**
 * Evaluate a dispute against the auto-resolve rules.
 *
 * Returns `review`/`escalated` when the facts don't decide it; the caller
 * routes those to the ops queue.
 */
export function evaluateDispute(facts: DisputeFacts): RuleOutcome {
  // Safety incidents never auto-resolve — they pause escrow and go to a human.
  if (facts.category === "safety_incident") {
    return {
      status: "escalated",
      resolution: null,
      driverShare: 0,
      autoResolved: false,
      reason: "Safety incident — escrow paused pending manual investigation.",
    };
  }

  // High-value or repeat-offender cases get eyes on them regardless of evidence.
  if (facts.payoutCents >= MANUAL_REVIEW_THRESHOLD_CENTS || facts.repeatOffender) {
    return {
      status: "escalated",
      resolution: null,
      driverShare: 0,
      autoResolved: false,
      reason: facts.repeatOffender
        ? "Repeat dispute history — routed to manual review."
        : "High-value load — routed to manual review.",
    };
  }

  // No-show: the driver never reached pickup, so there is nothing to pay for.
  if (facts.category === "no_show") {
    if (!facts.pickupConfirmed) {
      return {
        status: "resolved",
        resolution: "refund_to_fleet",
        driverShare: 0,
        autoResolved: true,
        reason: "Driver never confirmed pickup — held funds returned to the fleet operator.",
      };
    }
    return {
      status: "review",
      resolution: null,
      driverShare: 0,
      autoResolved: false,
      reason: "Pickup was confirmed, so the no-show claim needs review.",
    };
  }

  // Non-payment: delivery evidence exists, so the driver is owed unless the
  // operator produces something to the contrary inside the window.
  if (facts.category === "non_payment") {
    const deliveryProven =
      facts.deliveryConfirmed && facts.hasDeliveryPhoto && facts.hasValidOtp;
    if (deliveryProven && facts.windowClosed && !facts.respondentReplied) {
      return {
        status: "resolved",
        resolution: "release_to_driver",
        driverShare: 1,
        autoResolved: true,
        reason: "Delivery proven by GPS, photo and receiver code; operator did not respond in the window.",
      };
    }
    if (!deliveryProven) {
      return {
        status: "review",
        resolution: null,
        driverShare: 0,
        autoResolved: false,
        reason: "Delivery evidence is incomplete — needs review.",
      };
    }
    return {
      status: "review",
      resolution: null,
      driverShare: 0,
      autoResolved: false,
      reason: "Operator contested a proven delivery — needs review.",
    };
  }

  // Damage / shortage: the pickup photo is the baseline. Without one, the
  // driver cannot show the cargo left intact, so it goes to review rather than
  // auto-resolving against either side.
  if (facts.category === "cargo_damage" || facts.category === "shortage") {
    if (!facts.hasPickupPhoto || !facts.hasDeliveryPhoto) {
      return {
        status: "review",
        resolution: null,
        driverShare: 0,
        autoResolved: false,
        reason: "Missing before/after photos — a reviewer must compare what evidence exists.",
      };
    }
    return {
      status: "review",
      resolution: null,
      driverShare: 0,
      autoResolved: false,
      reason: "Both photos present — reviewer compares pickup against delivery condition.",
    };
  }

  // Route deviation on its own doesn't move money; it flags the trip.
  if (facts.category === "route_deviation") {
    if (facts.deliveryConfirmed) {
      return {
        status: "resolved",
        resolution: "no_action",
        driverShare: 1,
        autoResolved: true,
        reason: "Cargo was delivered and confirmed; deviation logged against the driver's record only.",
      };
    }
    return {
      status: "review",
      resolution: null,
      driverShare: 0,
      autoResolved: false,
      reason: "Route deviation with no confirmed delivery — needs review.",
    };
  }

  // Anything uncategorised: if nobody contests it before the window closes,
  // fall back to whatever the delivery evidence says.
  if (facts.windowClosed && !facts.respondentReplied) {
    return facts.deliveryConfirmed
      ? {
          status: "resolved",
          resolution: "release_to_driver",
          driverShare: 1,
          autoResolved: true,
          reason: "Delivery confirmed and unchallenged within the evidence window.",
        }
      : {
          status: "resolved",
          resolution: "refund_to_fleet",
          driverShare: 0,
          autoResolved: true,
          reason: "No delivery evidence and no response within the evidence window.",
        };
  }

  return {
    status: "review",
    resolution: null,
    driverShare: 0,
    autoResolved: false,
    reason: "Awaiting evidence or manual review.",
  };
}

/** Reliability penalty applied to the party a dispute is upheld against. */
export function reliabilityPenalty(category: DisputeCategory): number {
  switch (category) {
    case "no_show":
      return 15;
    case "safety_incident":
      return 20;
    case "cargo_damage":
    case "shortage":
      return 10;
    case "non_payment":
      return 12;
    case "route_deviation":
      return 5;
    default:
      return 5;
  }
}
