"use client"

import type { ProfileWorkspaceData, SavedSearch, UserProfile } from "@/lib/profile/types"

export async function fetchProfileWorkspace(): Promise<ProfileWorkspaceData> {
  const res = await fetch("/api/profile", { cache: "no-store" })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
  return (await res.json()) as ProfileWorkspaceData
}

export async function saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { profile: UserProfile }).profile
}

export async function saveCareerProfileClient(
  career: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ career }),
  })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { career: Record<string, unknown> }).career
}

export async function createSavedSearch(input: {
  name: string
  citySlug?: string
  budgetMin?: number | null
  budgetMax?: number | null
}): Promise<SavedSearch> {
  const res = await fetch("/api/profile/saved-searches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { savedSearch: SavedSearch }).savedSearch
}

export async function deleteSavedSearch(id: string): Promise<void> {
  const res = await fetch(`/api/profile/saved-searches/${id}`, { method: "DELETE" })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
}
