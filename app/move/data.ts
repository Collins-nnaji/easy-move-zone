// EasyMoveZone — content data. Plausible, researched-feeling, but illustrative.
// Ported from the Claude Design handoff (relocation-app-design-brief).

export type Mode = "trip" | "nomad" | "move";

export interface SpectrumStop {
  key: string;
  label: string;
  mode: Mode;
  sub: string;
}

export const SPECTRUM: SpectrumStop[] = [
  { key: "2w", label: "2 weeks", mode: "trip", sub: "A quick work trip or recce" },
  { key: "1m", label: "1 month", mode: "trip", sub: "Testing the waters" },
  { key: "1-3m", label: "1–3 months", mode: "nomad", sub: "A proper nomad stint" },
  { key: "6m", label: "6 months", mode: "move", sub: "Settling in for a season" },
  { key: "perm", label: "Permanently", mode: "move", sub: "Making it home" },
];

export const MODE_LABEL: Record<Mode, { name: string; blurb: string }> = {
  trip: { name: "Trip Pack", blurb: "A clean brief to land confidently." },
  nomad: { name: "Nomad Mode", blurb: "Settle in for a season, sorted." },
  move: { name: "Move Plan", blurb: "A phased plan to make it home." },
};

export interface Question {
  id: string;
  q: string;
  hint: string;
  options: string[];
}

export const QUESTIONS: Question[] = [
  {
    id: "priority",
    q: "What matters most right now?",
    hint: "Pick the one thing that would make or break it.",
    options: ["Low cost", "Great weather", "Career & networks", "Community", "Pure adventure"],
  },
  {
    id: "region",
    q: "Where in the world pulls you?",
    hint: "A gut feeling is fine.",
    options: ["Europe", "Latin America", "Asia-Pacific", "Anywhere warm", "Surprise me"],
  },
  {
    id: "work",
    q: "How will you spend your days?",
    hint: "This shapes the visa route we suggest.",
    options: ["Remote, my own hours", "On a work assignment", "Studying", "Taking a break"],
  },
  {
    id: "budget",
    q: "What's the monthly budget?",
    hint: "Rough is fine — rent, food, getting around.",
    options: ["Lean · under $1.5k", "Comfortable · $1.5–3k", "Generous · $3k+"],
  },
  {
    id: "who",
    q: "Who's coming with you?",
    hint: "We tailor the practical bits around this.",
    options: ["Just me", "Me & my partner", "With family", "With pets"],
  },
];

export interface VisaInfo {
  headline: string;
  body: string;
  tag: string;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  region: string;
  photo: string;
  match: Record<Mode, number>;
  honest: Record<Mode, string>;
  stats: Record<Mode, [string, string][]>;
  visa: Record<Mode, VisaInfo>;
}

