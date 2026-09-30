import { readFile } from "node:fs/promises"
import path from "node:path"
import { classifySubject, feeToGbp, formatDuration, subjectFromAsced, subjectFromCah } from "../../lib/education/catalog.ts"
import type { StudyLevel } from "../../lib/education/types.ts"
import type { ImportBatch, ImportCourse, ImportUniversity } from "./db.ts"
import { download, fetchText, mode, normaliseName, readCsv, readXlsx, readZipCsvs, titleCase, websiteUrl, type Row } from "./io.ts"

export type SourceOptions = { cacheDir: string; files: Record<string, string | undefined>; log: (message: string) => void }

const isMba = (title: string) => /\bmba\b|business administration/i.test(title)

function course(partial: Omit<ImportCourse, "feeGbp" | "duration"> & { duration?: string | null }): ImportCourse {
  return {
    ...partial,
    duration: partial.duration ?? formatDuration(partial.durationMonths),
    feeGbp: feeToGbp(partial.tuitionMin, partial.tuitionMax, partial.currency),
  }
}

// ── United Kingdom: Discover Uni (Jisc/HESA) + GOV.UK register of student sponsors ──

const UK_DISCOVER_UNI = "https://unistatsdataset.hesa.ac.uk/api/UnistatsDatasetDownload"
const UK_SPONSOR_REGISTER_API = "https://www.gov.uk/api/content/government/publications/register-of-licensed-sponsors-students"
const UK_COUNTIES = /shire$|^(greater london|greater manchester|middlesex|surrey|kent|essex|sussex|east sussex|west sussex|cornwall|devon|dorset|norfolk|suffolk|cumbria|merseyside|tyne and wear|west midlands|south yorkshire|west yorkshire|north yorkshire|east yorkshire|county durham|durham|isle of wight|rutland|cheshire|somerset|cardiff|gwynedd|ceredigion|powys|pembrokeshire|carmarthenshire|conwy|denbighshire|flintshire|wrexham|swansea|scotland|wales|england|northern ireland|lothian|fife|highland|county antrim|county down|co antrim|co down|county londonderry|county armagh|county tyrone|county fermanagh|uk|united kingdom)$/i
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

function ukCityFromAddress(address: string) {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !UK_POSTCODE.test(part))
  for (let i = parts.length - 1; i >= 0; i--) {
    if (!UK_COUNTIES.test(parts[i]) && !/\d/.test(parts[i])) return titleCase(parts[i])
  }
  return ""
}

/** Name forms to try against the register, e.g. "University of Kent (Part of London and South East University Group)". */
function institutionNameVariants(names: string[]) {
  const out = new Set<string>()
  const add = (value: string) => {
    const n = normaliseName(value)
    if (n.split(" ").length >= 2) out.add(n)
  }
  for (const name of names.filter(Boolean)) {
    add(name)
    const bare = name.replace(/\([^)]*\)/g, " ")
    add(bare)
    for (const m of name.matchAll(/\(part of ([^)]+)\)/gi)) add(m[1])
    for (const part of bare.split(/[/,:;|]/)) add(part)
  }
  return [...out]
}

function sponsorNameVariants(name: string) {
  const full = normaliseName(name)
  const first = normaliseName(name.split(",")[0])
  return [full, full.replace(/ (higher education )?corporation$/, ""), first, first.replace(/ college$/, "")].filter(Boolean)
}

const TARIFF_BUCKETS = ["T001", "T048", "T064", "T080", "T096", "T112", "T128", "T144", "T160", "T176", "T192", "T208", "T224", "T240"]

function typicalTariff(row: Row | undefined) {
  if (!row) return null
  let cumulative = 0
  for (let i = 0; i < TARIFF_BUCKETS.length; i++) {
    cumulative += Number(row[TARIFF_BUCKETS[i]] || 0)
    if (cumulative >= 50) {
      const low = i === 0 ? 1 : Number(TARIFF_BUCKETS[i].slice(1))
      const next = TARIFF_BUCKETS[i + 1]
      return next ? `${low}–${Number(next.slice(1)) - 1}` : `${low}+`
    }
  }
  return null
}

