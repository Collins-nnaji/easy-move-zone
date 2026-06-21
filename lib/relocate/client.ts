"use client"

import type {
  RelocationPlan,
  RelocationTask,
  RelocationContact,
  RelocationCountryGuide,
  TaskCategory,
  TaskStatus,
} from "@/lib/relocate/types"

export interface RelocationWorkspace {
  plan: RelocationPlan | null
  tasks: RelocationTask[]
  contacts: RelocationContact[]
}

/** Load the signed-in user's relocation plan, tasks and contacts. */
export async function fetchWorkspace(): Promise<RelocationWorkspace> {
  const res = await fetch("/api/relocate/plan", { cache: "no-store" })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
  return (await res.json()) as RelocationWorkspace
}

/** Create or update the plan (PUT upserts for the current user). */
export async function savePlan(plan: Partial<RelocationPlan>): Promise<RelocationPlan> {
  const res = await fetch("/api/relocate/plan", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { plan: RelocationPlan }).plan
}

export async function addTask(input: {
  title: string
  category?: TaskCategory
  priority?: "low" | "medium" | "high"
  notes?: string
}): Promise<RelocationTask> {
  const res = await fetch("/api/relocate/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { task: RelocationTask }).task
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<RelocationTask> {
  const res = await fetch(`/api/relocate/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { task: RelocationTask }).task
}

/** Country guide(s); pass a country or citySlug to filter. */
export async function fetchGuides(country?: string): Promise<RelocationCountryGuide[]> {
  const params = new URLSearchParams()
  if (country) params.set("country", country)
  const url = params.size ? `/api/relocate/guides?${params}` : "/api/relocate/guides"
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) return []
  return ((await res.json()) as { guides: RelocationCountryGuide[] }).guides
}

/** Guide for a Move destination id (e.g. lisbon, bangkok). */
export async function fetchGuideByCitySlug(citySlug: string): Promise<RelocationCountryGuide | null> {
  const res = await fetch(`/api/relocate/guides?citySlug=${encodeURIComponent(citySlug)}`, { cache: "no-store" })
  if (!res.ok) return null
  const guides = ((await res.json()) as { guides: RelocationCountryGuide[] }).guides
  return guides[0] ?? null
}