export const DESTINATIONS: Destination[] = [
  {
    id: "lisbon",
    city: "Lisbon",
    country: "Portugal",
    region: "Europe",
    photo: "Lisbon · Alfama rooftops at golden hour",
    match: { trip: 91, nomad: 95, move: 88 },
    honest: {
      trip: "Easy to land in and walkable, but the hills and old trams mean slow crosstown trips. August is hot and tourist-packed.",
      nomad: "A genuine nomad hub with great cafés and a big community — which means rents have climbed fast and the best flats go in days.",
      move: "Sunny, safe and welcoming, with a clear residency path. Bureaucracy is slow and finding long-term housing takes patience.",
    },
    stats: {
      trip: [["Business hotels", "From €120/nt"], ["Median wifi", "92 Mbps"], ["Airport → centre", "20 min metro"]],
      nomad: [["Furnished 1-bed", "€1,100–1,600/mo"], ["Coworking spaces", "40+"], ["Nomad visa", "D8 eligible"]],
      move: [["Cost · couple", "€2,300/mo"], ["Healthcare", "Public + strong private"], ["Intl schools", "12 in metro"]],
    },
    visa: {
      trip: { headline: "Visa-free up to 90 days", body: "Most US, UK, EU, CA & AU passports enter Schengen visa-free for 90 days in any 180-day window.", tag: "Schengen · 90/180" },
      nomad: { headline: "Digital Nomad Visa (D8)", body: "For stays over 90 days. Show remote income of roughly €3,280/mo. Renewable, and counts toward residency.", tag: "D8 · 12 months" },
      move: { headline: "Residence permit (D7 / D8)", body: "Apply from a long-stay visa, then a residence permit. Permanent residency possible after 5 years.", tag: "Path to PR · 5 yrs" },
    },
  },
  {
    id: "mexicocity",
    city: "Mexico City",
    country: "Mexico",
    region: "Latin America",
    photo: "Mexico City · leafy Roma Norte streets",
    match: { trip: 86, nomad: 93, move: 82 },
    honest: {
      trip: "Huge, vibrant and great value, but the scale means long taxi rides and altitude can leave you breathless for a day or two.",
      nomad: "Incredible food, culture and a fast-growing remote scene. Roma & Condesa are lovely but rents there now rival European cities.",
      move: "Warm people and a low cost of living, but you'll want functional Spanish and patience for paperwork to truly settle.",
    },
    stats: {
      trip: [["Business hotels", "From $95/nt"], ["Median wifi", "70 Mbps"], ["Airport → centre", "35 min"]],
      nomad: [["Furnished 1-bed", "$700–1,200/mo"], ["Coworking spaces", "60+"], ["Tourist entry", "Up to 180 days"]],
      move: [["Cost · couple", "$1,700/mo"], ["Healthcare", "Excellent private"], ["Intl schools", "20+ in CDMX"]],
    },
    visa: {
      trip: { headline: "Visa-free, up to 180 days", body: "Many nationalities enter as a tourist for a stay set on arrival — commonly up to 180 days.", tag: "Tourist · up to 180d" },
      nomad: { headline: "Tourist entry covers it", body: "No dedicated nomad visa, but the generous tourist entry comfortably covers a 1–3 month stint.", tag: "No special visa" },
      move: { headline: "Temporary Resident Visa", body: "Apply at a consulate with proof of income or savings. Valid 1–4 years and leads to permanent residency.", tag: "Path to PR · 4 yrs" },
    },
  },
  {
    id: "bangkok",
    city: "Bangkok",
    country: "Thailand",
    region: "Asia-Pacific",
    photo: "Bangkok · Chao Phraya river at dusk",
    match: { trip: 84, nomad: 90, move: 79 },
    honest: {
      trip: "Cheap, fast and endlessly convenient — but heat, humidity and traffic are real. Get a hotel near a BTS Skytrain stop.",
      nomad: "Unbeatable value with modern condos and cafés everywhere. Air quality dips in the burning season (Feb–Apr).",
      move: "Comfortable and affordable for years, though long-term visas need planning and property ownership rules are strict.",
    },
    stats: {
      trip: [["Business hotels", "From $55/nt"], ["Median wifi", "120 Mbps"], ["Airport → centre", "30 min rail"]],
      nomad: [["Furnished condo", "$450–900/mo"], ["Coworking spaces", "50+"], ["Nomad visa", "DTV eligible"]],
      move: [["Cost · couple", "$1,500/mo"], ["Healthcare", "World-class private"], ["Intl schools", "30+ in city"]],
    },
    visa: {
      trip: { headline: "Visa-exemption on arrival", body: "Many passports get a 30–60 day visa-exempt stay on entry, extendable once at an immigration office.", tag: "Exempt · 30–60d" },
      nomad: { headline: "Destination Thailand Visa", body: "The DTV allows 180 days per entry over a 5-year multi-entry validity — built for remote workers.", tag: "DTV · 5-yr multi" },
      move: { headline: "Long-Term Resident visa", body: "The LTR visa offers up to 10 years for qualifying professionals, retirees and high earners.", tag: "LTR · up to 10 yrs" },
    },
  },
  {
    id: "tbilisi",
    city: "Tbilisi",
    country: "Georgia",
    region: "Europe",
    photo: "Tbilisi · Old Town & sulphur baths",
    match: { trip: 78, nomad: 88, move: 80 },
    honest: {
      trip: "Astonishing value and famously easy entry, but it's smaller and quieter than the big hubs — charming, not buzzing.",
      nomad: "One of the simplest places in the world to base yourself, with cheap flats and fast wifi. English is less common day-to-day.",
      move: "Very low cost of living and light bureaucracy, though it's further from family back home and winters are grey.",
    },
    stats: {
      trip: [["Boutique hotels", "From $45/nt"], ["Median wifi", "65 Mbps"], ["Airport → centre", "25 min"]],
      nomad: [["Furnished 1-bed", "$500–850/mo"], ["Coworking spaces", "15+"], ["Nomad program", "Remotely from Georgia"]],
      move: [["Cost · couple", "$1,300/mo"], ["Healthcare", "Affordable private"], ["Intl schools", "6 in city"]],
    },
    visa: {
      trip: { headline: "Visa-free up to 1 year", body: "Around 95 nationalities can enter and stay visa-free for a full 365 days — one of the most generous policies anywhere.", tag: "Visa-free · 365d" },
      nomad: { headline: "Remotely from Georgia", body: "A simple program for remote workers and freelancers to stay long-term, on top of the 1-year visa-free entry.", tag: "Remote-work · 1 yr" },
      move: { headline: "Residence permits", body: "Work, study and investment residence permits are straightforward, with a path to permanent residency.", tag: "Path to PR" },
    },
  },
];

export interface Phase {
  title: string;
  when: string;
  items: string[];
}

export interface PlanInfo {
  kind: "checklist" | "phased";
  name: string;
  intro: string;
  phases: Phase[];
}

