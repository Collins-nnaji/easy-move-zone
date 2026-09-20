export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric"
export type Transmission = "Automatic" | "Manual"
export type BodyType = "Saloon" | "Hatchback" | "Estate" | "SUV" | "Coupe" | "MPV"
export type StockType = "uk_stock" | "import" | "cfr"
export type Market = "us" | "uk" | "ng"
export type CurrencyCode = "USD" | "GBP" | "NGN"
export type ShippingStatus =
  | "ready"
  | "in_transit"
  | "at_port"
  | "arriving"
  | "available_to_order"

export type Car = {
  id: string
  year: number
  make: string
  model: string
  trim: string
  mileage: number
  fuel: FuelType
  transmission: Transmission
  engine: string
  body: BodyType
  colour: string
  doors: number
  seats: number
  price: number
  monthlyFrom: number
  photos: string[]
  features: string[]
  description: string
  history: {
    hpi: string
    mot: string
    service: string
    owners: number
  }
  stockType: StockType
  market: Market
  currency?: CurrencyCode
  originCountry: string
  originPort?: string
  destinationPort?: string
  incoterm?: "CFR" | "CIF" | "FOB" | "EXW"
  shippingStatus: ShippingStatus
  eta?: string
  trackingRef?: string
  featured?: boolean
  location?: string
  seller?: string
  sellerType?: "Dealer" | "Private"
  rating?: number
  reviewCount?: number
  priceRating?: "Great price" | "Good price" | "Fair price"
}