export async function loadUk({ cacheDir, files, log }: SourceOptions): Promise<ImportBatch> {
  const zipFile = files.ukZip ?? (await download(UK_DISCOVER_UNI, path.join(cacheDir, "discover-uni.zip")))
  let sponsorFile = files.ukSponsors
  if (!sponsorFile) {
    const meta = JSON.parse(await fetchText(UK_SPONSOR_REGISTER_API)) as { details?: { attachments?: Array<{ url?: string }> } }
    const url = meta.details?.attachments?.map((a) => a.url).find((u) => u?.endsWith(".csv"))
    if (!url) throw new Error("Could not find the GOV.UK student sponsor register CSV")
    sponsorFile = await download(url, path.join(cacheDir, "uk-student-sponsors.csv"))
  }
  const data = await readZipCsvs(zipFile, ["KISCOURSE.csv", "INSTITUTION.csv", "KISAIM.csv", "SBJ.csv", "TARIFF.csv"])
  const sponsors = (await readCsv(sponsorFile)).filter((row) => row.Route === "Student")
  log(`  ${data["KISCOURSE.csv"].length} Discover Uni courses, ${sponsors.length} student sponsors`)

  const sponsorByName = new Map<string, Row>()
  const schoolLast = [...sponsors].sort((a, b) => Number(a["Sponsor Type"] === "Independent school") - Number(b["Sponsor Type"] === "Independent school"))
  for (const row of schoolLast) {
    for (const variant of sponsorNameVariants(row["Sponsor Name"])) if (!sponsorByName.has(variant)) sponsorByName.set(variant, row)
  }
  const aims = new Map(data["KISAIM.csv"].map((row) => [row.KISAIMCODE, row.KISAIMLABEL.trim()]))
  const key = (row: Row) => `${row.PUBUKPRN}:${row.KISCOURSEID}:${row.KISMODE}`
  const subjects = new Map<string, string>()
  for (const row of data["SBJ.csv"]) if (!subjects.has(key(row))) subjects.set(key(row), row.SBJ)
  const tariffs = new Map(data["TARIFF.csv"].map((row) => [key(row), row]))

  const courses: ImportCourse[] = []
  const used = new Set<string>()
  for (const row of data["KISCOURSE.csv"]) {
    if (row.KISMODE !== "01" || row.DISTANCE !== "0" || !row.TITLE) continue
    const aim = aims.get(row.KISAIMCODE) ?? ""
    const title = [aim, row.HONOURS === "1" ? "(Hons)" : "", row.TITLE].filter(Boolean).join(" ")
    const years = Number(row.NUMSTAGE)
    const tariff = typicalTariff(tariffs.get(key(row)))
    const entry = [
      tariff ? `Typical entrants hold around ${tariff} UCAS tariff points (or an international equivalent).` : null,
      row.FOUNDATION === "1" ? "An optional foundation year is available." : row.FOUNDATION === "2" ? "Includes a foundation year." : null,
      row.SANDWICH === "1" ? "Optional placement year." : row.SANDWICH === "2" ? "Includes a placement year." : null,
      row.YEARABROAD === "1" ? "Optional year abroad." : row.YEARABROAD === "2" ? "Includes a year abroad." : null,
    ].filter(Boolean)
    used.add(row.PUBUKPRN)
    courses.push(
      course({
        externalId: key(row),
        universityExternalId: row.PUBUKPRN,
        title,
        level: "undergraduate",
        subject: subjectFromCah(subjects.get(key(row)), row.TITLE),
        durationMonths: Number.isFinite(years) && years > 0 ? years * 12 : null,
        intake: null,
        tuitionMin: null,
        tuitionMax: null,
        currency: "GBP",
        feeNote: "International fees aren't published in the national dataset. Check the university's fees page.",
        entryRequirements: entry.length ? entry.join(" ") : null,
        englishRequirement: null,
        courseUrl: websiteUrl(row.CRSEURL) ? (/^https?:/i.test(row.CRSEURL) ? row.CRSEURL : `https://${row.CRSEURL}`) : null,
      }),
    )
  }

  const universities: ImportUniversity[] = []
  const seen = new Set<string>()
  for (const row of data["INSTITUTION.csv"]) {
    if (!used.has(row.PUBUKPRN) || seen.has(row.PUBUKPRN)) continue
    seen.add(row.PUBUKPRN)
    const name = row.FIRST_TRADING_NAME || row.LEGAL_NAME
    const names = institutionNameVariants([row.FIRST_TRADING_NAME, row.LEGAL_NAME, ...row.OTHER_NAMES.split(/[;|]/)])
    const sponsor = names.map((n) => sponsorByName.get(n)).find(Boolean)
    universities.push({
      externalId: row.PUBUKPRN,
      name,
      country: "United Kingdom",
      city: sponsor?.["Town/City"] ? titleCase(sponsor["Town/City"]) : ukCityFromAddress(row.PROVADDRESS),
      website: websiteUrl(row.PROVURL),
      summary: null,
      studentSponsor: Boolean(sponsor),
      sponsorNote: sponsor ? `Licensed Student sponsor (${sponsor.Status}) on the GOV.UK register` : null,
      institutionType: sponsor?.["Sponsor Type"] || null,
    })
  }
  return { source: "hesa-discover-uni", universities, courses }
}

