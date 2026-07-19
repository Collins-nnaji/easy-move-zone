export const COMMISSION_BPS = 800; // 8% platform commission

export const VEHICLE_TYPES = [
  "sprinter",
  "cargo-van",
  "box-truck",
  "flatbed",
  "semi",
  "tanker",
  "refrigerated",
  "dump-truck",
  "client-fleet",
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const CARGO_CATEGORIES = [
  "parcel",
  "heavy-goods",
  "tanker",
  "refrigerated",
  "construction",
  "hazmat",
  "general-freight",
] as const;

export type CargoCategory = (typeof CARGO_CATEGORIES)[number];

export const OWNER_TYPES = ["driver", "owner"] as const;
export type OwnerType = (typeof OWNER_TYPES)[number];

export const VEHICLE_TAGS: Record<VehicleType, { label: string; color: string; bg: string }> = {
  sprinter: { label: "Sprinter Van", color: "#9c3f15", bg: "#fbeae0" },
  "cargo-van": { label: "Cargo Van", color: "#7a4a12", bg: "#fdf0e4" },
  "box-truck": { label: "Box Truck", color: "#1f6f78", bg: "#e9f5f4" },
  flatbed: { label: "Flatbed", color: "#5c4a8a", bg: "#f0ecf8" },
  semi: { label: "Semi / Tractor", color: "#2d4a6b", bg: "#e8eef5" },
  tanker: { label: "Tanker", color: "#8b4513", bg: "#f5ebe0" },
  refrigerated: { label: "Reefer", color: "#1a6b8a", bg: "#e3f2f8" },
  "dump-truck": { label: "Dump Truck", color: "#5a4a3a", bg: "#f0ebe4" },
  "client-fleet": { label: "Client Fleet", color: "#3d6b3f", bg: "#eef6ec" },
};

export const CARGO_TAGS: Record<CargoCategory, { label: string; color: string; bg: string }> = {
  parcel: { label: "Parcel / Last-mile", color: "#9c3f15", bg: "#fbeae0" },
  "heavy-goods": { label: "Heavy Goods", color: "#2d4a6b", bg: "#e8eef5" },
  tanker: { label: "Tanker / Liquid", color: "#8b4513", bg: "#f5ebe0" },
  refrigerated: { label: "Refrigerated", color: "#1a6b8a", bg: "#e3f2f8" },
  construction: { label: "Construction", color: "#5a4a3a", bg: "#f0ebe4" },
  hazmat: { label: "Hazmat", color: "#8b1a1a", bg: "#fce8e8" },
  "general-freight": { label: "General Freight", color: "#3d6b3f", bg: "#eef6ec" },
};

export const VEHICLE_OPTIONS = [
  { key: "sprinter" as const, label: "Sprinter Van", sub: "Last-mile · 12–20 stops", blurb: "High-volume residential and small-business drops. Most shifts pay per day." },
  { key: "cargo-van" as const, label: "Cargo Van", sub: "Small goods · Local", blurb: "Light parcel and small-goods runs. Flexible hourly or daily rates." },
  { key: "box-truck" as const, label: "Box Truck", sub: "26' · Restaurant & retail", blurb: "Heavier loads, fewer stops. Hourly pay with overtime on long routes." },
  { key: "flatbed" as const, label: "Flatbed CDL-B", sub: "Construction · Port", blurb: "CDL-B required. Fewer stops, higher skill premium on every shift." },
  { key: "semi" as const, label: "Semi / Tractor", sub: "Long-haul · CDL-A", blurb: "Linehaul and interstate freight. Premium daily rates for experienced operators." },
  { key: "tanker" as const, label: "Tanker", sub: "Liquid · Hazmat", blurb: "Tanker endorsement required. Fuel, chemical, and food-grade liquid hauls." },
  { key: "refrigerated" as const, label: "Reefer", sub: "Cold chain", blurb: "Temperature-controlled freight. Grocery, pharma, and perishable goods." },
  { key: "dump-truck" as const, label: "Dump Truck", sub: "Aggregate · Debris", blurb: "Construction sites, quarries, and demolition hauls." },
  { key: "client-fleet" as const, label: "Client Fleet", sub: "No vehicle needed", blurb: "Drive the client's branded fleet. Linehaul and hub returns — daily rate." },
] as const;

export const CARGO_OPTIONS = [
  { key: "parcel" as const, label: "Parcel / Last-mile", sub: "Small packages · high stop count" },
  { key: "heavy-goods" as const, label: "Heavy Goods", sub: "Pallets · industrial freight" },
  { key: "tanker" as const, label: "Tanker / Liquid", sub: "Fuel · chemicals · food-grade" },
  { key: "refrigerated" as const, label: "Refrigerated", sub: "Cold chain · perishables" },
  { key: "construction" as const, label: "Construction", sub: "Materials · equipment" },
  { key: "hazmat" as const, label: "Hazmat", sub: "Endorsement required" },
  { key: "general-freight" as const, label: "General Freight", sub: "Mixed loads · flexible" },
] as const;

export const ZONE_OPTIONS = [
  { key: "dfw-north", label: "DFW North", sub: "Haslet · Irving · Plano" },
  { key: "dfw-central", label: "DFW Central", sub: "Dallas · Garland · Mesquite" },
  { key: "dfw-east", label: "DFW East", sub: "Mesquite · Rockwall · Terrell" },
  { key: "houston-inner", label: "Houston Inner", sub: "Downtown · Midtown · Heights" },
  { key: "houston-port", label: "Houston Port", sub: "Port · Baytown · Pasadena" },
  { key: "san-antonio", label: "San Antonio", sub: "Downtown · North · South" },
] as const;

export function formatRating(avg: number, count: number): string {
  if (count === 0) return "New";
  return `${avg.toFixed(1)} ★ (${count})`;
}

export function commissionCents(grossCents: number, bps = COMMISSION_BPS): number {
  return Math.round((grossCents * bps) / 10000);
}

export function netPayoutCents(grossCents: number, bps = COMMISSION_BPS): number {
  return grossCents - commissionCents(grossCents, bps);
}
