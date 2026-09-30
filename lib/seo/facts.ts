import { COUNTRY_GUIDES } from "@/lib/sponsors/country-guides"

/** The UK (live register) plus every country with a skilled-route guide. */
export const DESTINATION_COUNT = COUNTRY_GUIDES.length + 1

export const GUIDE_COUNTRY_NAMES = COUNTRY_GUIDES.map((country) => country.name)

export function listCountries(names: readonly string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names.join("")
}
