// pdf-parse v1 ships its own lightweight text extractor with no pdfjs-dist/canvas
// dependency. v2 needs native canvas and an on-disk PDF worker, which is
// unreliable after a Next/serverless bundle is deployed, so keep this on v1.
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use plain PDF.js byte-array semantics rather than Buffer's shared slices.
    // Passing multipart Buffers directly can produce intermittent xref errors.
    const { default: pdfParse } = await import("pdf-parse")
    const data = await pdfParse(Uint8Array.from(buffer))

    return data.text
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
