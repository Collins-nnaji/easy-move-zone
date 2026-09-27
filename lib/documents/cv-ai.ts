import { randomUUID } from "node:crypto"
import { getAiProvider, getAzureOpenAiConfig, openaiClient } from "@/lib/ai/openai"
import { autoBullet } from "@/lib/documents/bullets"
import { sectionsFromParsed, type CvSection } from "@/lib/documents/cv-sections"

export type ParsedCV = {
  personalInfo?: {
    name?: string
    email?: string
    phone?: string
    location?: string
    linkedin?: string
  }
  summary?: string
  experiences?: Array<{
    company?: string
    position?: string
    duration?: string
    description?: string
  }>
  education?: Array<{
    institution?: string
    degree?: string
    field?: string
    year?: string
  }>
  skills?: string[]
  targetRoles?: string[]
  industries?: string[]
  jobKeywords?: string[]
  remotePreference?: "remote" | "hybrid" | "onsite" | "flexible"
  visaRequired?: boolean
  certifications?: Array<{ name?: string; issuer?: string; date?: string; expiryDate?: string }>
  publications?: Array<{ title?: string; journal?: string; date?: string; url?: string }>
  projects?: Array<{ name?: string; description?: string; technologies?: string[]; url?: string }>
  courses?: Array<{ name?: string; provider?: string; date?: string; url?: string }>
  awards?: Array<{ name?: string; issuer?: string; date?: string; description?: string }>
  volunteering?: Array<{ organization?: string; role?: string; duration?: string; description?: string }>
  languages?: Array<{ language?: string; proficiency?: string }>
}

export type BuilderCV = {
  personalInfo: {
    fullName: string
    title: string
    email: string
    phone: string
    location: string
    linkedin: string
    summary: string
  }
  experience: Array<{
    id: string
    company: string
    role: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    location: string
    startDate: string
    endDate: string
    current: boolean
  }>
  skillCategories: Array<{ id: string; name: string; skills: string[] }>
  sections: CvSection[]
  parsed: ParsedCV
}

const EMPTY_PARSED: ParsedCV = {
  personalInfo: {}, summary: "", experiences: [], education: [], skills: [],
  targetRoles: [], industries: [], jobKeywords: [], remotePreference: "flexible",
  visaRequired: false, certifications: [], publications: [], projects: [], courses: [],
  awards: [], volunteering: [], languages: [],
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function asString(value: unknown): string {
  return typeof value === "string" && !/^(?:n\/?a|null|undefined)$/i.test(value.trim())
    ? value.trim()
    : ""
}

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(asString).filter(Boolean) : []
}

function normalizeParsedCV(value: unknown): ParsedCV {
  const root = asObject(value)
  const personal = asObject(root.personalInfo)
  const objects = (key: string) => Array.isArray(root[key])
    ? (root[key] as unknown[]).map(asObject)
    : []
  return {
    ...EMPTY_PARSED,
    personalInfo: {
      name: asString(personal.name), email: asString(personal.email),
      phone: asString(personal.phone), location: asString(personal.location),
      linkedin: asString(personal.linkedin),
    },
    summary: asString(root.summary),
    experiences: objects("experiences").map((item) => ({
      company: asString(item.company), position: asString(item.position),
      duration: asString(item.duration), description: asString(item.description),
    })),
    education: objects("education").map((item) => ({
      institution: asString(item.institution), degree: asString(item.degree),
      field: asString(item.field), year: asString(item.year),
    })),
    skills: asStrings(root.skills), targetRoles: asStrings(root.targetRoles),
    industries: asStrings(root.industries), jobKeywords: asStrings(root.jobKeywords),
    remotePreference: ["remote", "hybrid", "onsite", "flexible"].includes(asString(root.remotePreference))
      ? asString(root.remotePreference) as ParsedCV["remotePreference"] : "flexible",
    visaRequired: root.visaRequired === true,
    certifications: objects("certifications").map((item) => ({ name: asString(item.name), issuer: asString(item.issuer), date: asString(item.date), expiryDate: asString(item.expiryDate) })),
    publications: objects("publications").map((item) => ({ title: asString(item.title), journal: asString(item.journal), date: asString(item.date), url: asString(item.url) })),
    projects: objects("projects").map((item) => ({ name: asString(item.name), description: asString(item.description), technologies: asStrings(item.technologies), url: asString(item.url) })),
    courses: objects("courses").map((item) => ({ name: asString(item.name), provider: asString(item.provider), date: asString(item.date), url: asString(item.url) })),
    awards: objects("awards").map((item) => ({ name: asString(item.name), issuer: asString(item.issuer), date: asString(item.date), description: asString(item.description) })),
    volunteering: objects("volunteering").map((item) => ({ organization: asString(item.organization), role: asString(item.role), duration: asString(item.duration), description: asString(item.description) })),
    languages: objects("languages").map((item) => ({ language: asString(item.language), proficiency: asString(item.proficiency) })),
  }
}

