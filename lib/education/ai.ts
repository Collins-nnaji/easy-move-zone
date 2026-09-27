import { chatJson, getAiProvider } from "@/lib/ai/openai"
import type { CareerProfile } from "@/lib/career/profile-store"
import { STUDY_LEVEL_LABELS, type CourseFit, type CourseWithUniversity, type StatementFormat } from "./types"

export type ApplicantContext = {
  cvText: string
  profile: CareerProfile | null
  fullName?: string
}

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function describeCourse(course: CourseWithUniversity) {
  return [
    `Course: ${course.title} (${STUDY_LEVEL_LABELS[course.level]})`,
    `University: ${course.university.name}, ${course.university.city}, ${course.university.country}`,
    `Subject area: ${course.subject}`,
    course.duration ? `Duration: ${course.duration}` : "",
    course.entryRequirements ? `Entry requirements: ${course.entryRequirements}` : "",
    course.englishRequirement ? `English requirement: ${course.englishRequirement}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

function describeApplicant(ctx: ApplicantContext) {
  const p = ctx.profile
  return [
    p?.currentRole ? `Current role: ${p.currentRole}${p.currentCompany ? ` at ${p.currentCompany}` : ""}` : "",
    p?.yearsExperience != null ? `Years of experience: ${p.yearsExperience}` : "",
    p?.industry ? `Industry: ${p.industry}` : "",
    p?.skills?.length ? `Skills: ${p.skills.join(", ")}` : "",
    p?.bio ? `Bio: ${p.bio}` : "",
    ctx.cvText ? `CV:\n${clip(ctx.cvText, 12000)}` : "No CV uploaded.",
  ]
    .filter(Boolean)
    .join("\n")
}

function fallbackFit(course: CourseWithUniversity, ctx: ApplicantContext): CourseFit {
  const text = `${ctx.cvText} ${ctx.profile?.skills.join(" ") ?? ""} ${ctx.profile?.currentRole ?? ""}`.toLowerCase()
  const subjectWords = `${course.subject} ${course.title}`
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length > 3 && !["msc", "master", "bachelor", "science", "with"].includes(word))
  const hits = [...new Set(subjectWords.filter((word) => text.includes(word)))]
  const hasCv = ctx.cvText.trim().length > 200
  const score = Math.min(90, (hasCv ? 40 : 20) + hits.length * 12)
  return {
    score,
    verdict: score >= 70 ? "strong" : score >= 45 ? "possible" : "stretch",
    meets: hits.length ? [`Your background mentions ${hits.slice(0, 4).join(", ")}.`] : [],
    gaps: [
      ...(hasCv ? [] : ["Upload your CV in My Workspace so we can check your academic record."]),
      course.entryRequirements ? `Confirm you meet: ${course.entryRequirements}` : "",
      course.englishRequirement ? `Plan for the English requirement: ${course.englishRequirement}` : "",
    ].filter(Boolean),
    advice: ["Check the full entry requirements on the university's course page before applying."],
  }
}

export async function checkCourseFit(course: CourseWithUniversity, ctx: ApplicantContext): Promise<CourseFit> {
  const fallback = fallbackFit(course, ctx)
  if (!getAiProvider()) return fallback
  const result = await chatJson<Partial<CourseFit>>(
    "You are an admissions adviser for international students. Judge how well an applicant fits a university course using only the evidence given. Never invent grades, degrees or test scores. If evidence is missing, say what they need to confirm. Return JSON only.",
    `${describeCourse(course)}\n\nAPPLICANT\n${describeApplicant(ctx)}\n\nReturn {"score":0-100,"verdict":"strong|possible|stretch","meets":["requirement the applicant clearly meets, with the evidence"],"gaps":["missing or unconfirmed requirement"],"advice":["specific next step to strengthen the application"]}. Keep each item under 25 words, 2-5 items per list.`,
    fallback,
    { maxTokens: 900 },
  )
  const score = Math.max(0, Math.min(100, Math.round(Number(result.score ?? fallback.score))))
  const verdict = result.verdict === "strong" || result.verdict === "possible" || result.verdict === "stretch" ? result.verdict : fallback.verdict
  const list = (value: unknown, alt: string[]) =>
    Array.isArray(value) ? value.map(String).filter(Boolean).slice(0, 6) : alt
  return {
    score,
    verdict,
    meets: list(result.meets, fallback.meets),
    gaps: list(result.gaps, fallback.gaps),
    advice: list(result.advice, fallback.advice),
  }
}

const UCAS_QUESTIONS = [
  "Why do you want to study this course or subject?",
  "How have your qualifications and studies helped you to prepare for this course or subject?",
  "What else have you done to prepare outside of education, and why are these experiences useful?",
]

export async function draftPersonalStatement(
  course: CourseWithUniversity,
  ctx: ApplicantContext,
  options: { format: StatementFormat; motivation: string; wordLimit: number },
): Promise<string> {
  const fallbackText =
    options.format === "ucas"
      ? UCAS_QUESTIONS.map((question) => `${question}\n\n[Write your answer here.]`).join("\n\n")
      : `Dear Admissions Committee,\n\nI am applying for the ${course.title} at ${course.university.name}.\n\n[Explain why this course, how your background prepares you, and what you plan to do afterwards.]\n\nYours sincerely,\n${ctx.fullName || ""}`
  if (!getAiProvider()) return fallbackText

  const formatInstructions =
    options.format === "ucas"
      ? `Write a UCAS undergraduate personal statement answering these three questions in order, each as its own section headed by the question:\n${UCAS_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n")}\nThe whole statement must be under 4,000 characters including spaces.`
      : `Write a postgraduate personal statement (statement of purpose) of about ${options.wordLimit} words: why this course and university, how the applicant's education and experience prepare them, and their goals after graduating.`

  const result = await chatJson<{ statement?: string }>(
    "You write admissions personal statements for international applicants. Use only facts from the applicant's CV, profile and motivation notes. Never invent grades, awards, employers, dates or experiences. Write in the first person, plain and specific, with no clichés or flowery openings. Return JSON only.",
    `${describeCourse(course)}\n\nAPPLICANT\n${describeApplicant(ctx)}\n\nMOTIVATION NOTES FROM THE APPLICANT\n${options.motivation.trim() || "None given."}\n\n${formatInstructions}\n\nReturn {"statement":"..."} with paragraphs separated by blank lines.`,
    { statement: fallbackText },
    { maxTokens: 2200, temperature: 0.5 },
  )
  return String(result.statement ?? "").trim() || fallbackText
}
