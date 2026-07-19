export type VehicleType = "sprinter" | "box-truck" | "client-fleet" | "flatbed";

export type ShiftStatus = "open" | "claimed" | "active" | "completed";

export type DocStatus = "verified" | "pending" | "expiring" | "missing";

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

export interface WalletEntry {
  id: string;
  label: string;
  amount: number;
  date: string;
  type: "credit" | "deduction" | "cashout";
}

export interface ComplianceDoc {
  id: string;
  name: string;
  status: DocStatus;
  detail: string;
  expiresAt?: string;
}

export const VEHICLE_TAGS: Record<VehicleType, { label: string; color: string; bg: string }> = {
  sprinter: { label: "Sprinter Van", color: "#9c3f15", bg: "#fbeae0" },
  "box-truck": { label: "Box Truck", color: "#1f6f78", bg: "#e9f5f4" },
  "client-fleet": { label: "Client Fleet", color: "#3d6b3f", bg: "#eef6ec" },
  flatbed: { label: "Flatbed", color: "#5c4a8a", bg: "#f0ecf8" },
};

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: "s1",
    payout: 180,
    payoutType: "day",
    vehicle: "sprinter",
    vehicleLabel: "Sprinter Van",
    pickup: "Amazon DFW-7, Haslet TX",
    dropoff: "12 stops · DFW metro",
    startTime: "6:00 AM",
    endTime: "2:30 PM",
    hours: 8.5,
    zone: "DFW North",
    distanceMi: 94,
    stops: 12,
    demand: "high",
    status: "open",
    date: "Today",
  },
  {
    id: "s2",
    payout: 25,
    payoutType: "hour",
    vehicle: "box-truck",
    vehicleLabel: "Box Truck (26')",
    pickup: "Sysco Houston Hub",
    dropoff: "8 restaurant drops",
    startTime: "4:00 PM",
    endTime: "11:00 PM",
    hours: 7,
    zone: "Houston Inner",
    distanceMi: 62,
    stops: 8,
    demand: "normal",
    status: "open",
    date: "Today",
  },
  {
    id: "s3",
    payout: 165,
    payoutType: "day",
    vehicle: "client-fleet",
    vehicleLabel: "No Vehicle Needed",
    pickup: "FedEx Ground, Mesquite TX",
    dropoff: "Linehaul return",
    startTime: "5:30 AM",
    endTime: "1:00 PM",
    hours: 7.5,
    zone: "DFW East",
    distanceMi: 118,
    stops: 2,
    demand: "high",
    status: "open",
    date: "Tomorrow",
  },
  {
    id: "s4",
    payout: 22,
    payoutType: "hour",
    vehicle: "flatbed",
    vehicleLabel: "Flatbed CDL-B",
    pickup: "Port of Houston",
    dropoff: "3 construction sites",
    startTime: "7:00 AM",
    endTime: "4:00 PM",
    hours: 9,
    zone: "Houston Port",
    distanceMi: 48,
    stops: 3,
    demand: "normal",
    status: "open",
    date: "Tomorrow",
  },
];

export const CLAIMED_SHIFTS: Shift[] = [
  {
    id: "c1",
    payout: 195,
    payoutType: "day",
    vehicle: "sprinter",
    vehicleLabel: "Sprinter Van",
    pickup: "UPS Dallas Gateway",
    dropoff: "15 residential stops",
    startTime: "7:00 AM",
    endTime: "3:30 PM",
    hours: 8.5,
    zone: "DFW Central",
    distanceMi: 76,
    stops: 15,
    demand: "normal",
    status: "claimed",
    date: "Mon, Jul 21",
  },
  {
    id: "c2",
    payout: 170,
    payoutType: "day",
    vehicle: "box-truck",
    vehicleLabel: "Box Truck (24')",
    pickup: "US Foods San Antonio",
    dropoff: "10 grocery drops",
    startTime: "5:00 AM",
    endTime: "1:30 PM",
    hours: 8.5,
    zone: "San Antonio",
    distanceMi: 88,
    stops: 10,
    demand: "normal",
    status: "claimed",
    date: "Wed, Jul 23",
  },
];

