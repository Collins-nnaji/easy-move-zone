import type { CargoCategory, OwnerType, VehicleType } from "@/lib/marketplace/taxonomy";

export type { VehicleType, CargoCategory, OwnerType };

export type ShiftStatus = "open" | "claimed" | "active" | "completed" | "cancelled";

export interface OperatorSummary {
  id: string;
  name: string;
  ratingAvg: number;
  ratingCount: number;
}

export interface Shift {
  id: string;
  title: string;
  payout: number;
  payoutType: "day" | "hour";
  vehicle: VehicleType;
  vehicleLabel: string;
  cargo: CargoCategory;
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
  commissionBps: number;
  postedBy: string | null;
  operator: OperatorSummary | null;
  claimedBy: string | null;
  claimedDriverName: string | null;
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
  type: "credit" | "deduction" | "cashout";
}

export interface ComplianceDoc {
  id: string;
  docKey: string;
  name: string;
  status: "verified" | "pending" | "expiring" | "missing";
  detail: string;
  expiresAt?: string;
}

export interface DriverProfile {
  zone: string;
  vehicleType: VehicleType;
  ownerType: OwnerType;
  displayName: string | null;
  ratingAvg: number;
  ratingCount: number;
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

export interface MarketplaceDriver {
  id: string;
  displayName: string;
  ownerType: OwnerType;
  vehicleType: VehicleType;
  zone: string;
  ratingAvg: number;
  ratingCount: number;
  rateHint: number | null;
  bio: string | null;
}

export interface FleetProfile {
  companyName: string;
  contactName: string | null;
  zone: string;
  ratingAvg: number;
  ratingCount: number;
  commissionBps: number;
  onboardingCompleted: boolean;
}

export interface FleetStats {
  openLoads: number;
  activeLoads: number;
  completedLoads: number;
  commissionEarned: number;
  totalPosted: number;
}

export interface FleetWorkspace {
  profile: FleetProfile;
  stats: FleetStats;
  postedShifts: Shift[];
  activeWorkload: Shift[];
  drivers: MarketplaceDriver[];
}

export interface PostShiftInput {
  title: string;
  payoutCents: number;
  payoutType: "day" | "hour";
  vehicleType: VehicleType;
  vehicleLabel: string;
  cargoCategory: CargoCategory;
  pickup: string;
  dropoff: string;
  startTime: string;
  endTime: string;
  hours: number;
  zone: string;
  distanceMi: number;
  stops: number;
  demand: "high" | "normal";
  shiftDate: string;
}

export interface RateInput {
  shiftId: string;
  stars: number;
  comment?: string;
}
