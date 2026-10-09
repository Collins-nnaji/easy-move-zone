import { AREAS } from "./model";

export const WORKER_KINDS = [
  {
    id: "mover",
    name: "Mover",
    detail: "Loading crew that carries and packs.",
  },
  {
    id: "vehicle",
    name: "Vehicle owner",
    detail: "Van, pickup or truck available for moves.",
  },
] as const;

export const VEHICLE_TYPES = ["Van", "Pickup", "Truck", "Flatbed"] as const;

export const WORKER_PROGRESS = [
  "arriving",
  "arrived",
  "loaded",
  "transit",
  "completed",
] as const;

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type WorkerKind = (typeof WORKER_KINDS)[number]["id"];

export type Worker = {
  id: string;
  userId: string | null;
  kind: WorkerKind;
  name: string;
  email: string;
  phone: string;
  area: string;
  crewSize: number;
  vehicleType: string;
  plate: string;
  capacity: string;
  notes: string;
  createdAt: string;
};

export type WorkerDraft = Omit<Worker, "id" | "userId" | "email" | "createdAt">;

export function isWorkerId(value: unknown): value is string {
  return typeof value === "string" && ID.test(value);
}

export function crewLabel(
  mover: Pick<Worker, "name"> | null,
  vehicle: Pick<Worker, "name" | "vehicleType" | "plate"> | null,
) {
  const parts: string[] = [];
  if (mover) parts.push(`Movers: ${mover.name}`);
  if (vehicle) {
    const truck = [vehicle.vehicleType, vehicle.name].filter(Boolean).join(" ");
    parts.push(vehicle.plate ? `${truck} (${vehicle.plate})` : truck);
  }
  return parts.join(" · ").slice(0, 200);
}

export function validateWorkerDraft(value: unknown): value is WorkerDraft {
  if (!value || typeof value !== "object") return false;
  const b = value as WorkerDraft;
  const kindOk = WORKER_KINDS.some((kind) => kind.id === b.kind);
  const vehicle = b.kind === "vehicle";
  return (
    kindOk &&
    typeof b.name === "string" &&
    b.name.trim().length >= 2 &&
    b.name.length <= 120 &&
    typeof b.phone === "string" &&
    /^[+\d\s()-]{7,40}$/.test(b.phone) &&
    AREAS.includes(b.area) &&
    typeof b.notes === "string" &&
    b.notes.length <= 500 &&
    (vehicle
      ? b.crewSize === 0 &&
        VEHICLE_TYPES.includes(
          b.vehicleType as (typeof VEHICLE_TYPES)[number],
        ) &&
        typeof b.plate === "string" &&
        /^[A-Za-z0-9 -]{2,20}$/.test(b.plate) &&
        typeof b.capacity === "string" &&
        b.capacity.trim().length >= 2 &&
        b.capacity.length <= 80
      : Number.isInteger(b.crewSize) &&
        b.crewSize >= 1 &&
        b.crewSize <= 30 &&
        b.vehicleType === "" &&
        b.plate === "" &&
        b.capacity === "")
  );
}
