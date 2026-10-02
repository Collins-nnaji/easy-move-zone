import {
  COLLECTIONS,
  type Collection,
  type ProduceCatalog,
  type SiteSettings,
} from "./model";
export class ValidationError extends Error {}
const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ValidationError("Invalid record.");
  return value as Record<string, unknown>;
};
function text(
  o: Record<string, unknown>,
  key: string,
  max = 500,
  optional = false,
) {
  const v = typeof o[key] === "string" ? o[key].trim() : "";
  if ((!optional && !v) || v.length > max)
    throw new ValidationError(
      `Please check ${key.replace(/[A-Z]/g, " $&").toLowerCase()}.`,
    );
  return v;
}
function number(o: Record<string, unknown>, key: string, max = 1e10) {
  const v = o[key];
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0 || v > max)
    throw new ValidationError(
      `Please check ${key.replace(/[A-Z]/g, " $&").toLowerCase()}.`,
    );
  return v;
}
function choice(o: Record<string, unknown>, key: string, options: string[]) {
  const value = text(o, key);
  if (!options.includes(value))
    throw new ValidationError(
      `Please check ${key.replace(/[A-Z]/g, " $&").toLowerCase()}.`,
    );
  return value;
}
export function imageUrl(value: unknown) {
  if (!value) return "";
  if (typeof value !== "string" || value.length > 2000)
    throw new ValidationError("Invalid picture URL.");
  if (/^\/api\/produce\/media\/[a-f0-9-]{36}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password)
      return url.toString();
  } catch {}
  throw new ValidationError("Use an uploaded picture or an HTTPS picture URL.");
}
export function validateSettings(value: unknown): SiteSettings {
  const o = record(value);
  const settings: Record<string, string> = {};
  for (const prefix of ["home", "buy", "export", "routes", "track"]) {
    settings[`${prefix}Title`] = text(o, `${prefix}Title`, 200);
    settings[`${prefix}Description`] = text(o, `${prefix}Description`, 1000);
    if (prefix !== "track")
      settings[`${prefix}Image`] = imageUrl(o[`${prefix}Image`]);
  }
  return settings as SiteSettings;
}
export function validateEntry(
  collection: Collection,
  value: unknown,
  catalog: ProduceCatalog,
) {
  if (!COLLECTIONS.includes(collection))
    throw new ValidationError("Unknown collection.");
  const o = record(value);
  const id = text(o, "id", 80);
  if (!/^[a-zA-Z0-9_-]+$/.test(id))
    throw new ValidationError(
      "The ID can contain letters, numbers, hyphens and underscores.",
    );
  const base = {
    id,
    active: o.active !== false,
    imageUrl: imageUrl(o.imageUrl),
  };
  const place = (key: string) =>
    choice(
      o,
      key,
      catalog.places.map((item) => item.id),
    );
  const crops = () => {
    if (
      !Array.isArray(o.crops) ||
      !o.crops.length ||
      o.crops.some(
        (id) =>
          typeof id !== "string" ||
          !catalog.commodities.some((crop) => crop.id === id),
      )
    )
      throw new ValidationError("Choose at least one valid produce type.");
    return [...new Set(o.crops)] as string[];
  };
  if (collection === "exportDocuments")
    return {
      id,
      active: o.active !== false,
      title: text(o, "title", 200),
      body: text(o, "body", 2000),
    };
  if (collection === "places")
    return {
      ...base,
      name: text(o, "name", 100),
      state: text(o, "state", 100),
      zone: text(o, "zone", 100),
      kind: choice(o, "kind", ["farm", "market", "port"]),
    };
  if (collection === "commodities")
    return {
      ...base,
      name: text(o, "name", 100),
      unit: text(o, "unit", 30),
      lane: choice(o, "lane", ["domestic", "export", "both"]),
      samplePrice: number(o, "samplePrice"),
      note: text(o, "note", 1000),
    };
  if (collection === "corridors") {
    const from = place("from"),
      to = place("to");
    if (from === to)
      throw new ValidationError(
        "Collection and destination must be different.",
      );
    return {
      ...base,
      from,
      to,
      km: number(o, "km", 20000),
      crops: crops(),
      summary: text(o, "summary", 1000),
    };
  }
  if (collection === "exportLanes") {
    const portId = place("portId");
    if (catalog.places.find((p) => p.id === portId)?.kind !== "port")
      throw new ValidationError("Choose a port.");
    return {
      ...base,
      portId,
      region: text(o, "region", 100),
      countries: text(o, "countries", 500),
      crops: crops(),
      sailing: text(o, "sailing", 100),
      summary: text(o, "summary", 1000),
    };
  }
  const ready = text(o, "ready", 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(ready) ||
    !Number.isFinite(Date.parse(ready)) ||
    new Date(`${ready}T00:00:00Z`).toISOString().slice(0, 10) !== ready
  )
    throw new ValidationError("Choose a valid ready date.");
  return {
    ...base,
    commodityId: choice(
      o,
      "commodityId",
      catalog.commodities.map((item) => item.id),
    ),
    originId: place("originId"),
    destinationId: place("destinationId"),
    tonnes: number(o, "tonnes", 500),
    grade: text(o, "grade", 200),
    pricePerTonne: number(o, "pricePerTonne"),
    ready,
    seller: text(o, "seller", 200),
    sample: o.sample !== false,
  };
}
export function assertCanDelete(
  collection: Collection,
  id: string,
  catalog: ProduceCatalog,
) {
  const placeInUse =
    catalog.corridors.some((r) => r.from === id || r.to === id) ||
    catalog.lots.some((l) => l.originId === id || l.destinationId === id) ||
    catalog.exportLanes.some((l) => l.portId === id);
  const cropInUse =
    catalog.corridors.some((r) => r.crops.includes(id)) ||
    catalog.lots.some((l) => l.commodityId === id) ||
    catalog.exportLanes.some((l) => l.crops.includes(id));
  if (
    (collection === "places" && placeInUse) ||
    (collection === "commodities" && cropInUse)
  )
    throw new ValidationError(
      "This item is used by other records. Hide it, or update those records before deleting it.",
    );
}
