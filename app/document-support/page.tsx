"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  FolderPlus,
  Info,
  UploadCloud,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

type RouteKey = "uk" | "canada" | "europe"
type PurposeKey = "travel" | "work" | "study" | "business"
type DocStatus = "missing" | "uploaded" | "needs_fix" | "approved"

interface DocItem {
  id: string
  name: string
  reason: string
  status: DocStatus
  notes: string
  files: string[]
  required: boolean
}

const EASE = [0.16, 1, 0.3, 1] as const

const ROUTE_LABELS: Record<RouteKey, string> = {
  uk: "United Kingdom",
  canada: "Canada",
  europe: "Europe",
}

const BASE_DOCS = [
  { key: "passport", name: "Valid international passport", reason: "Core identity and travel document for any route.", required: true },
  { key: "bank", name: "Recent bank statements", reason: "Supports proof of funds and financial stability checks.", required: true },
  { key: "photos", name: "Passport photographs", reason: "Required for most applications and form submissions.", required: true },
]

const PURPOSE_DOCS: Record<PurposeKey, Array<{ key: string; name: string; reason: string; required: boolean }>> = {
  travel: [
    { key: "itinerary", name: "Travel itinerary / trip plan", reason: "Shows travel intent and planned movement dates.", required: true },
    { key: "accommodation", name: "Accommodation booking evidence", reason: "Demonstrates where you will stay after entry.", required: false },
  ],
  work: [
    { key: "cv", name: "CV / resume", reason: "Supports skilled worker and role-fit assessments.", required: true },
    { key: "employment", name: "Employment letter / contract", reason: "Confirms role, salary, and employer details.", required: true },
    { key: "reference", name: "Professional reference letters", reason: "Strengthens profile credibility for work routes.", required: false },
  ],
  study: [
    { key: "admission", name: "Admission letter", reason: "Primary evidence for study visa eligibility.", required: true },
    { key: "transcripts", name: "Academic transcripts/certificates", reason: "Required for school and visa processing.", required: true },
    { key: "sop", name: "Statement of purpose", reason: "Explains study intent and education pathway.", required: false },
  ],
  business: [
    { key: "biz-plan", name: "Business plan / investment memo", reason: "Required for business and founder pathways.", required: true },
    { key: "company", name: "Company/incorporation documents", reason: "Validates business structure and ownership.", required: true },
    { key: "tax", name: "Tax/compliance records", reason: "Supports legal and financial history checks.", required: false },
  ],
}

const ROUTE_DOCS: Record<RouteKey, Array<{ key: string; name: string; reason: string; required: boolean }>> = {
  uk: [
    { key: "tb", name: "TB test certificate (if required)", reason: "Often needed for long-stay UK routes.", required: false },
    { key: "sponsor", name: "Sponsor / offer evidence", reason: "Required for most UK work and sponsored pathways.", required: true },
  ],
  canada: [
    { key: "pof", name: "Detailed proof-of-funds evidence", reason: "Critical for Canada route scoring and submission.", required: true },
    { key: "eca", name: "Educational credential assessment", reason: "Required in many skilled and study streams.", required: false },
  ],
  europe: [
    { key: "insurance", name: "Travel/health insurance proof", reason: "Common requirement in many Europe pathways.", required: true },
    { key: "housing", name: "Housing contract / invitation", reason: "Supports settlement and compliance checks.", required: false },
  ],
}

function buildChecklist(route: RouteKey, purpose: PurposeKey): DocItem[] {
  const raw = [...BASE_DOCS, ...PURPOSE_DOCS[purpose], ...ROUTE_DOCS[route]]
  return raw.map((doc) => ({
    id: `${doc.key}-${route}-${purpose}`,
    name: doc.name,
    reason: doc.reason,
    status: "missing",
    notes: "",
    files: [],
    required: doc.required,
  }))
}

function statusPill(status: DocStatus) {
  if (status === "approved") return "bg-black text-white"
  if (status === "uploaded") return "bg-black/[0.08] text-black"
  if (status === "needs_fix") return "bg-black/[0.12] text-black"
  return "bg-black/[0.04] text-black/65"
}

