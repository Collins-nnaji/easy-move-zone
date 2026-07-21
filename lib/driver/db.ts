import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

export const driverSql = DATABASE_URL ? neon(DATABASE_URL) : null;

export const isDriverDatabaseConfigured = Boolean(driverSql);

export const CASHOUT_FEE_CENTS = 199;

export const DEFAULT_WAYPOINTS = [
  { id: "w1", label: "Warehouse check-in", address: "Apapa Port Gate 2, Lagos", lat: 6.4474, lng: 3.359, done: false },
  { id: "w2", label: "Stop 1 — Surulere", address: "Adeniran Ogunsanya St, Surulere", lat: 6.4969, lng: 3.3563, done: false },
  { id: "w3", label: "Stop 2 — Yaba", address: "Herbert Macaulay Way, Yaba", lat: 6.5095, lng: 3.3711, done: false },
  { id: "w4", label: "Stop 3 — Ikeja", address: "Obafemi Awolowo Way, Ikeja", lat: 6.6018, lng: 3.3515, done: false },
  { id: "w5", label: "Stop 4 — Maryland", address: "Mobolaji Bank Anthony Way, Maryland", lat: 6.5763, lng: 3.3669, done: false },
  { id: "w6", label: "Return to hub", address: "Apapa Port Gate 2, Lagos", lat: 6.4474, lng: 3.359, done: false },
];

export const COMPLIANCE_TEMPLATE = [
  { docKey: "cdl", name: "Valid Driver's Licence", detail: "FRSC · commercial class preferred" },
  { docKey: "background", name: "Background Check", detail: "Police clearance" },
  { docKey: "medical", name: "Medical Fitness Certificate", detail: "Fit to drive" },
  { docKey: "insurance", name: "Vehicle Insurance", detail: "Comprehensive · third-party minimum" },
  { docKey: "i9", name: "NIN / Identity Verification", detail: "National Identity Number on file" },
  { docKey: "hazmat", name: "Dangerous Goods Endorsement", detail: "Optional — unlocks premium tanker shifts" },
] as const;
