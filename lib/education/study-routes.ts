export type StudyRoute = {
  country: string
  flag: string
  visa: string
  /** The document the university issues that you need before applying for the visa. */
  keyDocument: string
  workWhileStudying: string
  postStudyShort: string
  afterStudy: string
  nextStep: string
  family: string
  familyShort: "Yes" | "Limited" | "Rarely"
  money: string
  tuition: string
  url: string
}

/**
 * Student visa and post-study work routes by destination. Rules change often, so every
 * figure is indicative and the UI always links to the official source.
 */
export const STUDY_ROUTES: StudyRoute[] = [
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    visa: "Student visa",
    keyDocument: "CAS (Confirmation of Acceptance for Studies)",
    workWhileStudying: "Up to 20 hours a week in term time at degree level, full-time in holidays.",
    postStudyShort: "Graduate route",
    afterStudy: "Graduate route to stay and look for work — currently 2 years (3 after a PhD). The government has announced a cut to 18 months, so check the current length.",
    nextStep: "Switch to a Skilled Worker visa with a licensed sponsor. Recent graduates can qualify at a lower 'new entrant' salary.",
    family: "Only if you're on a PhD / research postgraduate course, or government-sponsored.",
    familyShort: "Limited",
    money: "Living costs for up to 9 months (about £1,483 a month in London, £1,136 elsewhere) plus any unpaid tuition, and the Immigration Health Surcharge.",
    tuition: "Most master's degrees are 1 year, which cuts living costs.",
    url: "https://www.gov.uk/student-visa",
  },
  {
    country: "Ireland",
    flag: "🇮🇪",
    visa: "Study visa (Stamp 2)",
    keyDocument: "Letter of acceptance from the college",
    workWhileStudying: "Up to 20 hours a week in term, 40 hours in the summer and Christmas holidays.",
    postStudyShort: "Stay Back (Stamp 1G)",
    afterStudy: "Third Level Graduate Programme (Stamp 1G): 1 year after an honours bachelor's, up to 2 years after a master's or above.",
    nextStep: "Move to a Critical Skills or General Employment Permit once you have a job offer.",
    family: "Generally not allowed on a student permission.",
    familyShort: "Rarely",
    money: "Proof you can cover living costs for the year (the Irish immigration service sets the amount) plus your tuition.",
    tuition: "Master's degrees are usually 1 year.",
    url: "https://www.irishimmigration.ie/my-situation-has-changed-since-i-arrived-in-ireland/third-level-graduate-programme/",
  },
  {
    country: "Netherlands",
    flag: "🇳🇱",
    visa: "Residence permit for study",
    keyDocument: "The university applies for your permit as your recognised sponsor",
    workWhileStudying: "Limited part-time hours or full-time in June–August; your employer needs a work permit for you.",
    postStudyShort: "Orientation year",
    afterStudy: "Orientation year (zoekjaar): 1 year to find work, with a lower salary threshold for the Highly Skilled Migrant route.",
    nextStep: "Take a job with a recognised employer on the Highly Skilled Migrant (kennismigrant) route or an EU Blue Card.",
    family: "Possible if you can show enough extra income for them.",
    familyShort: "Yes",
    money: "Funds based on the Dutch student-finance norm for each month of study; the university checks this.",
    tuition: "Bachelor's are 3 years, most master's 1–2 years.",
    url: "https://ind.nl/en/residence-permits/work/residence-permit-for-orientation-year",
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    visa: "Student visa, then residence permit",
    keyDocument: "University admission letter",
    workWhileStudying: "Up to 140 full days or 280 half days a year.",
    postStudyShort: "18-month job search",
    afterStudy: "Up to 18 months' residence to look for a job related to your degree.",
    nextStep: "EU Blue Card or skilled worker permit — graduates of German universities can apply for settlement after about 2 years of work.",
    family: "Possible if you can show enough money and housing for them.",
    familyShort: "Yes",
    money: "A blocked account covering living costs for the year (roughly €11,900 a year).",
    tuition: "Most public universities charge no tuition, only a semester fee.",
    url: "https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    visa: "Study permit",
    keyDocument: "Letter of acceptance + Provincial Attestation Letter (PAL)",
    workWhileStudying: "Up to 24 hours a week off campus during term, full-time in scheduled breaks.",
    postStudyShort: "Post-Graduation Work Permit",
    afterStudy: "Post-Graduation Work Permit of up to 3 years depending on programme length. Eligible fields and language scores apply.",
    nextStep: "Canadian work experience boosts Express Entry and provincial nominee applications for permanent residence.",
    family: "Spouse open work permits mainly for master's (16+ months), PhD and some professional programmes.",
    familyShort: "Limited",
    money: "First-year tuition plus a set amount for living costs (around CAD 20,000+ a year for one person).",
    tuition: "Choose a programme that qualifies for the PGWP before you apply.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    visa: "Student visa (subclass 500)",
    keyDocument: "Confirmation of Enrolment (CoE)",
    workWhileStudying: "Up to 48 hours a fortnight during term, unlimited in breaks.",
    postStudyShort: "Temporary Graduate (485)",
    afterStudy: "Temporary Graduate visa (subclass 485): usually 2 years after a bachelor's or master's, 3 years after a PhD. Age limits apply.",
    nextStep: "Employer-sponsored Skills in Demand visa, or a points-tested skilled visa towards permanent residence.",
    family: "Partners and children can join; partners can usually work.",
    familyShort: "Yes",
    money: "Proof of living costs (about AUD 29,000 a year), tuition, travel and health cover (OSHC).",
    tuition: "Visa fees are high, so budget for them early.",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
  },
  {
    country: "United States",
    flag: "🇺🇸",
    visa: "F-1 student visa",
    keyDocument: "Form I-20 from the university",
    workWhileStudying: "On campus up to 20 hours a week in term; off-campus only through CPT or OPT.",
    postStudyShort: "OPT (+ STEM extension)",
    afterStudy: "Optional Practical Training: 12 months, plus 24 more for eligible STEM degrees.",
    nextStep: "An employer can sponsor an H-1B visa, which is allocated by lottery.",
    family: "Spouse and children can come on F-2 visas but cannot work.",
    familyShort: "Yes",
    money: "Proof you can pay the first year's costs shown on your I-20.",
    tuition: "Master's degrees are usually 1.5–2 years.",
    url: "https://studyinthestates.dhs.gov/students/prepare/students-and-the-form-i-20",
  },
]

export const STUDY_ROUTE_BY_COUNTRY = new Map(STUDY_ROUTES.map((route) => [route.country, route]))