// ── Australia: CRICOS ──

const CRICOS_BASE = "https://data.gov.au/data/dataset/e5ae7059-bfa8-4fa4-a5c0-c13cf3520193/resource"
const CRICOS_FILES = {
  courses: `${CRICOS_BASE}/48cacf69-2082-415e-9595-f17d0c3a4af0/download/cricos-courses.csv`,
  institutions: `${CRICOS_BASE}/7f6941f3-5327-4db7-b556-5f16d77f63c1/download/cricos-institutions.csv`,
  courseLocations: `${CRICOS_BASE}/4cd2de02-8ba3-4eb2-bac2-fe272cae3f5f/download/cricos-course-locations.csv`,
}

function cricosLevel(row: Row): StudyLevel | null {
  const level = row["Course Level"]
  const name = row["Course Name"]
  if (row["Foundation Studies"] === "Yes") return "foundation"
  if (["Bachelor Degree", "Bachelor Honours Degree", "Associate Degree"].includes(level)) return "undergraduate"
  if (["Masters Degree (Coursework)", "Masters Degree (Extended)", "Graduate Certificate", "Graduate Diploma"].includes(level)) {
    return isMba(name) ? "mba" : "postgraduate"
  }
  if (level === "Masters Degree (Research)" || level === "Doctoral Degree") return "phd"
  return null
}

