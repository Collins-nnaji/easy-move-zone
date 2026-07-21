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
  { id: "w1", label: "Warehouse check-in", address: "Apapa Port Gate 2, Lagos", lat: 6.4474, lng: 3.359, done: true },
  { id: "w2", label: "Stop 1 — Surulere", address: "Adeniran Ogunsanya St, Surulere", lat: 6.4969, lng: 3.3563, done: true },
  { id: "w3", label: "Stop 2 — Yaba", address: "Herbert Macaulay Way, Yaba", lat: 6.5095, lng: 3.3711, done: true },
  { id: "w4", label: "Stop 3 — Ikeja", address: "Obafemi Awolowo Way, Ikeja", lat: 6.6018, lng: 3.3515, done: false },
  { id: "w5", label: "Stop 4 — Maryland", address: "Mobolaji Bank Anthony Way, Maryland", lat: 6.5763, lng: 3.3669, done: false },
  { id: "w6", label: "Return to hub", address: "Apapa Port Gate 2, Lagos", lat: 6.4474, lng: 3.359, done: false },
];
