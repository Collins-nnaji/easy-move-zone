import { instantQuote, type Move, type MoveInput } from "@/lib/moving/model";
export const CITIES = ["Lagos", "Abuja", "Port Harcourt"] as const;
export const TRUCKS = [
  "Auto",
  "Van",
  "Medium truck",
  "10-tonne truck",
] as const;
export type PricingRules = {
  perKm: number;
  includedKm: number;
  floorMultiplier: number;
  depositPercent: number;
  commissionPercent: number;
  cityMultipliers: Record<string, number>;
  truckFees: Record<string, number>;
  areaFees: Record<string, number>;
};
export const DEFAULT_PRICING: PricingRules = {
  perKm: 1500,
  includedKm: 10,
  floorMultiplier: 1,
  depositPercent: 30,
  commissionPercent: 15,
  cityMultipliers: { Lagos: 1, Abuja: 1.05, "Port Harcourt": 1.1 },
  truckFees: {
    Auto: 0,
    Van: 0,
    "Medium truck": 25000,
    "10-tonne truck": 100000,
  },
  areaFees: {},
};
export function estimateMove(
  input: Pick<
    MoveInput,
    "service" | "size" | "pickupFloor" | "destinationFloor" | "extras"
  > &
    Partial<MoveInput>,
  rules = DEFAULT_PRICING,
) {
  const ground = instantQuote({
    ...input,
    pickupFloor: 0,
    destinationFloor: 0,
  });
  const stairs = instantQuote(input) - ground;
  const distance =
    Math.max(0, (input.distanceKm ?? 10) - rules.includedKm) * rules.perKm;
  const area = Object.entries(rules.areaFees).reduce(
    (total, [key, fee]) =>
      (input.pickup ?? "").toLowerCase().includes(key.toLowerCase()) ||
      (input.destination ?? "").toLowerCase().includes(key.toLowerCase())
        ? total + fee
        : total,
    0,
  );
  const total = Math.round(
    (ground +
      stairs * rules.floorMultiplier +
      distance +
      (rules.truckFees[input.truckSize ?? "Auto"] ?? 0) +
      area) *
      (rules.cityMultipliers[input.city ?? "Lagos"] ?? 1),
  );
  return {
    low: Math.floor((total * 0.9) / 1000) * 1000,
    high: Math.ceil((total * 1.15) / 1000) * 1000,
  };
}
export function validPricing(v: unknown): v is PricingRules {
  if (!v || typeof v !== "object") return false;
  const b = v as PricingRules;
  const num = (n: unknown, max: number) =>
    typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= max;
  const record = (o: unknown, max: number) =>
    !!o &&
    typeof o === "object" &&
    !Array.isArray(o) &&
    Object.keys(o).length <= 50 &&
    Object.entries(o).every(
      ([k, n]) => k.length > 0 && k.length <= 80 && num(n, max),
    );
  return (
    num(b.perKm, 100000) &&
    num(b.includedKm, 500) &&
    num(b.floorMultiplier, 10) &&
    num(b.depositPercent, 100) &&
    b.depositPercent >= 10 &&
    num(b.commissionPercent, 20) &&
    b.commissionPercent >= 10 &&
    record(b.cityMultipliers, 10) &&
    CITIES.every((c) => b.cityMultipliers[c] >= 0.1) &&
    record(b.truckFees, 10000000) &&
    TRUCKS.every((t) => num(b.truckFees[t], 10000000)) &&
    record(b.areaFees, 10000000)
  );
}
export type Review = {
  reference: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  createdAt: string;
  published: boolean;
};
export type EvidenceItem = {
  id: string;
  name: string;
  condition: string;
  photo: string;
};
export type Checklist = {
  reference: string;
  phase: "pickup" | "delivery";
  items: EvidenceItem[];
  signedBy: string;
  signedAt: string | null;
  recordedBy: string;
};
export type Claim = {
  id: string;
  reference: string;
  userId: string;
  description: string;
  photos: string[];
  status: "open" | "reviewing" | "resolved";
  notes: string;
  createdAt: string;
};
export type Payment = {
  id: string;
  reference: string;
  amount: number;
  purpose: "deposit" | "balance";
  status: "pending" | "paid" | "failed";
  createdAt: string;
  paidAt?: string;
  authorizationUrl?: string;
};
export type Account = {
  addresses: { label: string; address: string }[];
  business: { name: string; kind: string; cac: string } | null;
};
export type Payout = {
  id: string;
  workerId: string;
  reference: string;
  amount: number;
  bankReference: string;
  createdAt: string;
};
export type Verification = {
  status: "pending" | "verified" | "rejected";
  idPhoto: string;
  licencePhoto: string;
  vehiclePhoto: string;
  guarantorName: string;
  guarantorPhone: string;
  notes: string;
};
export type FleetVehicle = {
  id: string;
  type: string;
  plate: string;
  capacity: string;
  areas: string;
  available: boolean;
};
export type WorkerExtras = {
  workerId: string;
  verification: Verification;
  fleet: FleetVehicle[];
  available: boolean;
};
export const EMPTY_VERIFICATION: Verification = {
  status: "pending",
  idPhoto: "",
  licencePhoto: "",
  vehiclePhoto: "",
  guarantorName: "",
  guarantorPhone: "",
  notes: "",
};
export function validPhotos(v: unknown, max = 3): v is string[] {
  return (
    Array.isArray(v) &&
    v.length <= max &&
    v.every(
      (p) =>
        typeof p === "string" &&
        p.length <= 2800000 &&
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p),
    )
  );
}
export function due(move: Move, purpose: "deposit" | "balance") {
  if (!move.quote || move.status === "requested" || move.status === "cancelled")
    return 0;
  const paid = move.paidAmount ?? 0;
  return Math.max(
    0,
    Math.round(
      purpose === "deposit"
        ? (move.quote * (move.depositPercent ?? 30)) / 100 - paid
        : move.quote - paid,
    ),
  );
}
export function canChangeMove(move: Move, now = new Date()) {
  return (
    ["requested", "quoted", "scheduled"].includes(move.status) &&
    new Date(`${move.date}T00:00:00+01:00`).getTime() - now.getTime() >=
      48 * 3600000
  );
}
export function workerEarning(move: Move) {
  return Math.round(
    (move.quote ?? 0) * (1 - (move.commissionPercent ?? 15) / 100),
  );
}
