"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ExternalLink, FileUp, Loader2, Play, RotateCcw, Square, Trash2 } from "lucide-react"
import { COUNTRY_GUIDES } from "@/lib/sponsors/country-guides"
import { Btn, Check, Panel, SPONSOR_STATUS, adminApi, errorMessage, formatWhen, inputClass, useNotify } from "./ui"

type Register = {
  id: string
  country: string
  label: string
  visaType: string | null
  sourceUrl: string | null
  entries: number
  builtIn: boolean
  updatedAt: string | null
}

type Summary = {
  total: number
  unchecked: number
  byStatus: Record<string, number>
  taggedNotListed: number
  tagsApplied: number
}

type Overview = { registers: Register[]; summary: Summary }
type ParsedRow = { name: string; city: string | null; route: string | null }

const QUEUE_SIZE = 500
const CHECK_CHUNK = 250
const IMPORT_CHUNK = 2000

/** Minimal CSV reader: handles quoted fields, commas and new lines inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i += 1
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === "," || ch === "\t" || ch === ";") {
      row.push(field)
      field = ""
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1
      row.push(field)
      if (row.some((cell) => cell.trim())) rows.push(row)
      row = []
      field = ""
    } else field += ch
  }
  row.push(field)
  if (row.some((cell) => cell.trim())) rows.push(row)
  return rows
}

function toRegisterRows(text: string): ParsedRow[] {
  const rows = parseCsv(text)
  if (!rows.length) return []
  const header = rows[0].map((cell) => cell.trim().toLowerCase())
  const nameCol = header.findIndex((cell) => /name|organi[sz]ation|company|employer|sponsor|werkgever|naam/.test(cell))
  const hasHeader = nameCol >= 0
  const cityCol = hasHeader ? header.findIndex((cell) => /city|town|location|plaats/.test(cell)) : -1
  const routeCol = hasHeader ? header.findIndex((cell) => /route|type|category|permit/.test(cell)) : -1
  return (hasHeader ? rows.slice(1) : rows)
    .map((cells) => ({
      name: (cells[hasHeader ? nameCol : 0] ?? "").trim(),
      city: cityCol >= 0 ? cells[cityCol]?.trim() || null : null,
      route: routeCol >= 0 ? cells[routeCol]?.trim() || null : null,
    }))
    .filter((row) => row.name.length > 1)
}

const REGISTER_PRESETS = COUNTRY_GUIDES.filter((guide) => guide.register).map((guide) => ({
  country: guide.jobCountries[0] ?? guide.name,
  label: guide.register!.label,
  url: guide.register!.url,
}))

export function SponsorCheckTab({ onJobsChanged }: { onJobsChanged: () => void }) {
  const notify = useNotify()
  const [data, setData] = useState<Overview | null>(null)
  const [applyTags, setApplyTags] = useState(true)
  const [running, setRunning] = useState<string | null>(null)
  const [progress, setProgress] = useState({ done: 0, total: 0, licensed: 0, likely: 0, notListed: 0, tagged: 0 })
  const cancelled = useRef(false)

  const [country, setCountry] = useState("")
  const [label, setLabel] = useState("")
  const [visaType, setVisaType] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [paste, setPaste] = useState("")
  const [parsed, setParsed] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState("")
  const [replace, setReplace] = useState(true)
  const [importing, setImporting] = useState<string | null>(null)

  const load = useCallback(() => {
    return adminApi<Overview>("/api/admin/sponsor-check")
      .then(setData)
      .catch((error: unknown) => notify(errorMessage(error), "error"))
  }, [notify])

  useEffect(() => {
    void load()
  }, [load])

  async function runCheck(mode: "unchecked" | "all" | "country", onlyCountry?: string) {
    cancelled.current = false
    const before = mode === "unchecked" ? null : new Date().toISOString()
    setRunning(mode === "country" ? `Rechecking ${onlyCountry}` : mode === "all" ? "Rechecking every job" : "Checking unchecked jobs")
    const tally = { done: 0, total: 0, licensed: 0, likely: 0, notListed: 0, tagged: 0 }
    setProgress(tally)
    try {
      for (;;) {
        if (cancelled.current) break
        const queue = await adminApi<{ ids: number[]; remaining: number }>("/api/admin/sponsor-check", {
          action: "queue",
          limit: QUEUE_SIZE,
          before,
          country: onlyCountry ?? null,
        })
        if (!tally.total) tally.total = queue.remaining
        if (!queue.ids.length) break
        for (let i = 0; i < queue.ids.length && !cancelled.current; i += CHECK_CHUNK) {
          const { results } = await adminApi<{ results: Array<{ status: string; tagApplied: string | null }> }>(
            "/api/admin/sponsor-check",
            { action: "check", ids: queue.ids.slice(i, i + CHECK_CHUNK), applyTags },
          )
          tally.done += results.length
          tally.licensed += results.filter((r) => r.status === "licensed").length
          tally.likely += results.filter((r) => r.status === "likely").length
          tally.notListed += results.filter((r) => r.status === "not_listed").length
          tally.tagged += results.filter((r) => r.tagApplied).length
          setProgress({ ...tally })
        }
      }
      notify(
        `${cancelled.current ? "Stopped" : "Done"}: ${tally.done.toLocaleString()} checked · ${tally.licensed} on register · ${tally.likely} likely · ${tally.notListed} not listed · ${tally.tagged} tagged.`,
      )
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setRunning(null)
      void load()
      onJobsChanged()
    }
  }

  function choosePreset(value: string) {
    setCountry(value)
    const preset = REGISTER_PRESETS.find((p) => p.country === value)
    if (preset) {
      setLabel((current) => current || preset.label)
      setSourceUrl((current) => current || preset.url)
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return
    const text = await file.text()
    setFileName(file.name)
    setPaste("")
    setParsed(toRegisterRows(text))
  }

  async function importRegister() {
    const rows = parsed.length ? parsed : toRegisterRows(paste)
    if (!country.trim()) return notify("Choose the country this list is for.", "error")
    if (!rows.length) return notify("No company names found. Upload a CSV or paste one name per line.", "error")
    try {
      let inserted = 0
      for (let i = 0; i < rows.length; i += IMPORT_CHUNK) {
        setImporting(`Importing ${Math.min(i + IMPORT_CHUNK, rows.length).toLocaleString()} / ${rows.length.toLocaleString()}…`)
        const result = await adminApi<{ inserted: number }>("/api/admin/sponsor-check", {
          action: "import-register",
          country,
          label,
          visaType,
          sourceUrl,
          rows: rows.slice(i, i + IMPORT_CHUNK),
          replace: replace && i === 0,
        })
        inserted += result.inserted
      }
      notify(`Imported ${inserted.toLocaleString()} sponsors for ${country}. Recheck ${country} jobs to flag them.`)
      setParsed([])
      setPaste("")
      setFileName("")
      await load()
    } catch (error) {
      notify(errorMessage(error), "error")
    } finally {
      setImporting(null)
    }
  }

  async function removeRegister(register: Register) {
    if (!window.confirm(`Delete the ${register.country} register (${register.entries.toLocaleString()} names) and its check results?`)) return
    try {
      await adminApi("/api/admin/sponsor-check", { action: "delete-register", id: register.id })
      notify(`Deleted the ${register.country} register.`)
      await load()
      onJobsChanged()
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const summary = data?.summary
  const checked = summary ? summary.total - summary.unchecked : 0
  const previewRows = parsed.length ? parsed : paste ? toRegisterRows(paste) : []

  return (
    <div className="space-y-4">
      <Panel
        title="Sponsor check"
        description="Match each job's company against the sponsor register for its country. Exact matches can be tagged with that country's visa route automatically. Tags are never removed without you."
        actions={
          running ? (
            <>
              <span className="text-xs font-bold text-sky-200">
                <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />
                {running}: {progress.done.toLocaleString()} / {progress.total.toLocaleString()}
              </span>
              <Btn variant="danger" onClick={() => { cancelled.current = true }}><Square className="h-3 w-3" /> Stop</Btn>
            </>
          ) : (
            <>
              <label className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <Check checked={applyTags} onChange={() => setApplyTags((v) => !v)} label="Tag exact matches" /> Tag exact matches
              </label>
              <Btn variant="primary" disabled={!summary?.unchecked} onClick={() => void runCheck("unchecked")}>
                <Play className="h-3.5 w-3.5" /> Check unchecked ({(summary?.unchecked ?? 0).toLocaleString()})
              </Btn>
              <Btn onClick={() => void runCheck("all")}><RotateCcw className="h-3.5 w-3.5" /> Recheck all</Btn>
            </>
          )
        }
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Checked", value: `${checked.toLocaleString()} / ${(summary?.total ?? 0).toLocaleString()}`, tone: "text-white" },
            { label: SPONSOR_STATUS.licensed.label, value: summary?.byStatus.licensed ?? 0, tone: "text-emerald-300" },
            { label: SPONSOR_STATUS.likely.label, value: summary?.byStatus.likely ?? 0, tone: "text-sky-300" },
            { label: SPONSOR_STATUS.not_listed.label, value: summary?.byStatus.not_listed ?? 0, tone: "text-rose-300" },
            { label: SPONSOR_STATUS.no_register.label, value: summary?.byStatus.no_register ?? 0, tone: "text-white/60" },
            { label: "Tagged but not on register", value: summary?.taggedNotListed ?? 0, tone: "text-amber-300" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">{card.label}</p>
              <p className={`mt-1 text-lg font-bold ${card.tone}`}>{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
            </div>
          ))}
        </div>
        {running && progress.done > 0 && (
          <p className="mt-3 text-xs text-white/60">
            This run: {progress.licensed} on register · {progress.likely} likely · {progress.notListed} not listed · {progress.tagged} newly tagged
          </p>
        )}
        <p className="mt-3 text-[11px] text-white/40">
          Review results in the Jobs tab with the “Sponsor” filter. “Tagged but not on register” lists jobs whose visa tag the register does not back up; select them there and use “Clear visa tag”.
        </p>
      </Panel>

      <Panel title="Sponsor registers" description="One list per country. The UK register is built in; add other countries by importing their official list.">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/[0.04] text-[10px] uppercase tracking-wide text-white/40">
              <tr>
                <th className="p-3">Country</th>
                <th className="p-3">Register</th>
                <th className="p-3">Companies</th>
                <th className="p-3">Visa tag for matches</th>
                <th className="p-3">Updated</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.registers ?? []).map((register) => (
                <tr key={register.id} className="border-t border-white/5">
                  <td className="p-3 font-semibold">{register.country}{register.builtIn && <span className="ml-2 text-[10px] font-bold uppercase text-white/30">Built in</span>}</td>
                  <td className="p-3 text-xs text-white/60">
                    {register.sourceUrl ? (
                      <a href={register.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                        {register.label} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : register.label}
                  </td>
                  <td className="p-3 text-xs">{register.entries.toLocaleString()}</td>
                  <td className="p-3 text-xs text-white/60">{register.visaType ?? <span className="text-white/30">Flag only</span>}</td>
                  <td className="p-3 text-xs text-white/40">{register.builtIn ? "—" : formatWhen(register.updatedAt)}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Btn size="sm" disabled={Boolean(running)} onClick={() => void runCheck("country", register.country)}>
                        <RotateCcw className="h-3 w-3" /> Recheck jobs
                      </Btn>
                      {!register.builtIn && (
                        <Btn size="sm" variant="ghost" className="hover:text-rose-300" onClick={() => void removeRegister(register)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-bold">Import a country register</p>
          <p className="mt-0.5 text-xs text-white/50">
            Upload the official list as CSV, or paste one company per line. A column called name, organisation, company or employer is used for the company; city and route columns are optional.
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <label className="text-xs">
              <span className="mb-1 block font-semibold text-white/60">Country (must match the job country)</span>
              <input className={`${inputClass} w-full`} list="register-countries" value={country} onChange={(e) => choosePreset(e.target.value)} placeholder="e.g. Netherlands" />
              <datalist id="register-countries">
                {REGISTER_PRESETS.map((p) => <option key={p.country} value={p.country} />)}
              </datalist>
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-semibold text-white/60">Visa tag for exact matches (optional)</span>
              <input className={`${inputClass} w-full`} value={visaType} onChange={(e) => setVisaType(e.target.value)} placeholder="e.g. Netherlands Highly Skilled Migrant" />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-semibold text-white/60">Register name</span>
              <input className={`${inputClass} w-full`} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. IND public register of recognised sponsors" />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-semibold text-white/60">Source URL</span>
              <input className={`${inputClass} w-full`} value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://…" />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-3.5 text-xs font-bold hover:bg-white/15">
              <FileUp className="h-3.5 w-3.5" /> {fileName || "Upload CSV"}
              <input type="file" accept=".csv,.txt,.tsv,text/csv" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
            </label>
            <span className="text-xs text-white/40">or paste below</span>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <Check checked={replace} onChange={() => setReplace((v) => !v)} label="Replace existing list" /> Replace existing list for this country
            </label>
          </div>
          <textarea
            className="mt-2 h-28 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white outline-none placeholder:text-white/30 focus:border-[#e0511f]"
            value={paste}
            onChange={(e) => { setPaste(e.target.value); setParsed([]); setFileName("") }}
            placeholder={"name,city\nASML Netherlands B.V.,Veldhoven\nBooking.com B.V.,Amsterdam"}
          />
          {previewRows.length > 0 && (
            <p className="mt-2 text-xs text-white/60">
              {previewRows.length.toLocaleString()} companies found · e.g. {previewRows.slice(0, 4).map((r) => r.name).join(" · ")}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <Btn variant="primary" disabled={Boolean(importing) || !previewRows.length || !country.trim()} onClick={() => void importRegister()}>
              {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />} Import register
            </Btn>
            {importing && <span className="text-xs text-sky-200">{importing}</span>}
          </div>
        </div>
      </Panel>
    </div>
  )
}
