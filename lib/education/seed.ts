import type { StudyLevel } from "./types"

type SeedCourse = {
  title: string
  level: StudyLevel
  subject: string
  duration: string
  intake: string
  tuition: [number, number]
  feeNote?: string
  entry: string
  english: string
}

type SeedUniversity = {
  slug: string
  name: string
  country: string
  city: string
  website: string
  summary: string
  currency: string
  courses: SeedCourse[]
}

const UK_PG_ENTRY = "Typically a 2:1 honours degree (or international equivalent) in a related subject."
const UK_UG_ENTRY = "A-levels, IB or an equivalent international qualification; some students join through a foundation year."
const IELTS_65 = "IELTS 6.5 overall (no band below 6.0) or equivalent."
const IELTS_60 = "IELTS 6.0 overall (no band below 5.5) or equivalent."
const IELTS_70 = "IELTS 7.0 overall or equivalent."

/**
 * Starter catalogue. Tuition is an indicative annual range for international
 * students; admins should confirm and update figures from each university.
 */
export const EDUCATION_SEED: SeedUniversity[] = [
  {
    slug: "university-of-manchester",
    name: "University of Manchester",
    country: "United Kingdom",
    city: "Manchester",
    website: "https://www.manchester.ac.uk",
    summary: "Large Russell Group research university with strong engineering, computing and business schools.",
    currency: "GBP",
    courses: [
      { title: "MSc Data Science", level: "postgraduate", subject: "Computing & data", duration: "1 year", intake: "September", tuition: [31000, 37000], entry: UK_PG_ENTRY, english: IELTS_65 },
      { title: "BSc Computer Science", level: "undergraduate", subject: "Computing & data", duration: "3 years", intake: "September", tuition: [30000, 37000], entry: UK_UG_ENTRY, english: IELTS_65 },
      { title: "MSc International Business and Management", level: "postgraduate", subject: "Business & management", duration: "1 year", intake: "September", tuition: [28000, 35000], entry: UK_PG_ENTRY, english: IELTS_70 },
    ],
  },
  {
    slug: "university-of-leeds",
    name: "University of Leeds",
    country: "United Kingdom",
    city: "Leeds",
    website: "https://www.leeds.ac.uk",
    summary: "Russell Group university known for business, public health and engineering.",
    currency: "GBP",
    courses: [
      { title: "MSc Advanced Computer Science", level: "postgraduate", subject: "Computing & data", duration: "1 year", intake: "September", tuition: [28000, 35000], entry: UK_PG_ENTRY, english: IELTS_65 },
      { title: "MPH Public Health (International)", level: "postgraduate", subject: "Health & medicine", duration: "1 year", intake: "September", tuition: [24000, 30000], entry: UK_PG_ENTRY, english: IELTS_65 },
      { title: "BSc Business Management", level: "undergraduate", subject: "Business & management", duration: "3 years", intake: "September", tuition: [25000, 32000], entry: UK_UG_ENTRY, english: IELTS_65 },
    ],
  },
  {
    slug: "university-of-glasgow",
    name: "University of Glasgow",
    country: "United Kingdom",
    city: "Glasgow",
    website: "https://www.gla.ac.uk",
    summary: "One of the UK's oldest universities, with a large international community in Scotland.",
    currency: "GBP",
    courses: [
      { title: "MSc Data Analytics", level: "postgraduate", subject: "Computing & data", duration: "1 year", intake: "September", tuition: [27000, 33000], entry: UK_PG_ENTRY, english: IELTS_65 },
      { title: "MSc International Business", level: "postgraduate", subject: "Business & management", duration: "1 year", intake: "September", tuition: [25000, 31000], entry: UK_PG_ENTRY, english: IELTS_65 },
      { title: "BEng Mechanical Engineering", level: "undergraduate", subject: "Engineering", duration: "4 years", intake: "September", tuition: [27000, 34000], entry: UK_UG_ENTRY, english: IELTS_65 },
    ],
  },
  {
    slug: "kings-college-london",
    name: "King's College London",
    country: "United Kingdom",
    city: "London",
    website: "https://www.kcl.ac.uk",
    summary: "Central London university with leading health, law and AI programmes.",
    currency: "GBP",
    courses: [
      { title: "MSc Artificial Intelligence", level: "postgraduate", subject: "Computing & data", duration: "1 year", intake: "September", tuition: [35000, 43000], entry: UK_PG_ENTRY, english: IELTS_65 },
      { title: "MSc Global Health", level: "postgraduate", subject: "Health & medicine", duration: "1 year", intake: "September", tuition: [30000, 37000], entry: UK_PG_ENTRY, english: IELTS_70 },
      { title: "LLM Master of Laws", level: "postgraduate", subject: "Law", duration: "1 year", intake: "September", tuition: [30000, 38000], entry: UK_PG_ENTRY, english: IELTS_70 },
    ],
  },
  {
    slug: "coventry-university",
    name: "Coventry University",
    country: "United Kingdom",
    city: "Coventry",
    website: "https://www.coventry.ac.uk",
    summary: "Career-focused modern university with January and September intakes and lower fees.",
    currency: "GBP",
    courses: [
      { title: "MSc Data Science and Computational Intelligence", level: "postgraduate", subject: "Computing & data", duration: "1 year", intake: "January, May, September", tuition: [18000, 23000], entry: "A 2:2 honours degree or equivalent; relevant experience considered.", english: IELTS_65 },
      { title: "MBA Global", level: "mba", subject: "Business & management", duration: "1 year", intake: "January, September", tuition: [18000, 24000], entry: "A 2:2 honours degree or equivalent; work experience preferred.", english: IELTS_65 },
      { title: "BSc Adult Nursing", level: "undergraduate", subject: "Health & medicine", duration: "3 years", intake: "September", tuition: [17000, 21000], entry: UK_UG_ENTRY, english: IELTS_70 },
    ],
  },
  {
    slug: "trinity-college-dublin",
    name: "Trinity College Dublin",
    country: "Ireland",
    city: "Dublin",
    website: "https://www.tcd.ie",
    summary: "Ireland's oldest university, in the centre of Dublin's tech and finance hub.",
    currency: "EUR",
    courses: [
      { title: "MSc Computer Science (Data Science)", level: "postgraduate", subject: "Computing & data", duration: "1 year", intake: "September", tuition: [24000, 32000], entry: "A 2.1 honours degree (or equivalent) in computing or a related field.", english: IELTS_65 },
      { title: "MSc Global Health", level: "postgraduate", subject: "Health & medicine", duration: "1 year", intake: "September", tuition: [18000, 26000], entry: "A 2.1 honours degree (or equivalent) in a relevant discipline.", english: IELTS_65 },
    ],
  },
  {
    slug: "university-college-dublin",
    name: "University College Dublin",
    country: "Ireland",
    city: "Dublin",
    website: "https://www.ucd.ie",
    summary: "Ireland's largest university, home to the Smurfit Graduate Business School.",
    currency: "EUR",
    courses: [
      { title: "MSc Business Analytics", level: "postgraduate", subject: "Business & management", duration: "1 year", intake: "September", tuition: [26000, 34000], entry: "A 2.1 honours degree (or equivalent) with strong quantitative content.", english: IELTS_65 },
      { title: "MSc Data and Computational Science", level: "postgraduate", subject: "Computing & data", duration: "1 year", intake: "September", tuition: [22000, 29000], entry: "A 2.1 honours degree (or equivalent) in maths, science or engineering.", english: IELTS_65 },
    ],
  },
  {
    slug: "university-of-amsterdam",
    name: "University of Amsterdam",
    country: "Netherlands",
    city: "Amsterdam",
    website: "https://www.uva.nl",
    summary: "Research university with many English-taught bachelor's and master's programmes.",
    currency: "EUR",
    courses: [
      { title: "MSc Data Science", level: "postgraduate", subject: "Computing & data", duration: "1 year", intake: "September", tuition: [19000, 27000], feeNote: "Non-EU/EEA tuition; EU students pay the lower statutory fee.", entry: "A relevant bachelor's degree with programming and statistics.", english: IELTS_65 },
      { title: "BSc Psychology", level: "undergraduate", subject: "Social sciences", duration: "3 years", intake: "September", tuition: [12000, 17000], feeNote: "Non-EU/EEA tuition; EU students pay the lower statutory fee.", entry: "Secondary diploma equivalent to Dutch VWO, with maths.", english: IELTS_65 },
    ],
  },
  {
    slug: "tu-delft",
    name: "Delft University of Technology",
    country: "Netherlands",
    city: "Delft",
    website: "https://www.tudelft.nl",
    summary: "The Netherlands' largest technical university, strong in engineering and computer science.",
    currency: "EUR",
    courses: [
      { title: "MSc Computer Science", level: "postgraduate", subject: "Computing & data", duration: "2 years", intake: "September", tuition: [19000, 26000], feeNote: "Non-EU/EEA tuition per year.", entry: "A bachelor's degree in computer science or a closely related field, with a strong GPA.", english: IELTS_65 },
      { title: "MSc Civil Engineering", level: "postgraduate", subject: "Engineering", duration: "2 years", intake: "September", tuition: [19000, 26000], feeNote: "Non-EU/EEA tuition per year.", entry: "A bachelor's degree in civil engineering or a closely related field.", english: IELTS_65 },
    ],
  },
  {
    slug: "technical-university-of-munich",
    name: "Technical University of Munich",
    country: "Germany",
    city: "Munich",
    website: "https://www.tum.de",
    summary: "Top German technical university; charges tuition to non-EU students since 2024.",
    currency: "EUR",
    courses: [
      { title: "MSc Informatics", level: "postgraduate", subject: "Computing & data", duration: "2 years", intake: "October, April", tuition: [8000, 12000], feeNote: "Non-EU tuition charged per semester, plus a semester fee.", entry: "A relevant bachelor's degree; aptitude assessment applies.", english: IELTS_65 },
      { title: "BSc Informatics", level: "undergraduate", subject: "Computing & data", duration: "3 years", intake: "October", tuition: [4000, 6000], feeNote: "Non-EU tuition charged per semester, plus a semester fee.", entry: "A school-leaving certificate recognised as equivalent to the German Abitur.", english: "German (C1) for most bachelor's programmes." },
    ],
  },
  {
    slug: "rwth-aachen",
    name: "RWTH Aachen University",
    country: "Germany",
    city: "Aachen",
    website: "https://www.rwth-aachen.de",
    summary: "Public technical university with no tuition fees, only a semester contribution.",
    currency: "EUR",
    courses: [
      { title: "MSc Data Science", level: "postgraduate", subject: "Computing & data", duration: "2 years", intake: "October, April", tuition: [0, 700], feeNote: "No tuition fees; semester contribution only.", entry: "A relevant bachelor's degree with maths and computer science.", english: IELTS_65 },
      { title: "MSc Mechanical Engineering", level: "postgraduate", subject: "Engineering", duration: "2 years", intake: "October", tuition: [0, 700], feeNote: "No tuition fees; semester contribution only.", entry: "A bachelor's degree in mechanical engineering or similar.", english: IELTS_65 },
    ],
  },
  {
    slug: "university-of-toronto",
    name: "University of Toronto",
    country: "Canada",
    city: "Toronto",
    website: "https://www.utoronto.ca",
    summary: "Canada's largest research university, in the country's main business centre.",
    currency: "CAD",
    courses: [
      { title: "Master of Engineering (Electrical & Computer)", level: "postgraduate", subject: "Engineering", duration: "1–1.5 years", intake: "September, January", tuition: [45000, 65000], entry: "A four-year bachelor's degree in engineering with a B+ average or equivalent.", english: "IELTS 7.0 overall or equivalent." },
      { title: "BSc Computer Science", level: "undergraduate", subject: "Computing & data", duration: "4 years", intake: "September", tuition: [60000, 72000], entry: "High school diploma with strong maths; competitive admission.", english: IELTS_65 },
    ],
  },
  {
    slug: "university-of-british-columbia",
    name: "University of British Columbia",
    country: "Canada",
    city: "Vancouver",
    website: "https://www.ubc.ca",
    summary: "West-coast research university known for data science, forestry and business.",
    currency: "CAD",
    courses: [
      { title: "Master of Data Science", level: "postgraduate", subject: "Computing & data", duration: "10 months", intake: "September", tuition: [50000, 60000], feeNote: "Programme fee for the full course.", entry: "A four-year bachelor's degree with maths and programming.", english: IELTS_65 },
      { title: "MBA", level: "mba", subject: "Business & management", duration: "16 months", intake: "August", tuition: [55000, 70000], entry: "A bachelor's degree, work experience and GMAT/GRE.", english: IELTS_70 },
    ],
  },
  {
    slug: "university-of-melbourne",
    name: "University of Melbourne",
    country: "Australia",
    city: "Melbourne",
    website: "https://www.unimelb.edu.au",
    summary: "Australia's top-ranked university, with graduate-entry professional degrees.",
    currency: "AUD",
    courses: [
      { title: "Master of Information Technology", level: "postgraduate", subject: "Computing & data", duration: "2 years", intake: "February, July", tuition: [50000, 58000], entry: "A bachelor's degree in any discipline with a weighted average of at least 65%.", english: IELTS_65 },
      { title: "Master of Public Health", level: "postgraduate", subject: "Health & medicine", duration: "1.5–2 years", intake: "February, July", tuition: [45000, 53000], entry: "A bachelor's degree with relevant study or work experience.", english: IELTS_65 },
    ],
  },
  {
    slug: "monash-university",
    name: "Monash University",
    country: "Australia",
    city: "Melbourne",
    website: "https://www.monash.edu",
    summary: "Australia's largest university, strong in data science, pharmacy and business analytics.",
    currency: "AUD",
    courses: [
      { title: "Master of Data Science", level: "postgraduate", subject: "Computing & data", duration: "2 years", intake: "February, July", tuition: [48000, 56000], entry: "A bachelor's degree with a credit average (60%) or equivalent.", english: IELTS_65 },
      { title: "Master of Business Analytics", level: "postgraduate", subject: "Business & management", duration: "1.5–2 years", intake: "February, July", tuition: [48000, 57000], entry: "A bachelor's degree with a credit average (60%) or equivalent.", english: IELTS_65 },
    ],
  },
  {
    slug: "northeastern-university",
    name: "Northeastern University",
    country: "United States",
    city: "Boston",
    website: "https://www.northeastern.edu",
    summary: "Boston university known for co-op work placements built into its degrees.",
    currency: "USD",
    courses: [
      { title: "MS Data Science", level: "postgraduate", subject: "Computing & data", duration: "2 years", intake: "September, January", tuition: [30000, 45000], feeNote: "Charged per credit; annual cost varies with course load.", entry: "A bachelor's degree with maths and programming foundations.", english: IELTS_65 },
      { title: "MS Project Management", level: "postgraduate", subject: "Business & management", duration: "1.5–2 years", intake: "September, January", tuition: [25000, 38000], feeNote: "Charged per credit; annual cost varies with course load.", entry: "A bachelor's degree in any discipline.", english: IELTS_65 },
    ],
  },
  {
    slug: "arizona-state-university",
    name: "Arizona State University",
    country: "United States",
    city: "Tempe",
    website: "https://www.asu.edu",
    summary: "Large public university with a wide range of STEM degrees and lower-cost options.",
    currency: "USD",
    courses: [
      { title: "MS Computer Science", level: "postgraduate", subject: "Computing & data", duration: "1.5–2 years", intake: "August, January", tuition: [30000, 40000], entry: "A bachelor's degree in computer science or a related field, GPA 3.0+.", english: IELTS_65 },
      { title: "BS Business Data Analytics", level: "undergraduate", subject: "Business & management", duration: "4 years", intake: "August, January", tuition: [32000, 38000], entry: "High school diploma with competitive grades.", english: IELTS_60 },
    ],
  },
]
