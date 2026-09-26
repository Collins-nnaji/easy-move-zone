import type { MobilityProfile } from "./types"

/** The worked example from the product: a cybersecurity professional in Nigeria with £8,000. */
export const EXAMPLE_PROFILE: MobilityProfile = {
  citizenship: "Nigeria",
  currentCountry: "Nigeria",
  age: 29,
  profession: "Cybersecurity",
  experienceYears: 5,
  education: "bachelor",
  languages: ["English"],
  englishLevel: "fluent",
  savingsGbp: 8000,
  family: "single",
  familySize: 1,
  climate: "any",
  desiredSalaryGbp: 45000,
  timelineMonths: 12,
  hasJobOffer: false,
}

export const PROFILE_KEY = "emz.mobility.profile.v1"
export const ARRIVED_KEY = "emz.mobility.arrived.v1"
export const PASSPORT_KEY = "emz.mobility.passport.v1"

export type ProfileSource = "example" | "saved"
export type StoredProfile = { profile: MobilityProfile; source: ProfileSource }

const SERVER_PROFILE: StoredProfile = { profile: EXAMPLE_PROFILE, source: "example" }
const EMPTY_CHECKS: Record<string, string[]> = {}
const CHANGE = "emz-mobility"

let profileCache: { raw: string | null; value: StoredProfile } | null = null
const checksCache = new Map<string, { raw: string | null; value: Record<string, string[]> }>()

export function serverProfile(): StoredProfile {
  return SERVER_PROFILE
}

export function emptyChecks(): Record<string, string[]> {
  return EMPTY_CHECKS
}

export function subscribeMobility(onChange: () => void) {
  window.addEventListener(CHANGE, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(CHANGE, onChange)
    window.removeEventListener("storage", onChange)
  }
}

function notifyMobility() {
  window.dispatchEvent(new Event(CHANGE))
}

export function readProfile(): StoredProfile {
  if (typeof window === "undefined") return SERVER_PROFILE
  const raw = window.localStorage.getItem(PROFILE_KEY)
  if (profileCache && profileCache.raw === raw) return profileCache.value
  let value = SERVER_PROFILE
  if (raw) {
    try {
      value = { profile: { ...EXAMPLE_PROFILE, ...(JSON.parse(raw) as Partial<MobilityProfile>) }, source: "saved" }
    } catch {
      value = SERVER_PROFILE
    }
  }
  profileCache = { raw, value }
  return value
}

export function writeProfile(profile: MobilityProfile) {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  profileCache = null
  notifyMobility()
}

export function readChecks(key: string): Record<string, string[]> {
  if (typeof window === "undefined") return EMPTY_CHECKS
  const raw = window.localStorage.getItem(key)
  const cached = checksCache.get(key)
  if (cached && cached.raw === raw) return cached.value
  let value = EMPTY_CHECKS
  if (raw) {
    try {
      value = JSON.parse(raw) as Record<string, string[]>
    } catch {
      value = EMPTY_CHECKS
    }
  }
  checksCache.set(key, { raw, value })
  return value
}

export function writeChecks(key: string, value: Record<string, string[]>) {
  window.localStorage.setItem(key, JSON.stringify(value))
  checksCache.delete(key)
  notifyMobility()
}
