// Shared by the app and scripts/import-education.ts, which runs under plain Node,
// so this file must stay free of runtime imports.

export const SUBJECTS = [
  "Business & management",
  "Computing & data",
  "Engineering",
  "Health & medicine",
  "Law",
  "Social sciences",
  "Sciences & maths",
  "Creative arts & design",
  "Humanities & languages",
  "Education & teaching",
  "Architecture & built environment",
  "Environment & agriculture",
  "Hospitality & tourism",
] as const
export type Subject = (typeof SUBJECTS)[number]

export const GENERAL_SUBJECT = "General & combined studies"

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
export const DURATION_BANDS = ["Up to 1 year", "1–2 years", "Over 2 years"] as const
export const BUDGET_BANDS = ["No tuition fees", "Under £15k", "£15k–£25k", "£25k–£35k", "Over £35k", "Fees on request"] as const

/** Rough conversion so fees in different currencies can share one budget filter. */
export const GBP_RATE: Record<string, number> = { GBP: 1, EUR: 0.85, USD: 0.79, CAD: 0.58, AUD: 0.52 }

const SUBJECT_RULES: Array<[Subject, RegExp]> = [
  ["Law", /\b(law|laws|legal|llb|llm|bcl|jurisprudence|solicitor|barrister)\b/],
  ["Health & medicine", /medicine|medical|nursing|nurse|midwi|pharma|dentist|dental|physiotherap|occupational therap|radiograph|radiother|radiation therap|paramedic|health|clinical|biomedical|optom|podiatr|speech and language|nutrition|dietetic|veterinary|surgery|surgical|psychotherap|psychiatr|anatomy|physician|oncology|cancer|orthoptic|orthodont|audiolog|chiropract|osteopath|sonograph|prosthetic|healthcare|dentistry|cardio|rehabilitation|dementia|paediatric|pediatric|epidemiolog|gerontolog|palliative|therapy|neonat|obstetric|ophthalm|patholog|survivorship|dermatolog|radiolog|imaging|magnetic resonance|addiction/],
  ["Computing & data", /comput|software|\bdata\b|information technology|information and communication|communication technolog|\bict\b|\bit\b|cyber|artificial intelligence|machine learning|informatics|games (development|programming|design and development)|web development|cloud|information systems|digital technolog|\bnetwork|\bai\b|embedded system|speech technolog|game technolog/],
  ["Engineering", /engineer|mechatron|robotic|electronic|electrical|aerospace|aeronaut|automotive|manufactur|mechanical|civil|materials science|energy|renewable|nanotech|telecommunic|motorsport|avionic|aircraft|marine technology|naval|systems and control|fire safety|recycling technolog/],
  ["Architecture & built environment", /architect|construction|surveying|urban|planning|built environment|real estate|property|building|interior architecture/],
  ["Education & teaching", /education|teaching|teacher|pedagog|early childhood|early years|tesol|\btefl\b|montessori|childhood studies/],
  ["Hospitality & tourism", /hospitality|touris|hotel|culinary|cookery|events management|event management|travel|leisure|gastronom|patisserie|aviation management/],
  ["Business & management", /business|management|marketing|accounting|accountancy|finance|financial|banking|commerce|entrepreneur|\bmba\b|supply chain|logistics|human resource|retail|fintech|procurement|leadership|administration|\bhrm\b|trade|insurance|economics and finance|investment|\brisk\b|strategy|competition|regulation|organi[sz]ation|operations/],
  ["Creative arts & design", /\bart\b|fine art|design|music|drama|theatre|theater|dance|film|animation|photograph|fashion|media|journalism|creative|illustration|graphic|visual|acting|performance|publishing|broadcast|screen|songwriting|audio|sound|game art|cinema|textile|craft|jewell?ery|comics|advertising|communication|opera|choreograph|sonology|imagineering|\bbmus\b/],
  ["Environment & agriculture", /agricult|environment|sustainab|ecology|conservation|forestry|horticult|geograph|climate|marine|food|animal science|animal behaviour|equine|earth science|oceanograph|wildlife|zoo|agri|land management|water|geoscience|circular economy|rural|hydrolog/],
  ["Social sciences", /psycholog|sociolog|politic|international relations|economics|econometric|anthropolog|antropolog|criminolog|social|policy|development studies|development practice|gender|youth|community|counselling|public administration|public affairs|global studies|european studies|international studies|governance|security studies|peace|conflict|reconciliation|migration|human rights|demograph|population|behaviour|crimin|\brace\b|ethnic|disability|deaf|psychoanaly|employment|child protection|welfare|adolescen|society|societal|minorities|dispute resolution|equality|international development|war studies|security|terror|intelligence stud|strategic studies/],
  ["Humanities & languages", /history|philosoph|theolog|religio|divinity|biblical|ecumenic|literature|literary|english|language|linguistic|multilingual|classic|greek|latin|hebrew|jewish|oriental|near eastern|middle east|hispanic|french|german|spanish|italian|chinese|japanese|arabic|korean|russian|irish|celtic|gaelic|welsh|translation|interpreting|archaeolog|liberal arts|humanities|writing|museum|heritage|ancient|medieval|cultur|american studies|asian studies|library|librarian|letters|texts|ethics|consciousness|gaeilge|\blogic\b/],
  ["Sciences & maths", /math|statistic|physics|chemistry|chemical|biolog|bioscience|biochem|genetic|microbio|neuroscience|geolog|astronom|astrophys|science|actuarial|biotechnolog|forensic|sport|exercise|kinesiology|pharmacology|immunolog|molecular|quantum|analytics|botan/],
]