// Plan adapts to the Move Spectrum: a phased timeline for long-term moves,
// lighter checklists for nomad stints and short trips. Move Meter fills as you tick items.
export const PLAN: Record<Mode, PlanInfo> = {
  trip: {
    kind: "checklist",
    name: "Trip Pack",
    intro: "A lightweight brief to land confidently. Tick things off as you go.",
    phases: [
      {
        title: "Before you fly",
        when: "",
        items: [
          "Check entry requirements for your passport",
          "Book a hotel near a transit line",
          "Sort travel insurance",
          "Download offline maps & a translation app",
          "Tell your bank you're travelling",
        ],
      },
      {
        title: "Day one on the ground",
        when: "",
        items: [
          "Buy a local SIM at the airport",
          "Get a transit card or ride-hail app",
          "Find your coworking spot & test the wifi",
          "Save local emergency numbers",
          "Scope a café and supermarket nearby",
        ],
      },
    ],
  },
  nomad: {
    kind: "checklist",
    name: "Nomad Mode",
    intro: "Everything between a quick trip and a full move — sorted for a season.",
    phases: [
      {
        title: "Before you go",
        when: "",
        items: [
          "Confirm your visa-free duration or nomad visa",
          "Book your first two weeks of stay",
          "Shortlist furnished-flat & coliving platforms",
          "Sort longer-term travel insurance",
          "Join the local nomad community",
        ],
      },
      {
        title: "Your first week",
        when: "",
        items: [
          "View 2–3 furnished flats in person",
          "Buy a local SIM with a generous data plan",
          "Set up a coworking membership",
          "Check the tax implications of a longer stay",
          "Walk your neighbourhood & find your café",
        ],
      },
    ],
  },
  move: {
    kind: "phased",
    name: "Move Plan",
    intro: "A phased, manageable plan. Each phase unlocks as you finish the one before.",
    phases: [
      {
        title: "Lay the groundwork",
        when: "3+ months out",
        items: [
          "Confirm your visa or residency route",
          "Budget the full cost of the move",
          "Start the long-term housing search",
          "Get key documents apostilled & translated",
          "Tell your employer or clients",
        ],
      },
      {
        title: "Make it real",
        when: "1–2 months out",
        items: [
          "Book your flights",
          "Arrange shipping or storage",
          "Line up your first month's accommodation",
          "Sort international health insurance",
          "Start a local bank account application",
        ],
      },
      {
        title: "Final stretch",
        when: "Final weeks",
        items: [
          "Confirm your lease or housing",
          "Book your arrival & registration appointments",
          "Notify banks, subscriptions & post",
          "Set up utilities and a local SIM",
          "Pack your essentials box",
        ],
      },
      {
        title: "Land & settle in",
        when: "First month there",
        items: [
          "Attend your residence-permit appointment",
          "Register with the local authority",
          "Set up local healthcare",
          "Get a local phone number & bank card",
          "Find your people & community",
        ],
      },
    ],
  },
};

export interface SettleCard {
  tag: string;
  title: string;
  body: string;
}

export const SETTLE: Record<string, SettleCard[]> = {
  lisbon: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Príncipe Real for cafés, Alcântara for value, Estrela for families and green space." },
    { tag: "Getting around", title: "Metro, trams & a Navegante card", body: "A monthly Navegante pass is €40 and covers metro, bus and tram across the city." },
    { tag: "Connectivity", title: "SIM in 10 minutes", body: "Grab a MEO or Vodafone prepaid SIM at the airport — generous data, no contract." },
    { tag: "Community", title: "Lisbon Digital Nomads", body: "14k-member group with weekly meetups, a housing channel and a newcomer onboarding thread." },
  ],
  mexicocity: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Roma Norte & Condesa for walkability, Coyoacán for charm, Polanco for upscale calm." },
    { tag: "Getting around", title: "Metro, Metrobús & apps", body: "A rechargeable Movilidad Integrada card works across metro and Metrobús; ride-hail is cheap." },
    { tag: "Connectivity", title: "Telcel or AT&T SIM", body: "Cheap prepaid data everywhere; Telcel has the widest coverage outside the city too." },
    { tag: "Community", title: "CDMX Expats & Nomads", body: "Active community with neighbourhood guides, Spanish-exchange nights and a trusted-services list." },
  ],
  bangkok: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Thonglor & Ekkamai for nomads, Ari for a local feel, Sathorn for business proximity." },
    { tag: "Getting around", title: "Live near the BTS", body: "The Skytrain and MRT skip the traffic — a Rabbit card makes both seamless." },
    { tag: "Connectivity", title: "AIS or TrueMove SIM", body: "Tourist SIMs with huge data allowances are sold right at the airport arrivals hall." },
    { tag: "Community", title: "Bangkok Nomads & Expats", body: "One of Asia's biggest scenes — condo tips, visa-run advice and daily coworking meetups." },
  ],
  tbilisi: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Vera & Sololaki for cafés and walkability, Vake for green calm, Old Town for character." },
    { tag: "Getting around", title: "Metro, marshrutkas & Bolt", body: "The metro is cents per ride; Bolt rides across town rarely cost more than a few dollars." },
    { tag: "Connectivity", title: "Magti or Silknet SIM", body: "Cheap, fast data with easy top-ups — sorted within minutes of landing." },
    { tag: "Community", title: "Tbilisi Nomads", body: "Tight-knit and welcoming, with flat listings, language tips and weekend trip groups." },
  ],
};
