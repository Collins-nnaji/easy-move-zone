import { randomUUID } from "crypto"
import { neon } from "@neondatabase/serverless"
import {
  seedClientEngagements,
  seedCorridors,
  seedDeliverables,
  seedFaqs,
  seedIntelligenceFeed,
  seedIntroductions,
  seedMarkets,
  seedMessages,
  seedPartners,
  seedPress,
  seedReports,
  seedServices,
  seedTeam,
  seedTestimonials,
  seedValues,
} from "@/lib/platform/seed"
import type {
  ClientEngagement,
  CorridorWithMarkets,
  Deliverable,
  Direction,
  Faq,
  IntelligenceFeedItem,
  Introduction,
  LeadInput,
  LeadRecord,
  Market,
  Message,
  PartnerItem,
  PressItem,
  Report,
  ReportFilters,
  Service,
  TeamMember,
  Testimonial,
  ValueCard,
} from "@/lib/platform/types"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export const isPlatformDatabaseConfigured = Boolean(sql)

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
}

function normalizeMarketLookup(market: string): string {
  const maybe = seedMarkets.find((m) => m.id === market || m.slug === market || m.name.toLowerCase() === market.toLowerCase())
  return maybe?.id ?? market
}

function serviceDirectionForLead(direction: string): Direction {
  return direction.toLowerCase().includes("from africa") || direction.toLowerCase().includes("global")
    ? "outbound"
    : "inbound"
}

function currencyRange(min: number, max: number): string {
  return `$${min.toLocaleString()}-${max.toLocaleString()}`
}

export async function getMarkets(): Promise<Market[]> {
  if (!sql) return seedMarkets
  try {
    const rows = await sql`
      SELECT
        id,
        slug,
        name,
        country_code,
        flag_emoji,
        region,
        status,
        gdp,
        population,
        business_environment_score,
        ease_of_doing_business_rank,
        top_sectors,
        regulatory_notes,
        latitude,
        longitude
      FROM markets
      ORDER BY
        CASE status
          WHEN 'active' THEN 1
          WHEN 'coming_soon' THEN 2
          ELSE 3
        END,
        name ASC
    `
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      countryCode: row.country_code,
      flagEmoji: row.flag_emoji,
      region: row.region,
      status: row.status,
      gdp: row.gdp,
      population: row.population,
      businessEnvironmentScore: Number(row.business_environment_score),
      easeOfDoingBusinessRank: Number(row.ease_of_doing_business_rank),
      topSectors: Array.isArray(row.top_sectors) ? row.top_sectors : [],
      regulatoryNotes: row.regulatory_notes,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    }))
  } catch {
    return seedMarkets
  }
}

export async function getMarketBySlug(slug: string): Promise<Market | null> {
  const markets = await getMarkets()
  return markets.find((market) => market.slug === slug) ?? null
}

export async function getCorridors(): Promise<CorridorWithMarkets[]> {
  if (!sql) {
    const marketMap = new Map(seedMarkets.map((m) => [m.id, m]))
    return seedCorridors.map((c) => ({
      ...c,
      originMarket: marketMap.get(c.originMarketId),
      destinationMarket: marketMap.get(c.destinationMarketId),
    }))
  }

  try {
    const rows = await sql`
      SELECT
        c.id,
        c.origin_market_id,
        c.destination_market_id,
        c.sector,
        c.active_client_count,
        c.status,
        origin.name AS origin_name,
        origin.slug AS origin_slug,
        origin.country_code AS origin_country_code,
        origin.flag_emoji AS origin_flag_emoji,
        destination.name AS destination_name,
        destination.slug AS destination_slug,
        destination.country_code AS destination_country_code,
        destination.flag_emoji AS destination_flag_emoji
      FROM corridors c
      JOIN markets origin ON origin.id = c.origin_market_id
      JOIN markets destination ON destination.id = c.destination_market_id
      ORDER BY c.active_client_count DESC, c.id ASC
    `

    return rows.map((row) => ({
      id: row.id,
      originMarketId: row.origin_market_id,
      destinationMarketId: row.destination_market_id,
      sector: row.sector,
      activeClientCount: Number(row.active_client_count),
      status: row.status,
      originMarket: {
        id: row.origin_market_id,
        slug: row.origin_slug,
        name: row.origin_name,
        countryCode: row.origin_country_code,
        flagEmoji: row.origin_flag_emoji,
        region: "",
        status: "active",
        gdp: "",
        population: "",
        businessEnvironmentScore: 0,
        easeOfDoingBusinessRank: 0,
        topSectors: [],
        regulatoryNotes: "",
        latitude: 0,
        longitude: 0,
      },
      destinationMarket: {
        id: row.destination_market_id,
        slug: row.destination_slug,
        name: row.destination_name,
        countryCode: row.destination_country_code,
        flagEmoji: row.destination_flag_emoji,
        region: "",
        status: "active",
        gdp: "",
        population: "",
        businessEnvironmentScore: 0,
        easeOfDoingBusinessRank: 0,
        topSectors: [],
        regulatoryNotes: "",
        latitude: 0,
        longitude: 0,
      },
    }))
  } catch {
    const marketMap = new Map(seedMarkets.map((m) => [m.id, m]))
    return seedCorridors.map((c) => ({
      ...c,
      originMarket: marketMap.get(c.originMarketId),
      destinationMarket: marketMap.get(c.destinationMarketId),
    }))
  }
}

