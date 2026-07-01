import type {
  Destination,
  JobOption,
  Mode,
  PlanInfo,
  SchoolOption,
  StayOption,
  TripOption,
  VisaService,
} from "./data";

type Answers = Record<string, string>;

type Tone = "positive" | "warning" | "neutral";

export type TravelPersona =
  | "Explorer"
  | "Relaxer"
  | "Culture seeker"
  | "Food traveler"
  | "Nightlife traveler"
  | "Budget optimizer"
  | "Luxury traveler";

export interface CoreMetric {
  label: string;
  value: string;
  detail: string;
  tone?: Tone;
}

export interface CorePoint {
  title: string;
  detail: string;
  tone?: Tone;
}

export interface CoreAlert {
  level: "Calm" | "Heads up" | "Watch";
  title: string;
  detail: string;
}

export interface PersonaMatch {
  persona: TravelPersona;
  score: number;
  reason: string;
}

export interface ReadinessSection {
  title: string;
  items: string[];
}

export interface IntegrationAction {
  title: string;
  detail: string;
  countLabel: string;
  target: "trips" | "stays" | "visaBook" | "plan" | "school" | "job";
}

export interface TravelIntelligenceCore {
  decision: CoreMetric[];
  visa: CoreMetric[];
  compliance: CorePoint[];
  prep: string[];
  alternatives: string[];
}

export interface SituationalAwarenessCore {
  mapLayers: CorePoint[];
  reality: CoreMetric[];
  alerts: CoreAlert[];
  helpPoints: CorePoint[];
}

export interface TravelExecutionCore {
  personaMatches: PersonaMatch[];
  strategy: string[];
  readiness: ReadinessSection[];
  actions: IntegrationAction[];
}

type AwarenessSeed = {
  reality: Record<
    "safety" | "police" | "cost" | "scams" | "culture" | "night",
    string
  >;
  legalZones: string[];
  scamHotspots: string[];
  culturalZones: string[];
  embassyArea: string;
  alerts: CoreAlert[];
};

const REGION_COMPLIANCE: Record<
  string,
  { title: string; detail: string; tone?: Tone }[]
> = {
  Europe: [
    {
      title: "ID and registration rules",
      detail:
        "Short-stay visitors can usually move freely, but long-stay arrivals should expect address registration, proof-of-funds checks, and tighter residency paperwork.",
      tone: "neutral",
    },
    {
      title: "Medication and customs",
      detail:
        "Prescription medicines should stay in original packaging with a doctor's note. CBD, supplements, and large cash declarations are checked more closely than many travelers expect.",
      tone: "warning",
    },
    {
      title: "Photography and drones",
      detail:
        "Historic centres are easy for photography, but drones, government buildings, and transport hubs often have permit or no-fly restrictions.",
      tone: "warning",
    },
    {
      title: "Social norms",
      detail:
        "Dress codes are mostly relaxed, though churches, memorial sites, and official offices expect quieter dress and behaviour.",
      tone: "positive",
    },
  ],
  "Latin America": [
    {
      title: "Police and paperwork",
      detail:
        "Carry a passport copy, proof of stay, and onward details. Police stops are uncommon in tourist zones but document checks do happen around transport hubs.",
      tone: "neutral",
    },
    {
      title: "Cash and import controls",
      detail:
        "Cash-heavy districts attract more attention. High-value electronics, professional drones, and undeclared medicines can trigger customs questions.",
      tone: "warning",
    },
    {
      title: "Photography etiquette",
      detail:
        "Street life is photogenic, but markets, police activity, and some transport nodes are poor places to film or wave a camera around.",
      tone: "warning",
    },
    {
      title: "Nightlife and alcohol rules",
      detail:
        "Nightlife is central to many cities, but late-night transport, phone theft, and unofficial taxi offers are the real compliance risk to plan around.",
      tone: "positive",
    },
  ],
  "Asia-Pacific": [
    {
      title: "Public behaviour",
      detail:
        "Etiquette matters more here: queueing, quiet public transport, temple respect, and disposal rules are part of staying out of trouble.",
      tone: "neutral",
    },
    {
      title: "Medication and vaping",
      detail:
        "Medication rules can be strict and vaping products are banned or tightly controlled in several destinations. Check official import guidance before you fly.",
      tone: "warning",
    },
    {
      title: "Drone and filming rules",
      detail:
        "Drones, protest filming, and photography near official buildings are often regulated more tightly than in Europe or North America.",
      tone: "warning",
    },
    {
      title: "Dress and cultural sensitivity",
      detail:
        "Dress is generally flexible in commercial districts, but temples, shrines, and some family-oriented areas expect more modest clothing.",
      tone: "positive",
    },
  ],
  Africa: [
    {
      title: "Safety-aware movement",
      detail:
        "Legal trouble is less likely than opportunistic crime, so route-planning, ride-hail habits, and night movement rules matter as much as formal law.",
      tone: "neutral",
    },
    {
      title: "Driving and checkpoints",
      detail:
        "Driving documents, insurance, and sobriety enforcement can be stricter than visitors assume, especially outside central areas.",
      tone: "warning",
    },
    {
      title: "Photography restrictions",
      detail:
        "Ports, police, military sites, and infrastructure should be treated as no-photo areas unless clearly permitted.",
      tone: "warning",
    },
    {
      title: "Beach and nature rules",
      detail:
        "Outdoor culture is a major upside here, but wildfire, marine, or park restrictions shift quickly with season and municipality.",
      tone: "positive",
    },
  ],
  "Middle East": [
    {
      title: "Dress and conduct",
      detail:
        "Modern business zones can feel relaxed, but modest dress, respectful conduct, and sobriety rules matter far more than many first-timers expect.",
      tone: "warning",
    },
    {
      title: "Alcohol and medication",
      detail:
        "Alcohol is tightly controlled outside licensed venues and some medications that are routine elsewhere need paperwork or are restricted.",
      tone: "warning",
    },
    {
      title: "Photography and drones",
      detail:
        "Government buildings, airports, and residential privacy are treated seriously. Drone use usually needs prior approval.",
      tone: "warning",
    },
    {
      title: "Transport and service quality",
      detail:
        "Formal systems are polished and easy to follow, which lowers friction once you understand the rule set.",
      tone: "positive",
    },
  ],
  "North America": [
    {
      title: "Travel formalities",
      detail:
        "Entry can be smooth for visa-exempt nationals, but border questioning, digital-device scrutiny, and proof-of-purpose checks are real.",
      tone: "neutral",
    },
    {
      title: "Medication and cannabis",
      detail:
        "Cannabis laws vary by province or state context, while prescription medication import rules still apply nationally.",
      tone: "warning",
    },
    {
      title: "Photography and privacy",
      detail:
        "Photography is generally open, but private property, children, and police activity are sensitive areas where social norms matter.",
      tone: "neutral",
    },
    {
      title: "Public conduct",
      detail:
        "Rules are clear and enforced predictably, so travelers who plan documents and purpose well usually find the system straightforward.",
      tone: "positive",
    },
  ],
  Oceania: [
    {
      title: "Biosecurity",
      detail:
        "Customs is strict about food, outdoor gear, plant material, and animal products. Small declaration mistakes can become expensive quickly.",
      tone: "warning",
    },
    {
      title: "Work and holiday rules",
      detail:
        "Tourist, working-holiday, and skilled-migration routes are distinct. Working on the wrong status is one of the easiest mistakes to make.",
      tone: "warning",
    },
    {
      title: "Beach, fire, and nature zones",
      detail:
        "Beach safety flags, fire bans, and protected-land rules are taken seriously and change with weather conditions.",
      tone: "neutral",
    },
    {
      title: "Everyday etiquette",
      detail:
        "The social tone is relaxed and friendly, which makes settlement easier once the visa side is sorted.",
      tone: "positive",
    },
  ],
};

