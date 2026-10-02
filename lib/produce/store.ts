import "server-only";
import type { ProduceCatalog } from "./model";
import type { Shipment } from "./shipments";
export { database } from "@/lib/database";
export type ManagedShipment = Shipment & {
  internalNotes?: string;
  updatedAt?: string;
};
export async function ensureProduceStore(): Promise<never> {
  throw new Error(
    "The produce platform has been retired. Use the moving platform.",
  );
}
// Compatibility signatures for archived components. These never query or
// recreate retired tables, even if an old component is accidentally mounted.
export async function readCatalog(): Promise<{
  catalog: ProduceCatalog;
  revision: number;
}> {
  return ensureProduceStore();
}
export async function publicCatalog(): Promise<ProduceCatalog> {
  return ensureProduceStore();
}
export async function writeCatalog(
  catalog: ProduceCatalog,
  revision: number,
): Promise<number | undefined> {
  void catalog;
  void revision;
  return ensureProduceStore();
}
export async function createShipment(shipment: Shipment): Promise<Shipment> {
  void shipment;
  return ensureProduceStore();
}
export async function readShipment(
  reference: string,
): Promise<ManagedShipment | null> {
  void reference;
  return ensureProduceStore();
}