export async function getServices(direction?: Direction): Promise<Service[]> {
  if (!sql) {
    return direction ? seedServices.filter((service) => service.direction === direction) : seedServices
  }
  try {
    const rows = direction
      ? await sql`
          SELECT id, direction, name, description, client_receives, emz_execution, timeline, price_min, price_max, featured
          FROM services
          WHERE direction = ${direction}
          ORDER BY featured DESC, name ASC
        `
      : await sql`
          SELECT id, direction, name, description, client_receives, emz_execution, timeline, price_min, price_max, featured
          FROM services
          ORDER BY featured DESC, name ASC
        `

    return rows.map((row) => ({
      id: row.id,
      direction: row.direction,
      name: row.name,
      description: row.description,
      clientReceives: row.client_receives,
      emzExecution: row.emz_execution,
      timeline: row.timeline,
      priceMin: Number(row.price_min),
      priceMax: Number(row.price_max),
      featured: Boolean(row.featured),
    }))
  } catch {
    return direction ? seedServices.filter((service) => service.direction === direction) : seedServices
  }
}

export async function getFaqs(): Promise<Faq[]> {
  if (!sql) return [...seedFaqs].sort((a, b) => a.orderIndex - b.orderIndex)
  try {
    const rows = await sql`
      SELECT id, question, answer, order_index
      FROM faqs
      ORDER BY order_index ASC
    `
    return rows.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      orderIndex: Number(row.order_index),
    }))
  } catch {
    return [...seedFaqs].sort((a, b) => a.orderIndex - b.orderIndex)
  }
}