const CITY_AWARENESS: Record<string, AwarenessSeed> = {
  lisbon: {
    reality: {
      safety: "Generally calm",
      police: "Visible but low-drama",
      cost: "Medium-high and rising",
      scams: "Mostly tourist-pickpocketing",
      culture: "Warm, late, and social",
      night: "Comfortable in the core",
    },
    legalZones: [
      "Historic tram corridors around Baixa and Alfama punish fare evasion quickly.",
      "Beach municipalities can shift alcohol and fire rules by season.",
    ],
    scamHotspots: [
      "Tram 28 queues and crowded viewpoints.",
      "Airport transfers that avoid the meter or card machine.",
    ],
    culturalZones: [
      "Príncipe Real and Estrela feel polished and low-friction.",
      "Alfama gets quieter, steeper, and more local once the day crowd thins.",
    ],
    embassyArea: "Most consular help clusters around Lapa, Estrela, and Avenida da Liberdade.",
    alerts: [
      { level: "Heads up", title: "Heat and wildfire season", detail: "Summer travel needs extra planning for midday heat, train disruption, and regional fire alerts." },
      { level: "Calm", title: "Transit is reliable", detail: "Metro is usually the safest first-day option from airport to city core." },
    ],
  },
  mexicocity: {
    reality: {
      safety: "Block-by-block",
      police: "Present around big roads",
      cost: "Good value if you choose well",
      scams: "Phone and taxi scams common",
      culture: "Fast, social, and local",
      night: "Comfortable in the main zones",
    },
    legalZones: [
      "Airport and interchange zones are stricter for unofficial taxis and aggressive soliciting.",
      "Cash exchange and SIM purchases are safer in malls or formal shops than on the street.",
    ],
    scamHotspots: [
      "Airport taxi desks outside the official channel.",
      "Tourist nightlife around Roma, Condesa, and Centro after midnight.",
    ],
    culturalZones: [
      "Roma and Condesa feel easiest for first-timers.",
      "Centro is powerful and useful by day, but needs more situational awareness after dark.",
    ],
    embassyArea: "Embassies and high-trust services cluster around Polanco, Lomas, and Reforma.",
    alerts: [
      { level: "Heads up", title: "Rain and gridlock", detail: "Storms can turn 20-minute crossings into 60-minute rides during afternoon peak." },
      { level: "Watch", title: "Phone-snatch risk", detail: "Use ride-hail pickup points and keep phones away at curbside windows." },
    ],
  },
  bangkok: {
    reality: {
      safety: "Busy but manageable",
      police: "Light touch until rules break",
      cost: "Excellent value",
      scams: "Tourist and tuk-tuk scams",
      culture: "Polite, layered, practical",
      night: "Comfortable with ride-hail",
    },
    legalZones: [
      "Temple compounds and official sites have stricter dress and behaviour expectations.",
      "Cannabis rules keep shifting, so do not assume casual retail equals risk-free use.",
    ],
    scamHotspots: [
      "Grand Palace area tuk-tuk and gem detours.",
      "Late-night nightlife corridors without a clear ride home.",
    ],
    culturalZones: [
      "Ari and Thonglor feel easiest for longer stays.",
      "Old-city temple areas are slower, more formal, and less forgiving of sloppy dress.",
    ],
    embassyArea: "Embassies and international hospitals are easiest to reach from Sukhumvit, Sathorn, and Lumphini.",
    alerts: [
      { level: "Heads up", title: "Air quality season", detail: "Burning season can turn a great week into an indoor one if you do not check AQI." },
      { level: "Heads up", title: "Monsoon downpours", detail: "Short violent storms can flood streets and slow taxi times even when the city feels normal." },
    ],
  },
  tbilisi: {
    reality: {
      safety: "Low-key and comfortable",
      police: "Predictable and visible",
      cost: "Very strong value",
      scams: "Low-medium",
      culture: "Warm but less polished",
      night: "Fine in core districts",
    },
    legalZones: [
      "Driving behaviour is the bigger hazard than formal restrictions for most visitors.",
      "Mountain and regional trips need extra caution on road rules and weather changes.",
    ],
    scamHotspots: [
      "Airport taxi pricing if you skip apps.",
      "Short-let deposit disputes without written terms.",
    ],
    culturalZones: [
      "Vera, Vake, and Sololaki feel easiest for a first base.",
      "Old Town is charming but less practical for day-to-day logistics.",
    ],
    embassyArea: "Consular help is easiest to reach from Vake and central administrative corridors.",
    alerts: [
      { level: "Calm", title: "Low-friction entry", detail: "Entry rules are among the easiest in the product, which lowers first-week stress." },
      { level: "Heads up", title: "Winter street conditions", detail: "Cold snaps and icy hills change walkability fast outside the core." },
    ],
  },
  berlin: {
    reality: {
      safety: "High, with big-city caveats",
      police: "Formal and document-driven",
      cost: "Medium-high, housing constrained",
      scams: "Low-medium",
      culture: "Direct, private, rules-aware",
      night: "Strong if you know your route",
    },
    legalZones: [
      "Registration, address paperwork, and residence timing matter more than most newcomers expect.",
      "Parks and nightlife zones feel relaxed, but transit fines and tenant rules are enforced mechanically.",
    ],
    scamHotspots: [
      "Housing deposits on unverified short-let listings.",
      "Crowded nightlife U-Bahn routes after club hours.",
    ],
    culturalZones: [
      "Prenzlauer Berg and Charlottenburg feel easiest for families and first months.",
      "Kreuzberg and Neukölln bring energy, but daily life is rougher at the edges.",
    ],
    embassyArea: "Embassies, ministries, and legal services cluster through Mitte and Tiergarten.",
    alerts: [
      { level: "Heads up", title: "Housing competition", detail: "Apartment scarcity is one of the few issues that can reshape the whole move plan." },
      { level: "Calm", title: "Transit reliability", detail: "Public transport is the easiest way to keep the city feeling small enough to handle." },
    ],
  },
  buenosaires: {
    reality: {
      safety: "Good if you stay switched on",
      police: "Visible in the core",
      cost: "Strong value, unstable pricing",
      scams: "Cash and phone risk",
      culture: "Late, social, expressive",
      night: "Good in known districts",
    },
    legalZones: [
      "Currency exchange and cash handling create more risk than formal legal restrictions for most arrivals.",
      "Demonstrations can reshape central routes even when tourist districts feel normal.",
    ],
    scamHotspots: [
      "Unofficial exchange offers around transport corridors.",
      "Phone theft in busy nightlife and café zones.",
    ],
    culturalZones: [
      "Palermo and Recoleta are easiest for first-time stays.",
      "Centro is useful but can feel sharper and more transactional after business hours.",
    ],
    embassyArea: "Embassy support and formal services are easiest around Recoleta and Retiro.",
    alerts: [
      { level: "Watch", title: "Currency swings", detail: "Price expectations can go stale quickly, especially for longer stays and deposits." },
      { level: "Heads up", title: "Marches and transport slowdowns", detail: "Central demonstrations can block key routes with little notice." },
    ],
  },
  tokyo: {
    reality: {
      safety: "Exceptionally high",
      police: "Formal and orderly",
      cost: "High but predictable",
      scams: "Low",
      culture: "Highly rule-aware",
      night: "Very strong in major hubs",
    },
    legalZones: [
      "Medication import rules, work status, and public conduct matter more than tourists often assume.",
      "Photography is easy until you hit private property, rail etiquette, or official/security-sensitive sites.",
    ],
    scamHotspots: [
      "Late-night bar touts in a few entertainment districts.",
      "Short-term rental compliance in unlicensed accommodation.",
    ],
    culturalZones: [
      "Shibuya and Shinjuku are easy transport bases but intense.",
      "Kichijoji and Nakameguro feel calmer for longer routines.",
    ],
    embassyArea: "Most embassies and formal support routes are easiest to reach through Akasaka, Roppongi, and central Chiyoda access.",
    alerts: [
      { level: "Heads up", title: "Typhoon and weather planning", detail: "Seasonal weather can disrupt trains and airport access even when city life looks stable." },
      { level: "Calm", title: "Night transport confidence", detail: "Major station districts remain some of the easiest places in the product to navigate after dark." },
    ],
  },
  capetown: {
    reality: {
      safety: "Scenic but planning-heavy",
      police: "Supportive in core zones",
      cost: "Strong value",
      scams: "Medium",
      culture: "Open, outdoorsy, mixed",
      night: "Choose areas carefully",
    },
    legalZones: [
      "Driving, route choice, and visible valuables matter more than formal rule complexity.",
      "Beach, mountain, and wildlife areas shift rules with wind, fire, and marine conditions.",
    ],
    scamHotspots: [
      "Unsecured parking and scenic stops with bags visible.",
      "Phone and bag grabs outside nightlife clusters.",
    ],
    culturalZones: [
      "Sea Point and Camps Bay feel easiest for a first base.",
      "Woodstock and CBD bring energy, but need sharper time-of-day awareness.",
    ],
    embassyArea: "Embassy, clinic, and consular help are easiest through CBD and Atlantic seaboard routes.",
    alerts: [
      { level: "Watch", title: "Loadshedding and backup power", detail: "Power cuts still shape workdays, security choices, and where longer-stay housing feels livable." },
      { level: "Heads up", title: "After-dark routing", detail: "Use ride-hail and stay deliberate about where you stop rather than wandering between zones." },
    ],
  },
  dubai: {
    reality: {
      safety: "Very high",
      police: "Strict but clear",
      cost: "High",
      scams: "Low-medium",
      culture: "Polished, formal, global",
      night: "Very comfortable in licensed zones",
    },
    legalZones: [
      "Alcohol, medication, public intoxication, and online conduct rules are tighter than the city vibe first suggests.",
      "Residential privacy and official-building photography are taken seriously.",
    ],
    scamHotspots: [
      "Apartment deposit terms on fast-turn rentals.",
      "Tourist add-ons and upsells in taxi or excursion corridors.",
    ],
    culturalZones: [
      "Marina and Downtown are the easiest first bases.",
      "Older districts are more practical and affordable but culturally more mixed in rhythm.",
    ],
    embassyArea: "Consular routes and formal services are easiest from Business Bay, Downtown, and Embassy-adjacent government corridors.",
    alerts: [
      { level: "Heads up", title: "Heat management", detail: "The weather can be the main operational risk from late spring into early autumn." },
      { level: "Calm", title: "Smooth transport", detail: "Metro, ride-hail, and polished service standards lower first-week friction dramatically." },
    ],
  },
  toronto: {
    reality: {
      safety: "High",
      police: "Professional and visible",
      cost: "High, especially housing",
      scams: "Low-medium",
      culture: "Polite, diverse, structured",
      night: "Good in main zones",
    },
    legalZones: [
      "Entry purpose, work rights, and digital-device checks at the border matter more than life inside the city.",
      "Cannabis legality does not remove workplace, housing, or border consequences.",
    ],
    scamHotspots: [
      "Housing deposits on unverified listings.",
      "Phone and wallet theft around nightlife and major stations.",
    ],
    culturalZones: [
      "King West, Annex, and waterfront routes are easiest for first months.",
      "Neighbourhood culture shifts fast block to block, but the city stays readable.",
    ],
    embassyArea: "Consular help and immigration services are easiest through downtown and University-area routes.",
    alerts: [
      { level: "Heads up", title: "Winter operations", detail: "Snow and cold can reshape commute time, clothing needs, and how neighbourhoods feel after dark." },
      { level: "Watch", title: "Housing cost pressure", detail: "Rent is the main drag on move confidence, especially before local credit history exists." },
    ],
  },
  sydney: {
    reality: {
      safety: "High",
      police: "Clear and rule-based",
      cost: "High",
      scams: "Low",
      culture: "Relaxed but expensive",
      night: "Strong in known districts",
    },
    legalZones: [
      "Working-rights mistakes and biosecurity declarations are bigger risks than everyday city law for most newcomers.",
      "Beach alcohol, fire, and wildlife rules shift by council and season.",
    ],
    scamHotspots: [
      "Rental competition and advance-payment traps.",
      "Tourist parking and event transport surcharges.",
    ],
    culturalZones: [
      "Surry Hills and Newtown feel easiest for daily life.",
      "Bondi is iconic but expensive and more visitor-heavy than it first appears.",
    ],
    embassyArea: "Embassies and immigration support are easiest through CBD, Potts Point, and central rail links.",
    alerts: [
      { level: "Watch", title: "Bushfire and smoke season", detail: "Regional fire conditions can affect air quality and travel even when city streets feel normal." },
      { level: "Heads up", title: "Beach and surf conditions", detail: "Flag rules and surf warnings matter for safety more than many short-stay visitors realize." },
    ],
  },
  singapore: {
    reality: {
      safety: "Exceptionally high",
      police: "Very rules-forward",
      cost: "Very high",
      scams: "Low",
      culture: "Orderly, fast, multicultural",
      night: "Very comfortable",
    },
    legalZones: [
      "Public-order rules, vaping bans, and drug enforcement are among the strictest in the product.",
      "Work status and immigration compliance are cleanly enforced with little tolerance for grey areas.",
    ],
    scamHotspots: [
      "Short-stay housing offers outside licensed channels.",
      "Tourist overcharging in a few nightlife or shopping corridors.",
    ],
    culturalZones: [
      "Tiong Bahru and River Valley feel easiest for longer routines.",
      "Marina Bay is polished and safe, but less reflective of everyday living value.",
    ],
    embassyArea: "Consular support, hospitals, and formal services are easiest through Orchard, Tanglin, and central MRT-linked districts.",
    alerts: [
      { level: "Calm", title: "Operational reliability", detail: "Transit, signage, and enforcement make this one of the easiest cities in the product to read fast." },
      { level: "Heads up", title: "Cost creep", detail: "Housing and daily spend escalate quickly if you treat the city like a pure short-stay destination." },
    ],
  },
};

