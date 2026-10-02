"use client";
import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CATALOG, type ProduceCatalog } from "@/lib/produce/model";
const CatalogContext = createContext<ProduceCatalog>(DEFAULT_CATALOG);
export function CatalogProvider({
  catalog,
  children,
}: {
  catalog: ProduceCatalog;
  children: ReactNode;
}) {
  return (
    <CatalogContext.Provider value={catalog}>
      {children}
    </CatalogContext.Provider>
  );
}
export function useProduceCatalog() {
  const catalog = useContext(CatalogContext);
  const placeById = (id: string) =>
    catalog.places.find((item) => item.id === id);
  const commodityById = (id: string) =>
    catalog.commodities.find((item) => item.id === id);
  const placeLabel = (id: string) => {
    const place = placeById(id);
    return place ? `${place.name}, ${place.state}` : id;
  };
  const routeKm = (from: string, to: string) => {
    if (from === to) return 0;
    return (
      catalog.corridors.find(
        (item) =>
          (item.from === from && item.to === to) ||
          (item.from === to && item.to === from),
      )?.km ?? null
    );
  };
  return { ...catalog, placeById, commodityById, placeLabel, routeKm };
}
