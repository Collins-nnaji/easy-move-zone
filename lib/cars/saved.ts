const SAVED_KEY = "emz.savedCarIds"
const RECENT_KEY = "emz.recentCarIds"
const ENQUIRY_KEY = "emz.carEnquiries"
const PX_KEY = "emz.partExchange"

export type StoredEnquiry = {
  id: string
  carId?: string
  intent: string
  firstName: string
  lastName: string
  createdAt: string
}

export type StoredValuation = {
  registration: string
  mileage: string
  condition: string
  createdAt: string
  estimate: number
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getSavedIds(): string[] {
  return readJson<string[]>(SAVED_KEY, [])
}

export function toggleSavedId(id: string): string[] {
  const current = getSavedIds()
  const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current]
  writeJson(SAVED_KEY, next)
  window.dispatchEvent(new Event("emz-saved-cars"))
  return next
}

export function getRecentIds(): string[] {
  return readJson<string[]>(RECENT_KEY, [])
}

export function pushRecentId(id: string) {
  const next = [id, ...getRecentIds().filter((x) => x !== id)].slice(0, 8)
  writeJson(RECENT_KEY, next)
}

export function getEnquiries(): StoredEnquiry[] {
  return readJson<StoredEnquiry[]>(ENQUIRY_KEY, [])
}

export function addEnquiry(entry: StoredEnquiry) {
  writeJson(ENQUIRY_KEY, [entry, ...getEnquiries()].slice(0, 20))
}

export function getPartExchange(): StoredValuation | null {
  return readJson<StoredValuation | null>(PX_KEY, null)
}

export function savePartExchange(entry: StoredValuation) {
  writeJson(PX_KEY, entry)
}

export type MyVehicle = {
  registration: string
  make: string
  model: string
  year: string
  mileage: string
  fuel: string
  colour: string
  motDue: string
  notes: string
}

const MY_CAR_KEY = "emz.myVehicle"

export function getMyVehicle(): MyVehicle | null {
  return readJson<MyVehicle | null>(MY_CAR_KEY, null)
}

export function saveMyVehicle(entry: MyVehicle) {
  writeJson(MY_CAR_KEY, entry)
}
