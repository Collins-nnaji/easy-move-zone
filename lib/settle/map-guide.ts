import type { SettleCard } from "@/lib/relocate/types"

interface GuideRow {
  id: string
  country: string
  city_slug: string | null
  visa_summary: string
  required_documents: string[] | null
  pre_move_steps: string[] | null
  first_week_steps: string[] | null
  healthcare_tip: string | null
  banking_tip: string | null
  schooling_tip: string | null
  sim_tip: string | null
  neighborhoods_tip: string | null
  community_tip: string | null
  transport_tip: string | null
  settle_cards: unknown
  estimated_setup_days: number | null
  created_at: string
  updated_at: string
}

function parseSettleCards(value: unknown): SettleCard[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is SettleCard => {
      if (!item || typeof item !== "object") return false
      const row = item as Record<string, unknown>
      return typeof row.tag === "string" && typeof row.title === "string" && typeof row.body === "string"
    })
    .map((item) => ({
      tag: item.tag,
      title: item.title,
      body: item.body,
    }))
}

export function mapGuideRow(row: GuideRow) {
  return {
    id: row.id,
    country: row.country,
    citySlug: row.city_slug,
    visaSummary: row.visa_summary,
    requiredDocuments: row.required_documents ?? [],
    preMoveSteps: row.pre_move_steps ?? [],
    firstWeekSteps: row.first_week_steps ?? [],
    healthcareTip: row.healthcare_tip ?? "",
    bankingTip: row.banking_tip ?? "",
    schoolingTip: row.schooling_tip ?? "",
    simTip: row.sim_tip ?? "",
    neighborhoodsTip: row.neighborhoods_tip ?? "",
    communityTip: row.community_tip ?? "",
    transportTip: row.transport_tip ?? "",
    settleCards: parseSettleCards(row.settle_cards),
    estimatedSetupDays: row.estimated_setup_days ?? 14,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export const GUIDE_SELECT_LEGACY = `id, country, visa_summary, required_documents, pre_move_steps, first_week_steps,
  healthcare_tip, banking_tip, schooling_tip, estimated_setup_days, created_at, updated_at`

export const GUIDE_SELECT = `id, country, city_slug, visa_summary, required_documents, pre_move_steps, first_week_steps,
  healthcare_tip, banking_tip, schooling_tip, sim_tip, neighborhoods_tip, community_tip, transport_tip,
  settle_cards, estimated_setup_days, created_at, updated_at`

interface GuideRowLegacy {
  id: string
  country: string
  visa_summary: string
  required_documents: string[] | null
  pre_move_steps: string[] | null
  first_week_steps: string[] | null
  healthcare_tip: string | null
  banking_tip: string | null
  schooling_tip: string | null
  estimated_setup_days: number | null
  created_at: string
  updated_at: string
}

export function mapGuideRowLegacy(row: GuideRowLegacy) {
  return {
    id: row.id,
    country: row.country,
    citySlug: null as string | null,
    visaSummary: row.visa_summary,
    requiredDocuments: row.required_documents ?? [],
    preMoveSteps: row.pre_move_steps ?? [],
    firstWeekSteps: row.first_week_steps ?? [],
    healthcareTip: row.healthcare_tip ?? "",
    bankingTip: row.banking_tip ?? "",
    schoolingTip: row.schooling_tip ?? "",
    simTip: "",
    neighborhoodsTip: "",
    communityTip: "",
    transportTip: "",
    settleCards: [] as SettleCard[],
    estimatedSetupDays: row.estimated_setup_days ?? 14,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}
