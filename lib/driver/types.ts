export type VehicleType = "sprinter" | "box-truck" | "client-fleet" | "flatbed";
export type ShiftStatus = "open" | "claimed" | "active" | "completed" | "cancelled";
export type DocStatus = "verified" | "pending" | "expiring" | "missing";
export type WalletTxnType = "credit" | "deduction" | "cashout";

export interface Shift {
  id: string;
  payout: number;
  payoutType: "day" | "hour";
  vehicle: VehicleType;
  vehicleLabel: string;
  pickup: string;
  dropoff: string;
  startTime: string;
  endTime: string;
  hours: number;
  zone: string;
  distanceMi: number;
  stops: number;
  demand: "high" | "normal";
  status: ShiftStatus;
  date: string;
}

export interface Waypoint {
  id: string;
  label: string;
  address: string;
  done: boolean;
}

export interface ShiftSession {
  id: string;
  shiftId: string;
  status: "scheduled" | "active" | "completed";
  clockedInAt: string | null;
  waypoints: Waypoint[];
  shift: Shift;
}

export interface WalletSnapshot {
  available: number;
  pending: number;
  lifetime: number;
  cashoutFee: number;
  weekEarnings: number;
}

export interface WalletEntry {
  id: string;
  label: string;
  amount: number;
  date: string;
  type: WalletTxnType;
}

export interface ComplianceDoc {
  id: string;
  docKey: string;
  name: string;
  status: DocStatus;
  detail: string;
  expiresAt?: string;
}

export interface DriverProfile {
  zone: string;
  vehicleType: VehicleType;
  onboardingCompleted: boolean;
}

export interface DriverWorkspace {
  profile: DriverProfile;
  openShifts: Shift[];
  myShifts: Shift[];
  activeSession: ShiftSession | null;
  wallet: WalletSnapshot;
  ledger: WalletEntry[];
  compliance: ComplianceDoc[];
}
