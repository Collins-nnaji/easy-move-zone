export type PlaceKind = "farm" | "market" | "port";

export type Place = {
  id: string;
  name: string;
  state: string;
  zone: string;
  kind: PlaceKind;
};

export type Commodity = {
  id: string;
  name: string;
  unit: string;
  lane: "domestic" | "export" | "both";
  /** Sample wholesale price per tonne, in naira. */
  samplePrice: number;
  note: string;
};

export type Corridor = {
  id: string;
  from: string;
  to: string;
  km: number;
  crops: string[];
  summary: string;
};

export type Lot = {
  id: string;
  commodityId: string;
  originId: string;
  destinationId: string;
  tonnes: number;
  grade: string;
  pricePerTonne: number;
  ready: string;
  seller: string;
};

export type ExportLane = {
  id: string;
  portId: string;
  region: string;
  countries: string;
  crops: string[];
  sailing: string;
  summary: string;
};

export type AudienceId = "farmers" | "traders" | "exporters";

export const PLACES: Place[] = [
  {
    id: "makurdi",
    name: "Makurdi",
    state: "Benue",
    zone: "North Central",
    kind: "farm",
  },
  {
    id: "lafia",
    name: "Lafia",
    state: "Nasarawa",
    zone: "North Central",
    kind: "farm",
  },
  {
    id: "jos",
    name: "Jos",
    state: "Plateau",
    zone: "North Central",
    kind: "farm",
  },
  {
    id: "ilorin",
    name: "Ilorin",
    state: "Kwara",
    zone: "North Central",
    kind: "farm",
  },
  {
    id: "kaduna",
    name: "Kaduna",
    state: "Kaduna",
    zone: "North West",
    kind: "farm",
  },
  {
    id: "kano",
    name: "Kano",
    state: "Kano",
    zone: "North West",
    kind: "market",
  },
  {
    id: "kebbi",
    name: "Birnin Kebbi",
    state: "Kebbi",
    zone: "North West",
    kind: "farm",
  },
  {
    id: "dutse",
    name: "Dutse",
    state: "Jigawa",
    zone: "North West",
    kind: "farm",
  },
  {
    id: "akure",
    name: "Akure",
    state: "Ondo",
    zone: "South West",
    kind: "farm",
  },
  {
    id: "osogbo",
    name: "Osogbo",
    state: "Osun",
    zone: "South West",
    kind: "farm",
  },
  {
    id: "abeokuta",
    name: "Abeokuta",
    state: "Ogun",
    zone: "South West",
    kind: "farm",
  },
  {
    id: "calabar",
    name: "Calabar",
    state: "Cross River",
    zone: "South South",
    kind: "farm",
  },
  {
    id: "mile12",
    name: "Mile 12 Market",
    state: "Lagos",
    zone: "South West",
    kind: "market",
  },
  {
    id: "apapa",
    name: "Apapa Port",
    state: "Lagos",
    zone: "South West",
    kind: "port",
  },
  {
    id: "tincan",
    name: "Tin Can Island",
    state: "Lagos",
    zone: "South West",
    kind: "port",
  },
  {
    id: "onne",
    name: "Onne Port",
    state: "Rivers",
    zone: "South South",
    kind: "port",
  },
];

