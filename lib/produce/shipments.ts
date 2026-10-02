import { estimateFare, routeKm } from "@/lib/produce/catalog";

export type ShipmentStatus =
  | "confirmed"
  | "assigned"
  | "loaded"
  | "transit"
  | "delivered";

export type Shipment = {
  reference: string;
  role: "farmer" | "trader" | "exporter";
  commodityId: string;
  tonnes: number;
  originId: string;
  destinationId: string;
  readyDate: string;
  contact: string;
  collectionAddress?: string;
  deliveryAddress?: string;
  fare: number | null;
  km: number | null;
  status: ShipmentStatus;
  createdAt: string;
  lotId?: string;
};

export const STATUS_STEPS: Array<{
  id: ShipmentStatus;
  label: string;
  detail: string;
}> = [
  {
    id: "confirmed",
    label: "Request received",
    detail: "The produce, weight and delivery locations are recorded.",
  },
  {
    id: "assigned",
    label: "Transport arranged",
    detail: "Transport is assigned for the collection and delivery.",
  },
  {
    id: "loaded",
    label: "Produce collected",
    detail: "The shipment is loaded at the collection point.",
  },
  {
    id: "transit",
    label: "On the way",
    detail: "The shipment is travelling to the delivery location.",
  },
  {
    id: "delivered",
    label: "Delivered",
    detail: "The shipment is marked as received at its destination.",
  },
];

const STORAGE_KEY = "emz-shipments";

export const DEMO_SHIPMENTS: Shipment[] = [
  {
    reference: "EMZ-4821",
    role: "trader",
    commodityId: "yam",
    tonnes: 30,
    originId: "makurdi",
    destinationId: "mile12",
    readyDate: "2026-10-01",
    contact: "Mile 12 desk",
    fare: estimateFare(780, 30).total,
    km: 780,
    status: "transit",
    createdAt: "2026-09-30T08:00:00.000Z",
  },
  {
    reference: "EMZ-7704",
    role: "exporter",
    commodityId: "cocoa",
    tonnes: 32,
    originId: "akure",
    destinationId: "apapa",
    readyDate: "2026-10-02",
    contact: "Apapa export desk",
    fare: estimateFare(230, 32).total,
    km: 230,
    status: "loaded",
    createdAt: "2026-10-01T09:30:00.000Z",
    lotId: "EMZ-LOT-1108",
  },
  {
    reference: "EMZ-2290",
    role: "farmer",
    commodityId: "rice",
    tonnes: 60,
    originId: "kebbi",
    destinationId: "mile12",
    readyDate: "2026-10-05",
    contact: "Kebbi mill",
    fare: estimateFare(1050, 60).total,
    km: 1050,
    status: "assigned",
    createdAt: "2026-10-02T07:15:00.000Z",
  },
];

function readStored(): Shipment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Shipment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function listShipments() {
  const stored = readStored();
  const refs = new Set(stored.map((shipment) => shipment.reference));
  return [
    ...stored,
    ...DEMO_SHIPMENTS.filter((shipment) => !refs.has(shipment.reference)),
  ];
}

export function findShipment(reference: string) {
  const cleaned = reference.trim().toUpperCase();
  return (
    listShipments().find((shipment) => shipment.reference === cleaned) ?? null
  );
}

export function saveShipment(input: {
  role: Shipment["role"];
  commodityId: string;
  tonnes: number;
  originId: string;
  destinationId: string;
  readyDate: string;
  contact: string;
  collectionAddress?: string;
  deliveryAddress?: string;
  lotId?: string;
}) {
  const km = routeKm(input.originId, input.destinationId);
  const shipment: Shipment = {
    ...input,
    reference: `EMZ-${Math.floor(1000 + Math.random() * 9000)}`,
    fare: km == null ? null : estimateFare(km, input.tonnes).total,
    km,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  const next = [shipment, ...readStored()].slice(0, 20);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return shipment;
}
