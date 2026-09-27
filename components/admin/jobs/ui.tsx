"use client"

import { createContext, useCallback, useContext, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react"
import { clsx } from "clsx"

/* ---------- API ---------- */

export async function adminApi<T = Record<string, unknown>>(path: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(
    path,
    body
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      : { cache: "no-store" },
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`)
  return data as T
}

/* ---------- Notifications ---------- */

type Tone = "success" | "error" | "info"
type Toast = { id: number; message: string; tone: Tone }
const NotifyContext = createContext<(message: string, tone?: Tone) => void>(() => {})

export function NotifyProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const notify = useCallback((message: string, tone: Tone = "success") => {
    const id = nextId.current++
    setToasts((prev) => [...prev.slice(-3), { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), tone === "error" ? 8000 : 4500)
  }, [])
  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={clsx(
              "pointer-events-auto rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur",
              toast.tone === "error" && "border-rose-400/30 bg-rose-950/90 text-rose-100",
              toast.tone === "success" && "border-emerald-400/30 bg-emerald-950/90 text-emerald-100",
              toast.tone === "info" && "border-white/15 bg-slate-900/90 text-white",
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </NotifyContext.Provider>
  )
}

export const useNotify = () => useContext(NotifyContext)

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong"
}

/* ---------- Primitives ---------- */

export const inputClass =
  "h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#e0511f]"

type Variant = "primary" | "secondary" | "danger" | "success" | "light" | "ghost"

const VARIANTS: Record<Variant, string> = {
  primary: "bg-[#e0511f] text-white hover:bg-[#c94619]",
  secondary: "bg-white/10 text-white hover:bg-white/15",
  danger: "bg-rose-500/20 text-rose-200 hover:bg-rose-500/30",
  success: "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30",
  light: "bg-white text-[#0f172a] hover:bg-white/90",
  ghost: "text-white/60 hover:bg-white/5 hover:text-white",
}

export function Btn({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" ? "h-7 px-2.5 text-[11px]" : "h-9 px-3.5 text-xs",
        VARIANTS[variant],
        className,
      )}
    />
  )
}

export function Check({ checked, onChange, disabled, label }: { checked: boolean; onChange: () => void; disabled?: boolean; label?: string }) {
  return (
    <input
      type="checkbox"
      aria-label={label ?? "Select"}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="h-4 w-4 shrink-0 cursor-pointer accent-[#e0511f]"
    />
  )
}

export function Panel({ title, description, actions, children, className }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx("rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-bold">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-white/50">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Pager({ page, totalPages, total, onPage, label = "items" }: { page: number; totalPages: number; total?: number; onPage: (page: number) => void; label?: string }) {
  if (totalPages <= 1 && total === undefined) return null
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
      <span>
        Page {page} of {totalPages}
        {total !== undefined ? ` · ${total.toLocaleString()} ${label}` : ""}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <Btn size="sm" disabled={page <= 1} onClick={() => onPage(1)}>First</Btn>
          <Btn size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Btn>
          <Btn size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Btn>
          <Btn size="sm" disabled={page >= totalPages} onClick={() => onPage(totalPages)}>Last</Btn>
        </div>
      )}
    </div>
  )
}

export function Badge({ tone = "neutral", children, title }: { tone?: "neutral" | "success" | "error" | "warning" | "info" | "accent"; children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold",
        tone === "neutral" && "bg-white/10 text-white/70",
        tone === "success" && "bg-emerald-500/15 text-emerald-300",
        tone === "error" && "bg-rose-500/15 text-rose-300",
        tone === "warning" && "bg-amber-500/15 text-amber-300",
        tone === "info" && "bg-sky-500/15 text-sky-300",
        tone === "accent" && "bg-[#e0511f]/20 text-[#ffb08f]",
      )}
    >
      {children}
    </span>
  )
}

export const SPONSOR_STATUS: Record<string, { label: string; tone: "success" | "warning" | "error" | "neutral" | "info"; hint: string }> = {
  licensed: { label: "On register", tone: "success", hint: "Company name matches the sponsor register for this country" },
  likely: { label: "Likely match", tone: "info", hint: "Partial name match on the register. Check before relying on it" },
  not_listed: { label: "Not on register", tone: "error", hint: "No company with this name on the sponsor register" },
  no_register: { label: "No register", tone: "neutral", hint: "No sponsor list loaded for this country yet" },
  no_company: { label: "No company", tone: "warning", hint: "The job has no company name to check" },
}

export function SponsorBadge({ status, match, register }: { status?: string | null; match?: string | null; register?: string | null }) {
  if (!status) return <span className="text-[10px] font-semibold uppercase tracking-wide text-white/25">Not checked</span>
  const meta = SPONSOR_STATUS[status] ?? { label: status, tone: "neutral" as const, hint: "" }
  const title = [meta.hint, match ? `Register name: ${match}` : null, register ? `Register: ${register.toUpperCase()}` : null].filter(Boolean).join("\n")
  return <Badge tone={meta.tone} title={title}>{meta.label}</Badge>
}

export function formatWhen(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })
}

export function formatDay(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
}

/* ---------- Selection ---------- */

export function useSelection<K extends string | number>() {
  const [selected, setSelected] = useState<Set<K>>(new Set())
  const toggle = useCallback((key: K) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])
  const toggleAll = useCallback((keys: K[]) => {
    setSelected((prev) => {
      const everySelected = keys.length > 0 && keys.every((key) => prev.has(key))
      const next = new Set(prev)
      keys.forEach((key) => (everySelected ? next.delete(key) : next.add(key)))
      return next
    })
  }, [])
  const clear = useCallback(() => setSelected(new Set()), [])
  const allOf = useCallback((keys: K[]) => keys.length > 0 && keys.every((key) => selected.has(key)), [selected])
  return { selected, toggle, toggleAll, clear, allOf, setSelected }
}

/* ---------- Job form ---------- */

export const JOB_CATEGORIES = ["Technology", "Finance", "Healthcare", "Engineering", "Marketing", "Education", "Other"]
export const JOB_LEVELS = ["Entry Level", "Mid Level", "Senior Level"]
export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote", "Fixed-Term Contract", "Apprenticeship"]
export const VISA_TYPES = ["UK Skilled Worker", "EU Blue Card", "H-1B (US)", "Canada Work Permit", "Australia Skilled Visa", "Other"]

export type JobFormValues = {
  title: string
  company: string
  location: string
  country: string
  category: string
  experienceLevel: string
  jobType: string
  visaType: string
  url: string
  logoUrl: string
  expiresAt: string
  skills: string
  description: string
}

export const EMPTY_JOB_FORM: JobFormValues = {
  title: "",
  company: "",
  location: "",
  country: "United Kingdom",
  category: "Technology",
  experienceLevel: "Mid Level",
  jobType: "Full-time",
  visaType: "UK Skilled Worker",
  url: "",
  logoUrl: "",
  expiresAt: "",
  skills: "",
  description: "",
}

export function JobForm({
  values,
  onChange,
  countries = [],
  showLogo = true,
}: {
  values: JobFormValues
  onChange: (values: JobFormValues) => void
  countries?: string[]
  showLogo?: boolean
}) {
  const field = (key: keyof JobFormValues) => ({
    value: values[key],
    onChange: (event: { target: { value: string } }) => onChange({ ...values, [key]: event.target.value }),
  })
  const listId = useId()
  const label = "block text-[10px] font-bold uppercase tracking-wide text-white/40"
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="sm:col-span-2"><span className={label}>Title</span><input className={`${inputClass} mt-1 w-full`} {...field("title")} /></label>
      <label className="sm:col-span-2"><span className={label}>Company</span><input className={`${inputClass} mt-1 w-full`} {...field("company")} /></label>
      <label><span className={label}>Location</span><input className={`${inputClass} mt-1 w-full`} {...field("location")} placeholder="London, UK" /></label>
      <label>
        <span className={label}>Country</span>
        <input className={`${inputClass} mt-1 w-full`} list={listId} {...field("country")} />
        <datalist id={listId}>{countries.map((c) => <option key={c} value={c} />)}</datalist>
      </label>
      <label><span className={label}>Category</span>
        <select className={`${inputClass} mt-1 w-full`} {...field("category")}>
          {[...new Set([values.category, ...JOB_CATEGORIES])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label><span className={label}>Visa type</span>
        <select className={`${inputClass} mt-1 w-full`} {...field("visaType")}>
          {[...new Set([values.visaType, ...VISA_TYPES])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label><span className={label}>Experience</span>
        <select className={`${inputClass} mt-1 w-full`} {...field("experienceLevel")}>
          {[...new Set([values.experienceLevel, ...JOB_LEVELS])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label><span className={label}>Job type</span>
        <select className={`${inputClass} mt-1 w-full`} {...field("jobType")}>
          {[...new Set([values.jobType, ...JOB_TYPES])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className="sm:col-span-2"><span className={label}>Job URL</span><input className={`${inputClass} mt-1 w-full`} {...field("url")} placeholder="https://" /></label>
      {showLogo && (
        <>
          <label><span className={label}>Logo URL</span><input className={`${inputClass} mt-1 w-full`} {...field("logoUrl")} placeholder="Optional" /></label>
          <label><span className={label}>Expires</span><input className={`${inputClass} mt-1 w-full`} {...field("expiresAt")} placeholder="e.g. 31 Oct 2026" /></label>
        </>
      )}
      <label className="sm:col-span-2 lg:col-span-4"><span className={label}>Skills (comma separated)</span><input className={`${inputClass} mt-1 w-full`} {...field("skills")} /></label>
      <label className="sm:col-span-2 lg:col-span-4">
        <span className={label}>Description</span>
        <textarea className={`${inputClass} mt-1 h-28 w-full py-2`} {...field("description")} />
      </label>
    </div>
  )
}

export function formToPayload(values: JobFormValues) {
  return { ...values, skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean) }
}

/* ---------- Bulk fetch runner ---------- */

export type FetchTarget = { key: string; name: string; url: string; savedUrlId?: number | null }
export type TargetStatus =
  | { state: "queued" }
  | { state: "running" }
  | { state: "success"; staged: number; found: number; duplicates: number; method?: string }
  | { state: "failed"; error: string }

export const FETCH_CONCURRENCY = 3

export function useFetchRunner(source: "bulk" | "sponsor") {
  const [statuses, setStatuses] = useState<Record<string, TargetStatus>>({})
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const cancelRef = useRef(false)

  const setStatus = (key: string, status: TargetStatus | null) =>
    setStatuses((prev) => {
      const next = { ...prev }
      if (status) next[key] = status
      else delete next[key]
      return next
    })

  const run = useCallback(
    async (targets: FetchTarget[], prepare?: (target: FetchTarget) => Promise<FetchTarget>) => {
      if (!targets.length) return { succeeded: 0, failed: 0, staged: 0, cancelled: false }
      cancelRef.current = false
      setRunning(true)
      setProgress({ done: 0, total: targets.length })
      targets.forEach((t) => setStatus(t.key, { state: "queued" }))
      const queue = [...targets]
      const totals = { succeeded: 0, failed: 0, staged: 0 }

      const worker = async () => {
        while (queue.length) {
          if (cancelRef.current) {
            queue.splice(0).forEach((t) => setStatus(t.key, null))
            return
          }
          const original = queue.shift()
          if (!original) return
          setStatus(original.key, { state: "running" })
          try {
            const target = prepare ? await prepare(original) : original
            const data = await adminApi<{ staged: number; found: number; duplicates: number; method: string }>("/api/admin/career-jobs", {
              action: "fetch-url",
              id: target.savedUrlId ?? undefined,
              url: target.url,
              company: target.name,
              source,
            })
            totals.succeeded += 1
            totals.staged += data.staged
            setStatus(original.key, { state: "success", staged: data.staged, found: data.found, duplicates: data.duplicates, method: data.method })
          } catch (error) {
            totals.failed += 1
            setStatus(original.key, { state: "failed", error: errorMessage(error) })
          }
          setProgress((prev) => ({ ...prev, done: prev.done + 1 }))
        }
      }

      await Promise.all(Array.from({ length: Math.min(FETCH_CONCURRENCY, targets.length) }, worker))
      setRunning(false)
      return { ...totals, cancelled: cancelRef.current }
    },
    [source],
  )

  const cancel = useCallback(() => {
    cancelRef.current = true
  }, [])
  const reset = useCallback(() => {
    setStatuses({})
    setProgress({ done: 0, total: 0 })
  }, [])

  return { statuses, running, progress, run, cancel, reset }
}

export function RunStatus({ status, persisted }: { status?: TargetStatus; persisted?: { status: string | null; error?: string | null; at?: string | null } }) {
  if (status?.state === "queued") return <Badge>Queued</Badge>
  if (status?.state === "running") return <Badge tone="info">Fetching…</Badge>
  if (status?.state === "success") {
    return (
      <div className="space-y-0.5">
        <Badge tone={status.staged > 0 ? "success" : "warning"}>
          {status.staged} staged · {status.found} found
        </Badge>
        {status.method && <p className="text-[10px] text-white/40">via {status.method}{status.duplicates ? ` · ${status.duplicates} dupes skipped` : ""}</p>}
      </div>
    )
  }
  if (status?.state === "failed") {
    return (
      <div className="space-y-0.5">
        <Badge tone="error" title={status.error}>Failed</Badge>
        <p className="max-w-[14rem] truncate text-[10px] text-rose-300/80" title={status.error}>{status.error}</p>
      </div>
    )
  }
  if (persisted?.status === "failed") {
    return (
      <div className="space-y-0.5">
        <Badge tone="error" title={persisted.error ?? undefined}>Failed last run</Badge>
        <p className="max-w-[14rem] truncate text-[10px] text-white/40" title={persisted.error ?? undefined}>{formatWhen(persisted.at)}</p>
      </div>
    )
  }
  if (persisted?.status === "success") {
    return (
      <div className="space-y-0.5">
        <Badge tone="success">OK last run</Badge>
        <p className="text-[10px] text-white/40">{formatWhen(persisted.at)}</p>
      </div>
    )
  }
  return <span className="text-xs text-white/30">Not fetched</span>
}
