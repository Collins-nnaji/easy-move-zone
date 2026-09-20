/** Freight modes, corridors, and cargo classes for quote forms and marketing. */

export const FREIGHT_MODES = ["sea", "air", "road", "multimodal"] as const;
export type FreightMode = (typeof FREIGHT_MODES)[number];

export const SHIPMENT_DIRECTIONS = ["export", "import"] as const;
export type ShipmentDirection = (typeof SHIPMENT_DIRECTIONS)[number];

export const INCOTERMS = ["EXW", "FOB", "CIF", "CFR", "DAP", "DDP", "FCA", "CPT"] as const;
export type Incoterm = (typeof INCOTERMS)[number];

export const FREIGHT_MODE_OPTIONS = [
  { key: "sea" as const, label: "Sea freight", sub: "FCL · LCL · containers" },
  { key: "air" as const, label: "Air freight", sub: "Express · consolidations" },
  { key: "road" as const, label: "Road haulage", sub: "Port · inland · cross-border" },
  { key: "multimodal" as const, label: "Multimodal", sub: "Door-to-door · truck + sea/air" },
] as const;

export const CARGO_CLASS_OPTIONS = [
  { key: "general", label: "General cargo", sub: "Cartons · pallets · mixed" },
  { key: "container", label: "Containerized", sub: "20' · 40' · HC" },
  { key: "perishable", label: "Perishable / cold chain", sub: "Reefer · temp-controlled" },
  { key: "project", label: "Project / oversized", sub: "Machinery · breakbulk" },
  { key: "dangerous", label: "Dangerous goods", sub: "DG documentation required" },
  { key: "personal", label: "Personal effects", sub: "Household · relocation cargo" },
] as const;

export type CargoClass = (typeof CARGO_CLASS_OPTIONS)[number]["key"];

export const CORRIDORS = [
  {
    key: "ng-export-eu",
    label: "Nigeria → Europe",
    hubs: "Lagos · Apapa · Tin Can → Rotterdam · Antwerp · Hamburg",
    modes: ["sea", "air"] as FreightMode[],
  },
  {
    key: "ng-export-us",
    label: "Nigeria → North America",
    hubs: "Lagos · Onne → New York · Houston · Toronto",
    modes: ["sea", "air"] as FreightMode[],
  },
  {
    key: "ng-export-asia",
    label: "Nigeria → Asia",
    hubs: "Lagos · Port Harcourt → Shanghai · Dubai · Singapore",
    modes: ["sea", "air"] as FreightMode[],
  },
  {
    key: "ng-export-africa",
    label: "Nigeria → West & East Africa",
    hubs: "Lagos · Abuja → Accra · Abidjan · Nairobi · Johannesburg",
    modes: ["road", "air", "sea"] as FreightMode[],
  },
  {
    key: "ng-import-world",
    label: "World → Nigeria",
    hubs: "Global origins → Lagos · Abuja · Port Harcourt · Kano",
    modes: ["sea", "air", "multimodal"] as FreightMode[],
  },
] as const;

export const SERVICES = [
  {
    key: "sea",
    title: "Sea freight",
    body: "FCL and LCL from Nigerian ports to major trade lanes, with booking, documentation, and inland haul to the terminal.",
  },
  {
    key: "air",
    title: "Air freight",
    body: "Time-critical cargo via Lagos and Abuja airports — consolidations, express, and charter coordination.",
  },
  {
    key: "road",
    title: "Road & inland",
    body: "Port drayage, inland delivery, and corridor haulage across Lagos, Abuja, Port Harcourt, and beyond.",
  },
  {
    key: "customs",
    title: "Customs & compliance",
    body: "Import and export clearance, Form M / PAAR support, SONCAP coordination, and duty guidance.",
  },
  {
    key: "warehouse",
    title: "Warehousing",
    body: "Short- and medium-term storage near ports and inland hubs, with inventory handoff to last-mile.",
  },
] as const;

export const COUNTRY_OPTIONS = [
  "Nigeria",
  "United Kingdom",
  "United States",
  "Canada",
  "Germany",
  "Netherlands",
  "China",
  "United Arab Emirates",
  "Ghana",
  "South Africa",
  "India",
  "Other",
] as const;
