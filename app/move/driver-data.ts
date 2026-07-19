export {
  VEHICLE_TAGS,
  VEHICLE_OPTIONS,
  CARGO_TAGS,
  CARGO_OPTIONS,
  ZONE_OPTIONS,
  formatRating,
} from "@/lib/marketplace/taxonomy";

export type { VehicleType, CargoCategory } from "@/lib/marketplace/taxonomy";

export const WAYPOINTS = [
  { id: "w1", label: "Warehouse check-in", address: "Amazon DFW-7, 700 Wport Pkwy", done: true },
  { id: "w2", label: "Stop 1 — Irving", address: "3201 W Northgate Dr", done: true },
  { id: "w3", label: "Stop 2 — Carrollton", address: "1840 E Hebron Pkwy", done: true },
  { id: "w4", label: "Stop 3 — Plano", address: "5100 W Park Blvd", done: false },
  { id: "w5", label: "Stop 4 — Frisco", address: "8720 Legacy Dr", done: false },
  { id: "w6", label: "Return to hub", address: "Amazon DFW-7, 700 Wport Pkwy", done: false },
];
