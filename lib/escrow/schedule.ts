/**
 * Milestone escrow schedule.
 *
 * A funded load releases in stages rather than one lump sum on completion:
 * neither side can be stiffed mid-route, and the fleet keeps a short window to
 * flag damage before the driver is fully paid.
 *
 * Pure functions only — no DB access — so the split maths stays unit-testable.
 */

export type MilestoneKind = "pickup" | "checkpoint" | "delivery" | "holdback";

export type MilestoneStatus = "pending" | "ready" | "released" | "skipped" | "withheld";

export interface MilestoneSpec {
  kind: MilestoneKind;
  sequence: number;
  /** Share of gross payout unlocked here, in basis points. */
  releaseBps: number;
  requiresGeofence: boolean;
  requiresPhoto: boolean;
  requiresOtp: boolean;
  label: string;
}

/** Long hauls get a mid-route health check that releases nothing. */
export const CHECKPOINT_DISTANCE_MI = 150;

/** Hours the fleet has to flag a problem before the holdback auto-releases. */
export const HOLDBACK_WINDOW_HOURS = 24;

const PICKUP_BPS = 2000; // 20%
const DELIVERY_BPS = 7000; // 70%
const HOLDBACK_BPS = 1000; // 10%

/**
 * Build the escrow schedule for a load. `distanceMi` decides whether a
 * mid-route checkpoint is inserted (it releases 0% — it exists so a stalled
 * truck is visible before the delivery deadline passes).
 */
export function buildMilestoneSchedule(opts: { distanceMi?: number } = {}): MilestoneSpec[] {
  const specs: MilestoneSpec[] = [
    {
      kind: "pickup",
      sequence: 1,
      releaseBps: PICKUP_BPS,
      requiresGeofence: true,
      requiresPhoto: true,
      requiresOtp: false,
      label: "Pickup confirmed",
    },
  ];

  if ((opts.distanceMi ?? 0) >= CHECKPOINT_DISTANCE_MI) {
    specs.push({
      kind: "checkpoint",
      sequence: 2,
      releaseBps: 0,
      requiresGeofence: false,
      requiresPhoto: false,
      requiresOtp: false,
      label: "Mid-route checkpoint",
    });
  }

  specs.push(
    {
      kind: "delivery",
      sequence: 3,
      releaseBps: DELIVERY_BPS,
      requiresGeofence: true,
      requiresPhoto: true,
      requiresOtp: true,
      label: "Delivery confirmed",
    },
    {
      kind: "holdback",
      sequence: 4,
      releaseBps: HOLDBACK_BPS,
      requiresGeofence: false,
      requiresPhoto: false,
      requiresOtp: false,
      label: "Quality holdback",
    },
  );

  return specs;
}

/**
 * Split gross into per-milestone amounts. Rounding remainder lands on the last
 * paying milestone so the parts always sum to exactly `grossCents`.
 */
export function splitMilestoneAmounts(grossCents: number, specs: MilestoneSpec[]): number[] {
  const amounts = specs.map((s) => Math.floor((grossCents * s.releaseBps) / 10000));
  const lastPayingIndex = specs.reduce((acc, s, i) => (s.releaseBps > 0 ? i : acc), -1);
  if (lastPayingIndex >= 0) {
    const assigned = amounts.reduce((a, b) => a + b, 0);
    amounts[lastPayingIndex] += grossCents - assigned;
  }
  return amounts;
}

/** Metres between two coordinates (haversine). */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface GeofenceResult {
  inside: boolean;
  distanceM: number;
}

/**
 * Is the driver close enough to confirm at this point?
 *
 * When the load has no anchor coordinate we return `inside: true` — loads
 * posted before geocoding existed must stay confirmable rather than trapping
 * the driver's money behind a check we cannot evaluate.
 */
export function checkGeofence(
  driver: { lat: number | null | undefined; lng: number | null | undefined },
  anchor: { lat: number | null | undefined; lng: number | null | undefined },
  radiusM: number,
): GeofenceResult {
  if (anchor.lat == null || anchor.lng == null) return { inside: true, distanceM: 0 };
  if (driver.lat == null || driver.lng == null) return { inside: false, distanceM: Infinity };

  const distanceM = distanceMeters(
    { lat: driver.lat, lng: driver.lng },
    { lat: anchor.lat, lng: anchor.lng },
  );
  return { inside: distanceM <= radiusM, distanceM };
}

/** Six-digit code the receiver reads to the driver at drop-off. */
export function generateDeliveryOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
