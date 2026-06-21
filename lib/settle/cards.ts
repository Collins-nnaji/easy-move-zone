import type { SettleCard } from "@/lib/relocate/types"
import { SETTLE } from "@/app/move/data"

export function settleCardsForCity(citySlug: string, fromDb: SettleCard[] | undefined | null): SettleCard[] {
  if (fromDb?.length) return fromDb
  return SETTLE[citySlug] ?? []
}

export function sortGuidesMoveFirst<T extends { citySlug: string | null }>(guides: T[]): T[] {
  return [...guides].sort((a, b) => {
    if (a.citySlug && !b.citySlug) return -1
    if (!a.citySlug && b.citySlug) return 1
    return 0
  })
}