export const COMMODITIES: Commodity[] = [
  {
    id: "yam",
    name: "Yam",
    unit: "tonne",
    lane: "domestic",
    samplePrice: 280_000,
    note: "Ware yam moving into city markets.",
  },
  {
    id: "maize",
    name: "Maize",
    unit: "tonne",
    lane: "both",
    samplePrice: 320_000,
    note: "Bagged grain for mills and feed.",
  },
  {
    id: "rice",
    name: "Rice",
    unit: "tonne",
    lane: "domestic",
    samplePrice: 480_000,
    note: "Milled rice for urban wholesale.",
  },
  {
    id: "cassava",
    name: "Cassava",
    unit: "tonne",
    lane: "domestic",
    samplePrice: 90_000,
    note: "Fresh roots for processing nearby.",
  },
  {
    id: "tomatoes",
    name: "Tomatoes",
    unit: "tonne",
    lane: "domestic",
    samplePrice: 220_000,
    note: "Perishable. Book the truck for the same day as harvest.",
  },
  {
    id: "plantain",
    name: "Plantain",
    unit: "tonne",
    lane: "domestic",
    samplePrice: 180_000,
    note: "Bunches for southern city markets.",
  },
  {
    id: "cocoa",
    name: "Cocoa",
    unit: "tonne",
    lane: "export",
    samplePrice: 4_800_000,
    note: "Dried beans graded for export.",
  },
  {
    id: "sesame",
    name: "Sesame",
    unit: "tonne",
    lane: "export",
    samplePrice: 1_150_000,
    note: "Oilseed for Europe and Asia.",
  },
  {
    id: "cashew",
    name: "Cashew",
    unit: "tonne",
    lane: "export",
    samplePrice: 1_400_000,
    note: "Raw nuts in jute bags.",
  },
  {
    id: "ginger",
    name: "Ginger",
    unit: "tonne",
    lane: "export",
    samplePrice: 900_000,
    note: "Dried split ginger.",
  },
  {
    id: "hibiscus",
    name: "Hibiscus",
    unit: "tonne",
    lane: "export",
    samplePrice: 650_000,
    note: "Dried calyces, often called zobo.",
  },
  {
    id: "shea",
    name: "Shea nut",
    unit: "tonne",
    lane: "export",
    samplePrice: 420_000,
    note: "Dried kernels for export crushers.",
  },
  {
    id: "soybean",
    name: "Soybean",
    unit: "tonne",
    lane: "both",
    samplePrice: 520_000,
    note: "Domestic crush or export, depending on the buyer.",
  },
];

export const CORRIDORS: Corridor[] = [
  {
    id: "benue-lagos-yam",
    from: "makurdi",
    to: "mile12",
    km: 780,
    crops: ["yam", "sesame"],
    summary: "Benue harvest into Mile 12, with sesame continuing to Apapa.",
  },
  {
    id: "nasarawa-lagos",
    from: "lafia",
    to: "mile12",
    km: 700,
    crops: ["yam", "sesame", "maize"],
    summary: "North Central grain and yam into Lagos wholesale.",
  },
  {
    id: "kaduna-apapa",
    from: "kaduna",
    to: "apapa",
    km: 790,
    crops: ["ginger", "maize"],
    summary: "Southern Kaduna ginger hauled to the export quay.",
  },
  {
    id: "kano-mile12",
    from: "kano",
    to: "mile12",
    km: 990,
    crops: ["tomatoes", "maize", "soybean"],
    summary: "Northern produce down the western corridor into Lagos.",
  },
  {
    id: "kebbi-mile12",
    from: "kebbi",
    to: "mile12",
    km: 1050,
    crops: ["rice"],
    summary: "Kebbi rice into Lagos wholesale markets.",
  },
  {
    id: "jigawa-apapa",
    from: "dutse",
    to: "apapa",
    km: 1080,
    crops: ["hibiscus", "sesame"],
    summary: "Jigawa hibiscus and sesame staged for export.",
  },
  {
    id: "plateau-mile12",
    from: "jos",
    to: "mile12",
    km: 900,
    crops: ["maize", "soybean"],
    summary: "Plateau grains into the Lagos market.",
  },
  {
    id: "kwara-tincan",
    from: "ilorin",
    to: "tincan",
    km: 310,
    crops: ["cashew", "maize"],
    summary: "Kwara cashew to Tin Can, maize to nearby markets.",
  },
  {
    id: "ondo-apapa",
    from: "akure",
    to: "apapa",
    km: 230,
    crops: ["cocoa"],
    summary: "Ondo cocoa, a short haul into Apapa.",
  },
  {
    id: "osun-tincan",
    from: "osogbo",
    to: "tincan",
    km: 240,
    crops: ["cocoa", "cashew"],
    summary: "Osun cocoa and cashew onto Tin Can.",
  },
  {
    id: "ogun-mile12",
    from: "abeokuta",
    to: "mile12",
    km: 80,
    crops: ["cassava", "plantain"],
    summary: "Ogun roots and plantain into Lagos the same day.",
  },
  {
    id: "cross-onne",
    from: "calabar",
    to: "onne",
    km: 180,
    crops: ["cocoa"],
    summary: "Cross River cocoa east to Onne instead of Lagos.",
  },
];

