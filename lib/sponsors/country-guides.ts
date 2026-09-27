export type SkilledRoute = {
  name: string
  summary: string
  url?: string
}

export type CountryGuide = {
  id: string
  flag: string
  name: string
  /** Values of `skilledjobs.jobs.country` that belong to this destination. */
  jobCountries: string[]
  headline: string
  routes: SkilledRoute[]
  sponsorship: string
  register?: { label: string; url: string; note: string }
  links: Array<{ label: string; url: string }>
}

/** Skilled-work routes outside the UK. The UK register is searched live from the database. */
export const COUNTRY_GUIDES: CountryGuide[] = [
  {
    id: "ireland",
    flag: "🇮🇪",
    name: "Ireland",
    jobCountries: ["Ireland"],
    headline: "Employment permits tied to a job offer.",
    routes: [
      {
        name: "Critical Skills Employment Permit",
        summary: "For occupations on the Critical Skills list or high-salary roles. The fastest employment route to long-term residence.",
      },
      {
        name: "General Employment Permit",
        summary: "For most other eligible occupations. The employer usually has to advertise the role locally first (Labour Market Needs Test).",
      },
      {
        name: "Intra-Company Transfer Employment Permit",
        summary: "For staff moving to an Irish branch of their current employer.",
      },
    ],
    sponsorship:
      "Irish employers don't hold a sponsor licence. The permit is linked to a specific job offer, and either you or the employer applies to the Department of Enterprise.",
    register: {
      label: "Companies issued employment permits",
      url: "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/statistics/",
      note: "Published by the Department of Enterprise. Shows which companies received permits, by year.",
    },
    links: [{ label: "Employment permits (Department of Enterprise)", url: "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/" }],
  },
  {
    id: "netherlands",
    flag: "🇳🇱",
    name: "Netherlands",
    jobCountries: ["Netherlands"],
    headline: "Recognised sponsors hire highly skilled migrants.",
    routes: [
      {
        name: "Highly Skilled Migrant (kennismigrant)",
        summary: "Salary-based permit with no degree requirement. The employer must be an IND recognised sponsor.",
        url: "https://ind.nl/en/residence-permits/work/highly-skilled-migrant",
      },
      {
        name: "EU Blue Card",
        summary: "For degree-level roles above the Blue Card salary threshold, with easier moves to other EU countries later.",
      },
      {
        name: "Intra-corporate transferee (ICT)",
        summary: "For managers, specialists and trainees moving within the same company group.",
      },
    ],
    sponsorship:
      "For the Highly Skilled Migrant route the employer must be recognised by the IND. Recognised sponsors apply on your behalf and decisions are usually quick.",
    register: {
      label: "IND public register of recognised sponsors",
      url: "https://ind.nl/en/public-register-recognised-sponsors",
      note: "The official list of employers allowed to sponsor highly skilled migrants.",
    },
    links: [{ label: "Highly Skilled Migrant (IND)", url: "https://ind.nl/en/residence-permits/work/highly-skilled-migrant" }],
  },
  {
    id: "germany",
    flag: "🇩🇪",
    name: "Germany",
    jobCountries: ["Germany"],
    headline: "Any employer can hire you if your qualification is recognised.",
    routes: [
      {
        name: "EU Blue Card",
        summary: "For graduates with a job offer above the salary threshold. The threshold is lower for shortage occupations and recent graduates.",
        url: "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card",
      },
      {
        name: "Skilled worker residence permit",
        summary: "For people with a recognised vocational or academic qualification and a matching job offer.",
        url: "https://www.make-it-in-germany.com/en/visa-residence/types/work-qualified-professionals",
      },
      {
        name: "Opportunity Card (Chancenkarte)",
        summary: "A points-based permit to come to Germany and look for skilled work before you have an offer.",
      },
    ],
    sponsorship:
      "Germany has no sponsor licence. Any employer can hire you; the Federal Employment Agency may need to approve the job, and your qualification usually has to be recognised in Germany.",
    links: [
      { label: "EU Blue Card (Make it in Germany)", url: "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card" },
      { label: "Skilled workers (Make it in Germany)", url: "https://www.make-it-in-germany.com/en/visa-residence/types/work-qualified-professionals" },
    ],
  },
  {
    id: "canada",
    flag: "🇨🇦",
    name: "Canada",
    jobCountries: ["Canada"],
    headline: "LMIA-backed work permits and points-based residence.",
    routes: [
      {
        name: "Temporary Foreign Worker Program (LMIA)",
        summary: "The employer gets a Labour Market Impact Assessment showing the role can't be filled locally, then you apply for a work permit.",
        url: "https://www.canada.ca/en/employment-social-development/services/foreign-workers.html",
      },
      {
        name: "Global Talent Stream",
        summary: "A faster LMIA stream for in-demand tech and specialist roles.",
      },
      {
        name: "Express Entry",
        summary: "Points-based permanent residence. A job offer helps your score but isn't required.",
        url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
      },
    ],
    sponsorship:
      "There's no sponsor licence, but most employer-backed work permits need a positive LMIA for the specific role. Some roles are LMIA-exempt under trade agreements or intra-company transfers.",
    register: {
      label: "Employers issued a positive LMIA",
      url: "https://open.canada.ca/data/en/dataset/90fed587-1364-4f33-a9ee-208181dc0b97",
      note: "Published quarterly by Employment and Social Development Canada. A record of past approvals, not current vacancies.",
    },
    links: [
      { label: "Hire a temporary foreign worker (ESDC)", url: "https://www.canada.ca/en/employment-social-development/services/foreign-workers.html" },
      { label: "Express Entry (IRCC)", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html" },
    ],
  },
  {
    id: "australia",
    flag: "🇦🇺",
    name: "Australia",
    jobCountries: ["Australia"],
    headline: "Approved business sponsors nominate the role.",
    routes: [
      {
        name: "Skills in Demand visa (subclass 482)",
        summary: "The main employer-sponsored temporary visa, which replaced the TSS visa. Streams depend on the occupation and salary.",
        url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482",
      },
      {
        name: "Employer Nomination Scheme (subclass 186)",
        summary: "Permanent residence with an employer nominating you, often after time on a 482.",
        url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/employer-nomination-scheme-186",
      },
      {
        name: "Skilled Independent (subclass 189)",
        summary: "Points-tested permanent residence with no employer sponsor.",
      },
    ],
    sponsorship:
      "The employer must be an approved standard business sponsor and nominate the position before you apply. Australia doesn't publish a public list of approved sponsors.",
    links: [
      { label: "Sponsoring workers (Home Affairs)", url: "https://immi.homeaffairs.gov.au/visas/employing-and-sponsoring-someone/sponsoring-workers" },
      { label: "Skills in Demand visa (Home Affairs)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482" },
    ],
  },
  {
    id: "new-zealand",
    flag: "🇳🇿",
    name: "New Zealand",
    jobCountries: ["New Zealand"],
    headline: "Accredited employers hire through a job check.",
    routes: [
      {
        name: "Accredited Employer Work Visa (AEWV)",
        summary: "The main work visa. The employer must be accredited and pass a job check for the role.",
        url: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa",
      },
      {
        name: "Green List residence",
        summary: "Roles on the Green List can lead straight to residence, or to residence after working in the role.",
      },
    ],
    sponsorship:
      "Only accredited employers can hire on the AEWV. They advertise the role, pass a job check, then offer it to you.",
    links: [{ label: "Accredited Employer Work Visa (Immigration NZ)", url: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa" }],
  },
  {
    id: "united-states",
    flag: "🇺🇸",
    name: "United States",
    jobCountries: ["United States"],
    headline: "Employer petitions, mostly through the H-1B lottery.",
    routes: [
      {
        name: "H-1B specialty occupation",
        summary: "For degree-level roles. Most employers enter an annual lottery; universities and research bodies are cap-exempt.",
        url: "https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations",
      },
      {
        name: "L-1 intracompany transfer",
        summary: "For managers and specialists moving to a US office of their current employer.",
      },
      {
        name: "O-1 extraordinary ability",
        summary: "For people with sustained, documented recognition in their field.",
      },
    ],
    sponsorship:
      "The employer files a petition with USCIS for you. For H-1B they also certify the wage with the Department of Labor, and most roles depend on the lottery.",
    register: {
      label: "USCIS H-1B Employer Data Hub",
      url: "https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub",
      note: "Employers who filed H-1B petitions, with approval counts by year.",
    },
    links: [{ label: "H-1B specialty occupations (USCIS)", url: "https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations" }],
  },
  {
    id: "denmark",
    flag: "🇩🇰",
    name: "Denmark",
    jobCountries: ["Denmark"],
    headline: "Salary, shortage-list and fast-track schemes.",
    routes: [
      {
        name: "Pay Limit Scheme",
        summary: "For any job paying above the scheme's annual salary limit.",
        url: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Pay-limit-scheme",
      },
      {
        name: "Positive Lists",
        summary: "For occupations with documented shortages, for graduates and skilled workers.",
      },
      {
        name: "Fast-track scheme",
        summary: "Certified companies can hire foreign staff with faster processing and fewer steps.",
        url: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Fast-track",
      },
    ],
    sponsorship:
      "No sponsor licence is needed for most schemes. Companies certified by SIRI can use the Fast-track scheme to speed up hiring.",
    register: {
      label: "SIRI certified companies",
      url: "https://www.nyidanmark.dk/en-GB/Words-and-concepts/SIRI/Certified-companies",
      note: "Companies certified to use the Fast-track scheme.",
    },
    links: [
      { label: "Pay Limit Scheme (SIRI)", url: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Pay-limit-scheme" },
      { label: "Fast-track scheme (SIRI)", url: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Fast-track" },
    ],
  },
  {
    id: "sweden",
    flag: "🇸🇪",
    name: "Sweden",
    jobCountries: ["Sweden"],
    headline: "Work permits for any occupation that meets Swedish terms.",
    routes: [
      {
        name: "Work permit for employment",
        summary: "For a job offer on Swedish pay and conditions, above the minimum salary level.",
        url: "https://www.migrationsverket.se/English/Private-individuals/Working-in-Sweden/Employed.html",
      },
      {
        name: "EU Blue Card",
        summary: "For degree-level roles above the Blue Card salary threshold.",
      },
    ],
    sponsorship:
      "There's no sponsor licence. The employer advertises the job, makes an offer on Swedish terms, and starts the application with the Migration Agency.",
    links: [{ label: "Working in Sweden (Migration Agency)", url: "https://www.migrationsverket.se/English/Private-individuals/Working-in-Sweden/Employed.html" }],
  },
  {
    id: "singapore",
    flag: "🇸🇬",
    name: "Singapore",
    jobCountries: ["Singapore"],
    headline: "Employer-led passes scored on salary and skills.",
    routes: [
      {
        name: "Employment Pass",
        summary: "For professionals and managers. Assessed on a qualifying salary and the COMPASS points framework.",
        url: "https://www.mom.gov.sg/passes-and-permits/employment-pass",
      },
      {
        name: "S Pass",
        summary: "For mid-skilled technical staff, subject to company quotas.",
      },
    ],
    sponsorship: "The employer, or an agent it appoints, applies to the Ministry of Manpower on your behalf.",
    links: [{ label: "Employment Pass (Ministry of Manpower)", url: "https://www.mom.gov.sg/passes-and-permits/employment-pass" }],
  },
  {
    id: "japan",
    flag: "🇯🇵",
    name: "Japan",
    jobCountries: ["Japan"],
    headline: "Professional visas, points-based fast track and Specified Skilled Worker.",
    routes: [
      {
        name: "Engineer / Specialist in Humanities / International Services",
        summary: "The standard work visa for graduates and professionals with a job offer.",
      },
      {
        name: "Highly Skilled Professional",
        summary: "Points-based status with faster permanent residence and extra family benefits.",
        url: "https://www.isa.go.jp/en/publications/materials/newimmiact_3_index.html",
      },
      {
        name: "Specified Skilled Worker",
        summary: "For set industries facing shortages. Needs a skills test and a Japanese language test.",
        url: "https://www.isa.go.jp/en/applications/ssw/index.html",
      },
    ],
    sponsorship: "The employer supports your Certificate of Eligibility application with the Immigration Services Agency before you apply for the visa.",
    links: [
      { label: "Highly Skilled Professional (ISA)", url: "https://www.isa.go.jp/en/publications/materials/newimmiact_3_index.html" },
      { label: "Specified Skilled Worker (ISA)", url: "https://www.isa.go.jp/en/applications/ssw/index.html" },
    ],
  },
]

export function getCountryGuide(id: string): CountryGuide | undefined {
  return COUNTRY_GUIDES.find((guide) => guide.id === id)
}
