import {
  COMMODITIES,
  CORRIDORS,
  EXPORT_LANES,
  EXPORT_DOCUMENTS,
  LOTS,
  PLACES,
  type Commodity,
  type Corridor,
  type ExportLane,
  type Lot,
  type Place,
} from "./catalog";

export type Managed<T> = T & { active?: boolean; imageUrl?: string };
export type SiteSettings = {
  homeTitle: string;
  homeDescription: string;
  homeImage: string;
  buyTitle: string;
  buyDescription: string;
  buyImage: string;
  exportTitle: string;
  exportDescription: string;
  exportImage: string;
  routesTitle: string;
  routesDescription: string;
  routesImage: string;
  trackTitle: string;
  trackDescription: string;
};
export type ProduceCatalog = {
  places: Managed<Place>[];
  commodities: Managed<Commodity>[];
  corridors: Managed<Corridor>[];
  lots: (Managed<Lot> & { sample?: boolean })[];
  exportLanes: Managed<ExportLane>[];
  exportDocuments: {
    id: string;
    title: string;
    body: string;
    active?: boolean;
  }[];
  settings: SiteSettings;
};
export type Collection = Exclude<keyof ProduceCatalog, "settings">;
export const COLLECTIONS: Collection[] = [
  "places",
  "commodities",
  "corridors",
  "lots",
  "exportLanes",
  "exportDocuments",
];
export const DEFAULT_CATALOG: ProduceCatalog = {
  places: PLACES,
  commodities: COMMODITIES,
  corridors: CORRIDORS,
  lots: LOTS.map((lot) => ({ ...lot, sample: true })),
  exportLanes: EXPORT_LANES,
  exportDocuments: EXPORT_DOCUMENTS.map((doc, index) => ({
    id: `document-${index + 1}`,
    ...doc,
  })),
  settings: {
    homeTitle: "Your produce.\nOur responsibility.",
    homeDescription:
      "From the farm to the market, or all the way to port. Tell us what needs moving. We take care of the collection, transport and delivery.",
    homeImage: "",
    buyTitle: "Good produce.\nA better way\nto buy it.",
    buyDescription:
      "For your market, your business or your next export. Find the produce you need. We help coordinate the purchase and get it where it needs to go.",
    buyImage: "",
    exportTitle: "Your next market.\nBeyond borders.",
    exportDescription:
      "Take your produce from its collection point to port, with one team bringing the journey together. We coordinate transport and help you prepare for the next stage of your export.",
    exportImage: "",
    routesTitle: "Across Nigeria.\nCloser to your buyer.",
    routesDescription:
      "Your produce has somewhere to be. Explore collection points, markets and ports, then let our team bring the journey together.",
    routesImage: "",
    trackTitle: "Your delivery.\nA clearer picture.",
    trackDescription:
      "Enter your shipment reference to see the journey, the current stage and what happens next.",
  },
};
export function visibleCatalog(catalog: ProduceCatalog): ProduceCatalog {
  const places = catalog.places.filter((item) => item.active !== false);
  const commodities = catalog.commodities.filter(
    (item) => item.active !== false,
  );
  const hasPlace = (id: string) => places.some((item) => item.id === id);
  const hasCrop = (id: string) => commodities.some((item) => item.id === id);
  return {
    ...catalog,
    places,
    commodities,
    exportDocuments: catalog.exportDocuments.filter(
      (item) => item.active !== false,
    ),
    corridors: catalog.corridors
      .filter(
        (item) =>
          item.active !== false &&
          hasPlace(item.from) &&
          hasPlace(item.to) &&
          item.crops.some(hasCrop),
      )
      .map((item) => ({ ...item, crops: item.crops.filter(hasCrop) })),
    lots: catalog.lots.filter(
      (item) =>
        item.active !== false &&
        hasPlace(item.originId) &&
        hasPlace(item.destinationId) &&
        hasCrop(item.commodityId),
    ),
    exportLanes: catalog.exportLanes
      .filter(
        (item) =>
          item.active !== false &&
          hasPlace(item.portId) &&
          item.crops.some(hasCrop),
      )
      .map((item) => ({ ...item, crops: item.crops.filter(hasCrop) })),
  };
}
