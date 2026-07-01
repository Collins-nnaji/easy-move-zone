"use client"

import type { ProfileWorkspaceData, UserProfile } from "@/lib/profile/types"

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