const PERSONA_REASONS: Record<TravelPersona, string> = {
  Explorer: "You are optimizing for novelty, momentum, and the feeling of movement.",
  Relaxer: "Weather, pace, and low-friction days matter more than squeezing every hour.",
  "Culture seeker": "Neighbourhood feel, language, and day-to-day local rhythm matter to you.",
  "Food traveler": "Markets, cafés, dinner culture, and everyday taste are part of the destination decision.",
  "Nightlife traveler": "You want the city to still feel alive after work hours or after dark.",
  "Budget optimizer": "You want the most runway per month without killing the experience.",
  "Luxury traveler": "Comfort, polish, smoother service, and premium convenience matter enough to pay for.",
};

function embassyAppointments(mode: Mode) {
  switch (mode) {
    case "trip":
      return "Usually low-friction if your passport is visa-free; if not, book 2-4 weeks ahead.";
    case "nomad":
      return "Remote-work routes often need an appointment window 3-6 weeks out plus insurance and income proof.";
    case "move":
      return "Residency routes are paperwork-heavy; assume 4-8 weeks to line up consular and on-arrival appointments.";
  }
}

function approvalOutlook(destination: Destination, mode: Mode) {
  const headline = destination.visa[mode].headline.toLowerCase();
  if (headline.includes("visa-free") || headline.includes("on arrival")) {
    return {
      value: "Strong for common passports",
      detail: "For US, UK, EU, CA, and AU style passports this route is usually the least painful. Check your own nationality before you commit.",
      tone: "positive" as Tone,
    };
  }
  if (headline.includes("tourist entry covers it")) {
    return {
      value: "Good for short stays",
      detail: "This works well for the timeframe in the app, but long-term work or residency rights are still limited.",
      tone: "neutral" as Tone,
    };
  }
  return {
    value: "Document-heavy",
    detail: "The route is viable, but evidence quality, translations, insurance, and timing matter much more than for a simple tourist entry.",
    tone: "warning" as Tone,
  };
}

