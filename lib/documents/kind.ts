import type { CheckDocumentKind } from "@/lib/check/types"

export const DOCUMENT_KINDS: CheckDocumentKind[] = ["cv", "certificate", "offer", "passport", "other"]

export const DOCUMENT_KIND_LABELS: Record<CheckDocumentKind, string> = {
  cv: "CV",
  certificate: "Certificate",
  offer: "Offer / contract",
  passport: "Passport / ID",
  other: "Other",
}

const CV_SECTIONS = [
  /\b(work|professional)?\s*experience\b/,
  /\beducation\b/,
  /\bskills\b/,
  /\b(professional\s+)?summary\b|\bprofile\b/,
  /\bemployment history\b/,
  /\breferences\b/,
]

export function detectDocumentKind(fileName: string, text = ""): CheckDocumentKind {
  const name = fileName.toLowerCase().replace(/[_\-.]+/g, " ")
  if (/\b(cv|resume|résumé|curriculum vitae)\b/.test(name)) return "cv"
  if (/\b(passport|brp|residence permit|national id|id card|driving licen[cs]e)\b/.test(name)) return "passport"
  if (/\b(offer|contract|cos|certificate of sponsorship)\b/.test(name)) return "offer"
  if (/\b(certificate|cert|diploma|transcript|degree|award)\b/.test(name)) return "certificate"

  const body = text.slice(0, 6000).toLowerCase()
  if (!body.trim()) return "other"
  if (/p<[a-z]{3}/.test(body) || /\bpassport no\b|\bdate of expiry\b[\s\S]*\bnationality\b/.test(body)) return "passport"
  if (CV_SECTIONS.filter((pattern) => pattern.test(body)).length >= 3) return "cv"
  if (/offer of employment|pleased to offer you|certificate of sponsorship|terms and conditions of employment/.test(body)) return "offer"
  if (/this is to certify|has been awarded|has successfully completed|certificate of (completion|achievement)/.test(body)) return "certificate"
  return "other"
}
