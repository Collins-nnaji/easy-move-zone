/** Ported from Rekruuter's docxParser. */
import mammoth from "mammoth"

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const { value } = await mammoth.extractRawText({ buffer })
    return value
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  } catch (error) {
    console.error("Error parsing DOCX:", error)
    throw new Error("Failed to parse DOCX file")
  }
}
