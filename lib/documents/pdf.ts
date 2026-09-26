/**
 * Ported from Rekruuter's pdfParser — line-aware cleanup for CV extraction.
 * Uses pdf-parse v2 (PDFParse) which is installed in this app.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse")
    // Prefer a plain byte copy — shared Buffer slices can cause intermittent xref errors.
    const parser = new PDFParse({ data: Uint8Array.from(buffer) })
    const data = await parser.getText()
    const text = data.text || ""

    return text
      .replace(/\0/g, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .split("\n")
      .map((line: string) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  } catch (error) {
    console.error("Error parsing PDF:", error)
    throw new Error("Failed to parse PDF file")
  }
}