export const ACTIVE_SHIFT: Shift = {
  id: "active",
  payout: 180,
  payoutType: "day",
  vehicle: "sprinter",
  vehicleLabel: "Sprinter Van",
  pickup: "Amazon DFW-7, Haslet TX",
  dropoff: "12 stops · DFW metro",
  startTime: "6:00 AM",
  endTime: "2:30 PM",
  hours: 8.5,
  zone: "DFW North",
  distanceMi: 94,
  stops: 12,
  demand: "high",
  status: "active",
  date: "Today",
};

export const WAYPOINTS = [
  { id: "w1", label: "Warehouse check-in", address: "Amazon DFW-7, 700 Wport Pkwy", done: true },
  { id: "w2", label: "Stop 1 — Irving", address: "3201 W Northgate Dr", done: true },
  { id: "w3", label: "Stop 2 — Carrollton", address: "1840 E Hebron Pkwy", done: true },
  { id: "w4", label: "Stop 3 — Plano", address: "5100 W Park Blvd", done: false },
  { id: "w5", label: "Stop 4 — Frisco", address: "8720 Legacy Dr", done: false },
  { id: "w6", label: "Return to hub", address: "Amazon DFW-7, 700 Wport Pkwy", done: false },
];

export const WALLET = {
  available: 542,
  pending: 178,
  lifetime: 18420,
  cashoutFee: 1.99,
};

export const LEDGER: WalletEntry[] = [
  { id: "l1", label: "UPS Dallas Gateway — Sprinter", amount: 195, date: "Jul 18", type: "credit" },
  { id: "l2", label: "Instant cashout", amount: -320, date: "Jul 17", type: "cashout" },
  { id: "l3", label: "Platform fee (3%)", amount: -5.85, date: "Jul 17", type: "deduction" },
  { id: "l4", label: "Sysco Houston — Box Truck", amount: 175, date: "Jul 15", type: "credit" },
  { id: "l5", label: "FedEx Mesquite — Client Fleet", amount: 165, date: "Jul 12", type: "credit" },
];

export const COMPLIANCE_DOCS: ComplianceDoc[] = [
  { id: "d1", name: "Commercial Driver's License (CDL)", status: "verified", detail: "Class B · TX #4829103" },
  { id: "d2", name: "Background Check", status: "verified", detail: "Cleared · Jul 2025" },
  { id: "d3", name: "Medical Examiner's Certificate", status: "expiring", detail: "DOT physical", expiresAt: "Aug 19, 2026" },
  { id: "d4", name: "Vehicle Insurance", status: "verified", detail: "Commercial policy · $1M liability" },
  { id: "d5", name: "Right-to-Work / I-9", status: "verified", detail: "On file" },
  { id: "d6", name: "Hazmat Endorsement", status: "missing", detail: "Optional — unlocks +$40/day shifts" },
];

export const ZONES = ["DFW North", "DFW Central", "DFW East", "Houston Inner", "Houston Port", "San Antonio"];

export const ZONE_OPTIONS = [
  { key: "dfw-north", label: "DFW North", sub: "Haslet · Irving · Plano" },
  { key: "dfw-central", label: "DFW Central", sub: "Dallas · Garland · Mesquite" },
  { key: "dfw-east", label: "DFW East", sub: "Mesquite · Rockwall · Terrell" },
  { key: "houston-inner", label: "Houston Inner", sub: "Downtown · Midtown · Heights" },
  { key: "houston-port", label: "Houston Port", sub: "Port · Baytown · Pasadena" },
  { key: "san-antonio", label: "San Antonio", sub: "Downtown · North · South" },
] as const;

export const VEHICLE_OPTIONS = [
  { key: "sprinter", label: "Sprinter Van", sub: "Last-mile · 12–20 stops", blurb: "High-volume residential and small-business drops. Most shifts pay per day." },
  { key: "box-truck", label: "Box Truck", sub: "26' · Restaurant & retail", blurb: "Heavier loads, fewer stops. Hourly pay with overtime on long routes." },
  { key: "client-fleet", label: "Client Fleet", sub: "No vehicle needed", blurb: "Drive the client's branded fleet. Linehaul and hub returns — daily rate." },
  { key: "flatbed", label: "Flatbed CDL-B", sub: "Construction · Port", blurb: "CDL-B required. Fewer stops, higher skill premium on every shift." },
] as const;
