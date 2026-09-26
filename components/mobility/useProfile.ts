"use client"

import { useCallback, useState, useSyncExternalStore } from "react"
import { readProfile, serverProfile, subscribeMobility, writeProfile } from "@/lib/mobility/profile"
import type { MobilityProfile } from "@/lib/mobility/types"

export function useMobilityProfile() {
  const stored = useSyncExternalStore(subscribeMobility, readProfile, serverProfile)
  const [draft, setDraft] = useState<MobilityProfile | null>(null)

  const save = useCallback((next: MobilityProfile) => {
    writeProfile(next)
    setDraft(null)
  }, [])

  return {
    profile: draft ?? stored.profile,
    setProfile: setDraft,
    source: stored.source,
    ready: true,
    save,
  }
}
