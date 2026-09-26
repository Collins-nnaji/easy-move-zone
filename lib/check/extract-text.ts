import mammoth from "mammoth"
import { extractTextFromUploadedFile } from "@/lib/documents/upload"

const MAX_CHARS = 24_000

export async function extractDocumentText(input: {
  buffer: Buffer
  mime?: string | null
  fileName?: string | null
}): Promise<string> {
  try {
    return (
      await extractTextFromUploadedFile({
        buffer: input.buffer,
        originalName: input.fileName || "document",
        mimeType: input.mime,
      })
    ).slice(0, MAX_CHARS)
  } catch {
    // Fall through for edge cases.
  }

  const mime = (input.mime ?? "").toLowerCase()
  const name = (input.fileName ?? "").toLowerCase()

  if (mime.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) {
    return input.buffer.toString("utf8").slice(0, MAX_CHARS)
  }

  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer: input.buffer })
    return (result.value || "").slice(0, MAX_CHARS)
  }

  throw new Error("Could not read text from this file. Upload a PDF, DOCX, or TXT.")
}

export function excerptFromText(text: string, max = 280): string {
  const compact = text.replace(/\s+/g, " ").trim()
  if (compact.length <= max) return compact
  return `${compact.slice(0, max - 1)}…`
}
