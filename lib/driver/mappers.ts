import type { ComplianceDoc, Shift, VehicleType, WalletEntry, Waypoint } from "./types";

export interface ShiftRow {
  id: string;
  payout_cents: number;
  payout_type: "day" | "hour";
  vehicle_type: VehicleType;
  vehicle_label: string;
  pickup: string;
  dropoff: string;
  start_time: string;
  end_time: string;
  hours: string | number;
  zone: string;
  distance_mi: number;
  stops: number;
  demand: "high" | "normal";
  shift_date: string;
  status: string;
}

export function mapShiftRow(row: ShiftRow): Shift {
  return {
    id: row.id,
    payout: row.payout_type === "day" ? row.payout_cents / 100 : row.payout_cents / 100,
    payoutType: row.payout_type,
    vehicle: row.vehicle_type,
    vehicleLabel: row.vehicle_label,
    pickup: row.pickup,
    dropoff: row.dropoff,
    startTime: row.start_time,
    endTime: row.end_time,
    hours: Number(row.hours),
    zone: row.zone,
    distanceMi: row.distance_mi,
    stops: row.stops,
    demand: row.demand,
    status: row.status as Shift["status"],
    date: row.shift_date,
  };
}

export function formatTxnDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function mapTxnRow(row: {
  id: string;
  label: string;
  amount_cents: number;
  txn_type: WalletEntry["type"];
  created_at: string;
}): WalletEntry {
  return {
    id: row.id,
    label: row.label,
    amount: row.amount_cents / 100,
    date: formatTxnDate(row.created_at),
    type: row.txn_type,
  };
}

export function mapComplianceRow(row: {
  id: string;
  doc_key: string;
  name: string;
  status: ComplianceDoc["status"];
  detail: string | null;
  expires_at: string | null;
}): ComplianceDoc {
  return {
    id: row.id,
    docKey: row.doc_key,
    name: row.name,
    status: row.status,
    detail: row.detail ?? "",
    expiresAt: row.expires_at
      ? new Date(row.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined,
  };
}

export function parseWaypoints(value: unknown): Waypoint[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (w): w is Waypoint =>
      !!w &&
      typeof w === "object" &&
      typeof (w as Waypoint).id === "string" &&
      typeof (w as Waypoint).label === "string",
  );
}
