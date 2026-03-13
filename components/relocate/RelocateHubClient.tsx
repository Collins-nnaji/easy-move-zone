"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, ClipboardCheck, Loader2, Plus, Trash2, Users, Wallet } from "lucide-react"
import type {
  RelocationContact,
  RelocationCountryGuide,
  RelocationPlan,
  RelocationTask,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "@/lib/relocate/types"

const EMPTY_PLAN: Omit<RelocationPlan, "id" | "authUserId" | "createdAt" | "updatedAt"> = {
  planName: "My relocation plan",
  originCity: "",
  originCountry: "",
  destinationCity: "",
  destinationCountry: "",
  moveDate: null,
  moveReason: "",
  householdSize: 1,
  workMode: "hybrid",
  visaPathway: "",
  status: "planning",
  budgetHousingUsd: 0,
  budgetTravelUsd: 0,
  budgetSetupUsd: 0,
  budgetBufferUsd: 0,
  notes: "",
}

const TASK_TEMPLATES: Array<{ title: string; category: TaskCategory; priority: TaskPriority }> = [
  { title: "Confirm visa eligibility and application route", category: "visa", priority: "high" },
  { title: "Prepare legal docs and certified translations", category: "legal", priority: "high" },
  { title: "Open destination bank account plan", category: "finance", priority: "medium" },
  { title: "Book flight and first 30-day accommodation", category: "logistics", priority: "medium" },
  { title: "Align work transition and notice periods", category: "career", priority: "medium" },
  { title: "Research schools/childcare and healthcare coverage", category: "family", priority: "medium" },
  { title: "Set up local SIM, transport, and utility onboarding", category: "settling", priority: "low" },
]

type AuthState = "loading" | "ready" | "unauthorized" | "error"

export function RelocateHubClient() {
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [plan, setPlan] = useState<RelocationPlan | null>(null)
  const [tasks, setTasks] = useState<RelocationTask[]>([])
  const [contacts, setContacts] = useState<RelocationContact[]>([])
  const [loading, setLoading] = useState(true)
  const [savingPlan, setSavingPlan] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [taskForm, setTaskForm] = useState({
    title: "",
    category: "logistics" as TaskCategory,
    priority: "medium" as TaskPriority,
    dueDate: "",
  })
  const [creatingTask, setCreatingTask] = useState(false)

  const [contactForm, setContactForm] = useState({
    name: "",
    serviceType: "",
    email: "",
    phone: "",
    website: "",
    notes: "",
  })
  const [creatingContact, setCreatingContact] = useState(false)
  const [guides, setGuides] = useState<RelocationCountryGuide[]>([])
  const [guidesLoading, setGuidesLoading] = useState(true)
  const [guideCountry, setGuideCountry] = useState("")
  const [monthlyRunwayCost, setMonthlyRunwayCost] = useState(1200)

  const budgetTotal = useMemo(() => {
    const p = plan ?? ({ ...EMPTY_PLAN } as Omit<RelocationPlan, "id" | "authUserId" | "createdAt" | "updatedAt">)
    return p.budgetHousingUsd + p.budgetTravelUsd + p.budgetSetupUsd + p.budgetBufferUsd
  }, [plan])

  const completedTasks = useMemo(() => tasks.filter((task) => task.status === "done").length, [tasks])
  const activeGuide = useMemo(() => {
    if (guides.length === 0) return null
    const bySelected = guides.find((guide) => guide.country.toLowerCase() === guideCountry.toLowerCase())
    if (bySelected) return bySelected
    return guides[0]
  }, [guideCountry, guides])
  const runwayMonths = useMemo(() => {
    if (!monthlyRunwayCost || monthlyRunwayCost <= 0) return 0
    return Math.floor(budgetTotal / monthlyRunwayCost)
  }, [budgetTotal, monthlyRunwayCost])

  async function loadWorkspace() {
    setLoading(true)
    setErrorMsg("")
    try {
      const res = await fetch("/api/relocate/plan", { cache: "no-store" })
      if (res.status === 401) {
        setAuthState("unauthorized")
        setPlan(null)
        setTasks([])
        setContacts([])
        return
      }
      if (!res.ok) {
        setAuthState("error")
        setErrorMsg("Unable to load relocation workspace right now.")
        return
      }
      const data = (await res.json()) as {
        plan: RelocationPlan | null
        tasks: RelocationTask[]
        contacts: RelocationContact[]
      }
      setAuthState("ready")
      setPlan(data.plan ?? null)
      setTasks(data.tasks ?? [])
      setContacts(data.contacts ?? [])
    } catch {
      setAuthState("error")
      setErrorMsg("Unable to load relocation workspace right now.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWorkspace()
  }, [])

  useEffect(() => {
    let mounted = true
    const loadGuides = async () => {
      setGuidesLoading(true)
      try {
        const res = await fetch("/api/relocate/guides", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { guides?: RelocationCountryGuide[] }
        if (!mounted) return
        const rows = data.guides ?? []
        setGuides(rows)
        if (rows.length > 0) {
          setGuideCountry((prev) => prev || rows[0].country)
        }
      } finally {
        if (mounted) setGuidesLoading(false)
      }
    }
    void loadGuides()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const destination = plan?.destinationCountry?.trim()
    if (!destination || guides.length === 0) return
    const matched = guides.find((guide) => guide.country.toLowerCase() === destination.toLowerCase())
    if (matched) setGuideCountry(matched.country)
  }, [guides, plan?.destinationCountry])

  function updatePlanField<K extends keyof typeof EMPTY_PLAN>(key: K, value: (typeof EMPTY_PLAN)[K]) {
    setPlan((prev) => {
      const baseline = prev ?? ({
        id: "",
        authUserId: "",
        createdAt: "",
        updatedAt: "",
        ...EMPTY_PLAN,
      } as RelocationPlan)
      return { ...baseline, [key]: value }
    })
  }

  async function savePlan() {
    const planToSave = plan ?? ({
      id: "",
      authUserId: "",
      createdAt: "",
      updatedAt: "",
      ...EMPTY_PLAN,
    } as RelocationPlan)
    setSavingPlan(true)
    setStatusMsg("")
    setErrorMsg("")
    try {
      const res = await fetch("/api/relocate/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planToSave }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setErrorMsg(data.error ?? "Unable to save relocation plan.")
        return
      }
      const data = (await res.json()) as { plan: RelocationPlan }
      setPlan(data.plan)
      setStatusMsg("Relocation plan saved.")
    } catch {
      setErrorMsg("Unable to save relocation plan.")
    } finally {
      setSavingPlan(false)
    }
  }

  async function createTask(input: { title: string; category: TaskCategory; priority: TaskPriority; dueDate?: string }) {
    const cleanTitle = input.title.trim()
    if (!cleanTitle) return
    setCreatingTask(true)
    setErrorMsg("")
    try {
      const res = await fetch("/api/relocate/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          category: input.category,
          priority: input.priority,
          dueDate: input.dueDate || null,
        }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setErrorMsg(data.error ?? "Unable to create task.")
        return
      }
      const data = (await res.json()) as { task: RelocationTask }
      setTasks((prev) => [data.task, ...prev])
      setTaskForm({ title: "", category: "logistics", priority: "medium", dueDate: "" })
    } catch {
      setErrorMsg("Unable to create task.")
    } finally {
      setCreatingTask(false)
    }
  }

  async function patchTask(taskId: string, patch: Partial<Pick<RelocationTask, "status" | "title" | "category" | "priority" | "dueDate" | "notes">>) {
    try {
      const res = await fetch(`/api/relocate/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!res.ok) return
      const data = (await res.json()) as { task: RelocationTask }
      setTasks((prev) => prev.map((task) => (task.id === taskId ? data.task : task)))
    } catch {
      // noop
    }
  }

  async function deleteTask(taskId: string) {
    const prev = tasks
    setTasks((list) => list.filter((task) => task.id !== taskId))
    const res = await fetch(`/api/relocate/tasks/${taskId}`, { method: "DELETE" })
    if (!res.ok) setTasks(prev)
  }

  async function createContact() {
    if (!contactForm.name.trim() || !contactForm.serviceType.trim()) return
    setCreatingContact(true)
    setErrorMsg("")
    try {
      const res = await fetch("/api/relocate/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setErrorMsg(data.error ?? "Unable to add contact.")
        return
      }
      const data = (await res.json()) as { contact: RelocationContact }
      setContacts((prev) => [data.contact, ...prev])
      setContactForm({ name: "", serviceType: "", email: "", phone: "", website: "", notes: "" })
    } catch {
      setErrorMsg("Unable to add contact.")
    } finally {
      setCreatingContact(false)
    }
  }

  async function deleteContact(contactId: string) {
    const prev = contacts
    setContacts((list) => list.filter((item) => item.id !== contactId))
    const res = await fetch(`/api/relocate/contacts/${contactId}`, { method: "DELETE" })
    if (!res.ok) setContacts(prev)
  }

  function nextTaskStatus(status: TaskStatus): TaskStatus {
    if (status === "todo") return "in_progress"
    if (status === "in_progress") return "done"
    return "todo"
  }

  if (loading || authState === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#475569]">
          <Loader2 className="h-4 w-4 animate-spin text-[#155eef]" />
          Loading relocation workspace…
        </div>
      </div>
    )
  }

  if (authState === "unauthorized") {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#dbe4f0] bg-white p-8 text-center">
          <h2 className="font-[var(--font-playfair)] text-4xl font-semibold text-[#091520]">Sign in to unlock planning tools</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#64748b]">
            Save your relocation plan, track visa/logistics tasks, manage budgets, and keep local contacts in one place.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/auth?redirect=/relocate/hub" className="rounded-full bg-[#155eef] px-6 py-3 text-sm font-semibold text-white">
              Sign in
            </Link>
            <Link href="/cities" className="rounded-full border border-[#dbe4f0] px-6 py-3 text-sm font-semibold text-[#0f172a]">
              Explore cities first
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const draftPlan = plan ?? ({
    id: "",
    authUserId: "",
    createdAt: "",
    updatedAt: "",
    ...EMPTY_PLAN,
  } as RelocationPlan)

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#155eef]">Total move budget</p>
          <p className="mt-2 font-[var(--font-playfair)] text-4xl font-semibold text-[#0f172a]">${budgetTotal.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[#64748b]">Housing + travel + setup + contingency</p>
        </article>
        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#155eef]">Checklist progress</p>
          <p className="mt-2 font-[var(--font-playfair)] text-4xl font-semibold text-[#0f172a]">{completedTasks}/{tasks.length}</p>
          <p className="mt-1 text-xs text-[#64748b]">Tasks completed</p>
        </article>
        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#155eef]">Local support</p>
          <p className="mt-2 font-[var(--font-playfair)] text-4xl font-semibold text-[#0f172a]">{contacts.length}</p>
          <p className="mt-1 text-xs text-[#64748b]">Saved relocation contacts</p>
        </article>
      </div>

      {statusMsg ? (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {statusMsg}
        </div>
      ) : null}
      {errorMsg ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMsg}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#155eef]">Relocation plan</p>
          <h3 className="mt-1 font-[var(--font-playfair)] text-3xl font-semibold text-[#091520]">Plan your move</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input value={draftPlan.originCity} onChange={(e) => updatePlanField("originCity", e.target.value)} placeholder="Origin city" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />
            <input value={draftPlan.originCountry} onChange={(e) => updatePlanField("originCountry", e.target.value)} placeholder="Origin country" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />
            <input value={draftPlan.destinationCity} onChange={(e) => updatePlanField("destinationCity", e.target.value)} placeholder="Destination city" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />
            <input value={draftPlan.destinationCountry} onChange={(e) => updatePlanField("destinationCountry", e.target.value)} placeholder="Destination country" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />
            <input type="date" value={draftPlan.moveDate ?? ""} onChange={(e) => updatePlanField("moveDate", e.target.value || null)} className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />
            <input type="number" min={1} value={draftPlan.householdSize} onChange={(e) => updatePlanField("householdSize", Number(e.target.value) || 1)} placeholder="Household size" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />
            <select value={draftPlan.workMode} onChange={(e) => updatePlanField("workMode", e.target.value as RelocationPlan["workMode"])} className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm">
              <option value="onsite">Onsite employment</option>
              <option value="hybrid">Hybrid employment</option>
              <option value="remote">Remote work</option>
              <option value="business_owner">Business owner</option>
              <option value="student">Student</option>
            </select>
            <select value={draftPlan.status} onChange={(e) => updatePlanField("status", e.target.value as RelocationPlan["status"])} className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm">
              <option value="planning">Planning</option>
              <option value="in_progress">In progress</option>
              <option value="ready_to_move">Ready to move</option>
              <option value="settled">Settled</option>
            </select>
            <input value={draftPlan.visaPathway} onChange={(e) => updatePlanField("visaPathway", e.target.value)} placeholder="Visa pathway (if known)" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm md:col-span-2" />
            <input value={draftPlan.moveReason} onChange={(e) => updatePlanField("moveReason", e.target.value)} placeholder="Move reason (career, family, study, business)" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm md:col-span-2" />
          </div>

          <div className="mt-5 rounded-xl border border-[#e8edf6] bg-[#f8fbff] p-4">
            <p className="text-xs font-semibold text-[#0f172a]">Budget planner (USD)</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input type="number" min={0} value={draftPlan.budgetHousingUsd} onChange={(e) => updatePlanField("budgetHousingUsd", Number(e.target.value) || 0)} placeholder="Housing" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />
              <input type="number" min={0} value={draftPlan.budgetTravelUsd} onChange={(e) => updatePlanField("budgetTravelUsd", Number(e.target.value) || 0)} placeholder="Travel" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />
              <input type="number" min={0} value={draftPlan.budgetSetupUsd} onChange={(e) => updatePlanField("budgetSetupUsd", Number(e.target.value) || 0)} placeholder="Setup costs" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />
              <input type="number" min={0} value={draftPlan.budgetBufferUsd} onChange={(e) => updatePlanField("budgetBufferUsd", Number(e.target.value) || 0)} placeholder="Emergency buffer" className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#155eef]">Total: ${budgetTotal.toLocaleString()}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                type="number"
                min={100}
                value={monthlyRunwayCost}
                onChange={(e) => setMonthlyRunwayCost(Number(e.target.value) || 0)}
                placeholder="Estimated monthly living cost"
                className="rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm"
              />
              <div className="rounded-xl border border-[#dbe4f0] bg-white px-3 py-2.5 text-sm text-[#475569]">
                Runway: <span className="font-semibold text-[#155eef]">{runwayMonths} months</span>
              </div>
            </div>
          </div>

          <textarea value={draftPlan.notes} onChange={(e) => updatePlanField("notes", e.target.value)} rows={3} placeholder="Planning notes, risks, and key dependencies…" className="mt-4 w-full rounded-xl border border-[#dbe4f0] px-3 py-2.5 text-sm" />

          <button type="button" disabled={savingPlan} onClick={() => void savePlan()} className="emz-pill-cta mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
            {savingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
            {savingPlan ? "Saving…" : "Save relocation plan"}
          </button>
        </article>

        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#155eef]">Quick starts</p>
          <h3 className="mt-1 font-[var(--font-playfair)] text-3xl font-semibold text-[#091520]">Planning templates</h3>
          <div className="mt-4 space-y-2">
            {TASK_TEMPLATES.map((template) => (
              <button
                key={template.title}
                type="button"
                onClick={() => void createTask({ title: template.title, category: template.category, priority: template.priority })}
                className="flex w-full items-center justify-between rounded-xl border border-[#dbe4f0] bg-[#f8fbff] px-3 py-2 text-left text-sm text-[#334155] transition hover:border-[#155eef]"
              >
                <span>{template.title}</span>
                <Plus className="h-4 w-4 text-[#155eef]" />
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-4">
            <p className="text-xs font-semibold text-[#0f172a]">Need city or financing inputs?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href="/cities" className="rounded-full border border-[#dbe4f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569]">Cities</Link>
              <Link href="/listings" className="rounded-full border border-[#dbe4f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569]">Listings</Link>
              <Link href="/hub" className="rounded-full border border-[#dbe4f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569]">The Hub</Link>
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#155eef]">Timeline + checklist</p>
              <h3 className="mt-1 font-[var(--font-playfair)] text-3xl font-semibold text-[#091520]">Relocation tasks</h3>
            </div>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#155eef]">{tasks.length} tasks</span>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
            <input value={taskForm.title} onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Add task title" className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" />
            <select value={taskForm.category} onChange={(e) => setTaskForm((prev) => ({ ...prev, category: e.target.value as TaskCategory }))} className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm">
              <option value="visa">Visa</option>
              <option value="legal">Legal</option>
              <option value="finance">Finance</option>
              <option value="logistics">Logistics</option>
              <option value="career">Career</option>
              <option value="family">Family</option>
              <option value="settling">Settling</option>
            </select>
            <select value={taskForm.priority} onChange={(e) => setTaskForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))} className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))} className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" />
          </div>
          <button
            type="button"
            disabled={creatingTask}
            onClick={() => void createTask(taskForm)}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#155eef] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {creatingTask ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add task
          </button>

          <div className="mt-4 space-y-2">
            {tasks.length === 0 ? (
              <p className="text-sm text-[#64748b]">No tasks yet. Start with a template or add your own.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#0f172a]">{task.title}</p>
                      <p className="mt-0.5 text-xs text-[#64748b]">
                        {task.category} · {task.priority} priority
                        {task.dueDate ? ` · due ${task.dueDate}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void patchTask(task.id, { status: nextTaskStatus(task.status) })}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          task.status === "done"
                            ? "bg-green-100 text-green-700"
                            : task.status === "in_progress"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-[#e8edf6] text-[#475569]"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </button>
                      <button type="button" onClick={() => void deleteTask(task.id)} className="rounded-lg border border-[#dbe4f0] p-1.5 text-[#94a3b8] hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#155eef]">Local services</p>
              <h3 className="mt-1 font-[var(--font-playfair)] text-3xl font-semibold text-[#091520]">Support contacts</h3>
            </div>
            <Users className="h-5 w-5 text-[#155eef]" />
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            <input value={contactForm.name} onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Contact name" className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" />
            <input value={contactForm.serviceType} onChange={(e) => setContactForm((prev) => ({ ...prev, serviceType: e.target.value }))} placeholder="Service type (immigration, school, tax)" className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" />
            <input value={contactForm.email} onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" />
            <input value={contactForm.phone} onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm" />
            <input value={contactForm.website} onChange={(e) => setContactForm((prev) => ({ ...prev, website: e.target.value }))} placeholder="Website" className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm md:col-span-2" />
            <textarea value={contactForm.notes} onChange={(e) => setContactForm((prev) => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Notes" className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm md:col-span-2" />
          </div>
          <button type="button" disabled={creatingContact} onClick={() => void createContact()} className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#091520] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
            {creatingContact ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add contact
          </button>

          <div className="mt-4 space-y-2">
            {contacts.length === 0 ? (
              <p className="text-sm text-[#64748b]">No contacts saved yet.</p>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#0f172a]">{contact.name}</p>
                      <p className="text-xs text-[#64748b]">{contact.serviceType}</p>
                      <div className="mt-1 text-xs text-[#64748b]">
                        {contact.email ? <p>{contact.email}</p> : null}
                        {contact.phone ? <p>{contact.phone}</p> : null}
                        {contact.website ? <p>{contact.website}</p> : null}
                      </div>
                    </div>
                    <button type="button" onClick={() => void deleteContact(contact.id)} className="rounded-lg border border-[#dbe4f0] p-1.5 text-[#94a3b8] hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      <div className="rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#155eef]">Planning signals</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[#e8edf6] bg-[#f8fbff] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f172a]"><Wallet className="h-3.5 w-3.5 text-[#155eef]" /> Budget coverage</p>
            <p className="mt-1 text-sm text-[#64748b]">Use 15–20% contingency in buffer for early-stage moves.</p>
          </div>
          <div className="rounded-xl border border-[#e8edf6] bg-[#f8fbff] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f172a]"><ClipboardCheck className="h-3.5 w-3.5 text-[#155eef]" /> Readiness score</p>
            <p className="mt-1 text-sm text-[#64748b]">{tasks.length === 0 ? "Add tasks to calculate readiness." : `${Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)}% checklist complete.`}</p>
          </div>
          <div className="rounded-xl border border-[#e8edf6] bg-[#f8fbff] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f172a]"><Users className="h-3.5 w-3.5 text-[#155eef]" /> Support network</p>
            <p className="mt-1 text-sm text-[#64748b]">Save immigration, legal, education, and tax contacts in one place.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#155eef]">Country relocation guide</p>
            <h3 className="mt-1 font-[var(--font-playfair)] text-3xl font-semibold text-[#091520]">Visa + setup briefing</h3>
          </div>
          <select
            value={guideCountry}
            onChange={(e) => setGuideCountry(e.target.value)}
            className="rounded-xl border border-[#dbe4f0] px-3 py-2 text-sm"
            disabled={guidesLoading || guides.length === 0}
          >
            {guides.map((guide) => (
              <option key={guide.id} value={guide.country}>
                {guide.country}
              </option>
            ))}
          </select>
        </div>

        {guidesLoading ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] px-3 py-2 text-sm text-[#64748b]">
            <Loader2 className="h-4 w-4 animate-spin text-[#155eef]" />
            Loading country guide…
          </div>
        ) : activeGuide ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
              <p className="text-xs font-semibold text-[#0f172a]">Visa summary</p>
              <p className="mt-1 text-sm text-[#526070]">{activeGuide.visaSummary}</p>
              <p className="mt-1 text-xs text-[#64748b]">Estimated setup window: {activeGuide.estimatedSetupDays} days</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                <p className="text-xs font-semibold text-[#0f172a]">Required documents</p>
                <ul className="mt-1 space-y-1 text-xs text-[#526070]">
                  {activeGuide.requiredDocuments.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                <p className="text-xs font-semibold text-[#0f172a]">Pre-move steps</p>
                <ul className="mt-1 space-y-1 text-xs text-[#526070]">
                  {activeGuide.preMoveSteps.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
                <p className="text-xs font-semibold text-[#0f172a]">First-week steps</p>
                <ul className="mt-1 space-y-1 text-xs text-[#526070]">
                  {activeGuide.firstWeekSteps.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[#dbe4f0] bg-white p-3 text-xs text-[#526070]">
                <p className="font-semibold text-[#0f172a]">Healthcare tip</p>
                <p className="mt-1">{activeGuide.healthcareTip}</p>
              </div>
              <div className="rounded-xl border border-[#dbe4f0] bg-white p-3 text-xs text-[#526070]">
                <p className="font-semibold text-[#0f172a]">Banking tip</p>
                <p className="mt-1">{activeGuide.bankingTip}</p>
              </div>
              <div className="rounded-xl border border-[#dbe4f0] bg-white p-3 text-xs text-[#526070]">
                <p className="font-semibold text-[#0f172a]">Schooling tip</p>
                <p className="mt-1">{activeGuide.schoolingTip}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#64748b]">No country guide available yet.</p>
        )}
      </div>
    </section>
  )
}