function visaDifficulty(destination: Destination, mode: Mode) {
  const headline = destination.visa[mode].headline.toLowerCase();
  if (headline.includes("visa-free") || headline.includes("on arrival")) return "22 / 100 · low friction";
  if (headline.includes("tourist entry covers it")) return "35 / 100 · manageable";
  if (headline.includes("digital nomad") || headline.includes("remote")) return "58 / 100 · evidence-led";
  return "74 / 100 · paperwork-heavy";
}

function keyDocuments(mode: Mode, answers: Answers) {
  const base =
    mode === "trip"
      ? ["Passport valid 6+ months", "Onward ticket or exit plan", "Address for your first stay"]
      : mode === "nomad"
        ? ["Passport + scans", "Remote-income proof", "Private health insurance"]
        : ["Passport + civil documents", "Proof of funds or sponsor", "Lease or arrival address"];

  if (answers.work === "Studying") return [...base, "School acceptance letter"];
  if (answers.work === "On a work assignment") return [...base, "Employer letter or contract"];
  return [...base, "Buffer funds for the first month"];
}

function commonRejection(mode: Mode, answers: Answers) {
  if (mode === "trip") return "Weak proof of funds, unclear itinerary, or a passport validity problem.";
  if (answers.work === "Studying") return "An incomplete school package, weak financial proof, or inconsistent study purpose.";
  if (answers.work === "On a work assignment") return "Employer paperwork that does not clearly match the visa category.";
  return "Income evidence, insurance coverage, or address documents that do not line up cleanly.";
}

