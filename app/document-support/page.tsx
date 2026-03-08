"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  FileText,
  FolderPlus,
  Info,
  LayoutDashboard,
  RotateCcw,
  Search,
  Trash2,
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
const STORAGE_PREFIX = "emz-doc-workspace"
const PREFERENCES_KEY = `${STORAGE_PREFIX}:preferences`
type DocFilter = "all" | "required" | DocStatus

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

function storageKey(route: RouteKey, purpose: PurposeKey) {
  return `${STORAGE_PREFIX}:${route}:${purpose}`
}

function sanitizeStoredItems(payload: unknown): DocItem[] | null {
  if (!Array.isArray(payload)) return null
  const valid: DocStatus[] = ["missing", "uploaded", "needs_fix", "approved"]
  const normalized = payload
    .map((item): DocItem | null => {
      if (!item || typeof item !== "object") return null
      const source = item as Partial<DocItem>
      if (!source.id || !source.name || !source.reason) return null
      if (!source.status || !valid.includes(source.status)) return null
      return {
        id: String(source.id),
        name: String(source.name),
        reason: String(source.reason),
        status: source.status,
        notes: typeof source.notes === "string" ? source.notes : "",
        files: Array.isArray(source.files) ? source.files.map(String) : [],
        required: Boolean(source.required),
      }
    })
    .filter((item): item is DocItem => item !== null)
  return normalized.length ? normalized : null
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
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<DocFilter>("all")

  React.useEffect(() => {
    try {
      const cachedPreferences = window.localStorage.getItem(PREFERENCES_KEY)
      if (!cachedPreferences) return
      const parsed = JSON.parse(cachedPreferences) as { route?: RouteKey; purpose?: PurposeKey }
      if (parsed.route) setRoute(parsed.route)
      if (parsed.purpose) setPurpose(parsed.purpose)
    } catch {
      // Ignore localStorage parsing errors and continue with defaults.
    }
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ route, purpose }))
    } catch {
      // Ignore localStorage write issues in restricted browsers.
    }
  }, [route, purpose])

  React.useEffect(() => {
    try {
      const cached = window.localStorage.getItem(storageKey(route, purpose))
      if (!cached) {
        setItems(buildChecklist(route, purpose))
        return
      }
      const parsed = sanitizeStoredItems(JSON.parse(cached))
      setItems(parsed ?? buildChecklist(route, purpose))
    } catch {
      setItems(buildChecklist(route, purpose))
    }
    setQuery("")
    setFilter("all")
  }, [route, purpose])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(route, purpose), JSON.stringify(items))
    } catch {
      // Ignore localStorage write issues in restricted browsers.
    }
  }, [items, route, purpose])

  const uploaded = items.filter((x) => x.status === "uploaded" || x.status === "approved").length
  const approved = items.filter((x) => x.status === "approved").length
  const missing = items.filter((x) => x.status === "missing").length
  const needsFix = items.filter((x) => x.status === "needs_fix").length
  const requiredMissing = items.filter((x) => x.required && x.status === "missing").length
  const progress = items.length ? Math.round((uploaded / items.length) * 100) : 0

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesText = query.trim()
        ? `${item.name} ${item.reason} ${item.notes}`.toLowerCase().includes(query.trim().toLowerCase())
        : true
      if (!matchesText) return false
      if (filter === "all") return true
      if (filter === "required") return item.required
      return item.status === filter
    })
  }, [items, query, filter])

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

  function resetCurrentChecklist() {
    setItems(buildChecklist(route, purpose))
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 bg-gradient-to-b from-white via-white to-black/[0.02]">
      <div className="max-w-7xl mx-auto">
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
          className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 mb-6 shadow-[0_24px_56px_-34px_rgba(0,0,0,0.42)]"
        >
          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-5 items-start">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold rounded-full bg-black/[0.05] border border-black/10 px-2.5 py-1 mb-3">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Document operations
              </div>
              <h1 className="display-title text-3xl md:text-5xl text-black mb-2">
                Document Support Workspace
              </h1>
              <p className="text-black/70 max-w-3xl">
                Platform mode for document processing: manage readiness, resolve blockers, and keep submission quality high for work, study, business, or travel routes.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Route mapped", "Checklist tracked", "Quality flags visible", "Progress persisted"].map((item) => (
                  <span key={item} className="rounded-full border border-black/12 bg-black/[0.03] px-2.5 py-1 text-[11px] font-semibold text-black/75">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-black text-white p-5">
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 mb-2">
                <Activity className="w-3.5 h-3.5" />
                Workspace status
              </div>
              <div className="text-3xl font-bold mb-1">{progress}%</div>
              <p className="text-xs text-white/70 mb-4">Document readiness across current route and purpose.</p>
              <div className="h-2 rounded-full bg-white/15 overflow-hidden mb-3">
                <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-white/15 bg-white/[0.06] p-2">
                  <div className="text-white/65">Approved</div>
                  <div className="font-bold text-sm">{approved}</div>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/[0.06] p-2">
                  <div className="text-white/65">Needs fix</div>
                  <div className="font-bold text-sm">{needsFix}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mb-6 grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {[
            { label: "Uploaded / Approved", value: `${uploaded}/${items.length}` },
            { label: "Fully approved", value: String(approved) },
            { label: "Missing", value: String(missing) },
            { label: "Required still missing", value: String(requiredMissing) },
            { label: "Needs fix", value: String(needsFix) },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-black/10 bg-white p-4">
              <div className="text-[11px] uppercase tracking-wider text-black/55 font-semibold">{item.label}</div>
              <div className="text-xl font-bold text-black mt-1">{item.value}</div>
            </article>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1.35fr_0.65fr] gap-5 items-start">
          <div>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-black" />
                <h2 className="text-lg font-bold text-black">Checklist queue</h2>
                <span className="text-xs text-black/60">Showing {filteredItems.length} of {items.length}</span>
              </div>
              <button
                type="button"
                onClick={resetCurrentChecklist}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/70 hover:text-black transition-colors rounded-lg border border-black/15 px-2.5 py-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset checklist
              </button>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-3 mb-3">
              <div className="grid md:grid-cols-[1fr_auto] gap-3">
                <label className="relative">
                  <Search className="w-4 h-4 text-black/45 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search documents, notes, or reasons"
                    className="w-full rounded-lg border border-black/15 bg-white pl-9 pr-3 py-2 text-sm text-black"
                  />
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "all", label: "All" },
                    { value: "required", label: "Required" },
                    { value: "missing", label: "Missing" },
                    { value: "uploaded", label: "Uploaded" },
                    { value: "needs_fix", label: "Needs fix" },
                    { value: "approved", label: "Approved" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFilter(option.value as DocFilter)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                        filter === option.value
                          ? "bg-black text-white border-black"
                          : "bg-white text-black/70 border-black/15 hover:text-black"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredItems.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.02, duration: 0.25 }}
                  className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(0,0,0,0.42)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-black/70" />
                      <h3 className="font-semibold text-black">{item.name}</h3>
                      {item.required && <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-black text-white px-2 py-0.5">Required</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 ${statusPill(item.status)}`}>
                        {item.status.replace("_", " ")}
                      </span>
                      {item.id.startsWith("custom-") && (
                        <button
                          type="button"
                          onClick={() => setItems((prev) => prev.filter((doc) => doc.id !== item.id))}
                          className="inline-flex items-center justify-center rounded-md border border-black/15 text-black/60 hover:text-black w-7 h-7"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
            {filteredItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-black/20 bg-white p-6 text-center text-sm text-black/60">
                No checklist items match this filter.
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <h3 className="font-bold text-black mb-3">Workspace controls</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-black/55 font-semibold mb-1 block">Route</label>
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
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-black/55 font-semibold mb-1 block">Purpose</label>
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
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <h3 className="font-bold text-black mb-2">Add custom document</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={customDoc}
                  onChange={(e) => setCustomDoc(e.target.value)}
                  placeholder="e.g. Business registration certificate"
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black"
                />
                <Button onClick={addCustomDoc} className="w-full gap-2">
                  Add document <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-3 text-xs text-black/60 inline-flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Planning support only. Final decisions are made by authorities.
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-black text-white p-5">
              <h3 className="font-bold mb-3">Next actions</h3>
              <div className="space-y-2">
                <Link href="/qualify" className="flex items-center justify-between rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm hover:bg-white/[0.1] transition-colors">
                  Run assessment <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/calculator" className="flex items-center justify-between rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm hover:bg-white/[0.1] transition-colors">
                  Open calculator <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/suite" className="flex items-center justify-between rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm hover:bg-white/[0.1] transition-colors">
                  Back to suite <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          </aside>
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
