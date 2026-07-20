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
  { id: "w1", label: "Warehouse check-in", address: "Amazon DFW-7, 700 Wport Pkwy", lat: 32.9205, lng: -97.0404, done: true },
  { id: "w2", label: "Stop 1 — Irving", address: "3201 W Northgate Dr", lat: 32.8741, lng: -96.9592, done: true },
  { id: "w3", label: "Stop 2 — Carrollton", address: "1840 E Hebron Pkwy", lat: 33.0052, lng: -96.8901, done: true },
  { id: "w4", label: "Stop 3 — Plano", address: "5100 W Park Blvd", lat: 33.0276, lng: -96.8298, done: false },
  { id: "w5", label: "Stop 4 — Frisco", address: "8720 Legacy Dr", lat: 33.1002, lng: -96.8195, done: false },
  { id: "w6", label: "Return to hub", address: "Amazon DFW-7, 700 Wport Pkwy", lat: 32.9205, lng: -97.0404, done: false },
];