export async function getReports(filters?: ReportFilters): Promise<Report[]> {
  const sortDirection = filters?.sort === "oldest" ? "ASC" : "DESC"
  if (!sql) {
    return [...seedReports]
      .filter((report) => (filters?.marketId ? report.marketId === normalizeMarketLookup(filters.marketId) : true))
      .filter((report) => (filters?.sector ? report.sector.toLowerCase() === filters.sector.toLowerCase() : true))
      .filter((report) => (filters?.direction ? report.direction === filters.direction : true))
      .sort((a, b) =>
        sortDirection === "ASC"
          ? new Date(a.lastUpdatedDate).getTime() - new Date(b.lastUpdatedDate).getTime()
          : new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime()
      )
  }

  try {
    const rows = await sql`
      SELECT
        id,
        title,
        market_id,
        sector,
        direction,
        summary,
        full_content,
        preview_excerpt,
        price,
        publish_date,
        last_updated_date,
        author,
        download_url,
        purchase_count,
        tags
      FROM reports
      ORDER BY last_updated_date DESC
    `

    const mapped: Report[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      marketId: row.market_id,
      sector: row.sector,
      direction: row.direction,
      summary: row.summary,
      fullContent: row.full_content,
      previewExcerpt: row.preview_excerpt,
      price: Number(row.price),
      publishDate: String(row.publish_date).slice(0, 10),
      lastUpdatedDate: String(row.last_updated_date).slice(0, 10),
      author: row.author,
      downloadUrl: row.download_url,
      purchaseCount: Number(row.purchase_count),
      tags: Array.isArray(row.tags) ? row.tags : [],
    }))

    return mapped
      .filter((report) => (filters?.marketId ? report.marketId === normalizeMarketLookup(filters.marketId) : true))
      .filter((report) => (filters?.sector ? report.sector.toLowerCase() === filters.sector.toLowerCase() : true))
      .filter((report) => (filters?.direction ? report.direction === filters.direction : true))
      .sort((a, b) =>
        sortDirection === "ASC"
          ? new Date(a.lastUpdatedDate).getTime() - new Date(b.lastUpdatedDate).getTime()
          : new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime()
      )
  } catch {
    return [...seedReports]
      .filter((report) => (filters?.marketId ? report.marketId === normalizeMarketLookup(filters.marketId) : true))
      .filter((report) => (filters?.sector ? report.sector.toLowerCase() === filters.sector.toLowerCase() : true))
      .filter((report) => (filters?.direction ? report.direction === filters.direction : true))
      .sort((a, b) =>
        sortDirection === "ASC"
          ? new Date(a.lastUpdatedDate).getTime() - new Date(b.lastUpdatedDate).getTime()
          : new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime()
      )
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!sql) return seedTestimonials
  try {
    const rows = await sql`
      SELECT id, client_type, corridor_id, outcome, quote
      FROM testimonials
      ORDER BY id DESC
      LIMIT 10
    `
    return rows.map((row) => ({
      id: row.id,
      clientType: row.client_type,
      corridorId: row.corridor_id,
      outcome: row.outcome,
      quote: row.quote,
    }))
  } catch {
    return seedTestimonials
  }
}

export async function getTeamMembers(section: "team" | "advisor"): Promise<TeamMember[]> {
  if (!sql) return seedTeam.filter((member) => member.section === section)
  try {
    const rows = await sql`
      SELECT id, section, name, title, bio, photo_url, markets, linkedin_url
      FROM team
      WHERE section = ${section}
      ORDER BY name ASC
    `
    return rows.map((row) => ({
      id: row.id,
      section: row.section,
      name: row.name,
      title: row.title,
      bio: row.bio,
      photoUrl: row.photo_url,
      markets: Array.isArray(row.markets) ? row.markets : [],
      linkedinUrl: row.linkedin_url,
    }))
  } catch {
    return seedTeam.filter((member) => member.section === section)
  }
}

export async function getValueCards(): Promise<ValueCard[]> {
  if (!sql) return [...seedValues].sort((a, b) => a.orderIndex - b.orderIndex)
  try {
    const rows = await sql`
      SELECT id, order_index, title, description
      FROM values
      ORDER BY order_index ASC
    `
    return rows.map((row) => ({
      id: row.id,
      orderIndex: Number(row.order_index),
      title: row.title,
      description: row.description,
    }))
  } catch {
    return [...seedValues].sort((a, b) => a.orderIndex - b.orderIndex)
  }
}

export async function getPressItems(): Promise<PressItem[]> {
  if (!sql) return seedPress
  try {
    const rows = await sql`
      SELECT id, name, logo_url, article_url
      FROM press
      ORDER BY id ASC
    `
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      logoUrl: row.logo_url,
      articleUrl: row.article_url,
    }))
  } catch {
    return seedPress
  }
}

export async function getPartners(): Promise<PartnerItem[]> {
  if (!sql) return seedPartners
  try {
    const rows = await sql`
      SELECT id, name, logo_url, country, website_url
      FROM partners
      ORDER BY name ASC
    `
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      logoUrl: row.logo_url,
      country: row.country,
      websiteUrl: row.website_url,
    }))
  } catch {
    return seedPartners
  }
}

export async function subscribeToNewsletter(email: string, listType = "general"): Promise<void> {
  if (!sql) return
  await sql`
    INSERT INTO newsletter (id, email, list_type, subscribed_date, status)
    VALUES (${randomUUID()}, ${email.toLowerCase()}, ${listType}, NOW(), 'subscribed')
    ON CONFLICT (email, list_type)
    DO UPDATE SET status = 'subscribed', subscribed_date = NOW()
  `
}

