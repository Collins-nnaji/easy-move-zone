import { toBulletText } from "./bullets"
import type { ParsedCV } from "./cv-ai"

export type CvSection = { id: string; title: string; content: string; bullets?: boolean }

export const SECTION_PRESETS: Array<{ title: string; bullets: boolean }> = [
  { title: "Certifications", bullets: true },
  { title: "Languages", bullets: false },
  { title: "Projects", bullets: true },
  { title: "Courses", bullets: true },
  { title: "Awards", bullets: true },
  { title: "Volunteering", bullets: true },
  { title: "Publications", bullets: true },
  { title: "Interests", bullets: false },
  { title: "References", bullets: false },
]

const clean = (value: unknown) => typeof value === "string" ? value.trim() : ""
const join = (parts: unknown[], separator: string) => parts.map(clean).filter(Boolean).join(separator)
const bracket = (value: unknown) => clean(value) ? ` (${clean(value)})` : ""
const rows = <T,>(value: T[] | undefined): T[] => Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : []

/** Turns the extra lists found when a CV is parsed into editable free-text sections. */
export function sectionsFromParsed(parsed: ParsedCV | undefined, makeId: (index: number) => string): CvSection[] {
  if (!parsed) return []
  const lists: Array<{ title: string; bullets: boolean; lines: string[] }> = [
    { title: "Certifications", bullets: true, lines: rows(parsed.certifications).map((item) => join([item.name, join([item.issuer, item.date], ", ")], " — ")) },
    { title: "Languages", bullets: false, lines: rows(parsed.languages).map((item) => join([item.language, item.proficiency], " — ")) },
    { title: "Projects", bullets: true, lines: rows(parsed.projects).map((item) => join([item.name, item.description], ": ") + bracket(Array.isArray(item.technologies) ? join(item.technologies, ", ") : "")) },
    { title: "Courses", bullets: true, lines: rows(parsed.courses).map((item) => join([item.name, join([item.provider, item.date], ", ")], " — ")) },
    { title: "Awards", bullets: true, lines: rows(parsed.awards).map((item) => join([join([item.name, item.issuer, item.date], ", "), item.description], " — ")) },
    { title: "Volunteering", bullets: true, lines: rows(parsed.volunteering).map((item) => join([join([item.role, item.organization], ", ") + bracket(item.duration), item.description], " — ")) },
    { title: "Publications", bullets: true, lines: rows(parsed.publications).map((item) => join([item.title, join([item.journal, item.date], ", ")], " — ")) },
  ]
  return lists
    .map((list) => ({ ...list, lines: list.lines.map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean) }))
    .filter((list) => list.lines.length)
    .map((list, index) => ({
      id: makeId(index), title: list.title, bullets: list.bullets,
      content: list.bullets ? toBulletText(list.lines) : list.lines.join("\n"),
    }))
}

export function normalizeSections(value: unknown): CvSection[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object") return []
    const row = item as Record<string, unknown>
    return [{
      id: String(row.id || `section-${index}`), title: String(row.title ?? ""), content: String(row.content ?? ""),
      ...(typeof row.bullets === "boolean" ? { bullets: row.bullets } : {}),
    }]
  })
}