export async function loadAu({ cacheDir, log }: SourceOptions): Promise<ImportBatch> {
  const [courseRows, institutionRows, locationRows] = await Promise.all([
    download(CRICOS_FILES.courses, path.join(cacheDir, "cricos-courses.csv")).then((f) => readCsv(f)),
    download(CRICOS_FILES.institutions, path.join(cacheDir, "cricos-institutions.csv")).then((f) => readCsv(f)),
    download(CRICOS_FILES.courseLocations, path.join(cacheDir, "cricos-course-locations.csv")).then((f) => readCsv(f)),
  ])
  log(`  ${courseRows.length} CRICOS courses, ${institutionRows.length} providers`)
  const cityByCourse = new Map<string, string>()
  for (const row of locationRows) if (!cityByCourse.has(row["CRICOS Course Code"])) cityByCourse.set(row["CRICOS Course Code"], titleCase(row["Location City"]))

  const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 })
  const courses: ImportCourse[] = []
  const citiesByProvider = new Map<string, string[]>()
  for (const row of courseRows) {
    if (row.Expired === "Yes") continue
    const level = cricosLevel(row)
    if (!level) continue
    const weeks = Number(row["Duration (Weeks)"])
    const total = Number(row["Tuition Fee"])
    const months = Number.isFinite(weeks) && weeks > 0 ? Math.max(1, Math.round((weeks / 52) * 12)) : null
    const annual = Number.isFinite(total) && total > 0 ? Math.round(weeks >= 52 ? (total * 52) / weeks : total) : null
    const provider = row["CRICOS Provider Code"]
    const city = cityByCourse.get(row["CRICOS Course Code"])
    if (city) citiesByProvider.set(provider, [...(citiesByProvider.get(provider) ?? []), city])
    courses.push(
      course({
        externalId: row["CRICOS Course Code"],
        universityExternalId: provider,
        title: row["Course Name"],
        level,
        subject: subjectFromAsced(row["Field of Education 1 Broad Field"], row["Field of Education 1 Narrow Field"], row["Course Name"]),
        durationMonths: months,
        intake: null,
        tuitionMin: annual,
        tuitionMax: annual,
        currency: "AUD",
        feeNote: annual && weeks ? `${aud.format(total)} total tuition over ${formatDuration(months, "")} (CRICOS).` : null,
        entryRequirements: null,
        englishRequirement: null,
        courseUrl: null,
      }),
    )
  }
  const providers = new Set(courses.map((c) => c.universityExternalId))
  const universities: ImportUniversity[] = institutionRows
    .filter((row) => providers.has(row["CRICOS Provider Code"]))
    .map((row) => ({
      externalId: row["CRICOS Provider Code"],
      name: row["Trading Name"] || row["Institution Name"],
      country: "Australia",
      city: mode(citiesByProvider.get(row["CRICOS Provider Code"]) ?? []) ?? titleCase(row["Postal Address City"]),
      website: websiteUrl(row.Website),
      summary: null,
      studentSponsor: true,
      sponsorNote: `CRICOS-registered provider ${row["CRICOS Provider Code"]}, so it can enrol student visa holders`,
      institutionType: row["Institution Type"] === "Government" ? "Public" : row["Institution Type"] || null,
    }))
  return { source: "cricos", universities, courses }
}

// ── Ireland: TrustEd Ireland list + Interim List of Eligible Programmes ──

const IE_PAGE = "https://www.irishimmigration.ie/coming-to-study-in-ireland/what-are-my-study-options/a-third-level-course-or-a-language-course/"
const IE_FALLBACK = {
  trusted: "https://www.trustedireland.ie/sites/default/files/2026-02/trusted-ireland-he-list-of-eligible-programmes.xlsx",
  ilep: "https://www.irishimmigration.ie/wp-content/uploads/2026/09/Interim-List-of-Eligible-Programmes-updated-22-September-2026.xlsx",
}
const IE_CITIES = ["Dublin", "Cork", "Galway", "Limerick", "Waterford", "Sligo", "Carlow", "Athlone", "Letterkenny", "Tralee", "Dundalk", "Maynooth", "Wexford", "Kilkenny", "Castlebar", "Dún Laoghaire", "Dun Laoghaire", "Thurles", "Clonmel", "Ennis", "Drogheda", "Killybegs", "Mountbellew", "Blanchardstown", "Tallaght"]
const FREE_MAIL = /(gmail|yahoo|hotmail|outlook|eircom|live)\./i

