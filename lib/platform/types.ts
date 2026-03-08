export type Direction = "inbound" | "outbound"
export type MarketStatus = "active" | "coming_soon" | "monitoring"
export type LeadStatus = "new" | "contacted" | "call_scheduled" | "proposal_sent" | "won" | "lost"
export type DeliverableStatus = "pending" | "in_progress" | "delivered" | "approved"
export type IntroductionStatus = "awaiting_response" | "meeting_scheduled" | "deal_in_progress" | "closed"

export interface Market {
  id: string
  slug: string
  name: string
  countryCode: string
  flagEmoji: string
  region: string
  status: MarketStatus
  gdp: string
  population: string
  businessEnvironmentScore: number
  easeOfDoingBusinessRank: number
  topSectors: string[]
  regulatoryNotes: string
  latitude: number
  longitude: number
}

export interface Corridor {
  id: string
  originMarketId: string
  destinationMarketId: string
  sector: string
  activeClientCount: number
  status: "active" | "paused" | "coming_soon"
}

export interface CorridorWithMarkets extends Corridor {
  originMarket?: Market
  destinationMarket?: Market
}

export interface Service {
  id: string
  direction: Direction
  name: string
  description: string
  clientReceives: string
  emzExecution: string
  timeline: string
  priceMin: number
  priceMax: number
  featured?: boolean
}

export interface Faq {
  id: string
  question: string
  answer: string
  orderIndex: number
}

export interface Report {
  id: string
  title: string
  marketId: string
  sector: string
  direction: Direction | "regulatory" | "sector_deep_dive"
  summary: string
  fullContent: string
  previewExcerpt: string
  price: number
  publishDate: string
  lastUpdatedDate: string
  author: string
  downloadUrl: string
  purchaseCount: number
  tags: string[]
}

export interface ReportFilters {
  marketId?: string
  sector?: string
  direction?: string
  sort?: "most_recent" | "oldest"
}

export interface Testimonial {
  id: string
  clientType: string
  corridorId: string
  outcome: string
  quote: string
}

export interface TeamMember {
  id: string
  section: "team" | "advisor"
  name: string
  title: string
  bio: string
  photoUrl: string
  markets: string[]
  linkedinUrl: string
}

export interface ValueCard {
  id: string
  orderIndex: number
  title: string
  description: string
}

export interface PressItem {
  id: string
  name: string
  logoUrl: string
  articleUrl: string
}

export interface PartnerItem {
  id: string
  name: string
  logoUrl: string
  country: string
  websiteUrl: string
}

export interface NewsletterSignup {
  id: string
  email: string
  listType: string
  subscribedDate: string
  status: "subscribed" | "unsubscribed"
}

export interface LeadInput {
  firstName: string
  lastName: string
  company: string
  email: string
  phone?: string
  website?: string
  direction: string
  targetMarket: string
  businessSector: string
  timeline: string
  budgetRange: string
  message: string
  source: string
  recommendedService?: string
}

export interface LeadRecord extends LeadInput {
  id: string
  status: LeadStatus
  aiSummary: string
  createdDate: string
}

export interface Deliverable {
  id: string
  clientId: string
  name: string
  dueDate: string
  status: DeliverableStatus
  fileUrl: string
  notes: string
}

export interface Introduction {
  id: string
  clientId: string
  contactName: string
  company: string
  introductionDate: string
  purpose: string
  outcomeStatus: IntroductionStatus
}

export interface Message {
  id: string
  clientId: string
  senderRole: "client" | "advisor"
  content: string
  timestamp: string
  readStatus: boolean
}

export interface ClientEngagement {
  id: string
  userId: string
  engagementType: string
  corridorId: string
  advisorName: string
  advisorPhoto: string
  phase: string
  startDate: string
  contractValue: number
  nextMilestone: string
}

export interface IntelligenceFeedItem {
  id: string
  corridorId: string
  title: string
  content: string
  publishedAt: string
}

