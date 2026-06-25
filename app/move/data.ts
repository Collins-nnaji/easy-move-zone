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

// Tap-to-fill starting points for the mood search box — short, in-your-own-words
// phrases that cover the same ground as the structured questions below.
export const MOOD_CHIPS: string[] = [
  "Cheap and easy to land in",
  "Fast wifi, great coffee, big nomad scene",
  "Warm, slow, and easy to settle into",
  "Career growth and good networks",
  "Bring the family — schools & space",
  "Adventure first, figure out the rest later",
];

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
  /** Hero image URL (seeded in DB; used when user hasn't uploaded a photo). */
  imageUrl?: string;
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
    imageUrl: "https://images.unsplash.com/photo-1555881400-74d7aca32786?w=1200&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1518659526051-2ca369704b54?w=1200&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1563492065-454364424952?w=1200&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80",
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
  {
    id: "berlin",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    photo: "Berlin · Spree riverside & TV tower skyline",
    match: { trip: 85, nomad: 89, move: 84 },
    honest: {
      trip: "Endlessly walkable with world-class museums and nightlife, but grey winters and patchy English at counters can catch first-timers off guard.",
      nomad: "A huge, established freelancer scene with cheap-by-European-standards rent — though the famous bureaucracy (Anmeldung, Bürgeramt queues) tests everyone's patience.",
      move: "Affordable, green and tolerant, with strong tenant protections. Apartment hunting is genuinely competitive and German fluency unlocks far more.",
    },
    stats: {
      trip: [["Business hotels", "From €95/nt"], ["Median wifi", "105 Mbps"], ["Airport → centre", "30 min train"]],
      nomad: [["Furnished 1-bed", "€950–1,400/mo"], ["Coworking spaces", "70+"], ["Freelance visa", "Freiberufler eligible"]],
      move: [["Cost · couple", "€2,100/mo"], ["Healthcare", "Public + private (Gesetzlich/Privat)"], ["Intl schools", "18 in metro"]],
    },
    visa: {
      trip: { headline: "Visa-free up to 90 days", body: "Most US, UK, CA & AU passports enter Schengen visa-free for 90 days in any 180-day window.", tag: "Schengen · 90/180" },
      nomad: { headline: "Freelance visa (Freiberufler)", body: "Self-employed professionals can apply for a freelance residence permit with proof of clients and income.", tag: "Freelance · 1–2 yrs" },
      move: { headline: "Residence permit + Anmeldung", body: "Register your address (Anmeldung) within 14 days, then apply for a residence permit. PR possible after 5 years.", tag: "Path to PR · 5 yrs" },
    },
  },
  {
    id: "buenosaires",
    city: "Buenos Aires",
    country: "Argentina",
    region: "Latin America",
    photo: "Buenos Aires · Palermo Soho cafés and jacarandas",
    match: { trip: 80, nomad: 87, move: 77 },
    honest: {
      trip: "Gorgeous European-style architecture and unbeatable steak, but inflation means prices shift fast and ATMs often run dry.",
      nomad: "A buzzing café and coworking culture with some of the best value left in the Americas — though the peso's swings make budgeting a moving target.",
      move: "Warm, cultured and welcoming, with relatively easy residency, but the economy's volatility affects everyday banking and savings.",
    },
    stats: {
      trip: [["Business hotels", "From $60/nt"], ["Median wifi", "75 Mbps"], ["Airport → centre", "40 min"]],
      nomad: [["Furnished 1-bed", "$450–800/mo"], ["Coworking spaces", "35+"], ["Digital nomad visa", "Available"]],
      move: [["Cost · couple", "$1,100/mo"], ["Healthcare", "Good public + affordable private"], ["Intl schools", "15 in city"]],
    },
    visa: {
      trip: { headline: "Visa-free up to 90 days", body: "Most US, UK, EU, CA & AU passports enter visa-free for tourism for up to 90 days.", tag: "Visa-free · 90d" },
      nomad: { headline: "Digital Nomad Visa", body: "A renewable visa for remote workers earning foreign income, valid up to 180 days per stay.", tag: "Nomad visa · 180d" },
      move: { headline: "Rentista / residency visa", body: "Show steady passive or foreign income to qualify for temporary residency, renewable toward permanent status.", tag: "Path to PR · 2 yrs" },
    },
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    region: "Asia-Pacific",
    photo: "Tokyo · Shibuya crossing at night",
    match: { trip: 88, nomad: 84, move: 81 },
    honest: {
      trip: "Immaculately run and endlessly fascinating, but it's expensive by Asian standards and queues/etiquette norms take adjusting to.",
      nomad: "Fast, reliable everything and a small but growing remote-work scene — though English is limited and short-term flexible leases are scarce.",
      move: "Safe, efficient and high quality of life, but visa sponsorship usually needs a local employer and the language barrier is real for daily life.",
    },
    stats: {
      trip: [["Business hotels", "From $90/nt"], ["Median wifi", "110 Mbps"], ["Airport → centre", "45 min train"]],
      nomad: [["Furnished 1-bed", "$1,100–1,700/mo"], ["Coworking spaces", "45+"], ["Digital nomad visa", "6-month eligible"]],
      move: [["Cost · couple", "$2,600/mo"], ["Healthcare", "Universal + excellent"], ["Intl schools", "25+ in metro"]],
    },
    visa: {
      trip: { headline: "Visa-free up to 90 days", body: "Most US, UK, EU, CA & AU passports enter visa-free for short tourism or business stays.", tag: "Visa-free · 90d" },
      nomad: { headline: "Digital Nomad Visa", body: "A 6-month visa for remote workers with a minimum income threshold and private health insurance.", tag: "Nomad visa · 6 mo" },
      move: { headline: "Work or specialist visa", body: "Usually needs employer sponsorship (e.g. Engineer/Specialist or Highly Skilled Professional). PR possible after years of residence.", tag: "Sponsorship usual" },
    },
  },
  {
    id: "capetown",
    city: "Cape Town",
    country: "South Africa",
    region: "Africa",
    photo: "Cape Town · Table Mountain over the Atlantic seaboard",
    match: { trip: 82, nomad: 86, move: 78 },
    honest: {
      trip: "Spectacular scenery and great value, but loadshedding (power cuts) and safety awareness in certain areas need planning around.",
      nomad: "A well-established nomad base with stunning surrounds and fast fibre internet — backup power and area choice matter more than elsewhere.",
      move: "Affordable and beautiful, with a path to residency, though crime concerns and the rand's volatility are real considerations to weigh.",
    },
    stats: {
      trip: [["Business hotels", "From $65/nt"], ["Median wifi", "60 Mbps"], ["Airport → centre", "25 min"]],
      nomad: [["Furnished 1-bed", "$600–1,000/mo"], ["Coworking spaces", "25+"], ["Remote work visa", "Available"]],
      move: [["Cost · couple", "$1,400/mo"], ["Healthcare", "Strong private"], ["Intl schools", "10 in metro"]],
    },
    visa: {
      trip: { headline: "Visa-free up to 90 days", body: "Most US, UK, EU & CA passports enter visa-free for tourism for up to 90 days.", tag: "Visa-free · 90d" },
      nomad: { headline: "Remote Work Visa", body: "A dedicated visa for remote workers earning above a foreign-income threshold, valid up to 3 years.", tag: "Remote visa · 3 yrs" },
      move: { headline: "Critical skills / residency visa", body: "Skilled workers can apply via the critical skills list; financially independent applicants have a separate route to residency.", tag: "Path to PR" },
    },
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    photo: "Dubai · Marina skyline at dusk",
    match: { trip: 87, nomad: 85, move: 80 },
    honest: {
      trip: "Slick, safe and easy to navigate, but it's pricier than people expect and the summer heat is genuinely brutal.",
      nomad: "Tax-free income and a polished remote-work visa make this attractive — though it's an expensive base with a car-dependent layout.",
      move: "Modern infrastructure and zero income tax, but residency is employment/sponsorship-tied and the cultural and legal norms differ sharply from the West.",
    },
    stats: {
      trip: [["Business hotels", "From $110/nt"], ["Median wifi", "95 Mbps"], ["Airport → centre", "20 min metro"]],
      nomad: [["Furnished 1-bed", "$1,500–2,400/mo"], ["Coworking spaces", "30+"], ["Virtual work visa", "1-year eligible"]],
      move: [["Cost · couple", "$3,200/mo"], ["Healthcare", "Mandatory private insurance"], ["Intl schools", "40+ in emirate"]],
    },
    visa: {
      trip: { headline: "Visa on arrival, up to 90 days", body: "Most US, UK, EU, CA & AU passports get a free visa on arrival for tourism, often extendable.", tag: "Visa on arrival · 90d" },
      nomad: { headline: "Virtual Working Programme", body: "A 1-year remote-work visa for employees and freelancers earning above a minimum monthly income.", tag: "Remote visa · 1 yr" },
      move: { headline: "Employment or Golden Visa", body: "Most residency is employer-sponsored; high earners, investors and specialists can qualify for a long-term Golden Visa.", tag: "Sponsorship or Golden Visa" },
    },
  },
  {
    id: "toronto",
    city: "Toronto",
    country: "Canada",
    region: "North America",
    photo: "Toronto · CN Tower over the harbourfront",
    match: { trip: 83, nomad: 81, move: 86 },
    honest: {
      trip: "Clean, friendly and easy to get around, but accommodation is pricier than most US cities and winters are long and cold.",
      nomad: "Solid infrastructure and a real tech scene, but there's no dedicated nomad visa and the cost of living rivals major US cities.",
      move: "One of the easier Western countries to build a long-term path in, with strong public services — but housing costs and winters are a real adjustment.",
    },
    stats: {
      trip: [["Business hotels", "From $130/nt"], ["Median wifi", "100 Mbps"], ["Airport → centre", "25 min train"]],
      nomad: [["Furnished 1-bed", "$1,600–2,300/mo"], ["Coworking spaces", "50+"], ["Tourist entry", "Up to 6 months"]],
      move: [["Cost · couple", "$3,000/mo"], ["Healthcare", "Universal (provincial)"], ["Intl schools", "N/A — strong public system"]],
    },
    visa: {
      trip: { headline: "eTA or visa-free, up to 6 months", body: "Visa-exempt nationals get an eTA on arrival by air; entry is typically granted for up to 6 months.", tag: "eTA · 6 mo" },
      nomad: { headline: "Tourist entry covers it", body: "No dedicated nomad visa yet, but the standard 6-month tourist entry comfortably covers most nomad stints.", tag: "No special visa" },
      move: { headline: "Express Entry / PR pathways", body: "Skilled-worker immigration via Express Entry or provincial nominee programs leads directly to permanent residency.", tag: "Path to PR" },
    },
  },
  {
    id: "sydney",
    city: "Sydney",
    country: "Australia",
    region: "Oceania",
    photo: "Sydney · Opera House & harbour bridge",
    match: { trip: 84, nomad: 79, move: 83 },
    honest: {
      trip: "Stunning beaches and an easy-going pace, but flights in are long and it's one of the more expensive stops on this list.",
      nomad: "Great weather and lifestyle, but the cost of living is high and there's no nomad-specific visa — most rely on the working holiday route.",
      move: "High quality of life and a clear skilled-migration pathway, though it's a lengthy and competitive points-based process.",
    },
    stats: {
      trip: [["Business hotels", "From $140/nt"], ["Median wifi", "85 Mbps"], ["Airport → centre", "20 min train"]],
      nomad: [["Furnished 1-bed", "$1,700–2,400/mo"], ["Coworking spaces", "40+"], ["Working Holiday visa", "Ages 18–35"]],
      move: [["Cost · couple", "$3,400/mo"], ["Healthcare", "Universal (Medicare)"], ["Intl schools", "N/A — strong public/private mix"]],
    },
    visa: {
      trip: { headline: "eVisitor or ETA, up to 90 days", body: "Most EU passports get a free eVisitor visa; US, CA & others get an ETA — both typically valid for 90-day stays.", tag: "eVisitor/ETA · 90d" },
      nomad: { headline: "Working Holiday visa", body: "For eligible passports aged 18–35 (or 18–30), allowing up to 12 months of work and travel.", tag: "WHV · 12 mo" },
      move: { headline: "Skilled migration (points-tested)", body: "A points-based system assessing age, skills and English ability; successful applicants get permanent residency directly.", tag: "Points-tested PR" },
    },
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    region: "Asia-Pacific",
    photo: "Singapore · Marina Bay skyline at night",
    match: { trip: 86, nomad: 82, move: 79 },
    honest: {
      trip: "Spotless, safe and effortless to navigate, but it's genuinely one of the most expensive cities in the world to even pass through.",
      nomad: "World-class infrastructure and connectivity, but the cost of living is brutal and there's no real nomad visa — most stay on tourist entry.",
      move: "Excellent healthcare, safety and schools, but residency is tightly controlled and almost always requires employer sponsorship.",
    },
    stats: {
      trip: [["Business hotels", "From $150/nt"], ["Median wifi", "130 Mbps"], ["Airport → centre", "25 min train"]],
      nomad: [["Furnished 1-bed", "$2,200–3,200/mo"], ["Coworking spaces", "60+"], ["Tourist entry", "Up to 90 days"]],
      move: [["Cost · couple", "$4,200/mo"], ["Healthcare", "Excellent public + private"], ["Intl schools", "30+ in city-state"]],
    },
    visa: {
      trip: { headline: "Visa-free up to 90 days", body: "Most US, UK, EU, CA & AU passports enter visa-free for tourism for up to 90 days.", tag: "Visa-free · 90d" },
      nomad: { headline: "Tourist entry covers it", body: "No dedicated nomad visa; most remote workers base here on the standard 90-day visa-free entry.", tag: "No special visa" },
      move: { headline: "Employment Pass", body: "Skilled professionals need employer sponsorship for an Employment Pass; PR is discretionary and highly selective.", tag: "Sponsorship usual" },
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

// ── Booking inventory ────────────────────────────────────────────────────
// Illustrative options surfaced in the in-app booking flows. Prices are sample
// figures for a prototype, not live availability.

export interface TripOption {
  id: string;
  provider: string;
  route: string;
  duration: string;
  price: string;
}

export interface StayOption {
  id: string;
  name: string;
  area: string;
  price: string;
  rating: string;
  forModes: Mode[];
}

export interface VisaService {
  id: string;
  title: string;
  detail: string;
  price: string;
}

// Trips keyed by destination id — the way to actually get there.
export const TRIPS: Record<string, TripOption[]> = {
  lisbon: [
    { id: "lis-tap", provider: "TAP Air Portugal", route: "Direct flight", duration: "non-stop", price: "From £138" },
    { id: "lis-ba", provider: "British Airways", route: "Direct flight", duration: "non-stop", price: "From £164" },
    { id: "lis-rail", provider: "Rail + ferry", route: "Overland via Madrid", duration: "~22h", price: "From £190" },
  ],
  mexicocity: [
    { id: "mex-aero", provider: "Aeroméxico", route: "Direct flight", duration: "non-stop", price: "From £498" },
    { id: "mex-ba", provider: "British Airways", route: "Direct flight", duration: "non-stop", price: "From £540" },
    { id: "mex-1stop", provider: "Iberia", route: "1 stop via Madrid", duration: "~14h", price: "From £430" },
  ],
  bangkok: [
    { id: "bkk-thai", provider: "Thai Airways", route: "Direct flight", duration: "non-stop", price: "From £612" },
    { id: "bkk-emi", provider: "Emirates", route: "1 stop via Dubai", duration: "~15h", price: "From £548" },
    { id: "bkk-qat", provider: "Qatar Airways", route: "1 stop via Doha", duration: "~16h", price: "From £560" },
  ],
  tbilisi: [
    { id: "tbs-wiz", provider: "Wizz Air", route: "1 stop via Warsaw", duration: "~9h", price: "From £176" },
    { id: "tbs-tk", provider: "Turkish Airlines", route: "1 stop via Istanbul", duration: "~8h", price: "From £224" },
    { id: "tbs-pgs", provider: "Pegasus", route: "1 stop via Istanbul", duration: "~10h", price: "From £158" },
  ],
  berlin: [
    { id: "ber-ba", provider: "British Airways", route: "Direct flight", duration: "non-stop", price: "From £85" },
    { id: "ber-eaze", provider: "easyJet", route: "Direct flight", duration: "non-stop", price: "From £62" },
    { id: "ber-rail", provider: "Eurostar + rail", route: "Overland via Brussels", duration: "~10h", price: "From £140" },
  ],
  buenosaires: [
    { id: "bue-ba", provider: "British Airways", route: "1 stop via São Paulo", duration: "~16h", price: "From £680" },
    { id: "bue-iberia", provider: "Iberia", route: "1 stop via Madrid", duration: "~18h", price: "From £610" },
    { id: "bue-latam", provider: "LATAM", route: "1 stop via São Paulo", duration: "~17h", price: "From £650" },
  ],
  tokyo: [
    { id: "tyo-ana", provider: "ANA", route: "Direct flight", duration: "non-stop", price: "From £720" },
    { id: "tyo-jal", provider: "JAL", route: "Direct flight", duration: "non-stop", price: "From £745" },
    { id: "tyo-emi", provider: "Emirates", route: "1 stop via Dubai", duration: "~17h", price: "From £640" },
  ],
  capetown: [
    { id: "cpt-ba", provider: "British Airways", route: "Direct flight", duration: "non-stop", price: "From £580" },
    { id: "cpt-virgin", provider: "Virgin Atlantic", route: "Direct flight", duration: "non-stop", price: "From £610" },
    { id: "cpt-emi", provider: "Emirates", route: "1 stop via Dubai", duration: "~16h", price: "From £520" },
  ],
  dubai: [
    { id: "dxb-emi", provider: "Emirates", route: "Direct flight", duration: "non-stop", price: "From £380" },
    { id: "dxb-ba", provider: "British Airways", route: "Direct flight", duration: "non-stop", price: "From £410" },
    { id: "dxb-fly", provider: "flydubai", route: "Direct flight", duration: "non-stop", price: "From £350" },
  ],
  toronto: [
    { id: "yyz-ac", provider: "Air Canada", route: "Direct flight", duration: "non-stop", price: "From £420" },
    { id: "yyz-ba", provider: "British Airways", route: "Direct flight", duration: "non-stop", price: "From £450" },
    { id: "yyz-ws", provider: "WestJet", route: "Direct flight", duration: "non-stop", price: "From £395" },
  ],
  sydney: [
    { id: "syd-qantas", provider: "Qantas", route: "1 stop via Singapore", duration: "~22h", price: "From £780" },
    { id: "syd-emi", provider: "Emirates", route: "1 stop via Dubai", duration: "~21h", price: "From £720" },
    { id: "syd-sing", provider: "Singapore Airlines", route: "1 stop via Singapore", duration: "~22h", price: "From £750" },
  ],
  singapore: [
    { id: "sin-sing", provider: "Singapore Airlines", route: "Direct flight", duration: "non-stop", price: "From £620" },
    { id: "sin-ba", provider: "British Airways", route: "Direct flight", duration: "non-stop", price: "From £650" },
    { id: "sin-qatar", provider: "Qatar Airways", route: "1 stop via Doha", duration: "~15h", price: "From £540" },
  ],
};

// Stays keyed by destination id; filtered by the active mode (hotels for a
// trip, furnished flats / coliving for nomad & move).
export const STAYS: Record<string, StayOption[]> = {
  lisbon: [
    { id: "lis-h1", name: "Baixa Boutique Hotel", area: "Baixa · central", price: "£128 / night", rating: "9.1", forModes: ["trip"] },
    { id: "lis-h2", name: "Alfama River Suites", area: "Alfama", price: "£146 / night", rating: "9.3", forModes: ["trip"] },
    { id: "lis-f1", name: "Príncipe Real 1-bed", area: "Príncipe Real", price: "£1,350 / month", rating: "9.0", forModes: ["nomad", "move"] },
    { id: "lis-f2", name: "Selina Secret Garden coliving", area: "Cais do Sodré", price: "£890 / month", rating: "8.7", forModes: ["nomad"] },
  ],
  mexicocity: [
    { id: "mex-h1", name: "Hotel Carlota", area: "Cuauhtémoc", price: "£118 / night", rating: "9.0", forModes: ["trip"] },
    { id: "mex-f1", name: "Roma Norte studio", area: "Roma Norte", price: "£820 / month", rating: "8.9", forModes: ["nomad", "move"] },
    { id: "mex-f2", name: "Condesa garden flat", area: "Condesa", price: "£1,040 / month", rating: "9.1", forModes: ["nomad", "move"] },
  ],
  bangkok: [
    { id: "bkk-h1", name: "Ariyasom Villa", area: "Sukhumvit", price: "£72 / night", rating: "9.2", forModes: ["trip"] },
    { id: "bkk-f1", name: "Thonglor serviced condo", area: "Thonglor", price: "£560 / month", rating: "8.8", forModes: ["nomad", "move"] },
    { id: "bkk-f2", name: "Ari coliving loft", area: "Ari", price: "£480 / month", rating: "8.6", forModes: ["nomad"] },
  ],
  tbilisi: [
    { id: "tbs-h1", name: "Stamba Hotel", area: "Vera", price: "£96 / night", rating: "9.3", forModes: ["trip"] },
    { id: "tbs-f1", name: "Sololaki 1-bed", area: "Sololaki", price: "£620 / month", rating: "8.7", forModes: ["nomad", "move"] },
    { id: "tbs-f2", name: "Vake coliving", area: "Vake", price: "£540 / month", rating: "8.5", forModes: ["nomad"] },
  ],
  berlin: [
    { id: "ber-h1", name: "Mitte City Hotel", area: "Mitte · central", price: "£105 / night", rating: "8.9", forModes: ["trip"] },
    { id: "ber-h2", name: "Kreuzberg Boutique Inn", area: "Kreuzberg", price: "£92 / night", rating: "8.7", forModes: ["trip"] },
    { id: "ber-f1", name: "Prenzlauer Berg 1-bed", area: "Prenzlauer Berg", price: "£1,150 / month", rating: "9.0", forModes: ["nomad", "move"] },
    { id: "ber-f2", name: "Neukölln coliving loft", area: "Neukölln", price: "£780 / month", rating: "8.6", forModes: ["nomad"] },
  ],
  buenosaires: [
    { id: "bue-h1", name: "Palermo Soho Hotel", area: "Palermo Soho", price: "£68 / night", rating: "9.0", forModes: ["trip"] },
    { id: "bue-f1", name: "Recoleta 1-bed", area: "Recoleta", price: "£520 / month", rating: "8.8", forModes: ["nomad", "move"] },
    { id: "bue-f2", name: "Palermo coliving flat", area: "Palermo Hollywood", price: "£460 / month", rating: "8.6", forModes: ["nomad"] },
  ],
  tokyo: [
    { id: "tyo-h1", name: "Shinjuku Business Hotel", area: "Shinjuku", price: "£98 / night", rating: "8.9", forModes: ["trip"] },
    { id: "tyo-h2", name: "Asakusa Ryokan Suites", area: "Asakusa", price: "£112 / night", rating: "9.1", forModes: ["trip"] },
    { id: "tyo-f1", name: "Shibuya 1-bed apartment", area: "Shibuya", price: "£1,450 / month", rating: "8.8", forModes: ["nomad", "move"] },
    { id: "tyo-f2", name: "Nakameguro share house", area: "Nakameguro", price: "£950 / month", rating: "8.5", forModes: ["nomad"] },
  ],
  capetown: [
    { id: "cpt-h1", name: "Camps Bay Boutique Hotel", area: "Camps Bay", price: "£82 / night", rating: "9.2", forModes: ["trip"] },
    { id: "cpt-f1", name: "Sea Point 1-bed", area: "Sea Point", price: "£640 / month", rating: "8.9", forModes: ["nomad", "move"] },
    { id: "cpt-f2", name: "Woodstock coliving loft", area: "Woodstock", price: "£520 / month", rating: "8.6", forModes: ["nomad"] },
  ],
  dubai: [
    { id: "dxb-h1", name: "Downtown Dubai Hotel", area: "Downtown", price: "£135 / night", rating: "9.0", forModes: ["trip"] },
    { id: "dxb-f1", name: "Marina 1-bed", area: "Dubai Marina", price: "£1,700 / month", rating: "8.8", forModes: ["nomad", "move"] },
    { id: "dxb-f2", name: "JLT coliving suite", area: "JLT", price: "£1,250 / month", rating: "8.5", forModes: ["nomad"] },
  ],
  toronto: [
    { id: "yyz-h1", name: "Downtown Toronto Hotel", area: "Downtown", price: "£140 / night", rating: "8.8", forModes: ["trip"] },
    { id: "yyz-f1", name: "King West 1-bed", area: "King West", price: "£1,800 / month", rating: "8.7", forModes: ["nomad", "move"] },
    { id: "yyz-f2", name: "Annex shared house", area: "The Annex", price: "£1,200 / month", rating: "8.4", forModes: ["nomad"] },
  ],
  sydney: [
    { id: "syd-h1", name: "Bondi Beach Hotel", area: "Bondi", price: "£150 / night", rating: "9.0", forModes: ["trip"] },
    { id: "syd-f1", name: "Surry Hills 1-bed", area: "Surry Hills", price: "£1,950 / month", rating: "8.8", forModes: ["nomad", "move"] },
    { id: "syd-f2", name: "Newtown coliving flat", area: "Newtown", price: "£1,350 / month", rating: "8.5", forModes: ["nomad"] },
  ],
  singapore: [
    { id: "sin-h1", name: "Orchard Road Hotel", area: "Orchard", price: "£160 / night", rating: "9.0", forModes: ["trip"] },
    { id: "sin-f1", name: "Tiong Bahru 1-bed", area: "Tiong Bahru", price: "£2,400 / month", rating: "8.9", forModes: ["nomad", "move"] },
    { id: "sin-f2", name: "Kampong Glam coliving", area: "Kampong Glam", price: "£1,800 / month", rating: "8.6", forModes: ["nomad"] },
  ],
};

// Visa assistance tiers, keyed by mode (the visa route depends on stay length).
export const VISA_SERVICES: Record<Mode, VisaService[]> = {
  trip: [
    { id: "trip-checklist", title: "Self-serve entry checklist", detail: "Tailored entry requirements & document list for your passport.", price: "Free" },
    { id: "trip-review", title: "Document review", detail: "An advisor checks your passport validity, onward tickets and proof of funds.", price: "£39" },
  ],
  nomad: [
    { id: "nomad-checklist", title: "Nomad visa eligibility check", detail: "Confirm which long-stay or nomad route you qualify for.", price: "Free" },
    { id: "nomad-review", title: "Application review", detail: "We review your income proof, insurance and forms before you submit.", price: "£89" },
    { id: "nomad-full", title: "Guided application", detail: "End-to-end help preparing and lodging your nomad-visa application.", price: "£249" },
  ],
  move: [
    { id: "move-checklist", title: "Residency route planner", detail: "Map the visa-to-residency pathway and the documents each step needs.", price: "Free" },
    { id: "move-review", title: "Full document review", detail: "Apostilles, translations and forms checked by a relocation specialist.", price: "£149" },
    { id: "move-full", title: "Full handling", detail: "We prepare, translate and lodge your residence application on your behalf.", price: "£399" },
  ],
};

export interface SettleCard {
  tag: string;
  title: string;
  body: string;
}

/** Fallback when DB guides are unseeded — source of truth is relocation_country_guides. */
export const SETTLE: Record<string, SettleCard[]> = {
  lisbon: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Príncipe Real for cafés, Alcântara for value, Estrela for families and green space." },
    { tag: "Getting around", title: "Metro, trams & a Navegante card", body: "A monthly Navegante pass is €40 and covers metro, bus and tram across the city." },
    { tag: "Connectivity", title: "SIM in 10 minutes", body: "Grab a MEO or Vodafone prepaid SIM at the airport — generous data, no contract." },
    { tag: "Community", title: "Lisbon Digital Nomads", body: "14k-member group with weekly meetups, a housing channel and a newcomer onboarding thread." },
    { tag: "Families & minors", title: "Free public schooling once registered", body: "EU rules make enrolling kids in public school straightforward; non-EU dependents are added directly to your D7/D8 residency application." },
    { tag: "Students (18–25)", title: "Student residence permit", body: "Enrol at a Portuguese university or language school, then apply for a renewable student residence permit each academic year." },
    { tag: "Working age (26–54)", title: "D8 income threshold", body: "The freelance/remote route (D8) needs proof of roughly €3,280/month in foreign income — budget for slow notary and AIMA appointment queues." },
    { tag: "Retirees (55+)", title: "D7 passive-income visa", body: "Built for pensions and passive income rather than salaries — show steady foreign income and a place to live, then renew yearly toward permanent residency." },
  ],
  mexicocity: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Roma Norte & Condesa for walkability, Coyoacán for charm, Polanco for upscale calm." },
    { tag: "Getting around", title: "Metro, Metrobús & apps", body: "A rechargeable Movilidad Integrada card works across metro and Metrobús; ride-hail is cheap." },
    { tag: "Connectivity", title: "Telcel or AT&T SIM", body: "Cheap prepaid data everywhere; Telcel has the widest coverage outside the city too." },
    { tag: "Community", title: "CDMX Expats & Nomads", body: "Active community with neighbourhood guides, Spanish-exchange nights and a trusted-services list." },
    { tag: "Families & minors", title: "Schools and paperwork", body: "Bilingual private schools are common in Roma, Condesa and Polanco; public enrolment needs a CURP, which dependents get once your residency is filed." },
    { tag: "Students (18–25)", title: "Student visa via enrolment", body: "A consulate-issued student visa needs an acceptance letter from an accredited institution, then converts to a local resident card on arrival." },
    { tag: "Working age (26–54)", title: "Temporary Resident Visa", body: "Apply at a Mexican consulate abroad with proof of income or savings — it generally can't be converted from a tourist stay inside the country." },
    { tag: "Retirees (55+)", title: "Comfortable on a fixed income", body: "A modest pension or savings balance comfortably clears the income threshold for temporary residency, renewing toward permanent status after 4 years." },
  ],
  bangkok: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Thonglor & Ekkamai for nomads, Ari for a local feel, Sathorn for business proximity." },
    { tag: "Getting around", title: "Live near the BTS", body: "The Skytrain and MRT skip the traffic — a Rabbit card makes both seamless." },
    { tag: "Connectivity", title: "AIS or TrueMove SIM", body: "Tourist SIMs with huge data allowances are sold right at the airport arrivals hall." },
    { tag: "Community", title: "Bangkok Nomads & Expats", body: "One of Asia's biggest scenes — condo tips, visa-run advice and daily coworking meetups." },
    { tag: "Families & minors", title: "International schools", body: "30+ international schools cover IB, British and American curricula; a Non-O extension for the family of a worker or retiree covers dependents." },
    { tag: "Students (18–25)", title: "Education visa", body: "An ED visa ties to enrolment at an accredited school or language institute and is renewable each term." },
    { tag: "Working age (26–54)", title: "DTV for remote workers", body: "The Destination Thailand Visa (DTV) is the easiest route if you freelance or work remotely — no employer sponsorship needed." },
    { tag: "Retirees (55+)", title: "Retirement visa", body: "Available from age 50, with a fixed deposit in a Thai bank or proof of monthly income — renewable annually, with private health insurance required." },
  ],
  tbilisi: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Vera & Sololaki for cafés and walkability, Vake for green calm, Old Town for character." },
    { tag: "Getting around", title: "Metro, marshrutkas & Bolt", body: "The metro is cents per ride; Bolt rides across town rarely cost more than a few dollars." },
    { tag: "Connectivity", title: "Magti or Silknet SIM", body: "Cheap, fast data with easy top-ups — sorted within minutes of landing." },
    { tag: "Community", title: "Tbilisi Nomads", body: "Tight-knit and welcoming, with flat listings, language tips and weekend trip groups." },
    { tag: "Families & minors", title: "Schools are limited but improving", body: "Only a handful of international schools in the city — shortlist and apply early if you're moving with kids." },
    { tag: "Students (18–25)", title: "Study at a local university", body: "Tuition is low by international standards, and a student residence permit is straightforward to arrange through your university." },
    { tag: "Working age (26–54)", title: "Remotely from Georgia", body: "The remote-work program needs only proof of foreign income and a clean record — one of the fastest approvals on this list." },
    { tag: "Retirees (55+)", title: "Light-touch residency", body: "No dedicated retirement visa, but a residence permit via property ownership or passive income is simple and affordable to maintain." },
  ],
  berlin: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Prenzlauer Berg for families, Kreuzberg & Neukölln for nightlife and value, Charlottenburg for calm." },
    { tag: "Getting around", title: "BVG monthly pass", body: "A monthly BVG ticket is €58 and covers U-Bahn, S-Bahn, trams and buses across the city." },
    { tag: "Connectivity", title: "Telekom or O2 SIM", body: "Prepaid SIMs are widely available at kiosks and electronics stores, no contract needed." },
    { tag: "Community", title: "Berlin Expats & Freelancers", body: "Regular meetups, Stammtisch nights and an active housing-tips channel for newcomers." },
    { tag: "Families & minors", title: "Kindergeld & free schooling", body: "Registered residents with kids can claim Kindergeld (child benefit), and state schools are free — though German-language support varies by district." },
    { tag: "Students (18–25)", title: "Student visa & blocked account", body: "Non-EU students need a university acceptance letter and a blocked account (roughly €11,900/year) to prove they can support themselves." },
    { tag: "Working age (26–54)", title: "Freiberufler route", body: "The freelance visa needs client letters and a German tax number (Steuer-ID) — budget weeks, not days, for Bürgeramt appointments." },
    { tag: "Retirees (55+)", title: "Health insurance is the gatekeeper", body: "Pension income alone doesn't grant residency outside EU family ties — most retirees here use a separate income- and insurance-based permit." },
  ],
  buenosaires: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Palermo for nomads and nightlife, Recoleta for elegance, Belgrano for families and green space." },
    { tag: "Getting around", title: "SUBE card", body: "One card covers subte, buses and trains — rides cost cents thanks to local subsidies." },
    { tag: "Connectivity", title: "Personal or Movistar SIM", body: "Cheap prepaid data plans available at any kiosko, no paperwork required." },
    { tag: "Community", title: "Buenos Aires Nomads & Expats", body: "Language exchanges, asado meetups and a trusted-services list for newcomers." },
    { tag: "Families & minors", title: "Bilingual schools cluster centrally", body: "Palermo, Recoleta and Belgrano have the strongest bilingual private school options; public schools are free but Spanish-only." },
    { tag: "Students (18–25)", title: "Student visa via enrolment", body: "A university or accredited course acceptance letter supports a renewable student residency category." },
    { tag: "Working age (26–54)", title: "Rentista or digital nomad route", body: "Show steady foreign income for the Rentista visa, or use the dedicated nomad visa if you're fully remote — both renew toward permanent residency." },
    { tag: "Retirees (55+)", title: "Pensionado residency", body: "A specific pensionado category exists for stable foreign pension income, with a comparatively fast approval process." },
  ],
  tokyo: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Shibuya & Shimokitazawa for energy, Kichijoji for families, Nakameguro for a quieter base." },
    { tag: "Getting around", title: "Suica or Pasmo IC card", body: "Tap onto every train, subway and bus across the metro — no tickets needed." },
    { tag: "Connectivity", title: "Pocket wifi or a Mobal SIM", body: "Easiest to order a rental pocket wifi or SIM online before you arrive." },
    { tag: "Community", title: "Tokyo Foreign Residents & Nomads", body: "Language-exchange meetups and an active visa-questions thread." },
    { tag: "Families & minors", title: "Long waitlists, plan early", body: "International schools are excellent but oversubscribed — apply 6–12 months ahead; dependents join on a Dependent visa tied to your status." },
    { tag: "Students (18–25)", title: "Student visa via a school", body: "Language schools and universities sponsor a Certificate of Eligibility, which converts into a student residence card on arrival." },
    { tag: "Working age (26–54)", title: "Employer sponsorship is the norm", body: "Most working-age movers need a Certificate of Eligibility from a Japanese employer — the digital nomad visa is a 6-month alternative for the self-employed." },
    { tag: "Retirees (55+)", title: "No dedicated retiree visa", body: "Japan has no long-stay retirement visa — most retirees here are on a spouse, dependent or long-term resident status instead." },
  ],
  capetown: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Sea Point & Green Point for nomads, Constantia for families, Woodstock for an arty, central base." },
    { tag: "Getting around", title: "MyCiTi & ride-hail apps", body: "MyCiTi bus rapid transit covers the city bowl; ride-hail apps are the norm beyond that." },
    { tag: "Connectivity", title: "Vodacom or MTN SIM", body: "Strong fibre backup keeps you online through loadshedding power cuts." },
    { tag: "Community", title: "Cape Town Digital Nomads", body: "Power-cut tips, area safety advice and a weekly co-working meetup." },
    { tag: "Families & minors", title: "Strong but mixed-quality schools", body: "Private schools are excellent and good value by international standards; safety and area choice matter more than in most cities on this list." },
    { tag: "Students (18–25)", title: "Study visa via a university", body: "A study visa needs an offer letter from an accredited institution plus proof of funds, renewed annually." },
    { tag: "Working age (26–54)", title: "Remote Work Visa or critical skills", body: "The dedicated Remote Work Visa suits foreign-income earners; the critical skills list is the route for local employment." },
    { tag: "Retirees (55+)", title: "Retired person visa", body: "A specific retired person visa exists for those with a guaranteed pension or passive income above a set threshold — no upper age limit." },
  ],
  dubai: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Dubai Marina & JLT for nomads, Jumeirah for families, Downtown for business proximity." },
    { tag: "Getting around", title: "Nol card", body: "One card covers the Metro, tram and buses — fast, clean and air-conditioned." },
    { tag: "Connectivity", title: "Etisalat or du SIM", body: "Available at the airport with generous data bundles from day one." },
    { tag: "Community", title: "Dubai Expats & Remote Workers", body: "Visa-run advice, networking events and an active housing channel." },
    { tag: "Families & minors", title: "Sponsor your dependents", body: "Once on a residence visa, you can sponsor a spouse and children — international school fees are a major budget line, with 40+ schools to choose from." },
    { tag: "Students (18–25)", title: "Student visa via a university", body: "UAE universities sponsor a student residence visa for enrolled students, renewable each academic year." },
    { tag: "Working age (26–54)", title: "Virtual Working Programme or employment visa", body: "Freelancers and remote employees use the Virtual Working Programme; most others need employer sponsorship for a standard employment visa." },
    { tag: "Retirees (55+)", title: "Retirement visa from age 55", body: "A 5-year retirement visa is available from age 55 with proof of savings, income or property ownership in the UAE." },
  ],
  toronto: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "King West & The Annex for nomads, North York for families, Leslieville for a quieter, leafy base." },
    { tag: "Getting around", title: "PRESTO card", body: "One card covers TTC subway, streetcars and buses across the city." },
    { tag: "Connectivity", title: "Freedom Mobile or Rogers SIM", body: "Prepaid SIMs are widely available at any mall kiosk." },
    { tag: "Community", title: "Toronto Newcomers & Nomads", body: "Settlement-service tips, networking meetups and a housing-search thread." },
    { tag: "Families & minors", title: "Strong public schools, no fees", body: "Public education is free and well-regarded; international schools are rare because the public system covers most needs." },
    { tag: "Students (18–25)", title: "Study permit via a school", body: "A study permit needs acceptance at a designated learning institution and proof of funds — many graduates transition to a post-graduation work permit." },
    { tag: "Working age (26–54)", title: "Express Entry favours this age band", body: "The points-based Express Entry system weights age heavily — applicants under 35 score highest, directly boosting PR chances." },
    { tag: "Retirees (55+)", title: "No dedicated retirement stream", body: "Canada has no specific retiree visa; most retirees arrive via family sponsorship or a 6-month visitor stay, renewed periodically." },
  ],
  sydney: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Surry Hills & Newtown for nomads, North Shore for families, Bondi for a beach-first lifestyle." },
    { tag: "Getting around", title: "Opal card", body: "One card covers trains, buses, ferries and light rail across greater Sydney." },
    { tag: "Connectivity", title: "Telstra or Optus SIM", body: "Strong coverage even outside the city centre, easy to top up." },
    { tag: "Community", title: "Sydney Backpackers & Nomads", body: "Working-holiday tips, share-house listings and weekend meetups." },
    { tag: "Families & minors", title: "Zoned public schools", body: "Public schools are zoned by home address and generally strong; private and selective schools have competitive entry exams." },
    { tag: "Students (18–25)", title: "Student visa via enrolment", body: "A student visa needs confirmed enrolment at a registered institution and proof of funds — many stay on for post-study work rights." },
    { tag: "Working age (26–54)", title: "Working Holiday or skilled migration", body: "Ages 18–35 (sometimes 30) can use the Working Holiday visa for up to 12 months; older or longer-term movers need the points-tested skilled migration route." },
    { tag: "Retirees (55+)", title: "Limited long-stay options", body: "Australia has no retirement-specific visa for most nationalities — long stays beyond a visitor visa generally need a family or partner sponsorship route." },
  ],
  singapore: [
    { tag: "Neighbourhoods", title: "Where to base yourself", body: "Tiong Bahru & Kampong Glam for nomads, Bukit Timah for families, Orchard for central convenience." },
    { tag: "Getting around", title: "EZ-Link card", body: "Taps onto the MRT, buses and most taxis — fast and air-conditioned throughout." },
    { tag: "Connectivity", title: "Singtel or StarHub SIM", body: "Sold at the airport with generous high-speed data from arrival." },
    { tag: "Community", title: "Singapore Expats & Nomads", body: "Visa-pass guidance, networking events and a condo-hunting channel." },
    { tag: "Families & minors", title: "Plan school applications early", body: "International schools are plentiful but have long waitlists and high fees — apply well before relocating with kids; dependents join on a Dependant's Pass." },
    { tag: "Students (18–25)", title: "Student Pass via enrolment", body: "A Student Pass needs acceptance at an approved institution, sponsored by the school once you've been issued an In-Principle Approval." },
    { tag: "Working age (26–54)", title: "Employment Pass is the standard route", body: "Most working-age professionals need an employer-sponsored Employment Pass, assessed against a points-based framework (COMPASS)." },
    { tag: "Retirees (55+)", title: "No retirement visa", body: "Singapore has no dedicated retirement visa — long-term stays for retirees are rare without a Dependant's Pass tied to a working family member." },
  ],
};
