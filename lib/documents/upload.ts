import { extractTextFromDocx } from "./docx"
import { extractTextFromPDF } from "./pdf"

export class DocumentUploadError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}

const MAX_CHARS = 40_000

/**
 * Ported from Rekruuter cv/upload extractTextFromUploadedFile.
 */
export async function extractTextFromUploadedFile(input: {
  buffer: Buffer
  originalName: string
  mimeType?: string | null
}): Promise<string> {
  if (!input.buffer.length) {
    throw new DocumentUploadError("This file is empty. Please upload a CV containing text.")
  }

  const name = input.originalName || ""
  const mime = (input.mimeType ?? "").toLowerCase()
  const isPdf = /\.pdf$/i.test(name) || mime === "application/pdf"
  const isDocx =
    /\.docx$/i.test(name) ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  const isText = /\.txt$/i.test(name) || mime === "text/plain" || mime === "text/markdown"

  if (!isPdf && !isDocx && !isText) {
    throw new DocumentUploadError("Unsupported file type. Please upload a PDF, DOCX or TXT file.")
  }

  let text: string
  try {
    text = isPdf
      ? await extractTextFromPDF(input.buffer)
      : isDocx
        ? await extractTextFromDocx(input.buffer)
        : input.buffer.toString("utf8")
  } catch {
    throw new DocumentUploadError(
      "This CV could not be read. It may be damaged or password-protected. Please export a fresh PDF or DOCX and try again.",
    )
  }

  if (!text.trim()) {
    throw new DocumentUploadError(
      "No readable text was found in this CV. For scanned PDFs, use a text-based PDF or DOCX instead.",
    )
  }

  return text.slice(0, MAX_CHARS)
}
