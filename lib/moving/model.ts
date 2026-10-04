export const SERVICES = [
  {
    id: "home",
    name: "Move my home",
    description:
      "From a room to a whole household. Arrange a truck, loading crew and optional packing and unpacking.",
  },
  {
    id: "office",
    name: "Move my office",
    description:
      "Desks, equipment and coordinated relocation. Plan your move around your working hours.",
  },
  {
    id: "item",
    name: "Move an item",
    description:
      "Sofas, fridges, beds and generators. Get bulky purchases from the seller to your door.",
  },
] as const;
export const AREAS = [
  "Lekki",
  "Ajah",
  "Victoria Island",
  "Ikoyi",
  "Ikeja",
  "Yaba",
  "Surulere",
  "Other Lagos area",
];
export const SIZES: Record<(typeof SERVICES)[number]["id"], readonly string[]> =
  {
    home: [
      "Studio / one bedroom",
      "Two bedrooms",
      "Three or more bedrooms",
    ],
    office: ["Small office", "Large office"],
    item: ["Single bulky item", "Several items"],
  };
/**
 * Local Lagos prices compared in October 2026.
 * A short studio with a van and two movers is about ₦80,000–₦120,000, while a
 * full 1-bedroom service is about ₦170,000–₦220,000. A 2-bedroom full move is
 * often ₦350,000–₦400,000 and a 3-bedroom from about ₦500,000. Packing adds
 * about ₦50,000–₦80,000. A cargo van alone is about ₦100,000 on the mainland
 * and ₦120,000 on the Island. Daily truck hire runs about ₦35,000–₦60,000 for
 * a mini truck, ₦70,000–₦120,000 for a medium truck and ₦150,000–₦250,000 for
 * a large truck.
 * The base includes a suitable vehicle, fuel and a standard crew inside Lagos.
 * Stairs, packing and extra hands are added on. Admin can raise a quote when
 * the trip crosses a long mainland-to-island route.
 */
const BASE_PRICES: Record<string, number> = {
  "Studio / one bedroom": 120000,
  "Two bedrooms": 220000,
  "Three or more bedrooms": 380000,
  "Small office": 250000,
  "Large office": 550000,
  "Single bulky item": 35000,
  "Several items": 70000,
};
const FLOOR_FEES: Record<string, number> = {
  "Studio / one bedroom": 6000,
  "Two bedrooms": 8000,
  "Three or more bedrooms": 12000,
  "Small office": 10000,
  "Large office": 15000,
  "Single bulky item": 4000,
  "Several items": 6000,
};
const EXTRA_PRICES: Record<string, Record<string, number>> = {
  Packing: {
    "Studio / one bedroom": 45000,
    "Two bedrooms": 65000,
    "Three or more bedrooms": 85000,
    "Small office": 70000,
    "Large office": 120000,
    "Single bulky item": 8000,
    "Several items": 18000,
  },
  Unpacking: {
    "Studio / one bedroom": 20000,
    "Two bedrooms": 30000,
    "Three or more bedrooms": 40000,
    "Small office": 35000,
    "Large office": 55000,
    "Single bulky item": 5000,
    "Several items": 10000,
  },
  Assembly: {
    "Studio / one bedroom": 15000,
    "Two bedrooms": 25000,
    "Three or more bedrooms": 40000,
    "Small office": 30000,
    "Large office": 60000,
    "Single bulky item": 8000,
    "Several items": 15000,
  },
  Cleaning: {
    "Studio / one bedroom": 20000,
    "Two bedrooms": 35000,
    "Three or more bedrooms": 50000,
    "Small office": 40000,
    "Large office": 80000,
    "Single bulky item": 8000,
    "Several items": 15000,
  },
  "Loading crew": {
    "Studio / one bedroom": 20000,
    "Two bedrooms": 25000,
    "Three or more bedrooms": 35000,
    "Small office": 30000,
    "Large office": 45000,
    "Single bulky item": 10000,
    "Several items": 15000,
  },
};
/** Lagos price confirmed at booking. Admin can still adjust it. */
export function instantQuote(input: {
  service: string;
  size: string;
  pickupFloor: number;
  destinationFloor: number;
  extras: string[];
}) {
  const base = BASE_PRICES[input.size];
  if (!base || !SIZES[input.service as keyof typeof SIZES]?.includes(input.size))
    return 0;
  const floors = [input.pickupFloor, input.destinationFloor].reduce(
    (sum, floor) => sum + (Number.isInteger(floor) && floor > 0 ? floor : 0),
    0,
  );
  const extras = input.extras.reduce(
    (sum, extra) => sum + (EXTRA_PRICES[extra]?.[input.size] ?? 0),
    0,
  );
  return base + floors * (FLOOR_FEES[input.size] ?? 0) + extras;
}
export const STATUSES = [
  "requested",
  "quoted",
  "scheduled",
  "arriving",
  "transit",
  "completed",
] as const;
export const STATUS_LABELS = [
  "Request received",
  "Quote ready",
  "Booked",
  "Crew arriving",
  "On the way",
  "Move completed",
];
export type MoveInput = {
  service: string;
  inventory: string;
  size: string;
  pickup: string;
  destination: string;
  date: string;
  pickupFloor: number;
  destinationFloor: number;
  access: string;
  extras: string[];
  name: string;
  email: string;
  phone: string;
  photos: string[];
};
export type Move = MoveInput & {
  reference: string;
  status: (typeof STATUSES)[number];
  quote: number | null;
  crew: string;
  arrival: string;
  moverId: string | null;
  vehicleId: string | null;
  createdAt: string;
};
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function validateMove(value: unknown): value is MoveInput {
  if (!value || typeof value !== "object") return false;
  const b = value as MoveInput;
  return (
    SERVICES.some((s) => s.id === b.service) &&
    (SIZES[b.service as keyof typeof SIZES] ?? []).includes(b.size) &&
    (
      [
        "inventory",
        "pickup",
        "destination",
        "name",
        "email",
        "phone",
      ] as const
    ).every(
      (k) =>
        typeof b[k] === "string" &&
        b[k].trim().length >= 2 &&
        b[k].length <= 2000,
    ) &&
    b.pickup.trim().toLowerCase() !== b.destination.trim().toLowerCase() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) &&
    /^[+\d\s()-]{7,40}$/.test(b.phone) &&
    typeof b.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(b.date) &&
    Number.isFinite(Date.parse(b.date)) &&
    new Date(b.date).toISOString().slice(0, 10) === b.date &&
    b.date >= today() &&
    [b.pickupFloor, b.destinationFloor].every(
      (n) => Number.isInteger(n) && n >= 0 && n <= 50,
    ) &&
    typeof b.access === "string" &&
    b.access.length <= 2000 &&
    Array.isArray(b.extras) &&
    b.extras.length <= 5 &&
    b.extras.every((x) =>
      ["Packing", "Unpacking", "Assembly", "Cleaning", "Loading crew"].includes(
        x,
      ),
    ) &&
    Array.isArray(b.photos) &&
    b.photos.length <= 3 &&
    b.photos.every(
      (x) =>
        typeof x === "string" &&
        x.length <= 2800000 &&
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(x),
    )
  );
}