function ieCity(address: string, provider: string) {
  const text = `${provider} ${address}`
  const hit = IE_CITIES.find((city) => new RegExp(`\\b${city}\\b`, "i").test(text))
  if (hit) return hit === "Dun Laoghaire" || hit === "Blanchardstown" || hit === "Tallaght" ? "Dublin" : hit
  const parts = address.split(",").map((p) => p.replace(/\b[A-Z]\d{2}\s?[A-Z0-9]{4}\b/g, "").replace(/\.$/, "").trim()).filter(Boolean)
  return parts.at(-1)?.replace(/^Co\.?\s+/i, "") ?? ""
}

function ieLevel(programmeType: string, nfq: string, title: string): StudyLevel | null {
  if (/foundation/i.test(programmeType)) return "foundation"
  const level = Number(nfq.match(/\b(5|6|7|8|9|10)\b/)?.[1])
  if (level === 10 || /\b(phd|doctor)/i.test(title)) return "phd"
  if (level === 9) return isMba(title) ? "mba" : "postgraduate"
  if (level === 8) return /higher diploma|graduate diploma|postgraduate/i.test(title) ? "postgraduate" : "undergraduate"
  if (level === 6 || level === 7) return "undergraduate"
  return null
}

function ieDurationMonths(value: string, level: StudyLevel) {
  if (level === "phd" && /research/i.test(value)) return 48
  const ects = Number(value.match(/(\d+)\s*(ects)?/i)?.[1])
  if (!Number.isFinite(ects) || ects < 30 || /per year/i.test(value)) return null
  if (level === "postgraduate" || level === "mba") return ects >= 90 && ects < 120 ? 12 : Math.round((ects / 60) * 12)
  return Math.round((ects / 60) * 12)
}

async function ieFileUrls() {
  try {
    const html = await fetchText(IE_PAGE)
    const links = [...html.matchAll(/href="([^"]+\.xlsx)"/gi)].map((m) => m[1])
    return {
      trusted: links.find((l) => /trusted-ireland-he/i.test(l)) ?? IE_FALLBACK.trusted,
      ilep: links.find((l) => /interim-list-of-eligible/i.test(l)) ?? IE_FALLBACK.ilep,
    }
  } catch {
    return IE_FALLBACK
  }
}

export async function loadIe({ cacheDir, files, log }: SourceOptions): Promise<ImportBatch> {
  const urls = await ieFileUrls()
  const trustedFile = files.ieTrusted ?? (await download(urls.trusted, path.join(cacheDir, "ie-trusted.xlsx")))
  const ilepFile = files.ieIlep ?? (await download(urls.ilep, path.join(cacheDir, "ie-ilep.xlsx")))
  const lists = [
    { rows: await readXlsx(trustedFile), note: "TrustEd Ireland authorised provider" },
    { rows: await readXlsx(ilepFile), note: "Listed on Ireland's Interim List of Eligible Programmes (ILEP)" },
  ]
  const universities = new Map<string, ImportUniversity>()
  const courses: ImportCourse[] = []
  const seenProgrammes = new Set<string>()
  for (const list of lists) {
    const headerIndex = list.rows.findIndex((row) => /programme ref/i.test(row.A ?? ""))
    for (const row of list.rows.slice(headerIndex + 1)) {
      const [ref, type, provider, address, email, title, nfq, duration] = [row.A, row.B, row.C, row.D, row.E, row.H, row.M, row.K].map((v) => (v ?? "").trim())
      if (!ref || !provider || !title || /english|professional/i.test(type)) continue
      const level = ieLevel(type, nfq, title)
      if (!level) continue
      const dedupe = `${normaliseName(provider)}|${normaliseName(title)}`
      if (seenProgrammes.has(dedupe)) continue
      seenProgrammes.add(dedupe)
      const uniKey = normaliseName(provider)
      if (!universities.has(uniKey)) {
        const domain = email.split(/[;,\s]+/).map((e) => e.split("@")[1]).find((d) => d && !FREE_MAIL.test(d))
        universities.set(uniKey, {
          externalId: uniKey,
          name: provider,
          country: "Ireland",
          city: ieCity(address, provider),
          website: websiteUrl(domain ? `www.${domain.replace(/^www\./, "")}` : null),
          summary: null,
          studentSponsor: true,
          sponsorNote: list.note,
          institutionType: null,
        })
      }
      courses.push(
        course({
          externalId: ref,
          universityExternalId: uniKey,
          title,
          level,
          subject: classifySubject(title),
          durationMonths: ieDurationMonths(duration, level),
          intake: null,
          tuitionMin: null,
          tuitionMax: null,
          currency: "EUR",
          feeNote: "Non-EU tuition isn't published in the national list. Check the university's fees page.",
          entryRequirements: null,
          englishRequirement: null,
          courseUrl: null,
        }),
      )
    }
  }
  log(`  ${courses.length} eligible programmes from ${universities.size} providers`)
  return { source: "ie-eligible-programmes", universities: [...universities.values()], courses }
}

