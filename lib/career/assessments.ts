import { randomUUID } from "crypto"
import {
  getSuitabilityRoleById,
  listSuitabilityCategories,
  SUITABILITY_CATEGORIES,
  SUITABILITY_LEVELS,
  SUITABILITY_ROLE_TEMPLATES,
  type SuitabilityRoleTemplate,
} from "./suitability-catalog"
import { careerSql } from "./db"

export const BADGE_TIERS = [
  { id: "bronze", label: "Bronze", minScore: 60 },
  { id: "silver", label: "Silver", minScore: 75 },
  { id: "gold", label: "Gold", minScore: 88 },
] as const

export type BadgeTier = (typeof BADGE_TIERS)[number]["id"]

export function tierForScore(score: number): BadgeTier | null {
  let earned: BadgeTier | null = null
  for (const tier of BADGE_TIERS) {
    if (score >= tier.minScore) earned = tier.id
  }
  return earned
}

export type PublicQuestion = {
  id: string
  prompt: string
  options: Array<{ id: string; text: string }>
}

type StoredQuestion = PublicQuestion & { correctId: string }

function hash(input: string): number {
  let n = 2166136261
  for (let i = 0; i < input.length; i++) {
    n ^= input.charCodeAt(i)
    n = Math.imul(n, 16777619)
  }
  return n >>> 0
}

function distractors(correct: string, pool: string[], seed: number): string[] {
  const unique = [...new Set(pool.map((item) => item.trim()).filter((item) => item && item !== correct))]
  const out: string[] = []
  let cursor = seed
  while (out.length < 3 && unique.length > 0) {
    const index = cursor % unique.length
    out.push(unique.splice(index, 1)[0])
    cursor = hash(`${seed}:${cursor}:${out.length}`)
  }
  while (out.length < 3) out.push(`General ${out.length + 1}`)
  return out
}

function question(
  role: SuitabilityRoleTemplate,
  index: number,
  prompt: string,
  correct: string,
  pool: string[],
): StoredQuestion {
  const seed = hash(`${role.id}:${index}:${correct}`)
  const options = [correct, ...distractors(correct, pool, seed)].map((text, optionIndex) => ({
    id: `${index}-${optionIndex}`,
    text,
  }))
  const order = [...options].sort((a, b) => hash(`${seed}:${a.text}`) - hash(`${seed}:${b.text}`))
  const correctOption = order.find((option) => option.text === correct) ?? order[0]
  return { id: `q${index}`, prompt, options: order, correctId: correctOption.id }
}

/** Fixed paper for a catalog role. The answer key stays on the server. */
export function buildAssessmentPaper(role: SuitabilityRoleTemplate): StoredQuestion[] {
  const others = SUITABILITY_ROLE_TEMPLATES.filter((item) => item.id !== role.id)
  const skillPool = others.flatMap((item) => item.coreSkills)
  const toolPool = others.flatMap((item) => item.toolOptions)
  const focusPool = others.flatMap((item) => item.focusOptions)
  const skills = role.coreSkills.slice(0, 3)
  const tools = role.toolOptions.slice(0, 3)
  const focus = role.focusOptions.slice(0, 2)

  const paper: StoredQuestion[] = []
  skills.forEach((skill) => {
    paper.push(question(
      role,
      paper.length,
      `Which of these is a core skill for a ${role.title}?`,
      skill,
      skillPool,
    ))
  })
  tools.forEach((tool) => {
    paper.push(question(
      role,
      paper.length,
      `Which tool belongs in a ${role.title}'s toolkit?`,
      tool,
      toolPool,
    ))
  })
  focus.forEach((item) => {
    paper.push(question(
      role,
      paper.length,
      `A ${role.title} is asked what they should go deeper on. Which focus fits the role?`,
      item,
      focusPool,
    ))
  })
  return paper
}

export function publicPaper(paper: StoredQuestion[]): PublicQuestion[] {
  return paper.map(({ id, prompt, options }) => ({ id, prompt, options }))
}

export function scorePaper(paper: StoredQuestion[], answers: Record<string, string>): number {
  if (paper.length === 0) return 0
  const correct = paper.filter((question) => answers[question.id] === question.correctId).length
  return Math.round((correct / paper.length) * 100)
}

export function listAssessmentCatalog(category?: string) {
  const roles = SUITABILITY_ROLE_TEMPLATES.filter((role) => !category || role.category === category).map((role) => ({
    id: role.id,
    title: role.title,
    category: role.category,
    categoryLabel: SUITABILITY_CATEGORIES.find((item) => item.id === role.category)?.label ?? role.category,
    description: role.description,
    coreSkills: role.coreSkills,
    toolOptions: role.toolOptions,
    focusOptions: role.focusOptions,
    questionCount: buildAssessmentPaper(role).length,
  }))
  return {
    roles,
    categories: listSuitabilityCategories(),
    levels: SUITABILITY_LEVELS.map((level) => ({ id: level.id, label: level.label })),
  }
}

