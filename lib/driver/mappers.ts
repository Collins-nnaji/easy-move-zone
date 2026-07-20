import type { CargoCategory, VehicleType } from "@/lib/marketplace/taxonomy";
import type { ComplianceDoc, OperatorSummary, Shift, WalletEntry, Waypoint } from "./types";

export interface ShiftRow {
  id: string;
  title?: string | null;
  payout_cents: number;
  payout_type: "day" | "hour";
  vehicle_type: VehicleType;
  vehicle_label: string;
  cargo_category?: CargoCategory;
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
  commission_bps?: number;
  posted_by?: string | null;
  claimed_by?: string | null;
  operator_name?: string | null;
  operator_rating_avg?: string | number | null;
  operator_rating_count?: number | null;
  operator_verified?: boolean | null;
  claimed_driver_name?: string | null;
  funded?: boolean;
}

const SHIFT_COLUMNS = `sh.id, sh.title, sh.payout_cents, sh.payout_type, sh.vehicle_type, sh.vehicle_label,
  sh.cargo_category, sh.pickup, sh.dropoff, sh.start_time, sh.end_time, sh.hours, sh.zone,
  sh.distance_mi, sh.stops, sh.demand, sh.shift_date, sh.status, sh.commission_bps,
  sh.posted_by, sh.claimed_by, coalesce(sh.funded, false) as funded,
  fo.company_name as operator_name, fo.rating_avg as operator_rating_avg, fo.rating_count as operator_rating_count,
  coalesce(fo.verified, false) as operator_verified,
  dp.display_name as claimed_driver_name`;

export { SHIFT_COLUMNS };

export const SHIFT_SELECT = `${SHIFT_COLUMNS} from driver_shifts sh
  left join fleet_operator_profiles fo on fo.auth_user_id = sh.posted_by
  left join driver_profiles dp on dp.auth_user_id = sh.claimed_by`;

export function mapOperator(row: ShiftRow): OperatorSummary | null {
  if (!row.posted_by || !row.operator_name) return null;
  return {
    id: row.posted_by,
    name: row.operator_name,
    ratingAvg: Number(row.operator_rating_avg ?? 0),
    ratingCount: row.operator_rating_count ?? 0,
    verified: Boolean(row.operator_verified),
  };
}

export function mapShiftRow(row: ShiftRow): Shift {
  return {
    id: row.id,
    title: row.title ?? row.vehicle_label,
    payout: row.payout_cents / 100,
    payoutType: row.payout_type,
    vehicle: row.vehicle_type,
    vehicleLabel: row.vehicle_label,
    cargo: row.cargo_category ?? "general-freight",
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
    commissionBps: row.commission_bps ?? 800,
    postedBy: row.posted_by ?? null,
    operator: mapOperator(row),
    claimedBy: row.claimed_by ?? null,
    claimedDriverName: row.claimed_driver_name ?? null,
    funded: Boolean(row.funded),
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
  file_name?: string | null;
  file_data?: string | null;
  has_file?: boolean | null;
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
    hasFile: Boolean(row.has_file ?? (row.file_data || row.file_name)),
    fileName: row.file_name ?? undefined,
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
