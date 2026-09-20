export type GarageService =
  | "MOT"
  | "Servicing"
  | "Tyres"
  | "Brakes"
  | "Diagnostics"
  | "Bodywork"
  | "Air con"
  | "EV"

export type GarageReview = {
  author: string
  rating: number
  date: string
  text: string
}

export type Garage = {
  id: string
  name: string
  area: string
  city: string
  postcode: string
  phone: string
  rating: number
  reviewCount: number
  services: GarageService[]
  open: string
  photo: string
  about: string
  reviews: GarageReview[]
  lat: number
  lng: number
}

const img = (id: string, q: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80&${q}`

export const GARAGES: Garage[] = [
  {
    id: "north-end-motors",
    name: "North End Motors",
    area: "Fulham",
    city: "London",
    postcode: "SW6",
    phone: "020 7946 0121",
    rating: 4.8,
    reviewCount: 214,
    services: ["MOT", "Servicing", "Tyres", "Brakes", "Diagnostics"],
    open: "Mon–Sat 8:00–18:00",
    photo: img("photo-1487754180451-c456f719a1fc", "garage"),
    lat: 51.4802,
    lng: -0.1955,
    about:
      "Independent garage that will fit EasyMoveZone tyres and pads, or source the part if you are buying a car from us. Same-day MOT slots most weekdays.",
    reviews: [
      { author: "Priya S.", rating: 5, date: "12 Sep 2026", text: "Booked tyres from the app, they had them on in 40 minutes. Honest about a worn drop-link too." },
      { author: "James T.", rating: 5, date: "2 Sep 2026", text: "MOT with no scare tactics. Price matched the quote on EasyMoveZone." },
      { author: "Helen M.", rating: 4, date: "18 Aug 2026", text: "Waited a bit at lunchtime but the work on the brakes was tidy." },
    ],
  },
  {
    id: "parkway-service",
    name: "Parkway Service Centre",
    area: "Didsbury",
    city: "Manchester",
    postcode: "M20",
    phone: "0161 496 0188",
    rating: 4.6,
    reviewCount: 167,
    services: ["MOT", "Servicing", "Air con", "Diagnostics", "EV"],
    open: "Mon–Fri 7:30–17:30",
    photo: img("photo-1492144534655-ae79c964c9d7", "workshop"),
    lat: 53.4174,
    lng: -2.2311,
    about: "Hybrid and EV-friendly workshop. Good if you have bought a RAV4, Sportage or Model 3 through EasyMoveZone.",
    reviews: [
      { author: "Chris A.", rating: 5, date: "8 Sep 2026", text: "Health check after I collected my import. Clear report, no upsell." },
      { author: "Niamh K.", rating: 4, date: "22 Aug 2026", text: "Air-con regas done while I waited. Coffee was terrible, work was not." },
    ],
  },
  {
    id: "harbour-autos",
    name: "Harbour Autos",
    area: "Portswood",
    city: "Southampton",
    postcode: "SO17",
    phone: "023 8055 4410",
    rating: 4.7,
    reviewCount: 98,
    services: ["Tyres", "Brakes", "Servicing", "MOT", "Bodywork"],
    open: "Mon–Sat 8:00–17:00",
    photo: img("photo-1486262715619-67b85e0b08d3", "pit"),
    lat: 50.9264,
    lng: -1.3952,
    about: "Close to the port — useful for UK stock collections and for a once-over when an import lands.",
    reviews: [
      { author: "Omar R.", rating: 5, date: "30 Aug 2026", text: "Fitted a set of Continentals I ordered on the site. Alignment included." },
      { author: "Lucy P.", rating: 5, date: "11 Aug 2026", text: "Small parking dent sorted before I collected the Golf." },
    ],
  },
  {
    id: "kings-cross-ev",
    name: "Kings Cross EV Lab",
    area: "King's Cross",
    city: "London",
    postcode: "N1C",
    phone: "020 7946 8802",
    rating: 4.9,
    reviewCount: 76,
    services: ["EV", "Diagnostics", "Tyres", "Servicing"],
    open: "Tue–Sat 9:00–19:00",
    photo: img("photo-1560958089-b8a1929cea89", "ev"),
    lat: 51.532,
    lng: -0.1257,
    about: "Tesla and hybrid specialists. Software updates, 12V batteries, and tyre pressure sensors without a main-dealer wait.",
    reviews: [
      { author: "Daniel F.", rating: 5, date: "4 Sep 2026", text: "12V battery on the Model 3 done in an hour. They knew the part from the listing." },
      { author: "Amelia W.", rating: 5, date: "19 Aug 2026", text: "Explained the tyre wear on the inside edges. Not just a fit-and-forget." },
    ],
  },
  {
    id: "midlands-mot",
    name: "Midlands MOT & Tyres",
    area: "Digbeth",
    city: "Birmingham",
    postcode: "B5",
    phone: "0121 496 0733",
    rating: 4.4,
    reviewCount: 251,
    services: ["MOT", "Tyres", "Brakes", "Servicing"],
    open: "Mon–Sat 7:00–18:00",
    photo: img("photo-1487754180451-c456f719a1fc", "bham"),
    lat: 52.4751,
    lng: -1.885,
    about: "High-volume MOT lane and budget tyre fitting. Good if you want a cheap first service after buying a car under £10k.",
    reviews: [
      { author: "Kelechi O.", rating: 4, date: "1 Sep 2026", text: "Walk-in MOT, advisory only. Tyres were cheaper than the supermarket." },
      { author: "Sarah L.", rating: 4, date: "15 Aug 2026", text: "Busy, but they text when the car is ready." },
    ],
  },
  {
    id: "clyde-body-shop",
    name: "Clyde Body Shop",
    area: "Partick",
    city: "Glasgow",
    postcode: "G11",
    phone: "0141 496 2290",
    rating: 4.5,
    reviewCount: 61,
    services: ["Bodywork", "Diagnostics", "Servicing"],
    open: "Mon–Fri 8:30–17:00",
    photo: img("photo-1492144534655-ae79c964c9d7", "body"),
    lat: 55.8704,
    lng: -4.3112,
    about: "Paint and panel for cars coming in from auction or import. They photograph the work so you can see it before collection.",
    reviews: [
      { author: "Fraser M.", rating: 5, date: "27 Aug 2026", text: "Bumper respray on the Civic. Colour match was bang on." },
      { author: "Aisha B.", rating: 4, date: "9 Aug 2026", text: "Took a week rather than three days, but the finish was worth it." },
    ],
  },
]

export const GARAGE_SERVICES: GarageService[] = [
  "MOT",
  "Servicing",
  "Tyres",
  "Brakes",
  "Diagnostics",
  "Bodywork",
  "Air con",
  "EV",
]

export function getGarage(id: string) {
  return GARAGES.find((g) => g.id === id) ?? null
}

export function filterGarages(opts: { q?: string; service?: string; city?: string }) {
  const q = opts.q?.trim().toLowerCase() ?? ""
  return GARAGES.filter((g) => {
    if (opts.service && !g.services.includes(opts.service as GarageService)) return false
    if (opts.city && g.city !== opts.city) return false
    if (!q) return true
    return `${g.name} ${g.area} ${g.city} ${g.services.join(" ")}`.toLowerCase().includes(q)
  })
}

export const GARAGE_CITIES = [...new Set(GARAGES.map((g) => g.city))].sort()