export async function startAssessment(roleId: string, userId: string | null) {
  const role = getSuitabilityRoleById(roleId)
  if (!role || !careerSql) return null
  const paper = buildAssessmentPaper(role)
  const id = randomUUID()
  await careerSql`
    INSERT INTO career.assessment_attempts (id, user_id, role_key, role_title, category, questions, status)
    VALUES (${id}, ${userId}, ${role.id}, ${role.title}, ${role.category}, ${JSON.stringify(paper)}::jsonb, 'in_progress')
  `
  return {
    attemptId: id,
    role: { id: role.id, title: role.title, description: role.description, category: role.category },
    questions: publicPaper(paper),
    badgeRule: "60% bronze, 75% silver, 88% gold. A later lower score does not remove a badge.",
  }
}

export async function submitAssessment(attemptId: string, userId: string | null, answers: Record<string, string>) {
  if (!careerSql) return null
  const rows = await careerSql`
    SELECT id, user_id, role_key, role_title, category, questions, status
    FROM career.assessment_attempts
    WHERE id = ${attemptId}
    LIMIT 1
  `
  const attempt = rows[0]
  if (!attempt || attempt.status !== "in_progress") return null
  if (attempt.user_id && userId && attempt.user_id !== userId) return null

  const paper = attempt.questions as StoredQuestion[]
  const score = scorePaper(paper, answers)
  const tier = tierForScore(score)
  const owner = (attempt.user_id as string | null) ?? userId

  await careerSql`
    UPDATE career.assessment_attempts
    SET answers = ${JSON.stringify(answers)}::jsonb,
        score = ${score},
        tier = ${tier},
        status = 'submitted',
        user_id = ${owner},
        submitted_at = now()
    WHERE id = ${attemptId}
  `

  let badge: { tier: string; bestScore: number; attempts: number } | null = null
  if (owner && tier) {
    const badgeId = randomUUID()
    const saved = await careerSql`
      INSERT INTO career.assessment_badges (
        id, user_id, role_key, role_title, category, tier, best_score, latest_score, attempts_count
      ) VALUES (
        ${badgeId}, ${owner}, ${attempt.role_key}, ${attempt.role_title}, ${attempt.category},
        ${tier}, ${score}, ${score}, 1
      )
      ON CONFLICT (user_id, role_key) DO UPDATE SET
        latest_score = EXCLUDED.latest_score,
        attempts_count = career.assessment_badges.attempts_count + 1,
        updated_at = now(),
        best_score = GREATEST(career.assessment_badges.best_score, EXCLUDED.latest_score),
        tier = CASE
          WHEN EXCLUDED.latest_score >= career.assessment_badges.best_score THEN EXCLUDED.tier
          ELSE career.assessment_badges.tier
        END
      RETURNING tier, best_score, attempts_count
    `
    const row = saved[0]
    badge = {
      tier: String(row.tier),
      bestScore: Number(row.best_score),
      attempts: Number(row.attempts_count),
    }
  }

  return {
    score,
    tier,
    badge,
    passed: Boolean(tier),
    roleTitle: String(attempt.role_title),
  }
}

export async function listBadges(userId: string) {
  if (!careerSql) return []
  const rows = await careerSql`
    SELECT role_key, role_title, category, tier, best_score, latest_score, attempts_count, first_earned_at
    FROM career.assessment_badges
    WHERE user_id = ${userId}
    ORDER BY best_score DESC, first_earned_at DESC
  `
  return rows.map((row) => ({
    roleKey: String(row.role_key),
    roleTitle: String(row.role_title),
    category: row.category ? String(row.category) : null,
    tier: String(row.tier),
    bestScore: Number(row.best_score),
    latestScore: Number(row.latest_score),
    attempts: Number(row.attempts_count),
    earnedAt: row.first_earned_at ? String(row.first_earned_at) : null,
  }))
}

export async function listAttempts(userId: string) {
  if (!careerSql) return []
  const rows = await careerSql`
    SELECT id, role_key, role_title, score, tier, status, created_at, submitted_at
    FROM career.assessment_attempts
    WHERE user_id = ${userId} AND status = 'submitted'
    ORDER BY coalesce(submitted_at, created_at) DESC
    LIMIT 40
  `
  return rows.map((row) => ({
    id: String(row.id),
    roleKey: String(row.role_key),
    roleTitle: String(row.role_title),
    score: Number(row.score ?? 0),
    tier: row.tier ? String(row.tier) : null,
    createdAt: String(row.submitted_at ?? row.created_at),
  }))
}