function shouldTravelVerdict(destination: Destination, mode: Mode) {
  const score = destination.match[mode];
  if (score >= 90) return { value: "Yes — strong fit", tone: "positive" as Tone };
  if (score >= 82) return { value: "Yes, with trade-offs", tone: "neutral" as Tone };
  return { value: "Maybe — compare alternatives", tone: "warning" as Tone };
}

function bestBase(stays: StayOption[]) {
  const first = stays[0];
  return first ? `${first.area} · ${first.name}` : "Start near a transit-rich central district.";
}

function complianceFor(destination: Destination) {
  return REGION_COMPLIANCE[destination.region] ?? REGION_COMPLIANCE.Europe;
}

function awarenessFor(destination: Destination) {
  return CITY_AWARENESS[destination.id] ?? CITY_AWARENESS.lisbon;
}

function safeZonesFrom(stays: StayOption[]) {
  const areas = Array.from(
    new Set(
      stays
        .map((stay) => stay.area.split("·")[0]?.trim() || stay.area.trim())
        .filter(Boolean),
    ),
  );

  if (areas.length === 0) return ["Start in the best-connected district with transit, pharmacies, and food within a short walk."];
  return areas.slice(0, 2).map((area) => `${area} is the easiest base for a first arrival and low-friction first week.`);
}

