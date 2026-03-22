import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import {
  Home,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  ArrowLeft,
  BadgeCheck,
  XCircle,
  Scale,
  Eye,
  Fingerprint,
  FileSearch,
  Building2,
} from "lucide-react"

const mockVerification = {
  propertyId: "1",
  propertyTitle: "Verified 800sqm Plot — Lekki Phase 2",
  city: "Lagos",
  overallStatus: "verified" as const,
  riskScore: 12,
  submittedAt: "March 5, 2026",
  reviewedAt: "March 8, 2026",
  reviewer: "EasyMoveZone Legal Team",
  steps: [
    { label: "Documents Uploaded", status: "complete" as const, date: "March 5, 2026" },
    { label: "Title Scan — AI Fraud Check", status: "complete" as const, date: "March 5, 2026" },
    { label: "Registry Cross-Reference", status: "complete" as const, date: "March 6, 2026" },
    { label: "Human Legal Review", status: "complete" as const, date: "March 8, 2026" },
    { label: "Verification Certificate Issued", status: "complete" as const, date: "March 8, 2026" },
  ],
  documents: [
    { name: "Certificate of Occupancy (C of O)", status: "verified" as const, uploadedAt: "March 5, 2026", notes: "Original document verified against Lagos State Land Registry." },
    { name: "Survey Plan", status: "verified" as const, uploadedAt: "March 5, 2026", notes: "Coordinates match registered plot boundaries." },
    { name: "Purchase Receipt", status: "pending" as const, uploadedAt: "March 5, 2026", notes: "Awaiting vendor confirmation." },
  ],
  fraudFlags: [
    { severity: "low" as const, description: "Minor naming discrepancy between C of O and survey plan — resolved after review." },
  ],
  aiScanResults: {
    documentAuthenticity: 96,
    registryMatch: 100,
    ownershipChain: 94,
    boundaryAccuracy: 98,
  },
}

const stepIcon = { complete: CheckCircle2, in_progress: Clock, pending: Circle }
const stepColor = { complete: "#059669", in_progress: "#d97706", pending: "#cbd5e1" }
const docStatusColor = { verified: "#059669", pending: "#d97706", flagged: "#dc2626", rejected: "#dc2626" }
const flagSeverityColor = { low: "#d97706", medium: "#ea580c", high: "#dc2626" }

export default function VerificationPage() {
  const v = mockVerification

  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href={`/properties/${v.propertyId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748b] hover:text-[#0f172a]">
          <ArrowLeft className="h-4 w-4" /> Back to listing
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#059669]/10 text-[#059669]">
              <Home className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Verification Centre</h1>
              <p className="text-sm text-[#64748b]">{v.propertyTitle} &middot; {v.city}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            <div className="rounded-2xl border border-[#059669]/20 bg-[#f0fdf4] p-6">
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-8 w-8 text-[#059669]" />
                <div>
                  <div className="text-lg font-bold text-[#059669]">Title Verified</div>
                  <div className="text-sm text-[#475569]">Reviewed by {v.reviewer} on {v.reviewedAt}</div>
                </div>
              </div>
            </div>

            {/* Verification Steps */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <h2 className="text-lg font-bold text-[#0f172a] mb-5">Verification Timeline</h2>
              <div className="space-y-0">
                {v.steps.map((step, i) => {
                  const Icon = stepIcon[step.status]
                  const color = stepColor[step.status]
                  return (
                    <div key={step.label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <Icon className="h-6 w-6 flex-shrink-0" style={{ color }} />
                        {i < v.steps.length - 1 && <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: stepColor[v.steps[i + 1].status] + "40" }} />}
                      </div>
                      <div className="pb-6">
                        <div className="font-semibold text-[#0f172a] text-sm">{step.label}</div>
                        <div className="text-xs text-[#64748b] mt-0.5">{step.date}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Scan Results */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <Fingerprint className="h-5 w-5 text-[#155eef]" />
                <h2 className="text-lg font-bold text-[#0f172a]">AI Fraud Detection Scan</h2>
              </div>
              <div className="grid gap-4 grid-cols-2">
                {Object.entries(v.aiScanResults).map(([key, value]) => {
                  const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
                  const barColor = value >= 90 ? "#059669" : value >= 70 ? "#d97706" : "#dc2626"
                  return (
                    <div key={key} className="rounded-xl bg-[#f8fafc] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#64748b]">{label}</span>
                        <span className="text-sm font-bold" style={{ color: barColor }}>{value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#e2e8f0]">
                        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: barColor }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Document History */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
              <h2 className="text-lg font-bold text-[#0f172a] mb-5">Document History</h2>
              <div className="space-y-4">
                {v.documents.map((doc) => (
                  <div key={doc.name} className="rounded-xl border border-[#e2e8f0] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <FileCheck className="h-5 w-5 text-[#155eef] mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-[#0f172a] text-sm">{doc.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: docStatusColor[doc.status] }}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </div>
                          <div className="text-xs text-[#94a3b8] mt-1">{doc.notes}</div>
                          <div className="text-[11px] text-[#cbd5e1] mt-1">Uploaded {doc.uploadedAt}</div>
                        </div>
                      </div>
                      <button className="rounded-lg border border-[#e2e8f0] p-2 text-[#64748b] hover:bg-[#f8fafc]">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fraud Flags */}
            {v.fraudFlags.length > 0 && (
              <div className="rounded-2xl border border-[#d97706]/20 bg-[#fffbeb] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-[#d97706]" />
                  <h2 className="text-lg font-bold text-[#92400e]">Flags Raised During Review</h2>
                </div>
                <div className="space-y-3">
                  {v.fraudFlags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-white p-4 border border-[#fde68a]">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: flagSeverityColor[flag.severity] + "15", color: flagSeverityColor[flag.severity] }}>
                        {flag.severity}
                      </span>
                      <p className="text-sm text-[#475569]">{flag.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="sticky top-24">
              {/* Risk Score */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center mb-5">
                <h3 className="text-sm font-bold text-[#64748b] mb-3">Risk Score</h3>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#059669]">
                  <span className="font-[var(--font-playfair)] text-3xl font-bold text-[#059669]">{v.riskScore}</span>
                </div>
                <p className="mt-3 text-xs text-[#64748b]">Out of 100. Lower is better.<br />This property is <strong className="text-[#059669]">low risk</strong>.</p>
              </div>

              {/* Download Report */}
              <button className="w-full rounded-2xl border border-[#e2e8f0] bg-white p-5 text-left transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#155eef]/8 text-[#155eef]">
                    <FileSearch className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#0f172a] text-sm">Due Diligence Report</div>
                    <div className="text-xs text-[#64748b]">Download full PDF report</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  )
}