// ── Netherlands: DUO higher education programme register ──

const NL_DUO = "https://onderwijsdata.duo.nl/dataset/7c0686f4-b5c2-418e-8e44-7be0057d8084/resource/ffffa7ad-e6a2-4ba7-9fc2-a09df4128555/download/ho_opleidingsoverzicht.csv"

/** Official English names international applicants search for, keyed by normalised DUO name. */
const NL_ENGLISH: Record<string, [name: string, city: string]> = {
  "erasmus universiteit rotterdam": ["Erasmus University Rotterdam", "Rotterdam"],
  "radboud universiteit nijmegen": ["Radboud University", "Nijmegen"],
  "rijksuniversiteit groningen": ["University of Groningen", "Groningen"],
  "technische universiteit eindhoven": ["Eindhoven University of Technology", "Eindhoven"],
  "technische universiteit delft": ["Delft University of Technology", "Delft"],
  "universiteit leiden": ["Leiden University", "Leiden"],
  "universiteit maastricht": ["Maastricht University", "Maastricht"],
  "universiteit utrecht": ["Utrecht University", "Utrecht"],
  "universiteit van amsterdam": ["University of Amsterdam", "Amsterdam"],
  "vu vrije universiteit amsterdam": ["Vrije Universiteit Amsterdam", "Amsterdam"],
  "universiteit twente": ["University of Twente", "Enschede"],
  "tilburg university": ["Tilburg University", "Tilburg"],
  "wageningen university": ["Wageningen University & Research", "Wageningen"],
  "open universiteit": ["Open University of the Netherlands", "Heerlen"],
  "hogeschool van amsterdam": ["Amsterdam University of Applied Sciences", "Amsterdam"],
  "hogeschool leiden": ["Leiden University of Applied Sciences", "Leiden"],
  "hogeschool rotterdam": ["Rotterdam University of Applied Sciences", "Rotterdam"],
  "hogeschool utrecht": ["HU University of Applied Sciences Utrecht", "Utrecht"],
  "de haagse hogeschool": ["The Hague University of Applied Sciences", "The Hague"],
  "hanzehogeschool groningen": ["Hanze University of Applied Sciences", "Groningen"],
  "han university of applied sciences": ["HAN University of Applied Sciences", "Arnhem"],
  "fontys hogeschool": ["Fontys University of Applied Sciences", "Eindhoven"],
  "saxion hogeschool": ["Saxion University of Applied Sciences", "Enschede"],
  "avans hogeschool": ["Avans University of Applied Sciences", "Breda"],
  "zuyd hogeschool": ["Zuyd University of Applied Sciences", "Maastricht"],
  "nhl stenden hogeschool": ["NHL Stenden University of Applied Sciences", "Leeuwarden"],
  "aeres hogeschool": ["Aeres University of Applied Sciences", "Dronten"],
  "breda university of applied sciences": ["Breda University of Applied Sciences", "Breda"],
  "hotelschool the hague": ["Hotelschool The Hague", "The Hague"],
  "koninklijk conservatorium": ["Royal Conservatoire The Hague", "The Hague"],
  "koninklijke academie van beeldende kunsten": ["Royal Academy of Art, The Hague", "The Hague"],
  "reinwardt academie": ["Reinwardt Academy", "Amsterdam"],
  "nederlandse filmacademie": ["Netherlands Film Academy", "Amsterdam"],
  "academie voor theater en dans": ["Academy of Theatre and Dance", "Amsterdam"],
}

