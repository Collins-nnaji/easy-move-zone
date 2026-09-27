export const BULLET_MARKER = "• "

const BULLET_RE = /^([ \t]*)[-•*·▪]([ \t]+)/

export function isBulletLine(line: string) {
  return BULLET_RE.test(line)
}

export function stripBullet(line: string) {
  return line.replace(BULLET_RE, "$1")
}

/** Lines without their markers; templates draw the marker themselves. */
export function parseBulletText(raw?: string): { lines: string[]; isBulleted: boolean } {
  const rawLines = (raw || "").split("\n").map((line) => line.trim()).filter(Boolean)
  const isBulleted = rawLines.some(isBulletLine)
  return {
    lines: isBulleted ? rawLines.map((line) => stripBullet(line).trim()).filter(Boolean) : rawLines,
    isBulleted,
  }
}

export function toBulletText(lines: string[]) {
  return lines.map((line) => `${BULLET_MARKER}${stripBullet(line).trim()}`).join("\n")
}

/** Multi-line text keeps its lines; a single paragraph is split into one bullet per sentence. */
export function autoBullet(raw: string) {
  if (!raw?.trim()) return raw ?? ""
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean)
  if (lines.some(isBulletLine)) return raw
  if (lines.length > 1) return toBulletText(lines)
  const sentences = lines.join(" ").split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean)
  return sentences.length < 2 ? toBulletText(lines) : toBulletText(sentences)
}

export function toggleBullets(raw: string) {
  const { lines, isBulleted } = parseBulletText(raw)
  return isBulleted ? lines.join("\n") : autoBullet(raw)
}
