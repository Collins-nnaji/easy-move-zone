import type { Collection, ProduceCatalog } from "@/lib/produce/model";
export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "date"
    | "textarea"
    | "boolean"
    | "crops"
    | "image";
  options?: string[];
  ref?: "places" | "commodities" | "ports";
  optional?: boolean;
  readonly?: boolean;
  max?: number;
};
export const SECTION_NAMES: Record<Collection, string> = {
  lots: "Produce listings",
  commodities: "Produce types",
  corridors: "Delivery routes",
  exportLanes: "Export destinations",
  places: "Locations",
  exportDocuments: "Export documents",
};
export const FIELDS: Record<Collection, Field[]> = {
  places: [
    { key: "name", label: "Name" },
    { key: "state", label: "State" },
    { key: "zone", label: "Region" },
    {
      key: "kind",
      label: "Location type",
      options: ["farm", "market", "port"],
    },
  ],
  commodities: [
    { key: "name", label: "Produce name" },
    { key: "unit", label: "Unit" },
    {
      key: "lane",
      label: "Intended use",
      options: ["domestic", "export", "both"],
    },
    { key: "samplePrice", label: "Sample price per tonne (₦)", type: "number" },
    { key: "note", label: "Description", type: "textarea" },
    { key: "imageUrl", label: "Picture", type: "image", optional: true },
  ],
  lots: [
    { key: "commodityId", label: "Produce type", ref: "commodities" },
    { key: "originId", label: "Origin", ref: "places" },
    { key: "destinationId", label: "Destination", ref: "places" },
    { key: "tonnes", label: "Quantity (tonnes)", type: "number", max: 500 },
    { key: "grade", label: "Quality / grade" },
    { key: "pricePerTonne", label: "Price per tonne (₦)", type: "number" },
    { key: "ready", label: "Ready date", type: "date" },
    { key: "seller", label: "Supplier name" },
    { key: "sample", label: "This is a sample listing", type: "boolean" },
    { key: "imageUrl", label: "Picture", type: "image", optional: true },
  ],
  corridors: [
    { key: "from", label: "Collection location", ref: "places" },
    { key: "to", label: "Delivery location", ref: "places" },
    { key: "km", label: "Road distance (km)", type: "number", max: 20000 },
    { key: "crops", label: "Produce carried", type: "crops" },
    { key: "summary", label: "Description", type: "textarea" },
    { key: "imageUrl", label: "Route picture", type: "image", optional: true },
  ],
  exportLanes: [
    { key: "portId", label: "Nigerian port", ref: "ports" },
    { key: "region", label: "Destination region" },
    { key: "countries", label: "Countries (separated by commas)" },
    { key: "crops", label: "Produce types", type: "crops" },
    { key: "sailing", label: "Planning frequency (internal estimate)" },
    { key: "summary", label: "Description", type: "textarea" },
    { key: "imageUrl", label: "Route picture", type: "image", optional: true },
  ],
  exportDocuments: [
    { key: "title", label: "Document name" },
    { key: "body", label: "Guidance", type: "textarea" },
  ],
};
export function entryTitle(
  collection: Collection,
  entry: Record<string, unknown>,
  catalog: ProduceCatalog,
) {
  if (collection === "corridors")
    return `${catalog.places.find((p) => p.id === entry.from)?.name ?? entry.from} → ${catalog.places.find((p) => p.id === entry.to)?.name ?? entry.to}`;
  if (collection === "lots")
    return `${catalog.commodities.find((c) => c.id === entry.commodityId)?.name ?? entry.commodityId} · ${entry.tonnes} tonnes`;
  if (collection === "exportLanes")
    return `${entry.region} · ${catalog.places.find((p) => p.id === entry.portId)?.name ?? entry.portId}`;
  return String(entry.name ?? entry.title ?? entry.id);
}
