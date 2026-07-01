"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Loader2, Trash2, Upload } from "lucide-react"
import {
  deleteDocument,
  fetchDocuments,
  registerDocument,
  uploadDocumentFile,
} from "@/lib/visa/client"
import type { DocumentType, VisaDocument } from "@/lib/visa/types"
import { ExpiryBadge } from "@/components/visa/ExpiryBadge"

const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  passport: "Passport",
  photo: "Passport photo",
  bank_statement: "Bank statement",
  invitation_letter: "Invitation letter",
  travel_insurance: "Travel insurance",
  employment_letter: "Employment letter",
  itinerary: "Itinerary",
  other: "Other",
}

export function DocumentUploadCard({ applicationId }: { applicationId: string }) {
  const [documents, setDocuments] = useState<VisaDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [documentType, setDocumentType] = useState<DocumentType>("passport")
  const [expiryDate, setExpiryDate] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function load() {
    setLoading(true)
    fetchDocuments(applicationId)
      .then(setDocuments)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId])

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const uploaded = await uploadDocumentFile(file)
      const document = await registerDocument({
        applicationId,
        documentType,
        label: DOCUMENT_TYPE_LABEL[documentType],
        fileKey: uploaded.key,
        mimeType: file.type,
        fileSizeBytes: file.size,
        expiryDate: expiryDate || null,
      })
      setDocuments((prev) => [document, ...prev])
      setExpiryDate("")
    } catch {
      setError("Upload failed. Check the file type and size, then try again.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function onDelete(id: string) {
    await deleteDocument(id)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-[#4a5047]">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading documents…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1b231e]">Documents</h1>

      <div className="rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-[#1b231e]">Document type</span>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
            >
              {Object.entries(DOCUMENT_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[#1b231e]">Expiry date (optional)</span>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
            />
          </label>
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d8d2c6] py-6 text-sm font-semibold text-[#4a5047] hover:border-[#e0511f] hover:text-[#e0511f]">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Choose a file (PDF, DOC, or image)"}
          <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange} disabled={uploading} accept=".pdf,.doc,.docx,image/*" />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      {documents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#d8d2c6] p-8 text-center text-[#4a5047]">
          No documents uploaded yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 rounded-2xl border border-[#e4dfd5] bg-white p-4 shadow-sm">
              <FileText className="h-6 w-6 shrink-0 text-[#e0511f]" />
              <div className="min-w-0 flex-1">
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-[#1b231e] hover:underline">
                  {doc.label}
                </a>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#4a5047]">
                  <span>{DOCUMENT_TYPE_LABEL[doc.documentType]}</span>
                  {doc.expiryDate ? <ExpiryBadge expiryDate={doc.expiryDate} /> : null}
                </div>
              </div>
              <button type="button" onClick={() => void onDelete(doc.id)} className="shrink-0 text-[#4a5047] hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
