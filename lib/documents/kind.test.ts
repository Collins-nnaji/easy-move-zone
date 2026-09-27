import { describe, expect, it } from "vitest"
import { detectDocumentKind } from "./kind"

describe("detectDocumentKind", () => {
  it("uses the file name first", () => {
    expect(detectDocumentKind("Collins_Nnaji_CV.pdf")).toBe("cv")
    expect(detectDocumentKind("passport-scan.jpg")).toBe("passport")
    expect(detectDocumentKind("Job offer letter.pdf")).toBe("offer")
    expect(detectDocumentKind("BSc_certificate.pdf")).toBe("certificate")
  })

  it("falls back to the document text", () => {
    expect(detectDocumentKind("upload.pdf", "Profile\nExperience\nAcme Ltd\nEducation\nUniversity\nSkills\nSQL")).toBe("cv")
    expect(detectDocumentKind("upload.pdf", "Dear Ada, we are pleased to offer you the role of Nurse")).toBe("offer")
    expect(detectDocumentKind("upload.pdf", "This is to certify that Ada has successfully completed")).toBe("certificate")
    expect(detectDocumentKind("scan.png", "")).toBe("other")
  })
})