export async function createLead(input: LeadInput, aiSummary: string): Promise<LeadRecord> {
  const lead: LeadRecord = {
    id: randomUUID(),
    ...input,
    status: "new",
    aiSummary,
    createdDate: new Date().toISOString(),
  }

  if (!sql) return lead

  try {
    await sql`
      INSERT INTO leads (
        id,
        first_name,
        last_name,
        company,
        email,
        phone,
        website,
        direction,
        target_market,
        business_sector,
        timeline,
        budget_range,
        message,
        source,
        recommended_service,
        status,
        ai_summary,
        created_date
      )
      VALUES (
        ${lead.id},
        ${lead.firstName},
        ${lead.lastName},
        ${lead.company},
        ${lead.email},
        ${lead.phone ?? null},
        ${lead.website ?? null},
        ${lead.direction},
        ${lead.targetMarket},
        ${lead.businessSector},
        ${lead.timeline},
        ${lead.budgetRange},
        ${lead.message},
        ${lead.source},
        ${lead.recommendedService ?? null},
        ${lead.status},
        ${lead.aiSummary},
        NOW()
      )
    `
  } catch {
    return lead
  }

  return lead
}

export async function createCustomReportRequest(input: LeadInput, aiSummary: string): Promise<LeadRecord> {
  return createLead(
    {
      ...input,
      direction: "Commissioning a report",
      source: "custom-report",
    },
    aiSummary
  )
}

export async function getClientEngagement(clientId = "ce1"): Promise<ClientEngagement | null> {
  if (!sql) return seedClientEngagements.find((item) => item.id === clientId) ?? seedClientEngagements[0] ?? null
  try {
    const rows = await sql`
      SELECT
        id,
        user_id,
        engagement_type,
        corridor_id,
        advisor_name,
        advisor_photo,
        phase,
        start_date,
        contract_value,
        next_milestone
      FROM clients
      WHERE id = ${clientId}
      LIMIT 1
    `
    const row = rows[0]
    if (!row) return null
    return {
      id: row.id,
      userId: row.user_id,
      engagementType: row.engagement_type,
      corridorId: row.corridor_id,
      advisorName: row.advisor_name,
      advisorPhoto: row.advisor_photo,
      phase: row.phase,
      startDate: String(row.start_date).slice(0, 10),
      contractValue: Number(row.contract_value),
      nextMilestone: row.next_milestone,
    }
  } catch {
    return seedClientEngagements.find((item) => item.id === clientId) ?? seedClientEngagements[0] ?? null
  }
}

export async function getClientDeliverables(clientId = "ce1"): Promise<Deliverable[]> {
  if (!sql) return seedDeliverables.filter((item) => item.clientId === clientId)
  try {
    const rows = await sql`
      SELECT id, client_id, name, due_date, status, file_url, notes
      FROM deliverables
      WHERE client_id = ${clientId}
      ORDER BY due_date ASC
    `
    return rows.map((row) => ({
      id: row.id,
      clientId: row.client_id,
      name: row.name,
      dueDate: String(row.due_date).slice(0, 10),
      status: row.status,
      fileUrl: row.file_url,
      notes: row.notes,
    }))
  } catch {
    return seedDeliverables.filter((item) => item.clientId === clientId)
  }
}

export async function getClientIntroductions(clientId = "ce1"): Promise<Introduction[]> {
  if (!sql) return seedIntroductions.filter((item) => item.clientId === clientId)
  try {
    const rows = await sql`
      SELECT id, client_id, contact_name, company, introduction_date, purpose, outcome_status
      FROM introductions
      WHERE client_id = ${clientId}
      ORDER BY introduction_date DESC
    `
    return rows.map((row) => ({
      id: row.id,
      clientId: row.client_id,
      contactName: row.contact_name,
      company: row.company,
      introductionDate: String(row.introduction_date).slice(0, 10),
      purpose: row.purpose,
      outcomeStatus: row.outcome_status,
    }))
  } catch {
    return seedIntroductions.filter((item) => item.clientId === clientId)
  }
}

