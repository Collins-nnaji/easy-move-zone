import { neon } from "@neondatabase/serverless"
import {
  opportunityRows,
  revenueStreams,
  seedAgents,
  seedCities,
  seedPropertyFaqs,
  seedResourceGuides,
  seedListings,
  seedTestimonials,
} from "@/lib/property/seed"
import type {
  AgentProfile,
  CityMarket,
  ListingFilters,
  OpportunityRow,
  PropertyFaq,
  PropertyListing,
  ResourceGuide,
  RevenueStream,
  Testimonial,
} from "@/lib/property/types"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export async function getCityMarkets(): Promise<CityMarket[]> {
  if (!sql) return seedCities
  try {
    const rows = await sql`
      SELECT
        id,
        slug,
        name,
        country,
        flag_emoji,
        status,
        avg_rent_usd,
        avg_buy_usd,
        security_score,
        commute_score,
        lifestyle_score,
        top_sectors,
        latitude,
        longitude
      FROM city_markets
      ORDER BY name ASC
    `
    if (!rows.length) return seedCities
    return rows.map((row) => ({
      ...seedCities.find((item) => item.slug === row.slug),
      id: row.id,
      slug: row.slug,
      name: row.name,
      country: row.country,
      flagEmoji: row.flag_emoji,
      status: row.status,
      avgRentUsd: Number(row.avg_rent_usd),
      avgBuyUsd: Number(row.avg_buy_usd),
      securityScore: Number(row.security_score),
      commuteScore: Number(row.commute_score),
      lifestyleScore: Number(row.lifestyle_score),
      topSectors: Array.isArray(row.top_sectors) ? row.top_sectors : [],
      latitude: Number.isFinite(Number(row.latitude)) ? Number(row.latitude) : 0,
      longitude: Number.isFinite(Number(row.longitude)) ? Number(row.longitude) : 0,
    }))
  } catch {
    return seedCities
  }
}

export async function getPropertyListings(filters?: ListingFilters): Promise<PropertyListing[]> {
  if (!sql) {
    return seedListings
      .filter((listing) => (filters?.citySlug ? listing.citySlug === filters.citySlug : true))
      .filter((listing) => (!filters?.type || filters.type === "all" ? true : listing.type === filters.type))
      .filter((listing) => (filters?.maxBudgetUsd ? listing.priceUsd <= filters.maxBudgetUsd : true))
      .filter((listing) => (filters?.moveInReady ? listing.moveInReady : true))
  }

  try {
    const rows = await sql`
      SELECT
        id,
        title,
        city_slug,
        country,
        neighborhood,
        type,
        price_usd,
        bedrooms,
        bathrooms,
        area_sqm,
        verified,
        move_in_ready,
        schools_nearby,
        commute_minutes,
        description,
        images,
        agent_id
      FROM property_listings
      ORDER BY verified DESC, move_in_ready DESC, price_usd ASC
    `
    const listings: PropertyListing[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      citySlug: row.city_slug,
      country: row.country,
      neighborhood: row.neighborhood,
      type: row.type,
      priceUsd: Number(row.price_usd),
      bedrooms: Number(row.bedrooms),
      bathrooms: Number(row.bathrooms),
      areaSqm: Number(row.area_sqm),
      verified: Boolean(row.verified),
      moveInReady: Boolean(row.move_in_ready),
      schoolsNearby: Number(row.schools_nearby),
      commuteMinutes: Number(row.commute_minutes),
      description: row.description,
      images: Array.isArray(row.images) ? row.images : [],
      agentId: row.agent_id,
    }))

    return listings
      .filter((listing) => (filters?.citySlug ? listing.citySlug === filters.citySlug : true))
      .filter((listing) => (!filters?.type || filters.type === "all" ? true : listing.type === filters.type))
      .filter((listing) => (filters?.maxBudgetUsd ? listing.priceUsd <= filters.maxBudgetUsd : true))
      .filter((listing) => (filters?.moveInReady ? listing.moveInReady : true))
  } catch {
    return seedListings
      .filter((listing) => (filters?.citySlug ? listing.citySlug === filters.citySlug : true))
      .filter((listing) => (!filters?.type || filters.type === "all" ? true : listing.type === filters.type))
      .filter((listing) => (filters?.maxBudgetUsd ? listing.priceUsd <= filters.maxBudgetUsd : true))
      .filter((listing) => (filters?.moveInReady ? listing.moveInReady : true))
  }
}

export async function getFeaturedListings(): Promise<PropertyListing[]> {
  const listings = await getPropertyListings()
  return listings.filter((listing) => listing.verified).slice(0, 6)
}

export async function getAgents(): Promise<AgentProfile[]> {
  if (!sql) return seedAgents
  try {
    const rows = await sql`
      SELECT
        id,
        name,
        company,
        city_coverage,
        rating,
        verified,
        transactions,
        languages
      FROM trusted_agents
      ORDER BY verified DESC, rating DESC
    `
    if (!rows.length) return seedAgents
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      company: row.company,
      cityCoverage: Array.isArray(row.city_coverage) ? row.city_coverage : [],
      rating: Number(row.rating),
      verified: Boolean(row.verified),
      transactions: Number(row.transactions),
      languages: Array.isArray(row.languages) ? row.languages : [],
    }))
  } catch {
    return seedAgents
  }
}

export async function getPropertyTestimonials(): Promise<Testimonial[]> {
  if (!sql) return seedTestimonials
  try {
    const rows = await sql`
      SELECT
        id,
        mover_type,
        route,
        outcome,
        quote
      FROM property_testimonials
      ORDER BY id DESC
      LIMIT 6
    `
    if (!rows.length) return seedTestimonials
    return rows.map((row) => ({
      id: row.id,
      moverType: row.mover_type,
      route: row.route,
      outcome: row.outcome,
      quote: row.quote,
    }))
  } catch {
    return seedTestimonials
  }
}

export function getOpportunityRows(): OpportunityRow[] {
  return opportunityRows
}

export function getRevenueStreams(): RevenueStream[] {
  return revenueStreams
}

export async function getPropertyFaqs(): Promise<PropertyFaq[]> {
  if (!sql) return seedPropertyFaqs
  try {
    const rows = await sql`
      SELECT id, question, answer
      FROM property_faqs
      ORDER BY id ASC
    `
    if (!rows.length) return seedPropertyFaqs
    return rows.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
    }))
  } catch {
    return seedPropertyFaqs
  }
}

export async function getResourceGuides(): Promise<ResourceGuide[]> {
  if (!sql) return seedResourceGuides
  try {
    const rows = await sql`
      SELECT id, title, summary, category, read_minutes, href
      FROM resource_guides
      ORDER BY id ASC
      LIMIT 12
    `
    if (!rows.length) return seedResourceGuides
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      category: row.category,
      readMinutes: Number(row.read_minutes),
      href: row.href,
    }))
  } catch {
    return seedResourceGuides
  }
}