function neighbourhoodPersonality(stays: StayOption[]) {
  return stays
    .slice(0, 2)
    .map((stay) => `${stay.area} · ${stay.name}`)
    .filter(Boolean);
}

function recommendedRoute(trips: TripOption[]) {
  const first = trips[0];
  return first ? `${first.provider} · ${first.route}` : "Choose the least-transfer route that lands in daylight.";
}

function travelDatesHint(destination: Destination, mode: Mode) {
  switch (destination.id) {
    case "lisbon":
      return mode === "trip" ? "Aim for April-June or September-October for the best balance of weather and crowd levels." : "Shoulder season arrivals make housing viewings and paperwork less frantic.";
    case "bangkok":
      return "November-February is the easiest first landing window; burning season and peak heat add friction.";
    case "capetown":
      return "Match your arrival to daylight and power-backup readiness more than pure peak season appeal.";
    case "dubai":
      return "October-March is the most forgiving runway for viewing neighbourhoods and doing admin on foot.";
    case "toronto":
      return "Late spring and early autumn are the easiest windows to learn the city before winter changes the feel.";
    default:
      return mode === "move" ? "Arrive when offices, housing viewings, and admin windows are easiest to stack in one week." : "Aim for shoulder season if you want the cleanest balance of cost, weather, and crowd pressure.";
  }
}

function transportModeHint(destination: Destination) {
  switch (destination.id) {
    case "mexicocity":
    case "bangkok":
    case "capetown":
    case "dubai":
      return "Use metro or rail for the backbone and ride-hail for late or awkward last-mile trips.";
    case "lisbon":
    case "berlin":
    case "toronto":
    case "singapore":
      return "Public transport can carry most of the move if you pick the right district first.";
    default:
      return "Build around the fastest transit corridor first, then optimize neighbourhood choice from there.";
  }
}

export function buildTravelIntelligenceCore({
  destination,
  mode,
  answers,
  ranked,
  trips,
  stays,
}: {
  destination: Destination;
  mode: Mode;
  answers: Answers;
  ranked: Destination[];
  trips: TripOption[];
  stays: StayOption[];
}): TravelIntelligenceCore {
  const shouldTravel = shouldTravelVerdict(destination, mode);
  const outlook = approvalOutlook(destination, mode);
  const alternatives = ranked
    .filter((item) => item.id !== destination.id)
    .slice(0, 3)
    .map((item) => `${item.city} · ${item.country}`);

  return {
    decision: [
      {
        label: "Can I travel there?",
        value: destination.visa[mode].headline,
        detail: destination.visa[mode].tag,
        tone: "positive",
      },
      {
        label: "Should I travel there?",
        value: shouldTravel.value,
        detail: destination.honest[mode],
        tone: shouldTravel.tone,
      },
      {
        label: "Best base right now",
        value: bestBase(stays),
        detail: "Use this as your first anchor while you validate the city in person.",
        tone: "neutral",
      },
      {
        label: "Best route",
        value: recommendedRoute(trips),
        detail: travelDatesHint(destination, mode),
        tone: "neutral",
      },
    ],
    visa: [
      {
        label: "Visa difficulty",
        value: visaDifficulty(destination, mode),
        detail: "A product score for how much evidence, timing, and admin this route usually takes.",
        tone: "neutral",
      },
      {
        label: "Approval outlook",
        value: outlook.value,
        detail: outlook.detail,
        tone: outlook.tone,
      },
      {
        label: "Embassy and appointments",
        value: awarenessFor(destination).embassyArea,
        detail: embassyAppointments(mode),
        tone: "neutral",
      },
      {
        label: "Key documents",
        value: keyDocuments(mode, answers).join(" · "),
        detail: "These are the highest-friction items to collect before you book non-refundable steps.",
        tone: "warning",
      },
      {
        label: "Common rejection reason",
        value: commonRejection(mode, answers),
        detail: "This is the failure mode the execution checklist should reduce first.",
        tone: "warning",
      },
      {
        label: "Recommended transport mode",
        value: transportModeHint(destination),
        detail: "Used by the decision coach because route stress changes the whole first-week experience.",
        tone: "positive",
      },
    ],
    compliance: complianceFor(destination).map((item) => ({
      title: item.title,
      detail: item.detail,
      tone: item.tone,
    })),
    prep: [
      "Confirm nationality-specific entry rules before you pay for anything irreversible.",
      "Build your first-week plan around the right district, not just the cheapest listing.",
      "Collect the highest-friction documents first: identity, funds, insurance, and purpose.",
      "Compare two alternatives before you commit so you know what trade-off you are accepting.",
    ],
    alternatives,
  };
}

