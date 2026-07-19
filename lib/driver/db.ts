import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

export const driverSql = DATABASE_URL ? neon(DATABASE_URL) : null;

export const isDriverDatabaseConfigured = Boolean(driverSql);

export const CASHOUT_FEE_CENTS = 199;

export const DEFAULT_WAYPOINTS = [
  { id: "w1", label: "Warehouse check-in", address: "Amazon DFW-7, 700 Wport Pkwy", done: false },
  { id: "w2", label: "Stop 1 — Irving", address: "3201 W Northgate Dr", done: false },
  { id: "w3", label: "Stop 2 — Carrollton", address: "1840 E Hebron Pkwy", done: false },
  { id: "w4", label: "Stop 3 — Plano", address: "5100 W Park Blvd", done: false },
  { id: "w5", label: "Stop 4 — Frisco", address: "8720 Legacy Dr", done: false },
  { id: "w6", label: "Return to hub", address: "Amazon DFW-7, 700 Wport Pkwy", done: false },
];

export const COMPLIANCE_TEMPLATE = [
  { docKey: "cdl", name: "Commercial Driver's License (CDL)", detail: "Class B · required for all routes" },
  { docKey: "background", name: "Background Check", detail: "Criminal record clearance" },
  { docKey: "medical", name: "Medical Examiner's Certificate", detail: "DOT physical" },
  { docKey: "insurance", name: "Vehicle Insurance", detail: "Commercial policy · $1M liability" },
  { docKey: "i9", name: "Right-to-Work / I-9", detail: "On file" },
  { docKey: "hazmat", name: "Hazmat Endorsement", detail: "Optional — unlocks premium shifts" },
] as const;