export const LOTS: Lot[] = [
  {
    id: "EMZ-LOT-1042",
    commodityId: "sesame",
    originId: "makurdi",
    destinationId: "apapa",
    tonnes: 48,
    grade: "A, 98% purity",
    pricePerTonne: 1_150_000,
    ready: "2026-10-08",
    seller: "Benue cooperative",
  },
  {
    id: "EMZ-LOT-1108",
    commodityId: "cocoa",
    originId: "akure",
    destinationId: "apapa",
    tonnes: 32,
    grade: "Grade 1, well dried",
    pricePerTonne: 4_800_000,
    ready: "2026-10-06",
    seller: "Ondo aggregator",
  },
  {
    id: "EMZ-LOT-0988",
    commodityId: "ginger",
    originId: "kaduna",
    destinationId: "apapa",
    tonnes: 18,
    grade: "Dried split",
    pricePerTonne: 900_000,
    ready: "2026-10-11",
    seller: "Kaduna shed",
  },
  {
    id: "EMZ-LOT-1210",
    commodityId: "rice",
    originId: "kebbi",
    destinationId: "mile12",
    tonnes: 60,
    grade: "Milled, bagged",
    pricePerTonne: 480_000,
    ready: "2026-10-05",
    seller: "Kebbi mill",
  },
  {
    id: "EMZ-LOT-0874",
    commodityId: "yam",
    originId: "makurdi",
    destinationId: "mile12",
    tonnes: 40,
    grade: "Ware, mixed sizes",
    pricePerTonne: 280_000,
    ready: "2026-10-04",
    seller: "Makurdi yard",
  },
  {
    id: "EMZ-LOT-1333",
    commodityId: "tomatoes",
    originId: "kano",
    destinationId: "mile12",
    tonnes: 22,
    grade: "Fresh, same-day load",
    pricePerTonne: 220_000,
    ready: "2026-10-03",
    seller: "Kano shed",
  },
  {
    id: "EMZ-LOT-0761",
    commodityId: "cocoa",
    originId: "calabar",
    destinationId: "onne",
    tonnes: 27,
    grade: "Grade 1",
    pricePerTonne: 4_650_000,
    ready: "2026-10-09",
    seller: "Cross River buyer",
  },
  {
    id: "EMZ-LOT-1419",
    commodityId: "hibiscus",
    originId: "dutse",
    destinationId: "apapa",
    tonnes: 15,
    grade: "Dried calyx",
    pricePerTonne: 650_000,
    ready: "2026-10-14",
    seller: "Jigawa aggregator",
  },
  {
    id: "EMZ-LOT-0902",
    commodityId: "cashew",
    originId: "ilorin",
    destinationId: "tincan",
    tonnes: 36,
    grade: "Raw in-shell",
    pricePerTonne: 1_400_000,
    ready: "2026-10-12",
    seller: "Kwara warehouse",
  },
  {
    id: "EMZ-LOT-1550",
    commodityId: "cassava",
    originId: "abeokuta",
    destinationId: "mile12",
    tonnes: 50,
    grade: "Fresh roots",
    pricePerTonne: 90_000,
    ready: "2026-10-03",
    seller: "Ogun farm group",
  },
];

export const EXPORT_LANES: ExportLane[] = [
  {
    id: "apapa-europe",
    portId: "apapa",
    region: "Europe",
    countries: "Netherlands, Belgium, Germany, United Kingdom",
    crops: ["cocoa", "sesame", "cashew"],
    sailing: "Weekly",
    summary:
      "Cocoa, sesame and cashew staged at Apapa for northern European buyers.",
  },
  {
    id: "apapa-middle-east",
    portId: "apapa",
    region: "Middle East",
    countries: "United Arab Emirates, Saudi Arabia",
    crops: ["hibiscus", "ginger", "sesame"],
    sailing: "Every 10 days",
    summary: "Dried hibiscus, ginger and sesame for Gulf wholesale.",
  },
  {
    id: "tincan-asia",
    portId: "tincan",
    region: "Asia",
    countries: "Vietnam, India, China",
    crops: ["cashew", "sesame", "soybean"],
    sailing: "Fortnightly",
    summary: "Raw cashew and oilseeds through Tin Can.",
  },
  {
    id: "onne-europe",
    portId: "onne",
    region: "Europe",
    countries: "Netherlands, Spain",
    crops: ["cocoa"],
    sailing: "Weekly",
    summary: "Eastern cocoa that never needs to cross to Lagos.",
  },
];