export function buildSituationalAwarenessCore({
  destination,
  stays,
}: {
  destination: Destination;
  stays: StayOption[];
}): SituationalAwarenessCore {
  const awareness = awarenessFor(destination);
  const safeZones = safeZonesFrom(stays);
  const personalities = neighbourhoodPersonality(stays);

  return {
    mapLayers: [
      {
        title: "Safe zones",
        detail: safeZones.join(" "),
        tone: "positive",
      },
      {
        title: "Legal zones",
        detail: awareness.legalZones.join(" "),
        tone: "warning",
      },
      {
        title: "Scam hotspots",
        detail: awareness.scamHotspots.join(" "),
        tone: "warning",
      },
      {
        title: "Cultural zones",
        detail: `${awareness.culturalZones.join(" ")}${personalities.length ? ` Neighbourhood personality cues: ${personalities.join(" · ")}.` : ""}`,
        tone: "neutral",
      },
    ],
    reality: [
      {
        label: "Safety",
        value: awareness.reality.safety,
        detail: "How the city feels once you move beyond the landing-page version.",
        tone: "positive",
      },
      {
        label: "Police strictness",
        value: awareness.reality.police,
        detail: "Useful for judging how much documentation and behavioural polish matters.",
        tone: "neutral",
      },
      {
        label: "Cost level",
        value: awareness.reality.cost,
        detail: "The operating reality once housing, transport, and small daily spend stack together.",
        tone: "neutral",
      },
      {
        label: "Scam frequency",
        value: awareness.reality.scams,
        detail: "Not a reason to avoid the city, but a reason to move with better habits.",
        tone: "warning",
      },
      {
        label: "Cultural sensitivity",
        value: awareness.reality.culture,
        detail: "How much local norms change whether the city feels easy or exhausting.",
        tone: "neutral",
      },
      {
        label: "Night safety",
        value: awareness.reality.night,
        detail: "The question solo travelers usually wish they had answered earlier.",
        tone: "positive",
      },
    ],
    alerts: awareness.alerts,
    helpPoints: [
      {
        title: "Embassy access",
        detail: awareness.embassyArea,
        tone: "neutral",
      },
      {
        title: "Emergency services",
        detail: "Keep police, ambulance, your insurer, and your first trusted hospital saved before the first night out.",
        tone: "warning",
      },
      {
        title: "Reality check",
        detail: "This module is built to answer what the city feels like now, not what brochure copy said last season.",
        tone: "positive",
      },
    ],
  };
}

function personaScores(destination: Destination, mode: Mode, answers: Answers) {
  const scores: Record<TravelPersona, number> = {
    Explorer: 48,
    Relaxer: 48,
    "Culture seeker": 48,
    "Food traveler": 46,
    "Nightlife traveler": 42,
    "Budget optimizer": 48,
    "Luxury traveler": 40,
  };

  const priority = answers.priority;
  const budget = answers.budget;
  const who = answers.who;

  if (priority === "Low cost") scores["Budget optimizer"] += 26;
  if (priority === "Great weather") scores.Relaxer += 22;
  if (priority === "Career & networks") scores.Explorer += 18;
  if (priority === "Community") scores["Culture seeker"] += 24;
  if (priority === "Pure adventure") scores.Explorer += 24;

  if (budget === "Lean · under $1.5k") scores["Budget optimizer"] += 18;
  if (budget === "Generous · $3k+") scores["Luxury traveler"] += 24;

  if (who === "With family") {
    scores.Relaxer += 12;
    scores["Culture seeker"] += 10;
    scores["Nightlife traveler"] -= 10;
  }

  if (mode === "trip") scores.Explorer += 10;
  if (mode === "nomad") scores["Culture seeker"] += 8;
  if (mode === "move") {
    scores.Relaxer += 6;
    scores["Culture seeker"] += 8;
  }

  if (["lisbon", "mexicocity", "bangkok", "buenosaires"].includes(destination.id)) {
    scores["Food traveler"] += 14;
  }
  if (["berlin", "lisbon", "buenosaires", "tokyo"].includes(destination.id)) {
    scores["Nightlife traveler"] += 14;
  }
  if (["dubai", "singapore", "sydney", "toronto"].includes(destination.id)) {
    scores["Luxury traveler"] += 14;
  }
  if (["tbilisi", "bangkok", "buenosaires", "capetown"].includes(destination.id)) {
    scores["Budget optimizer"] += 8;
  }

  return scores;
}