export async function parseCV(cvText: string): Promise<ParsedCV> {
  if (!openaiClient) throw new Error("AI is not configured. Set OpenAI or Azure OpenAI environment variables.")

  const prompt = `Parse this resume/CV and extract structured information.

Resume/CV Text:
${cvText}

Extract and return a JSON object with the following structure:
{
  "personalInfo": {"name":"Full name","email":"Email address","phone":"Phone number","location":"City, Country","linkedin":"LinkedIn URL"},
  "summary": "Professional summary or objective",
  "experiences": [{"company":"Company name","position":"Job title","duration":"Date range (e.g., Jan 2020 - Present)","description":"Every responsibility and achievement listed for this role, copied faithfully, one per line, each line starting with '• '"}],
  "education": [{"institution":"University/School name","degree":"Degree type","field":"Field of study","year":"Graduation year"}],
  "skills": ["Skill 1", "Skill 2"],
  "targetRoles": ["Job title they are seeking, e.g. Software Engineer, Product Manager — infer from summary/objective or most recent roles"],
  "industries": ["Industry domains they work in or target, e.g. FinTech, Healthcare, SaaS"],
  "jobKeywords": ["3-10 high-signal keywords that describe their niche, e.g. microservices, B2B SaaS, NHS, React, AWS"],
  "remotePreference": "remote | hybrid | onsite | flexible — infer from any location/remote signals in the CV; default to flexible",
  "visaRequired": false,
  "certifications": [{"name":"Certification name","issuer":"Issuing organization","date":"Date obtained"}],
  "publications": [{"title":"Publication title","journal":"Journal or publisher","date":"Publication date","url":"URL if available"}],
  "projects": [{"name":"Project name","description":"Project description","technologies":["Tech 1", "Tech 2"],"url":"Project URL if available"}],
  "courses": [{"name":"Course name","provider":"Course provider","date":"Completion date","url":"Certificate URL if available"}],
  "awards": [{"name":"Award name","issuer":"Awarding organization","date":"Date received","description":"Award description"}],
  "volunteering": [{"organization":"Organization name","role":"Role/position","duration":"Time period","description":"Description of activities"}],
  "languages": [{"language":"Language name","proficiency":"Proficiency level (e.g., Native, Fluent, Conversational)"}]
}

Extract all available information. Leave empty strings or empty arrays for sections not found in the CV.`

  const provider = getAiProvider()
  const completion = await openaiClient.chat.completions.create({
    model: provider === "azure-openai" ? getAzureOpenAiConfig()!.deployment : "gpt-4o",
    messages: [
      { role: "system", content: "You are an expert CV parser. Extract structured information from resumes accurately and comprehensively. Always respond with valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2000,
  })
  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error("The AI returned an empty CV response.")
  return normalizeParsedCV(JSON.parse(content))
}

export async function extractCvFromText(text: string): Promise<BuilderCV> {
  const parsed = await parseCV(text)
  return {
    personalInfo: {
      fullName: parsed.personalInfo?.name || "", email: parsed.personalInfo?.email || "",
      title: parsed.targetRoles?.[0] || parsed.experiences?.[0]?.position || "",
      phone: parsed.personalInfo?.phone || "", location: parsed.personalInfo?.location || "",
      linkedin: parsed.personalInfo?.linkedin || "", summary: parsed.summary || "",
    },
    experience: (parsed.experiences ?? []).map((item) => {
      const [startDate = "", endDate = ""] = (item.duration || "").split(/\s+[-–—]\s+|\s+to\s+/i).map((part) => part.trim())
      return {
        id: randomUUID(), company: item.company || "", role: item.position || "", location: "",
        startDate, endDate, current: /present|current/i.test(item.duration || ""),
        description: autoBullet(item.description || ""),
      }
    }),
    education: (parsed.education ?? []).map((item) => ({
      id: randomUUID(), institution: item.institution || "", degree: item.degree || "",
      field: item.field || "", location: "", startDate: "", endDate: item.year || "", current: false,
    })),
    skillCategories: (parsed.skills ?? []).length
      ? [{ id: randomUUID(), name: "Skills", skills: parsed.skills ?? [] }]
      : [],
    sections: sectionsFromParsed(parsed, () => randomUUID()),
    parsed,
  }
}
