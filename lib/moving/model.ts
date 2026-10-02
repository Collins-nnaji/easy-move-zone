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
  "Move scheduled",
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
    (
      [
        "inventory",
        "size",
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