function buildPersonaMatches(destination: Destination, mode: Mode, answers: Answers) {
  const scores = personaScores(destination, mode, answers);
  return (Object.keys(scores) as TravelPersona[])
    .map((persona) => ({
      persona,
      score: Math.max(44, Math.min(96, scores[persona])),
      reason: PERSONA_REASONS[persona],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function readinessFor(mode: Mode, plan: PlanInfo, answers: Answers) {
  const planItems = plan.phases.flatMap((phase) => phase.items);
  const documents = [
    ...planItems.slice(0, 2),
    mode === "trip" ? "Passport scans and onward proof in cloud storage" : "Insurance, address, and funds file ready to share",
  ];
  const safety = [
    "Save emergency numbers and insurer helplines.",
    "Download offline maps and a translation app.",
    mode === "move" ? "Carry first-week originals separately from the rest of your luggage." : "Keep your first-night transport and address accessible offline.",
  ];
  const localSetup = [
    "Install ride-hail, maps, and local payment apps before departure.",
    mode === "trip" ? "Book a transit-rich first base." : "Line up a first-week area before you hunt for the perfect long-term base.",
    "Plan one hospital, one coworking option, and one grocery fallback in advance.",
  ];
  const culturalPrep = [
    "Read the legal/compliance notes before nightlife, driving, or filming.",
    answers.who === "With family" ? "Check family-specific school, childcare, or dependent paperwork in week one." : "Check the local norm for ID checks, public conduct, and after-dark movement.",
    "Know the one behaviour that makes you look prepared, not like a confused arrival.",
  ];

  return [
    { title: "Documents and entry", items: documents },
    { title: "Safety and health", items: safety },
    { title: "Local setup", items: localSetup },
    { title: "Cultural and legal prep", items: culturalPrep },
  ];
}

export function buildTravelExecutionCore({
  destination,
  mode,
  answers,
  plan,
  trips,
  stays,
  visaServices,
  schools,
  jobs,
}: {
  destination: Destination;
  mode: Mode;
  answers: Answers;
  plan: PlanInfo;
  trips: TripOption[];
  stays: StayOption[];
  visaServices: VisaService[];
  schools: SchoolOption[];
  jobs: JobOption[];
}): TravelExecutionCore {
  const personaMatches = buildPersonaMatches(destination, mode, answers);
  const leadPersona = personaMatches[0];

  return {
    personaMatches,
    strategy: [
      `${leadPersona.persona} is your lead travel persona for ${destination.city}.`,
      `Use ${stays[0]?.area ?? "a transit-rich central district"} as the first-week base and ${trips[0]?.provider ?? "the cleanest route"} as the least-friction way in.`,
      mode === "move"
        ? "Treat this as an execution sprint: documents first, housing second, community third."
        : mode === "nomad"
          ? "Sequence the stay like a test run: soft landing, local setup, then longer-term commitments."
          : "Keep the first 48 hours light so the city can confirm the decision instead of overwhelming it.",
    ],
    readiness: readinessFor(mode, plan, answers),
    actions: [
      {
        title: "Transportation options",
        detail: "Open live route choices and hold the least-stress way to get there.",
        countLabel: `${trips.length} routes`,
        target: "trips",
      },
      {
        title: "Stay options",
        detail: "Choose a first base matched to your stay length and arrival pace.",
        countLabel: `${stays.length} stays`,
        target: "stays",
      },
      {
        title: "Visa support",
        detail: "Move from self-serve checklist to guided handling if the route is paperwork-heavy.",
        countLabel: `${visaServices.length} options`,
        target: "visaBook",
      },
      {
        title: "Readiness checklist",
        detail: "Turn this module into action with the plan and move meter.",
        countLabel: `${plan.phases.length} sections`,
        target: "plan",
      },
      ...(schools.length > 0
        ? [
            {
              title: "School applications",
              detail: "For study-led moves, go directly from intelligence to application.",
              countLabel: `${schools.length} programs`,
              target: "school" as const,
            },
          ]
        : []),
      ...(jobs.length > 0
        ? [
            {
              title: "Visa-sponsoring roles",
              detail: "For work-led moves, jump straight into roles that support the route.",
              countLabel: `${jobs.length} roles`,
              target: "job" as const,
            },
          ]
        : []),
    ],
  };
}