const img = (id: string, altQuery: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80&${altQuery}`

export const CARS: Car[] = [
  {
    id: "bmw-3-series-320i",
    year: 2023,
    make: "BMW",
    model: "3 Series",
    trim: "320i M Sport",
    mileage: 28450,
    fuel: "Petrol",
    transmission: "Automatic",
    engine: "2.0L",
    body: "Saloon",
    colour: "Black",
    doors: 4,
    seats: 5,
    price: 24995,
    monthlyFrom: 399,
    photos: [
      img("photo-1555215695-3004980ad54e", "bmw"),
      img("photo-1617531653332-bd46c24f2068", "interior"),
      img("photo-1503376780353-7e6692767b70", "detail"),
    ],
    features: [
      "Parking sensors",
      "Reversing camera",
      "Apple CarPlay",
      "Bluetooth",
      "Heated seats",
      "Cruise control",
      "Navigation",
      "Climate control",
    ],
    description:
      "A well-specified 320i M Sport with the right options for daily driving. Condition is tidy, service history is present, and the spec makes it an easy car to live with — whether you are paying cash or spreading the cost.",
    history: {
      hpi: "Clear — no outstanding finance or recorded write-off",
      mot: "Valid until March 2027",
      service: "Full service history",
      owners: 1,
    },
    stockType: "uk_stock",
    market: "uk",
    currency: "GBP",
    originCountry: "United Kingdom",
    shippingStatus: "ready",
    featured: true,
  },
  {
    id: "mercedes-c200",
    year: 2022,
    make: "Mercedes-Benz",
    model: "C-Class",
    trim: "C200 AMG Line",
    mileage: 31200,
    fuel: "Petrol",
    transmission: "Automatic",
    engine: "1.5L",
    body: "Saloon",
    colour: "Silver",
    doors: 4,
    seats: 5,
    price: 22950,
    monthlyFrom: 365,
    photos: [img("photo-1618843479313-40f8afb4b4d8", "merc"), img("photo-1605559424843-9e4c22870f31", "suv")],
    features: ["Parking sensors", "Reversing camera", "Apple CarPlay", "Heated seats", "Navigation", "Climate control"],
    description:
      "AMG Line C-Class in a usable mileage band. Quiet cabin, smooth auto gearbox, and a spec that feels a class above typical saloons at this price.",
    history: {
      hpi: "Clear",
      mot: "Valid until November 2026",
      service: "Mercedes service history",
      owners: 2,
    },
    stockType: "uk_stock",
    market: "uk",
    currency: "GBP",
    originCountry: "United Kingdom",
    shippingStatus: "ready",
    featured: true,
  },
  {
    id: "toyota-rav4-hybrid",
    year: 2021,
    make: "Toyota",
    model: "RAV4",
    trim: "Hybrid Design",
    mileage: 41800,
    fuel: "Hybrid",
    transmission: "Automatic",
    engine: "2.5L",
    body: "SUV",
    colour: "White",
    doors: 5,
    seats: 5,
    price: 18995,
    monthlyFrom: 319,
    photos: [img("photo-1621007947382-bb3c0433e8f0", "rav4"), img("photo-1549317661-bd32c8ce0db2", "toyota")],
    features: ["Apple CarPlay", "Bluetooth", "Reversing camera", "Cruise control", "Climate control"],
    description:
      "A practical hybrid SUV with Toyota reliability and sensible running costs. Strong option if you want space without a diesel.",
    history: {
      hpi: "Clear",
      mot: "Valid until August 2026",
      service: "Partial service history",
      owners: 1,
    },
    stockType: "uk_stock",
    market: "uk",
    currency: "GBP",
    originCountry: "United Kingdom",
    shippingStatus: "ready",
    featured: true,
  },
  {
    id: "vw-golf-gti",
    year: 2020,
    make: "Volkswagen",
    model: "Golf",
    trim: "GTI",
    mileage: 47200,
    fuel: "Petrol",
    transmission: "Manual",
    engine: "2.0L",
    body: "Hatchback",
    colour: "Red",
    doors: 5,
    seats: 5,
    price: 16495,
    monthlyFrom: 275,
    photos: [img("photo-1542282088-fe84266835ae", "golf"), img("photo-1494976388531-d1058494cdd8", "hatch")],
    features: ["Parking sensors", "Bluetooth", "Climate control", "Cruise control"],
    description:
      "A GTI for people who still want to drive. Manual gearbox, honest mileage, and a hatch that works as a daily as well as a weekend car.",
    history: {
      hpi: "Clear",
      mot: "Valid until January 2027",
      service: "Full service history",
      owners: 2,
    },
    stockType: "uk_stock",
    market: "uk",
    currency: "GBP",
    originCountry: "United Kingdom",
    shippingStatus: "ready",
  },
  {
    id: "audi-a4-avant",
    year: 2019,
    make: "Audi",
    model: "A4",
    trim: "Avant S Line",
    mileage: 62400,
    fuel: "Diesel",
    transmission: "Automatic",
    engine: "2.0L",
    body: "Estate",
    colour: "Grey",
    doors: 5,
    seats: 5,
    price: 12995,
    monthlyFrom: 219,
    photos: [img("photo-1606664515524-ed2f786a0bd6", "audi"), img("photo-1549317661-bd32c8ce0db2", "estate")],
    features: ["Parking sensors", "Bluetooth", "Navigation", "Climate control"],
    description:
      "S Line Avant with the load space families actually use. Diesel auto for motorway miles, presented cleanly for the year.",
    history: {
      hpi: "Clear",
      mot: "Valid until May 2026",
      service: "Audi service stamps",
      owners: 3,
    },
    stockType: "uk_stock",
    market: "uk",
    currency: "GBP",
    originCountry: "United Kingdom",
    shippingStatus: "ready",
  },
  {
    id: "honda-civic",
    year: 2018,
    make: "Honda",
    model: "Civic",
    trim: "VTEC Turbo",
    mileage: 58100,
    fuel: "Petrol",
    transmission: "Manual",
    engine: "1.0L",
    body: "Hatchback",
    colour: "Blue",
    doors: 5,
    seats: 5,
    price: 8995,
    monthlyFrom: 159,
    photos: [img("photo-1606664515524-ed2f786a0bd6", "civic")],
    features: ["Bluetooth", "Climate control", "Cruise control"],
    description:
      "A straightforward Civic under £10,000. Light to drive, cheap to run, and a sensible first or second car.",
    history: {
      hpi: "Clear",
      mot: "Valid until September 2026",
      service: "Service history on file",
      owners: 2,
    },
    stockType: "uk_stock",
    market: "uk",
    currency: "GBP",
    originCountry: "United Kingdom",
    shippingStatus: "ready",
  },
  {
    id: "ford-fiesta",
    year: 2017,
    make: "Ford",
    model: "Fiesta",
    trim: "Zetec",
    mileage: 71200,
    fuel: "Petrol",
    transmission: "Manual",
    engine: "1.0L",
    body: "Hatchback",
    colour: "White",
    doors: 5,
    seats: 5,
    price: 6495,
    monthlyFrom: 119,
    photos: [img("photo-1549317661-bd32c8ce0db2", "fiesta")],
    features: ["Bluetooth", "Air conditioning"],
    description:
      "A tidy city car under £7,000. Ideal if you want something simple to insure, park, and run without stretching the budget.",
    history: {
      hpi: "Clear",
      mot: "Valid until April 2026",
      service: "Partial history",
      owners: 3,
    },
    stockType: "uk_stock",
    market: "uk",
    currency: "GBP",
    originCountry: "United Kingdom",
    shippingStatus: "ready",
  },
  {
    id: "range-rover-sport-import",
    year: 2021,
    make: "Land Rover",
    model: "Range Rover Sport",
    trim: "HSE Dynamic",
    mileage: 33800,
    fuel: "Diesel",
    transmission: "Automatic",
    engine: "3.0L",
    body: "SUV",
    colour: "Black",
    doors: 5,
    seats: 5,
    price: 42995,
    monthlyFrom: 689,
    photos: [img("photo-1605559424843-9e4c22870f31", "rr"), img("photo-1619767886558-efdc259cde1a", "suv")],
    features: [
      "Parking sensors",
      "Reversing camera",
      "Heated seats",
      "Navigation",
      "Climate control",
      "Cruise control",
    ],
    description:
      "Import currently on the water. HSE Dynamic spec with the 3.0 diesel — a strong choice if you want a UK-spec SUV without waiting for local stock.",
    history: {
      hpi: "Export check in progress",
      mot: "Will be MOT’d on arrival where required",
      service: "Land Rover service records",
      owners: 1,
    },
    stockType: "import",
    market: "ng",
    currency: "USD",
    originCountry: "United Kingdom",
    originPort: "Southampton",
    destinationPort: "Lagos (Tin Can)",
    incoterm: "CIF",
    shippingStatus: "in_transit",
    eta: "12 Oct 2026",
    trackingRef: "EMZ-CAR-88421",
    featured: true,
  },
  {
    id: "lexus-rx-japan",
    year: 2020,
    make: "Lexus",
    model: "RX",
    trim: "450h F Sport",
    mileage: 29600,
    fuel: "Hybrid",
    transmission: "Automatic",
    engine: "3.5L",
    body: "SUV",
    colour: "White",
    doors: 5,
    seats: 5,
    price: 27450,
    monthlyFrom: 445,
    photos: [img("photo-1619767886558-efdc259cde1a", "lexus")],
    features: ["Reversing camera", "Apple CarPlay", "Heated seats", "Navigation", "Climate control"],
    description:
      "Japanese-spec RX 450h priced CFR. Hybrid running costs, quiet cabin, and a clean auction-grade history typical of Japan exports.",
    history: {
      hpi: "Japan auction sheet available",
      mot: "Inspection on arrival",
      service: "Dealer service in Japan",
      owners: 1,
    },
    stockType: "cfr",
    market: "ng",
    currency: "USD",
    originCountry: "Japan",
    originPort: "Yokohama",
    destinationPort: "Lagos (Apapa)",
    incoterm: "CFR",
    shippingStatus: "available_to_order",
    eta: "6–8 weeks from order",
    featured: true,
  },
  {
    id: "toyota-camry-us",
    year: 2022,
    make: "Toyota",
    model: "Camry",
    trim: "XSE",
    mileage: 18400,
    fuel: "Petrol",
    transmission: "Automatic",
    engine: "2.5L",
    body: "Saloon",
    colour: "Black",
    doors: 4,
    seats: 5,
    price: 20495,
    monthlyFrom: 345,
    photos: [img("photo-1621007947382-bb3c0433e8f0", "camry")],
    features: ["Apple CarPlay", "Bluetooth", "Reversing camera", "Climate control", "Cruise control"],
    description:
      "US-spec Camry XSE, CFR Houston. Low miles, comfortable motorway car, and a straightforward import if you want a saloon that is still in production.",
    history: {
      hpi: "Carfax summary available",
      mot: "On arrival",
      service: "Toyota dealer records",
      owners: 1,
    },
    stockType: "cfr",
    market: "ng",
    currency: "USD",
    originCountry: "United States",
    originPort: "Houston",
    destinationPort: "Lagos (Tin Can)",
    incoterm: "CFR",
    shippingStatus: "available_to_order",
    eta: "5–7 weeks from order",
    featured: true,
  },
  {
    id: "mercedes-gle-germany",
    year: 2023,
    make: "Mercedes-Benz",
    model: "GLE",
    trim: "300d AMG Line",
    mileage: 15200,
    fuel: "Diesel",
    transmission: "Automatic",
    engine: "2.0L",
    body: "SUV",
    colour: "Grey",
    doors: 5,
    seats: 5,
    price: 48995,
    monthlyFrom: 775,
    photos: [img("photo-1618843479313-40f8afb4b4d8", "gle")],
    features: [
      "Parking sensors",
      "Reversing camera",
      "Apple CarPlay",
      "Heated seats",
      "Navigation",
      "Climate control",
    ],
    description:
      "German-spec GLE currently at port. Low mileage AMG Line with the diesel that makes long trips easy. Import duty and clearance are separate from the CFR price.",
    history: {
      hpi: "EU export papers in file",
      mot: "On arrival",
      service: "Mercedes Digital Service",
      owners: 1,
    },
    stockType: "import",
    market: "ng",
    currency: "USD",
    originCountry: "Germany",
    originPort: "Bremerhaven",
    destinationPort: "Lagos (Tin Can)",
    incoterm: "CFR",
    shippingStatus: "at_port",
    eta: "Clearance this week",
    trackingRef: "EMZ-CAR-90112",
    featured: true,
  },
  {
    id: "honda-accord-japan",
    year: 2019,
    make: "Honda",
    model: "Accord",
    trim: "EX-L",
    mileage: 44200,
    fuel: "Petrol",
    transmission: "Automatic",
    engine: "1.5L",
    body: "Saloon",
    colour: "Silver",
    doors: 4,
    seats: 5,
    price: 11450,
    monthlyFrom: 195,
    photos: [img("photo-1494976388531-d1058494cdd8", "accord")],
    features: ["Apple CarPlay", "Bluetooth", "Climate control", "Cruise control"],
    description:
      "CFR Accord from Japan — a comfortable saloon with a turbo four-cylinder and a reputation for lasting. Priced for buyers who want import value rather than UK-forecourt money.",
    history: {
      hpi: "Auction grade 4",
      mot: "On arrival",
      service: "Honda Japan records",
      owners: 2,
    },
    stockType: "cfr",
    market: "ng",
    currency: "USD",
    originCountry: "Japan",
    originPort: "Nagoya",
    destinationPort: "Port Harcourt (Onne)",
    incoterm: "CFR",
    shippingStatus: "arriving",
    eta: "28 Sep 2026",
    trackingRef: "EMZ-CAR-77209",
  },
  {
    id: "kia-sportage",
    year: 2024,
    make: "Kia",
    model: "Sportage",
    trim: "GT-Line",
    mileage: 8200,
    fuel: "Hybrid",
    transmission: "Automatic",
    engine: "1.6L",
    body: "SUV",
    colour: "Green",
    doors: 5,
    seats: 5,
    price: 27995,
    monthlyFrom: 455,
    photos: [img("photo-1619767886558-efdc259cde1a", "kia")],
    features: ["Parking sensors", "Reversing camera", "Apple CarPlay", "Heated seats", "Climate control"],
    description:
      "Nearly-new Sportage GT-Line in UK stock. Warranty remaining, low miles, and a hybrid setup that keeps monthly running costs sensible.",
    history: {
      hpi: "Clear",
      mot: "First MOT 2027",
      service: "Kia warranty / first service done",
      owners: 1,
    },
    stockType: "uk_stock",
    market: "uk",
    currency: "GBP",
    originCountry: "United Kingdom",
    shippingStatus: "ready",
    featured: true,
  },
  {
    id: "tesla-model-3",
    year: 2022,
    make: "Tesla",
    model: "Model 3",
    trim: "Long Range",
    mileage: 22100,
    fuel: "Electric",
    transmission: "Automatic",
    engine: "Dual motor",
    body: "Saloon",
    colour: "White",
    doors: 4,
    seats: 5,
    price: 23495,
    monthlyFrom: 379,
    photos: [img("photo-1560958089-b8a1929cea89", "tesla")],
    features: ["Autopilot", "Heated seats", "Navigation", "Climate control", "Bluetooth"],
    description:
      "Long Range Model 3 with dual motor. Houston stock — a clean EV if you want low running costs in the US market.",
    history: {
      hpi: "Carfax clear",
      mot: "No MOT — US title",
      service: "Tesla records",
      owners: 1,
    },
    stockType: "uk_stock",
    market: "us",
    currency: "USD",
    originCountry: "United States",
    shippingStatus: "ready",
  },
  {
    id: "ford-f150-houston",
    year: 2021,
    make: "Ford",
    model: "F-150",
    trim: "XLT SuperCrew",
    mileage: 34800,
    fuel: "Petrol",
    transmission: "Automatic",
    engine: "3.5L EcoBoost",
    body: "SUV",
    colour: "Blue",
    doors: 4,
    seats: 5,
    price: 32990,
    monthlyFrom: 489,
    photos: [img("photo-1533473359331-0135ef1b58bf", "ford-truck")],
    features: ["Apple CarPlay", "Bluetooth", "Reversing camera", "Cruise control", "Climate control"],
    description:
      "US stock F-150 SuperCrew in Houston. Everyday pickup for work and family — listed for buyers shopping the American market.",
    history: {
      hpi: "Carfax clean title",
      mot: "No MOT — US title",
      service: "Ford dealer records",
      owners: 1,
    },
    stockType: "uk_stock",
    market: "us",
    currency: "USD",
    originCountry: "United States",
    shippingStatus: "ready",
    featured: true,
  },
  {
    id: "honda-crv-atlanta",
    year: 2020,
    make: "Honda",
    model: "CR-V",
    trim: "EX-L AWD",
    mileage: 41200,
    fuel: "Petrol",
    transmission: "Automatic",
    engine: "1.5L Turbo",
    body: "SUV",
    colour: "White",
    doors: 5,
    seats: 5,
    price: 24950,
    monthlyFrom: 385,
    photos: [img("photo-1606664515524-ed2f786a0bd6", "honda-suv")],
    features: ["Apple CarPlay", "Heated seats", "Reversing camera", "Climate control", "Bluetooth"],
    description: "Atlanta-area CR-V EX-L. AWD family SUV, local US stock, ready to view.",
    history: {
      hpi: "Carfax 1-owner",
      mot: "No MOT — US title",
      service: "Honda Care records",
      owners: 1,
    },
    stockType: "uk_stock",
    market: "us",
    currency: "USD",
    originCountry: "United States",
    shippingStatus: "ready",
  },
  {
    id: "toyota-camry-lagos",
    year: 2018,
    make: "Toyota",
    model: "Camry",
    trim: "LE",
    mileage: 62400,
    fuel: "Petrol",
    transmission: "Automatic",
    engine: "2.5L",
    body: "Saloon",
    colour: "Silver",
    doors: 4,
    seats: 5,
    price: 18500000,
    monthlyFrom: 420000,
    photos: [img("photo-1621007947382-bb3c0433e8f0", "camry-lagos")],
    features: ["Bluetooth", "Climate control", "Reversing camera", "Cruise control"],
    description:
      "Lagos stock Camry — already in Nigeria, papers in file, priced in naira. No waiting on a container.",
    history: {
      hpi: "Duty paid · customs papers",
      mot: "Roadworthiness current",
      service: "Toyota Nigeria service",
      owners: 2,
    },
    stockType: "uk_stock",
    market: "ng",
    currency: "NGN",
    originCountry: "Nigeria",
    shippingStatus: "ready",
    featured: true,
  },
  {
    id: "lexus-es-abuja",
    year: 2017,
    make: "Lexus",
    model: "ES",
    trim: "350",
    mileage: 58100,
    fuel: "Petrol",
    transmission: "Automatic",
    engine: "3.5L",
    body: "Saloon",
    colour: "Black",
    doors: 4,
    seats: 5,
    price: 24800000,
    monthlyFrom: 560000,
    photos: [img("photo-1619767886558-efdc259cde1a", "lexus-es")],
    features: ["Heated seats", "Navigation", "Climate control", "Reversing camera", "Bluetooth"],
    description: "Abuja-based ES 350. Local Nigerian stock for buyers who want a Lexus without an import wait.",
    history: {
      hpi: "Duty paid",
      mot: "Roadworthiness current",
      service: "Lexus specialist",
      owners: 2,
    },
    stockType: "uk_stock",
    market: "ng",
    currency: "NGN",
    originCountry: "Nigeria",
    shippingStatus: "ready",
  },
]

export const MAKES = [...new Set(CARS.map((c) => c.make))].sort()
export const FUELS: FuelType[] = ["Petrol", "Diesel", "Hybrid", "Electric"]
export const TRANSMISSIONS: Transmission[] = ["Automatic", "Manual"]
export const BODIES: BodyType[] = ["Saloon", "Hatchback", "Estate", "SUV", "Coupe", "MPV"]
export const COLOURS = [...new Set(CARS.map((c) => c.colour))].sort()

export const MARKETS: { id: Market; label: string; short: string; currency: CurrencyCode }[] = [
  { id: "us", label: "United States", short: "US", currency: "USD" },
  { id: "uk", label: "United Kingdom", short: "UK", currency: "GBP" },
  { id: "ng", label: "Nigeria", short: "Nigeria", currency: "NGN" },
]

export const MARKET_LABELS: Record<Market, string> = {
  us: "United States",
  uk: "United Kingdom",
  ng: "Nigeria",
}

export const STOCK_LABELS: Record<StockType, string> = {
  uk_stock: "Local stock",
  import: "Import in transit",
  cfr: "CFR from abroad",
}

export function stockLabel(car: Car) {
  if (car.stockType === "import") return "Import in transit"
  if (car.stockType === "cfr") return "CFR from abroad"
  return `${MARKETS.find((m) => m.id === car.market)?.short ?? "Local"} stock`
}

export function isLocalStock(car: Car) {
  return car.stockType === "uk_stock"
}

export function carCurrency(car: Pick<Car, "market" | "currency">): CurrencyCode {
  return car.currency ?? MARKETS.find((m) => m.id === car.market)?.currency ?? "GBP"
}

export const SHIPPING_LABELS: Record<ShippingStatus, string> = {
  ready: "Ready to view",
  in_transit: "On the water",
  at_port: "At destination port",
  arriving: "Arriving soon",
  available_to_order: "Available to order",
}

export const BUDGET_BANDS = [
  { id: "under-5k", label: "Under £5,000", min: 0, max: 4999 },
  { id: "5-10k", label: "£5,000 – £10,000", min: 5000, max: 10000 },
  { id: "10-20k", label: "£10,000 – £20,000", min: 10000, max: 20000 },
  { id: "20k-plus", label: "£20,000+", min: 20000, max: Infinity },
] as const

export function carTitle(car: Car) {
  return `${car.year} ${car.make} ${car.model} ${car.trim}`
}

export function formatGbp(amount: number) {
  return formatMoney(amount, "GBP")
}

export function formatMoney(amount: number, currency: CurrencyCode) {
  const locale = currency === "NGN" ? "en-NG" : currency === "USD" ? "en-US" : "en-GB"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPrice(car: Pick<Car, "price" | "market" | "currency">) {
  return formatMoney(car.price, carCurrency(car))
}

export function formatMonthly(car: Pick<Car, "monthlyFrom" | "market" | "currency">) {
  return formatMoney(car.monthlyFrom, carCurrency(car))
}

const FX_TO_GBP: Record<CurrencyCode, number> = { GBP: 1, USD: 0.79, NGN: 1 / 2100 }

export function priceInGbp(car: Pick<Car, "price" | "market" | "currency">) {
  return car.price * FX_TO_GBP[carCurrency(car)]
}

export function formatMiles(n: number) {
  return `${n.toLocaleString("en-GB")} miles`
}

export function getCar(id: string) {
  return CARS.find((c) => c.id === id) ?? null
}

export function getCarByTrackingRef(ref: string) {
  const cleaned = ref.trim().toUpperCase()
  return CARS.find((c) => c.trackingRef?.toUpperCase() === cleaned) ?? null
}

const LISTING_EXTRA: Record<
  string,
  Partial<Pick<Car, "location" | "seller" | "sellerType" | "rating" | "reviewCount" | "priceRating">>
> = {
  "bmw-3-series-320i": {
    location: "Birmingham",
    seller: "EMZ Birmingham",
    sellerType: "Dealer",
    rating: 4.8,
    reviewCount: 122,
    priceRating: "Great price",
  },
  "mercedes-c200": {
    location: "Manchester",
    seller: "Parkway Cars",
    sellerType: "Dealer",
    rating: 4.7,
    reviewCount: 88,
    priceRating: "Good price",
  },
  "toyota-rav4-hybrid": {
    location: "Leeds",
    seller: "EMZ Leeds",
    sellerType: "Dealer",
    rating: 4.6,
    reviewCount: 64,
    priceRating: "Great price",
  },
  "vw-golf-gti": {
    location: "Southampton",
    seller: "Harbour Autos",
    sellerType: "Dealer",
    rating: 4.5,
    reviewCount: 41,
    priceRating: "Fair price",
  },
  "audi-a4-avant": {
    location: "Glasgow",
    seller: "Private seller",
    sellerType: "Private",
    rating: 4.4,
    reviewCount: 12,
  },
  "honda-civic": {
    location: "Birmingham",
    seller: "Midlands MOT & Tyres",
    sellerType: "Dealer",
    rating: 4.3,
    reviewCount: 29,
    priceRating: "Good price",
  },
  "ford-fiesta": {
    location: "Manchester",
    seller: "Private seller",
    sellerType: "Private",
    rating: 4.2,
    reviewCount: 8,
    priceRating: "Great price",
  },
  "range-rover-sport-import": {
    location: "In transit · Southampton",
    seller: "EMZ Imports",
    sellerType: "Dealer",
    rating: 4.7,
    reviewCount: 53,
  },
  "lexus-rx-japan": {
    location: "CFR · Japan → Lagos",
    seller: "EMZ Imports",
    sellerType: "Dealer",
    rating: 4.8,
    reviewCount: 37,
    priceRating: "Great price",
  },
  "toyota-camry-us": {
    location: "CFR · Houston → Lagos",
    seller: "EMZ Imports",
    sellerType: "Dealer",
    rating: 4.6,
    reviewCount: 22,
    priceRating: "Good price",
  },
  "mercedes-gle-germany": {
    location: "At port · Tin Can",
    seller: "EMZ Imports",
    sellerType: "Dealer",
    rating: 4.9,
    reviewCount: 18,
  },
  "honda-accord-japan": {
    location: "Arriving · Onne",
    seller: "EMZ Imports",
    sellerType: "Dealer",
    rating: 4.5,
    reviewCount: 15,
    priceRating: "Great price",
  },
  "kia-sportage": {
    location: "London",
    seller: "North End Motors",
    sellerType: "Dealer",
    rating: 4.8,
    reviewCount: 71,
    priceRating: "Fair price",
  },
  "tesla-model-3": {
    location: "Houston",
    seller: "Gulf Coast EV",
    sellerType: "Dealer",
    rating: 4.9,
    reviewCount: 94,
    priceRating: "Good price",
  },
  "ford-f150-houston": {
    location: "Houston",
    seller: "Gulf Coast Trucks",
    sellerType: "Dealer",
    rating: 4.7,
    reviewCount: 61,
    priceRating: "Fair price",
  },
  "honda-crv-atlanta": {
    location: "Atlanta",
    seller: "Peachtree Autos",
    sellerType: "Dealer",
    rating: 4.6,
    reviewCount: 40,
    priceRating: "Good price",
  },
  "toyota-camry-lagos": {
    location: "Lekki, Lagos",
    seller: "Private seller",
    sellerType: "Private",
    rating: 4.4,
    reviewCount: 19,
    priceRating: "Great price",
  },
  "lexus-es-abuja": {
    location: "Abuja",
    seller: "Capital Motors",
    sellerType: "Dealer",
    rating: 4.7,
    reviewCount: 28,
    priceRating: "Fair price",
  },
}

export function listingOf(car: Car) {
  const extra = LISTING_EXTRA[car.id]
  return {
    location: extra?.location ?? car.location ?? "Nationwide",
    seller: extra?.seller ?? car.seller ?? "EasyMoveZone Approved",
    sellerType: extra?.sellerType ?? car.sellerType ?? "Dealer",
    rating: extra?.rating ?? car.rating ?? 4.6,
    reviewCount: extra?.reviewCount ?? car.reviewCount ?? 48,
    priceRating: extra?.priceRating ?? car.priceRating,
  }
}

export function similarCars(car: Car, limit = 3) {
  return CARS.filter((c) => c.id !== car.id && (c.make === car.make || c.body === car.body)).slice(0, limit)
}

export function featuredCars() {
  return CARS.filter((c) => c.featured)
}

export function estimateMonthly(price: number, deposit = 2000, months = 48, apr = 0.099) {
  const principal = Math.max(0, price - deposit)
  const r = apr / 12
  if (months <= 0) return 0
  if (r === 0) return principal / months
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

export type CarFilters = {
  q?: string
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  maxMonthly?: number
  minYear?: number
  maxMileage?: number
  fuel?: string
  transmission?: string
  body?: string
  engine?: string
  colour?: string
  stockType?: StockType | "all"
  origin?: string
  market?: Market | "all"
}

export type SortKey = "recommended" | "newest" | "price_asc" | "price_desc" | "mileage_asc"

export function filterCars(filters: CarFilters, sort: SortKey = "recommended", inventory: Car[] = CARS) {
  const q = filters.q?.trim().toLowerCase() ?? ""
  const nativePrice = Boolean(filters.market && filters.market !== "all")
  let list = inventory.filter((c) => {
    if (q) {
      const hay = `${c.year} ${c.make} ${c.model} ${c.trim} ${c.colour} ${c.originCountry}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (filters.make && c.make !== filters.make) return false
    if (filters.model && !c.model.toLowerCase().includes(filters.model.toLowerCase())) return false
    if (filters.minPrice != null) {
      const price = nativePrice ? c.price : priceInGbp(c)
      if (price < filters.minPrice) return false
    }
    if (filters.maxPrice != null && Number.isFinite(filters.maxPrice)) {
      const price = nativePrice ? c.price : priceInGbp(c)
      if (price > filters.maxPrice) return false
    }
    if (filters.maxMonthly != null) {
      const monthly = nativePrice ? c.monthlyFrom : c.monthlyFrom * FX_TO_GBP[carCurrency(c)]
      if (monthly > filters.maxMonthly) return false
    }
    if (filters.minYear != null && c.year < filters.minYear) return false
    if (filters.maxMileage != null && c.mileage > filters.maxMileage) return false
    if (filters.fuel && c.fuel !== filters.fuel) return false
    if (filters.transmission && c.transmission !== filters.transmission) return false
    if (filters.body && c.body !== filters.body) return false
    if (filters.engine && !c.engine.toLowerCase().includes(filters.engine.toLowerCase())) return false
    if (filters.colour && c.colour !== filters.colour) return false
    if (filters.stockType && filters.stockType !== "all" && c.stockType !== filters.stockType) return false
    if (filters.market && filters.market !== "all" && c.market !== filters.market) return false
    if (filters.origin && c.originCountry !== filters.origin) return false
    return true
  })

  list = [...list].sort((a, b) => {
    if (sort === "newest") return b.year - a.year
    if (sort === "price_asc") return a.price - b.price
    if (sort === "price_desc") return b.price - a.price
    if (sort === "mileage_asc") return a.mileage - b.mileage
    const rank = (c: Car) => (c.featured ? 0 : 1) + (c.stockType === "uk_stock" ? 0 : 0.2)
    return rank(a) - rank(b)
  })

  return list
}