export function classifySubject(title: string): string {
  const text = ` ${title.toLowerCase().replace(/&/g, " and ")} `
  for (const [subject, pattern] of SUBJECT_RULES) {
    if (pattern.test(text)) return subject
  }
  return GENERAL_SUBJECT
}

const CAH_SUBJECT: Record<string, Subject> = {
  CAH01: "Health & medicine",
  CAH02: "Health & medicine",
  CAH03: "Sciences & maths",
  CAH04: "Social sciences",
  CAH05: "Health & medicine",
  CAH06: "Environment & agriculture",
  CAH07: "Sciences & maths",
  CAH09: "Sciences & maths",
  CAH10: "Engineering",
  CAH11: "Computing & data",
  CAH13: "Architecture & built environment",
  CAH15: "Social sciences",
  CAH16: "Law",
  CAH17: "Business & management",
  CAH19: "Humanities & languages",
  CAH20: "Humanities & languages",
  CAH22: "Education & teaching",
  CAH24: "Creative arts & design",
  CAH25: "Creative arts & design",
  CAH26: "Environment & agriculture",
}

/** UK Common Aggregation Hierarchy code, e.g. "CAH17-01-06". */
export function subjectFromCah(code: string | undefined, title: string): string {
  if (!code) return classifySubject(title)
  if (code.startsWith("CAH17-01-06")) return "Hospitality & tourism"
  return CAH_SUBJECT[code.slice(0, 5)] ?? classifySubject(title)
}

/** Australian ASCED fields, e.g. broad "09 - Society and Culture", narrow "0909 - Law". */
export function subjectFromAsced(broad: string, narrow: string, title: string): string {
  const b = broad.slice(0, 2)
  const n = narrow.slice(0, 4)
  switch (b) {
    case "01":
      return "Sciences & maths"
    case "02":
      return "Computing & data"
    case "03":
      return "Engineering"
    case "04":
      return "Architecture & built environment"
    case "05":
      return "Environment & agriculture"
    case "06":
      return "Health & medicine"
    case "07":
      return "Education & teaching"
    case "08":
      return n === "0807" ? "Hospitality & tourism" : "Business & management"
    case "09":
      if (n === "0909" || n === "0911") return "Law"
      if (n === "0913" || n === "0915" || n === "0917") return "Humanities & languages"
      if (n === "0921") return "Sciences & maths"
      return "Social sciences"
    case "10":
      return "Creative arts & design"
    case "11":
      return "Hospitality & tourism"
    default:
      return classifySubject(title)
  }
}

/** Parses free-text durations such as "1 year full-time", "18 months" or "3–4 years". */
export function durationMonthsFromText(text: string | null | undefined): number | null {
  const value = (text ?? "").toLowerCase()
  const n = Number(value.match(/\d+(?:\.\d+)?/)?.[0])
  if (!Number.isFinite(n) || n <= 0) return null
  if (value.includes("month")) return Math.round(n)
  if (value.includes("week")) return Math.max(1, Math.round((n / 52) * 12))
  return Math.round(n * 12)
}

export function formatDuration(months: number | null, suffix = " full-time"): string | null {
  if (months == null || months <= 0) return null
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}${suffix}`
  const years = Math.round((months / 12) * 2) / 2
  return `${years} year${years === 1 ? "" : "s"}${suffix}`
}

export function feeToGbp(min: number | null, max: number | null, currency: string): number | null {
  const fee = min ?? max
  if (fee == null) return null
  return Math.round(fee * (GBP_RATE[currency.toUpperCase()] ?? 1))
}

export function durationBandSql(column: string) {
  return `case when ${column} is null then null when ${column} <= 12 then '${DURATION_BANDS[0]}' when ${column} <= 24 then '${DURATION_BANDS[1]}' else '${DURATION_BANDS[2]}' end`
}

export function budgetBandSql(column: string) {
  return `case when ${column} is null then '${BUDGET_BANDS[5]}' when ${column} = 0 then '${BUDGET_BANDS[0]}' when ${column} < 15000 then '${BUDGET_BANDS[1]}' when ${column} < 25000 then '${BUDGET_BANDS[2]}' when ${column} < 35000 then '${BUDGET_BANDS[3]}' else '${BUDGET_BANDS[4]}' end`
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export const DATA_SOURCES: Record<string, { label: string; country: string; licence: string; url: string }> = {
  "hesa-discover-uni": { label: "Discover Uni (Jisc/HESA)", country: "United Kingdom", licence: "CC BY 4.0", url: "https://discoveruni.gov.uk" },
  cricos: { label: "CRICOS register", country: "Australia", licence: "CC BY 2.5 AU", url: "https://cricos.education.gov.au" },
  "ie-eligible-programmes": { label: "TrustEd Ireland and ILEP programme lists", country: "Ireland", licence: "Public list", url: "https://www.irishimmigration.ie" },
  "duo-ho": { label: "DUO higher education programmes", country: "Netherlands", licence: "CC BY 4.0", url: "https://onderwijsdata.duo.nl" },
  "ircc-dli": { label: "IRCC designated learning institutions list", country: "Canada", licence: "Open Government Licence – Canada", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html" },
}