export const EXPORT_DOCUMENTS = [
  {
    title: "Weight and grade note",
    body: "Record the produce, weight, packaging and quality for the shipment.",
  },
  {
    title: "NAQS phytosanitary certificate",
    body: "Plant-health documentation may be needed for your produce and destination. Our team helps identify the checks to prepare for.",
  },
  {
    title: "Certificate of origin",
    body: "Documentation showing where your goods originate. Our team helps clarify what your destination needs.",
  },
  {
    title: "Form NXP",
    body: "Export paperwork connected to the transaction. Our team helps clarify how this fits into shipment preparation.",
  },
  {
    title: "Packing list and invoice",
    body: "A breakdown of the goods, quantities, packaging and agreed purchase price.",
  },
  {
    title: "Bill of lading",
    body: "The carrier’s transport document for the sea journey. Discuss onward shipping arrangements with our team.",
  },
] as const;

export const AUDIENCES: Record<
  AudienceId,
  {
    title: string;
    lede: string;
    points: Array<{ title: string; body: string }>;
    cta: { href: string; label: string };
  }
> = {
  farmers: {
    title: "For farmers and cooperatives",
    lede: "Focus on your harvest. Tell us what is ready, where to collect it and where it needs to go. Our team arranges the transport.",
    points: [
      {
        title: "Collection from producing areas",
        body: "Explore collection routes from Makurdi, Lafia, Kaduna, Kebbi, Akure and other producing towns.",
      },
      {
        title: "Get help with your delivery",
        body: "We coordinate collection and transport to your chosen market, warehouse or port.",
      },
      {
        title: "Plan around your harvest",
        body: "Tell us when your tomatoes, plantain or fresh cassava will be ready so we can plan collection with you.",
      },
    ],
    cta: { href: "/book", label: "Arrange collection from your farm" },
  },
  traders: {
    title: "For traders and aggregators",
    lede: "Find Nigerian produce by weight, quality and location. Our team helps coordinate your purchase and delivery.",
    points: [
      {
        title: "Compare produce before you buy",
        body: "Tonnes, grade, ready date and the asking price per tonne are on the listing.",
      },
      {
        title: "Deliver to your chosen market",
        body: "We arrange delivery to markets including Mile 12 and Kano, as well as Nigerian ports.",
      },
      {
        title: "Understand the transport cost",
        body: "Distance, truck count and a naira estimate before you confirm.",
      },
    ],
    cta: { href: "/lots", label: "Explore bulk produce" },
  },
  exporters: {
    title: "For exporters",
    lede: "We arrange transport from your collection point to Apapa, Tin Can or Onne and help you prepare for export.",
    points: [
      {
        title: "Transport for export produce",
        body: "Cocoa, sesame, cashew, ginger, hibiscus, shea and soybean, each tied to a port.",
      },
      {
        title: "Get your goods to port",
        body: "Our team coordinates the road journey and confirms delivery arrangements with you.",
      },
      {
        title: "Get help preparing paperwork",
        body: "Phytosanitary, origin, Form NXP, packing list and bill of lading, in the order they are needed.",
      },
    ],
    cta: { href: "/export", label: "Explore export services" },
  },
};

const DISTANCE = new Map<string, number>();
for (const corridor of CORRIDORS) {
  const key = [corridor.from, corridor.to].sort().join("|");
  DISTANCE.set(key, corridor.km);
}
// Lagos market and the two Lagos quays share a corridor, plus a short city leg.
for (const [from, km] of [
  ["makurdi", 780],
  ["lafia", 700],
  ["kano", 990],
  ["kebbi", 1050],
  ["jos", 900],
  ["abeokuta", 80],
] as const) {
  DISTANCE.set([from, "apapa"].sort().join("|"), km + 25);
  DISTANCE.set([from, "tincan"].sort().join("|"), km + 30);
}

export function placeById(id: string) {
  return PLACES.find((place) => place.id === id);
}

export function commodityById(id: string) {
  return COMMODITIES.find((commodity) => commodity.id === id);
}

export function lotById(id: string) {
  return LOTS.find((lot) => lot.id === id);
}

export function placeLabel(id: string) {
  const place = placeById(id);
  return place ? `${place.name}, ${place.state}` : id;
}

export function routeKm(from: string, to: string) {
  if (from === to) return 0;
  return DISTANCE.get([from, to].sort().join("|")) ?? null;
}

/** Illustrative interstate truck rate. A dispatcher confirms the fare. */
export function estimateFare(km: number, tonnes: number) {
  const trucks = Math.max(1, Math.ceil(tonnes / 30));
  const perTruck = 150_000 + km * 620;
  return { trucks, perTruck, total: trucks * perTruck };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatNaira(amount: number) {
  const digits = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₦${digits}`;
}

export function formatReady(iso: string) {
  const [year, month, day] = iso.split("-");
  const monthName = MONTHS[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthName} ${year}`;
}