function nlCity(value: string) {
  const city = titleCase(value).replace(/^'S-/, "'s-")
  return city === "'s-Gravenhage" ? "The Hague" : city
}

function nlLevel(niveau: string, title: string): StudyLevel | null {
  if (/-(BA|AD)$/.test(niveau)) return "undergraduate"
  if (/-(MA|PM)$/.test(niveau)) return isMba(title) ? "mba" : "postgraduate"
  return null
}

export async function loadNl({ cacheDir, log }: SourceOptions): Promise<ImportBatch> {
  const file = await download(NL_DUO, path.join(cacheDir, "duo-ho.csv"))
  const text = await readFile(file, "utf8")
  const delimiter = text.slice(0, 500).split(";").length > text.slice(0, 500).split(",").length ? ";" : ","
  const allRows = await readCsv(file, delimiter)
  const providerCities = new Map<string, string[]>()
  for (const row of allRows) {
    if (row.ONDERWIJSLOCATIEPLAATS) providerCities.set(row.ONDERWIJSAANBIEDERID, [...(providerCities.get(row.ONDERWIJSAANBIEDERID) ?? []), nlCity(row.ONDERWIJSLOCATIEPLAATS)])
  }
  const today = new Date().toISOString().slice(0, 10)
  const universities = new Map<string, ImportUniversity & { cities: string[] }>()
  const courses: ImportCourse[] = []
  const seen = new Set<string>()
  for (const row of allRows) {
    if (row.SOORT !== "OPLEIDING" || !row.VOERTAAL.includes("ENG") || row.VORM === "DEELTIJD") continue
    if ((row.EINDDATUM && row.EINDDATUM <= today) || (row.AANGEBODEN_OPLEIDING_EINDDATUM && row.AANGEBODEN_OPLEIDING_EINDDATUM <= today)) continue
    const title = row.INTERNATIONALE_NAAM || row.EIGENNAAM_ENGELS || row.NAAM_LANG
    const level = nlLevel(row.NIVEAU, title)
    if (!level || !title) continue
    const city = row.ONDERWIJSLOCATIEPLAATS ? nlCity(row.ONDERWIJSLOCATIEPLAATS) : ""
    const dutchName = row.ONDERWIJSAANBIEDER_NAAM.replace(/^Stichting\s+/i, "").replace(/_/g, " ").replace(/\s*\(.*$/, "").replace(/\s+/g, " ").trim()
    const uniKey = normaliseName(dutchName)
    const english = NL_ENGLISH[uniKey]
    const dedupe = `${uniKey}|${row.ERKENDEOPLEIDINGSCODE}|${city}|${row.NIVEAU}`
    if (seen.has(dedupe)) continue
    seen.add(dedupe)
    const ects = Number(row.STUDIELAST)
    const uni = universities.get(uniKey) ?? {
      externalId: uniKey,
      name: english?.[0] ?? dutchName,
      country: "Netherlands",
      city: english?.[1] ?? "",
      website: websiteUrl(row.WEBSITE),
      summary: null,
      studentSponsor: false,
      sponsorNote: null,
      institutionType: row.NIVEAU.startsWith("WO") ? "Research university" : "University of applied sciences",
      cities: [],
    }
    uni.cities.push(...(city ? [city] : providerCities.get(row.ONDERWIJSAANBIEDERID) ?? []))
    universities.set(uniKey, uni)
    courses.push(
      course({
        externalId: row.AANGEBODEN_OPLEIDINGCODE ? `${row.AANGEBODEN_OPLEIDINGCODE}:${row.OPLEIDINGSEENHEIDCODE}` : dedupe,
        universityExternalId: uniKey,
        title,
        level,
        subject: classifySubject(title),
        durationMonths: Number.isFinite(ects) && ects > 0 ? Math.round((ects / 60) * 12) : null,
        intake: null,
        tuitionMin: null,
        tuitionMax: null,
        currency: "EUR",
        feeNote: "Non-EU (institutional) fees aren't in the national register. Check the university's fees page.",
        entryRequirements: null,
        englishRequirement: null,
        courseUrl: row.WEBSITE ? (/^https?:/i.test(row.WEBSITE) ? row.WEBSITE : `https://${row.WEBSITE}`) : null,
      }),
    )
  }
  log(`  ${courses.length} English-taught programmes from ${universities.size} institutions`)
  return {
    source: "duo-ho",
    universities: [...universities.values()].map(({ cities, ...uni }) => ({ ...uni, city: uni.city || (mode(cities) ?? "") })),
    courses,
  }
}

// ── Canada: IRCC designated learning institutions (institutions only) ──

const CA_DLI = "https://www.canada.ca/content/dam/ircc/documents/json/dli/dli-full-list.json"

type DliRow = { Province: string; Institution: string; "DLI #": string; City: string; Campus: string; "Grad Program": string; PGWP: string; "Public/Private": string }

export async function loadCa({ cacheDir, files, log }: SourceOptions): Promise<ImportBatch> {
  let file = files.caDli
  if (!file) {
    try {
      file = await download(CA_DLI, path.join(cacheDir, "ca-dli.json"))
    } catch (error) {
      throw new Error(`${(error as Error).message}. canada.ca often blocks scripted downloads; save the JSON from a browser and pass --ca-file <path>.`)
    }
  }
  const raw = JSON.parse(await readFile(file, "utf8")) as { data?: DliRow[] } | DliRow[]
  const rows = Array.isArray(raw) ? raw : raw.data ?? []
  const grouped = new Map<string, DliRow[]>()
  for (const row of rows) {
    const key = `${normaliseName(row.Institution)}|${row.Province}`
    grouped.set(key, [...(grouped.get(key) ?? []), row])
  }
  const universities: ImportUniversity[] = [...grouped.entries()].map(([key, campuses]) => {
    const first = campuses[0]
    const dlis = [...new Set(campuses.map((c) => c["DLI #"]))]
    const cities = [...new Set(campuses.flatMap((c) => c.City.split(",").map((city) => city.trim())).filter(Boolean))]
    const pgwp = campuses.some((c) => c.PGWP === "Yes")
    return {
      externalId: key,
      name: first.Institution,
      country: "Canada",
      city: cities.find((city) => first.Institution.toLowerCase().includes(city.toLowerCase())) ?? mode(campuses.map((c) => c.City.split(",")[0].trim())) ?? "",
      website: null,
      summary: [
        `${first["Public/Private"]} in ${first.Province}${cities.length > 1 ? ` with campuses in ${cities.slice(0, 6).join(", ")}` : ""}.`,
        pgwp ? "Offers programmes that can lead to a post-graduation work permit (PGWP)." : "Check each programme's PGWP eligibility before applying.",
        campuses.some((c) => c["Grad Program"] === "Yes") ? "Offers graduate (master's or doctoral) programmes." : null,
      ]
        .filter(Boolean)
        .join(" "),
      studentSponsor: true,
      sponsorNote: `Designated learning institution (DLI ${dlis.slice(0, 3).join(", ")}${dlis.length > 3 ? "…" : ""})`,
      institutionType: first["Public/Private"].replace(/ institution$/i, "") || null,
    }
  })
  log(`  ${rows.length} DLI campuses grouped into ${universities.length} institutions`)
  return { source: "ircc-dli", universities, courses: [] }
}