export async function getClientMessages(clientId = "ce1"): Promise<Message[]> {
  if (!sql) return seedMessages.filter((item) => item.clientId === clientId)
  try {
    const rows = await sql`
      SELECT id, client_id, sender_role, content, timestamp, read_status
      FROM messages
      WHERE client_id = ${clientId}
      ORDER BY timestamp DESC
      LIMIT 50
    `
    return rows.map((row) => ({
      id: row.id,
      clientId: row.client_id,
      senderRole: row.sender_role,
      content: row.content,
      timestamp: row.timestamp,
      readStatus: Boolean(row.read_status),
    }))
  } catch {
    return seedMessages.filter((item) => item.clientId === clientId)
  }
}

export async function getClientIntelligenceFeed(corridorId = "c1"): Promise<IntelligenceFeedItem[]> {
  if (!sql) return seedIntelligenceFeed.filter((item) => item.corridorId === corridorId)
  try {
    const rows = await sql`
      SELECT id, corridor_id, title, content, published_at
      FROM intelligence_feed
      WHERE corridor_id = ${corridorId}
      ORDER BY published_at DESC
      LIMIT 30
    `
    return rows.map((row) => ({
      id: row.id,
      corridorId: row.corridor_id,
      title: row.title,
      content: row.content,
      publishedAt: row.published_at,
    }))
  } catch {
    return seedIntelligenceFeed.filter((item) => item.corridorId === corridorId)
  }
}

export async function getLeadManagementRows(limit = 50): Promise<LeadRecord[]> {
  if (!sql) {
    return [
      {
        id: "demo-lead-1",
        firstName: "Ada",
        lastName: "Cole",
        company: "NorthBridge Foods",
        email: "ada@example.com",
        direction: "Entering an African market",
        targetMarket: "Nigeria",
        businessSector: "FMCG",
        timeline: "Within 3 months",
        budgetRange: "$15K-$50K",
        message: "We need a Lagos distributor entry strategy.",
        source: "Website",
        status: "new",
        aiSummary: "Strong fit for Trade Bridge package with high urgency.",
        createdDate: new Date().toISOString(),
      },
    ]
  }
  try {
    const rows = await sql`
      SELECT
        id,
        first_name,
        last_name,
        company,
        email,
        phone,
        website,
        direction,
        target_market,
        business_sector,
        timeline,
        budget_range,
        message,
        source,
        recommended_service,
        status,
        ai_summary,
        created_date
      FROM leads
      ORDER BY created_date DESC
      LIMIT ${limit}
    `
    return rows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      company: row.company,
      email: row.email,
      phone: row.phone ?? undefined,
      website: row.website ?? undefined,
      direction: row.direction,
      targetMarket: row.target_market,
      businessSector: row.business_sector,
      timeline: row.timeline,
      budgetRange: row.budget_range,
      message: row.message,
      source: row.source,
      recommendedService: row.recommended_service ?? undefined,
      status: row.status,
      aiSummary: row.ai_summary,
      createdDate: row.created_date,
    }))
  } catch {
    return []
  }
}

export async function recommendServiceForLead(direction: string): Promise<{ service: Service; reason: string }> {
  const directionKey = serviceDirectionForLead(direction)
  const available = await getServices(directionKey)
  const service = available.find((item) => item.featured) ?? available[0]
  if (!service) {
    return {
      service: {
        id: "fallback",
        direction: "inbound",
        name: "Market Intelligence Report",
        description: "Data-backed market validation for your first move.",
        clientReceives: "Strategic report and action plan.",
        emzExecution: "Research and advisory review.",
        timeline: "2-3 weeks",
        priceMin: 2000,
        priceMax: 4500,
      },
      reason: "Baseline recommendation based on current lead direction.",
    }
  }

  return {
    service,
    reason: `Recommended because your direction is ${directionKey} and this package balances execution depth with speed (${currencyRange(service.priceMin, service.priceMax)}).`,
  }
}

export function buildMarketLookup(markets: Market[]): Record<string, Market> {
  return markets.reduce<Record<string, Market>>((acc, market) => {
    acc[market.id] = market
    acc[market.slug] = market
    acc[toSlug(market.name)] = market
    return acc
  }, {})
}