export default function DocumentSupportPage() {
  const [route, setRoute] = React.useState<RouteKey>("uk")
  const [purpose, setPurpose] = React.useState<PurposeKey>("work")
  const [items, setItems] = React.useState<DocItem[]>(() => buildChecklist("uk", "work"))
  const [customDoc, setCustomDoc] = React.useState("")

  React.useEffect(() => {
    setItems(buildChecklist(route, purpose))
  }, [route, purpose])

  const uploaded = items.filter((x) => x.status === "uploaded" || x.status === "approved").length
  const approved = items.filter((x) => x.status === "approved").length
  const progress = items.length ? Math.round((uploaded / items.length) * 100) : 0

  function updateItem(id: string, patch: Partial<DocItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function onUpload(id: string, files: FileList | null) {
    if (!files || files.length === 0) return
    updateItem(id, { files: Array.from(files).map((f) => f.name), status: "uploaded" })
  }

  function addCustomDoc() {
    const value = customDoc.trim()
    if (!value) return
    setItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: value,
        reason: "Custom document added by user.",
        status: "missing",
        notes: "",
        files: [],
        required: false,
      },
    ])
    setCustomDoc("")
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <Link href="/suite" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/70 hover:text-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Suite
          </Link>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 mb-8 shadow-[0_24px_56px_-34px_rgba(0,0,0,0.42)]"
        >
          <h1 className="display-title text-3xl md:text-5xl text-black mb-2">
            Document Support Workspace
          </h1>
          <p className="text-black/70 mb-6 max-w-3xl">
            A practical tool for anybody preparing global travel or relocation for work, study, or business.
            Organize documents, track status, and know exactly what needs attention.
          </p>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-black/10 p-4 bg-white">
              <div className="text-xs text-black/60 mb-1">Route</div>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value as RouteKey)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-black"
              >
                {Object.entries(ROUTE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-black/10 p-4 bg-white">
              <div className="text-xs text-black/60 mb-1">Purpose</div>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as PurposeKey)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-black"
              >
                <option value="travel">Travel</option>
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="rounded-xl border border-black/10 p-4 bg-white">
              <div className="text-xs text-black/60 mb-1">Uploaded/Approved</div>
              <div className="text-xl font-bold text-black">{uploaded}/{items.length}</div>
            </div>
            <div className="rounded-xl border border-black/10 p-4 bg-white">
              <div className="text-xs text-black/60 mb-1">Fully approved</div>
              <div className="text-xl font-bold text-black">{approved}</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-black/10 p-3">
            <div className="flex items-center justify-between text-xs text-black/65 mb-1">
              <span>Document readiness</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/[0.08] overflow-hidden">
              <div className="h-full bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </motion.section>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FolderPlus className="w-4 h-4 text-black" />
            <h2 className="text-lg font-bold text-black">Checklist</h2>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.02, duration: 0.25 }}
                className="rounded-xl border border-black/10 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-black/70" />
                    <h3 className="font-semibold text-black">{item.name}</h3>
                    {item.required && <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-black text-white px-2 py-0.5">Required</span>}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 ${statusPill(item.status)}`}>
                    {item.status.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-black/60 mb-3">{item.reason}</p>

                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-black/60 mb-1 block">Status</label>
                    <select
                      value={item.status}
                      onChange={(e) => updateItem(item.id, { status: e.target.value as DocStatus })}
                      className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black"
                    >
                      <option value="missing">Missing</option>
                      <option value="uploaded">Uploaded</option>
                      <option value="needs_fix">Needs fix</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-black/60 mb-1 block">Upload files</label>
                    <label className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-black cursor-pointer hover:bg-black/[0.03]">
                      <UploadCloud className="w-4 h-4" />
                      Add file(s)
                      <input type="file" multiple className="hidden" onChange={(e) => onUpload(item.id, e.target.files)} />
                    </label>
                  </div>

                  <div>
                    <label className="text-[11px] text-black/60 mb-1 block">Notes</label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                      placeholder="e.g. renew before upload"
                      className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black"
                    />
                  </div>
                </div>

                {item.files.length > 0 && (
                  <div className="mt-3 text-xs text-black/65 border-t border-black/10 pt-2">
                    <span className="font-semibold text-black/75">Files:</span> {item.files.join(", ")}
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h3 className="font-bold text-black mb-2">Add custom document</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customDoc}
              onChange={(e) => setCustomDoc(e.target.value)}
              placeholder="e.g. Business registration certificate"
              className="flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black"
            />
            <Button onClick={addCustomDoc} className="gap-2">
              Add to checklist <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-3 text-xs text-black/60 inline-flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            This workspace is for planning and support. Final visa decisions are made by government authorities.
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link href="/qualify">
            <Button variant="outline" className="gap-2">Run migration assessment <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
